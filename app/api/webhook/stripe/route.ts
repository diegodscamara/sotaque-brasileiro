import { NextRequest, NextResponse } from "next/server";
import { addMonths, addYears } from "date-fns";

import Stripe from "stripe";
import { SupabaseClient } from "@supabase/supabase-js";
import configFile from "@/config";
import { findCheckoutSession } from "@/libs/stripe";
import { headers } from "next/headers";

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
        // First payment is successful and a subscription is created (if mode was set to "subscription" in ButtonCheckout)
        // ✅ Grant access to the product
        const stripeObject: Stripe.Checkout.Session = event.data
          .object as Stripe.Checkout.Session;

        const session = await findCheckoutSession(stripeObject.id);

        const customerId = session?.customer;
        const priceId = session?.line_items?.data[0]?.price.id;
        const units = session?.line_items?.data[0].price?.transform_quantity.divide_by || 0; // Units purchased
        const userId = stripeObject.client_reference_id;
        const plan = configFile.stripe.plans.find((p) => p.priceId === priceId);

        if (!plan) break;

        const { data: profile } = await supabase
          .from("students")
          .select("credits")
          .eq("id", userId)
          .single();

        if (customerId && priceId && units > 0) {
          // Calculate expiration date based on plan interval
          let expirationDate = new Date();
          if (plan.interval === "monthly") {
            expirationDate = addMonths(expirationDate, 1);
          } else if (plan.interval === "yearly") {
            expirationDate = addYears(expirationDate, 1);
          } else if (plan.interval === "one-time") {
            expirationDate = addMonths(expirationDate, 1);
          }

          await supabase
            .from("students")
            .update({
              customer_id: customerId,
              price_id: priceId,
              has_access: true,
              credits: (profile?.credits || 0) + units,
              package_name: plan.name,
              package_expiration: expirationDate.toISOString(),
            })
            .eq("id", userId);
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
        const stripeObject: Stripe.Subscription = event.data
          .object as Stripe.Subscription;
        const subscription = await stripe.subscriptions.retrieve(
          stripeObject.id
        );

        await supabase
          .from("students")
          .update({ 
            has_access: false,
            package_expiration: null
          })
          .eq("customer_id", subscription.customer);
        break;
      }

      case "invoice.paid": {
        // Customer just paid an invoice (for instance, a recurring payment for a subscription)
        // ✅ Grant access to the product
        const stripeObject: Stripe.Invoice = event.data
          .object as Stripe.Invoice;
        const priceId = stripeObject.lines.data[0].price.id;
        const customerId = stripeObject.customer;
        const plan = configFile.stripe.plans.find((p) => p.priceId === priceId);

        if (!plan) break;

        // Find profile where customer_id equals the customerId (in table called 'profiles')
        const { data: profile } = await supabase
          .from("students")
          .select("*")
          .eq("customer_id", customerId)
          .single();

        // Make sure the invoice is for the same plan (priceId) the user subscribed to
        if (profile.price_id !== priceId) break;

        // Calculate new expiration date based on plan interval
        let expirationDate = new Date();
        if (plan.interval === "monthly") {
          expirationDate = addMonths(expirationDate, 1);
        } else if (plan.interval === "yearly") {
          expirationDate = addYears(expirationDate, 1);
        } else if (plan.interval === "one-time") {
          expirationDate = addMonths(expirationDate, 1);
        }

        // Grant the profile access to your product and update expiration
        await supabase
          .from("students")
          .update({ 
            has_access: true,
            package_expiration: expirationDate.toISOString()
          })
          .eq("customer_id", customerId);

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
    console.error("stripe error: ", e.message);
  }

  return NextResponse.json({});
}
