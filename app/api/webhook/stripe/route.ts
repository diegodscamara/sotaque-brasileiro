import { NextRequest, NextResponse } from "next/server";

import Stripe from "stripe";
import { SupabaseClient } from "@supabase/supabase-js";
import { findCheckoutSession } from "@/libs/stripe";
import { headers } from "next/headers";
import messages from "@/messages/en.json";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-08-16",
  typescript: true,
});
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// This is where we receive Stripe webhook events
// It used to update the user data, send emails, etc...
// By default, it'll store the user in the database
// See more: https://shipfa.st/docs/features/payments
export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature");

  let eventType;
  let event;

  // Create a private supabase client using the secret service_role API key
  const supabase = new SupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // verify Stripe event is legit
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed. ${err.message}`);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  eventType = event.type;

  try {
    switch (eventType) {
      case "checkout.session.completed": {
        const stripeObject: Stripe.Checkout.Session = event.data.object as Stripe.Checkout.Session;
        const session = await findCheckoutSession(stripeObject.id);

        const customerId = session?.customer as string;
        const priceId = session?.line_items?.data[0]?.price?.id;
        const userId = stripeObject.client_reference_id;
        const plan = messages.landing.pricing.plans.find(p => 
          p.variants.some(v => v.priceId.production === priceId)
        );
        const newPlanUnits = plan?.variants.find(v => v.priceId.production === priceId)?.units || 0;
        const planName = plan?.tier;

        if (!customerId || !priceId || !plan) {
          throw new Error("Missing required Stripe data");
        }

        const customer = (await stripe.customers.retrieve(customerId)) as Stripe.Customer;
        let user;
        let units = newPlanUnits;

        if (!userId) {
          // Check if user exists in User table
          const { data: existingUser } = await supabase
            .from("User")
            .select("*")
            .eq("email", customer.email)
            .single();

          if (existingUser) {
            // Check if student record exists
            const { data: student } = await supabase
              .from("Student")
              .select("*")
              .eq("userId", existingUser.id)
              .single();

            user = student || existingUser;
          } else {
            // Create new user and student record
            const { data: newUser } = await supabase.auth.admin.createUser({
              email: customer.email,
            });

            if (newUser?.user) {
              const { data: newStudent } = await supabase
                .from("Student")
                .insert({
                  userId: newUser.user.id,
                  email: customer.email,
                  credits: newPlanUnits,
                  customerId,
                  priceId,
                  hasAccess: true,
                  packageName: planName
                })
                .select()
                .single();

              user = newStudent;
            }
          }
        } else {
          // Handle plan upgrade/downgrade
          const existingSubscriptions = await stripe.subscriptions.list({
            customer: customerId,
            status: 'active',
            limit: 1
          });

          if (existingSubscriptions.data.length > 0) {
            const currentSubscription = existingSubscriptions.data[0];
            
            await stripe.subscriptions.update(currentSubscription.id, {
              cancel_at_period_end: true,
              proration_behavior: 'always_invoice'
            });

            // Get current user credits from database
            const { data: student } = await supabase
              .from("Student")
              .select("credits")
              .eq("userId", userId)
              .single();

            if (student) {
              // Calculate total credits: current credits + new plan's units
              units = student.credits + newPlanUnits;
            }
          }

          // Update existing student record
          const { data: student } = await supabase
            .from("Student")
            .select("*")
            .eq("userId", userId)
            .single();

          if (!student) {
            throw new Error("Student record not found");
          }

          user = student;
        }

        if (user) {
          await supabase
            .from("Student")
            .update({
              customerId,
              priceId,
              hasAccess: true,
              credits: units,
              packageName: planName,
            })
            .eq("userId", user.userId || user.id);
        }

        break;
      }

      case "checkout.session.expired": {
        // User didn't complete the transaction
        // You don't need to do anything here, by you can send an email to the user to remind him to complete the transaction, for instance
        break;
      }

      case "customer.subscription.updated": {
        // The customer might have changed the plan (higher or lower plan, cancel soon etc...)
        // You don't need to do anything here, because Stripe will let us know when the subscription is canceled for good (at the end of the billing cycle) in the "customer.subscription.deleted" event
        // You can update the user data to show a "Cancel soon" badge for instance
        break;
      }

      case "customer.subscription.deleted": {
        // The customer subscription stopped
        // ❌ Revoke access to the product
        const stripeObject: Stripe.Subscription = event.data.object as Stripe.Subscription;
        const subscription = await stripe.subscriptions.retrieve(
          stripeObject.id
        );

        await supabase
          .from("Student")
          .update({ hasAccess: false })
          .eq("customerId", subscription.customer);
        break;
      }

      case "invoice.paid": {
        const stripeObject: Stripe.Invoice = event.data.object as Stripe.Invoice;
        const priceId = stripeObject.lines.data[0]?.price?.id;
        const customerId = stripeObject.customer;

        if (!customerId || !priceId) {
          throw new Error("Missing required invoice data");
        }

        const { data: student } = await supabase
          .from("Student")
          .select("*")
          .eq("customerId", customerId)
          .single();

        if (!student) {
          throw new Error("Student not found");
        }

        // Update the student's priceId and credits
        const plan = messages.landing.pricing.plans.find(p => 
          p.variants.some(v => v.priceId.production === priceId)
        );
        const newPlanUnits = plan?.variants.find(v => v.priceId.production === priceId)?.units || 0;

        await supabase
          .from("Student")
          .update({ 
            hasAccess: true,
            priceId,
            credits: (student.credits || 0) + newPlanUnits,
            packageName: plan?.tier
          })
          .eq("customerId", customerId);

        break;
      }

      case "invoice.payment_failed":
        // A payment failed (for instance the customer does not have a valid payment method)
        // ❌ Revoke access to the product
        // ⏳ OR wait for the customer to pay (more friendly):
        //      - Stripe will automatically email the customer (Smart Retries)
        //      - We will receive a "customer.subscription.deleted" when all retries were made and the subscription has expired

        break;

      default:
      // Unhandled event type
    }
  } catch (e) {
    console.error("Stripe webhook error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}