import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";
import { prisma } from "@/libs/prisma";
import { findCheckoutSession } from "@/libs/stripe";
import messages from "@/messages/en.json";
import { SupabaseClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-08-16",
  typescript: true,
});
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

/**
 * Stripe webhook handler
 * Processes various Stripe events and updates the database accordingly
 * Events handled:
 * - checkout.session.completed: Creates or updates student records with purchased plan details
 * - customer.subscription.deleted: Revokes access by setting hasAccess to false
 * - invoice.paid: Updates student credits and plan details
 * 
 * @param req - The incoming request containing the Stripe event
 * @returns NextResponse with status indicating success or failure
 */
export async function POST(req: NextRequest) {
  console.log("🔔 Stripe webhook received");
  
  const body = await req.text();
  const signatureHeader = (await headers()).get("stripe-signature");

  let eventType;
  let event;

  // Create a private supabase client using the secret service_role API key
  // Used only for auth operations that Prisma can't handle
  const supabase = new SupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );

  // verify Stripe event is legit
  try {
    if (!signatureHeader || !webhookSecret) {
      console.error("Missing Stripe signature or webhook secret", {
        signaturePresent: !!signatureHeader,
        webhookSecretPresent: !!webhookSecret
      });
      throw new Error("Missing Stripe signature or webhook secret");
    }
    
    console.log("Verifying Stripe signature...");
    event = stripe.webhooks.constructEvent(body, signatureHeader, webhookSecret);
    console.log("✅ Stripe signature verified");
  } catch (err: any) {
    console.error(`Webhook signature verification failed:`, {
      error: err.message,
      signature: signatureHeader ? "present" : "missing"
    });
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  eventType = event.type;
  console.log(`📣 Processing Stripe event: ${eventType}`);

  try {
    switch (eventType) {
      case "checkout.session.completed": {
        console.log("🛒 Processing checkout.session.completed");
        const stripeObject: Stripe.Checkout.Session = event.data.object as Stripe.Checkout.Session;
        console.log("Session ID:", stripeObject.id);
        console.log("Client Reference ID:", stripeObject.client_reference_id);
        console.log("Session Metadata:", stripeObject.metadata);
        
        const session = await findCheckoutSession(stripeObject.id);
        console.log("Session details:", {
          customer: session?.customer,
          subscription: session?.subscription,
          lineItems: session?.line_items?.data.length
        });

        const customerId = session?.customer as string;
        const priceId = session?.line_items?.data[0]?.price?.id;
        const userId = stripeObject.client_reference_id || (stripeObject.metadata?.userId as string);
        
        console.log("Key data:", { customerId, priceId, userId });
        
        const plan = messages.landing.pricing.plans.find(p => 
          p.variants.some(v => v.priceId.production === priceId)
        );
        const planVariant = plan?.variants.find(v => v.priceId.production === priceId);
        const newPlanUnits = planVariant?.units || 0;
        const planName = plan?.tier;
        const planInterval = planVariant?.interval || 'monthly';
        
        console.log("Plan details:", { planName, units: newPlanUnits, interval: planInterval });

        if (!customerId || !priceId || !plan) {
          console.error("Missing required Stripe data", { customerId, priceId, planFound: !!plan });
          throw new Error("Missing required Stripe data");
        }

        // Ensure customerId is a string
        const customerIdString = typeof customerId === 'object' && customerId !== null && 'id' in customerId 
          ? (customerId as { id: string }).id 
          : customerId as string;
        const customer = (await stripe.customers.retrieve(customerIdString)) as Stripe.Customer;
        console.log("Customer email:", customer.email);
        
        let user;
        let units = newPlanUnits;
        let packageExpiration: Date | undefined;
        let isUpgradeOrDowngrade = false;
        let previousSubscriptionId: string | undefined;

        // Get subscription details to set package expiration
        if (session?.subscription) {
          const subscriptionId = typeof session.subscription === 'object' && session.subscription !== null && 'id' in session.subscription 
            ? (session.subscription as { id: string }).id 
            : session.subscription as string;
          
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          
          // Store the userId in the subscription metadata if available
          if (userId) {
            console.log("Storing userId in subscription metadata:", userId);
            await stripe.subscriptions.update(subscription.id, {
              metadata: { 
                userId,
                planName: planName || null,
                planUnits: newPlanUnits.toString(),
                planInterval
              }
            });
          }
          
          packageExpiration = new Date(subscription.current_period_end * 1000);
          console.log("Package expiration set to:", packageExpiration);
        }

        if (!userId) {
          console.log("No userId provided, looking up user by email");
          // Check if user exists in User table by email
          const existingUser = await prisma.user.findUnique({
            where: { email: customer.email || "" }
          });

          if (existingUser) {
            console.log("Found existing user:", existingUser.id);
            // Check if student record exists
            const student = await prisma.student.findFirst({
              where: { userId: existingUser.id }
            });

            if (student) {
              console.log("Found existing student record");
            } else {
              console.log("No student record found for existing user");
            }

            user = student || existingUser;
          } else {
            console.log("No existing user found, creating new user");
            // Create new user and student record via Supabase Auth
            // Extract name information from customer data if available
            const firstName = customer.name ? customer.name.split(' ')[0] : undefined;
            const lastName = customer.name ? customer.name.split(' ').slice(1).join(' ') : undefined;
            
            const { data: newUser, error } = await supabase.auth.admin.createUser({
              email: customer.email || "",
              user_metadata: {
                firstName,
                lastName
              }
            });

            if (error) {
              console.error("Failed to create user in Supabase Auth:", error);
              throw new Error(`Failed to create user: ${error.message}`);
            }

            if (newUser?.user) {
              console.log("Created new user in Supabase Auth:", newUser.user.id);
              // Create User record in database
              await prisma.user.create({
                data: {
                  id: newUser.user.id,
                  email: customer.email || "",
                  firstName: firstName || null,
                  lastName: lastName || null
                }
              });
              console.log("Created new user record in database");

              // Create Student record
              const newStudent = await prisma.student.create({
                data: {
                  userId: newUser.user.id,
                  credits: newPlanUnits,
                  customerId,
                  priceId,
                  hasAccess: true,
                  hasCompletedOnboarding: true,
                  packageName: planName,
                  packageExpiration
                }
              });
              console.log("Created new student record:", newStudent.id);

              user = newStudent;
            }
          }
        } else {
          console.log("Using provided userId:", userId);
          
          // Check for existing student record
          const student = await prisma.student.findFirst({
            where: { userId }
          });

          if (!student) {
            console.error("Student record not found for userId:", userId);
            throw new Error("Student record not found");
          }

          console.log("Found student record:", student.id);
          user = student;
          
          // Handle plan upgrade/downgrade
          const existingSubscriptions = await stripe.subscriptions.list({
            customer: customerId,
            status: 'active'
          });

          if (existingSubscriptions.data.length > 0) {
            // Filter out the newly created subscription
            const oldSubscriptions = existingSubscriptions.data.filter(
              sub => session?.subscription ? sub.id !== session.subscription : true
            );
            
            if (oldSubscriptions.length > 0) {
              isUpgradeOrDowngrade = true;
              const currentSubscription = oldSubscriptions[0];
              previousSubscriptionId = currentSubscription.id;
              
              console.log("Found existing subscription:", currentSubscription.id);
              console.log("This is a plan change (upgrade/downgrade)");
              
              // Get the current subscription's metadata
              const currentPlanName = currentSubscription.metadata.planName;
              const currentPlanUnits = parseInt(currentSubscription.metadata.planUnits || '0');
              const currentPlanInterval = currentSubscription.metadata.planInterval;
              
              console.log("Current plan details:", { 
                name: currentPlanName, 
                units: currentPlanUnits,
                interval: currentPlanInterval
              });
              
              // Cancel the old subscription at period end
              await stripe.subscriptions.update(currentSubscription.id, {
                cancel_at_period_end: true,
                proration_behavior: 'none' // Don't prorate, just add the new subscription
              });
              console.log("Updated existing subscription to cancel at period end");
              
              // Calculate total credits: current credits + new plan's units
              // We keep the existing credits and add the new plan's units
              units = student.credits + newPlanUnits;
              console.log("New total credits:", units);
            } else {
              console.log("No previous subscriptions found, this is a new subscription");
            }
          } else {
            console.log("No existing subscriptions found");
          }
        }

        if (user) {
          console.log("Updating student record for user:", user.id);
          // Update student record with Prisma
          try {
            await prisma.student.updateMany({
              where: { userId: user.id },
              data: {
                customerId: customerIdString,
                priceId,
                hasAccess: true,
                hasCompletedOnboarding: true,
                credits: units,
                packageName: planName,
                packageExpiration,
                // Store additional subscription info
                subscriptionInfo: JSON.stringify({
                  isUpgradeOrDowngrade,
                  previousSubscriptionId,
                  currentSubscriptionId: session?.subscription ? typeof session.subscription === 'object' && session.subscription !== null && 'id' in session.subscription ? (session.subscription as { id: string }).id : session.subscription as string : null,
                  planInterval,
                  planUnits: newPlanUnits,
                  lastUpdated: new Date().toISOString()
                })
              }
            });
            console.log("✅ Successfully updated student record");
            
            // Check if there's pending class data in the session metadata
            if (stripeObject.metadata?.pendingClass) {
              try {
                console.log("Found pending class data in session metadata:", stripeObject.metadata.pendingClass);
                const pendingClassData = JSON.parse(stripeObject.metadata.pendingClass);
                
                // Import the scheduleOnboardingClass function
                const { scheduleOnboardingClass } = await import('@/app/actions/classes');
                
                // Schedule the class
                const scheduledClass = await scheduleOnboardingClass({
                  teacherId: pendingClassData.teacherId,
                  studentId: pendingClassData.studentId,
                  startDateTime: new Date(pendingClassData.startDateTime),
                  endDateTime: new Date(pendingClassData.endDateTime),
                  duration: pendingClassData.duration,
                  notes: pendingClassData.notes || "",
                  status: "SCHEDULED"
                });
                
                console.log("Stripe webhook: Attempting to schedule class with data:", stripeObject.metadata.pendingClass);
                console.log("Stripe webhook: Class scheduled successfully with ID:", scheduledClass.id);
              } catch (classError) {
                console.error("Error scheduling class from webhook:", classError);
                // Don't throw error here, we don't want to fail the webhook
                // just because class scheduling failed
              }
            } else {
              console.log("No pending class data found in session metadata");
            }
          } catch (dbError: any) {
            console.error("Failed to update student record:", dbError);
            throw dbError;
          }
        } else {
          console.error("No user record to update");
        }

        break;
      }

      case "checkout.session.expired": {
        // User didn't complete the transaction
        // You could send an email to remind them to complete the transaction
        const stripeObject: Stripe.Checkout.Session = event.data.object as Stripe.Checkout.Session;
        const userId = stripeObject.client_reference_id;
        
        if (userId) {
          // Log the expired session for potential follow-up
          console.log(`Checkout session expired for user ${userId}`);
        }
        break;
      }

      case "customer.subscription.updated": {
        console.log("📝 Processing customer.subscription.updated");
        // The customer might have changed the plan
        const stripeObject: Stripe.Subscription = event.data.object as Stripe.Subscription;
        const subscription = await stripe.subscriptions.retrieve(stripeObject.id);
        
        // Get the price ID from the subscription
        const priceId = subscription.items.data[0]?.price.id;
        console.log("Subscription updated with price ID:", priceId);
        
        // Check if this is a plan change by comparing with previous_attributes
        const previousAttributes = event.data.previous_attributes as any;
        const isPlanChange = previousAttributes?.items?.data?.[0]?.price?.id !== undefined;
        
        if (isPlanChange) {
          console.log("This is a plan change event");
          const oldPriceId = previousAttributes?.items?.data?.[0]?.price?.id;
          console.log("Plan changed from", oldPriceId, "to", priceId);
          
          // Get plan details for the new plan
          const plan = messages.landing.pricing.plans.find(p => 
            p.variants.some(v => v.priceId.production === priceId)
          );
          const planVariant = plan?.variants.find(v => v.priceId.production === priceId);
          const newPlanUnits = planVariant?.units || 0;
          const planInterval = planVariant?.interval || 'monthly';
          
          console.log("New plan details:", { 
            name: plan?.tier, 
            units: newPlanUnits,
            interval: planInterval
          });
          
          // Find the student record
          const student = await prisma.student.findFirst({
            where: { customerId: subscription.customer as string }
          });
          
          if (student) {
            console.log("Found student record:", student.id);
            console.log("Current credits:", student.credits);
            
            // Add the new plan's units to the existing credits
            const updatedCredits = student.credits + newPlanUnits;
            console.log("Updated credits:", updatedCredits);
            
            // Parse existing subscription info if available
            let subscriptionInfo = {};
            try {
              if (student.subscriptionInfo) {
                subscriptionInfo = JSON.parse(student.subscriptionInfo as string);
              }
            } catch (error) {
              console.error("Error parsing subscription info:", error);
            }
            
            // Update the student record
            await prisma.student.update({
              where: { id: student.id },
              data: {
                priceId,
                credits: updatedCredits,
                packageName: plan?.tier,
                packageExpiration: new Date(subscription.current_period_end * 1000),
                hasAccess: true,
                hasCompletedOnboarding: true,
                // Update subscription info with plan change history
                subscriptionInfo: JSON.stringify({
                  ...subscriptionInfo,
                  planChangeHistory: [
                    ...((subscriptionInfo as any)?.planChangeHistory || []),
                    {
                      date: new Date().toISOString(),
                      fromPriceId: oldPriceId,
                      toPriceId: priceId,
                      creditsAdded: newPlanUnits,
                      totalCreditsAfterChange: updatedCredits
                    }
                  ],
                  currentPlanId: priceId,
                  planInterval,
                  planUnits: newPlanUnits,
                  lastUpdated: new Date().toISOString()
                })
              }
            });
            
            console.log("✅ Successfully updated student record with new plan details");
          } else {
            console.error("Student not found for customer:", subscription.customer);
          }
        } else {
          // Update packageExpiration based on current_period_end
          const packageExpiration = new Date(subscription.current_period_end * 1000);
          console.log("Updating package expiration to:", packageExpiration);
          
          // Update the student record with the new expiration date
          try {
            await prisma.student.updateMany({
              where: { customerId: subscription.customer as string },
              data: { 
                packageExpiration,
                hasAccess: true,
                hasCompletedOnboarding: true
              }
            });
            console.log("✅ Successfully updated student record with new expiration date");
          } catch (updateError: any) {
            console.error("Failed to update student record:", updateError);
            throw updateError;
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        console.log("🗑️ Processing customer.subscription.deleted");
        // The customer subscription stopped - revoke access to the product
        const stripeObject: Stripe.Subscription = event.data.object as Stripe.Subscription;
        const subscription = await stripe.subscriptions.retrieve(stripeObject.id);
        console.log("Revoking access for customer:", subscription.customer);

        // Use Prisma to update the student record
        try {
          await prisma.student.updateMany({
            where: { customerId: subscription.customer as string },
            data: { 
              hasAccess: false,
              packageExpiration: null
            }
          });
          console.log("✅ Successfully revoked access");
        } catch (updateError: any) {
          console.error("Failed to update student record:", updateError);
          throw updateError;
        }
        break;
      }

      case "invoice.paid": {
        console.log("💰 Processing invoice.paid");
        
        // Extract key data from the invoice
        const stripeObject: Stripe.Invoice = event.data.object as Stripe.Invoice;
        const customerId = stripeObject.customer;
        const priceId = stripeObject.lines.data[0]?.price?.id;
        const subscriptionId = stripeObject.subscription;
        
        console.log("Invoice details:", {
          customerId,
          priceId,
          subscriptionId
        });
        
        if (!customerId || !priceId) {
          console.error("Missing required Stripe data");
          throw new Error("Missing required Stripe data");
        }
        
        // Ensure customerId is a string
        const customerIdString = typeof customerId === 'object' && customerId !== null && 'id' in customerId 
          ? (customerId as { id: string }).id 
          : customerId as string;
        
        // Find the student record
        let student = await prisma.student.findFirst({
          where: { customerId: customerIdString }
        });
        
        if (!student) {
          console.log("Student not found by customerId, trying to find by email");
          
          // Try to find the student by email
          const customer = await stripe.customers.retrieve(customerIdString);
          if (customer && !customer.deleted && customer.email) {
            const user = await prisma.user.findUnique({
              where: { email: customer.email }
            });
            
            if (user) {
              student = await prisma.student.findFirst({
                where: { userId: user.id }
              });
              
              if (student) {
                console.log("Found student by email, updating customerId");
                // Update the student record with the customerId
                student = await prisma.student.update({
                  where: { id: student.id },
                  data: { customerId: customerIdString }
                });
                console.log("Found student by email, updating customerId");
              }
            }
          }
        }
        
        if (!student) {
          console.error("Student not found for customer:", customerIdString);
          throw new Error("Student not found");
        }
        
        console.log("Found student:", student.id);
        
        // Get the subscription details
        const subscription = await stripe.subscriptions.retrieve(subscriptionId as string);
        
        // Get plan details
        const plan = messages.landing.pricing.plans.find(p => 
          p.variants.some(v => v.priceId.production === priceId)
        );
        const planVariant = plan?.variants.find(v => v.priceId.production === priceId);
        const planUnits = planVariant?.units || 0;
        const planInterval = planVariant?.interval || 'monthly';
        
        console.log("Plan details:", { planName: plan?.tier, units: planUnits, interval: planInterval });
        
        // Calculate subscription dates
        const createdDate = new Date(subscription.created * 1000);
        const currentPeriodStart = new Date(subscription.current_period_start * 1000);
        const billingReason = stripeObject.billing_reason;
        
        // Determine if this is a renewal, new subscription, or plan change
        const isRenewal = billingReason === 'subscription_cycle';
        const isNewSubscription = billingReason === 'subscription_create';
        const isPlanChange = billingReason === 'subscription_update';
        
        console.log("Subscription details:", {
          created: createdDate,
          currentPeriodStart,
          billingReason,
          isRenewal,
          isNewSubscription,
          isPlanChange
        });
        
        // Set package expiration based on subscription end date
        const packageExpiration = new Date(subscription.current_period_end * 1000);
        console.log("Package expiration set to:", packageExpiration);
        
        // Parse existing subscription info
        let subscriptionInfo: {
          renewalHistory: Array<{
            date: string;
            creditsAdded: number;
            priceId: string;
          }>;
          planInterval: string;
          planUnits: number;
          lastUpdated: string;
          [key: string]: any;
        } = {
          renewalHistory: [],
          planInterval,
          planUnits,
          lastUpdated: new Date().toISOString()
        };
        
        try {
          if (student.subscriptionInfo) {
            const parsedInfo = JSON.parse(student.subscriptionInfo as string);
            subscriptionInfo = {
              ...parsedInfo,
              renewalHistory: Array.isArray(parsedInfo.renewalHistory) ? parsedInfo.renewalHistory : [],
              planInterval,
              planUnits,
              lastUpdated: new Date().toISOString()
            };
          }
        } catch (error) {
          console.error("Error parsing subscription info:", error);
        }
        
        console.log("Parsed subscription info:", subscriptionInfo);
        
        // Check for multiple active subscriptions and cancel old ones
        if (isNewSubscription || isPlanChange) {
          try {
            // Get all active subscriptions for this customer
            const activeSubscriptions = await stripe.subscriptions.list({
              customer: customerIdString,
              status: 'active'
            });
            
            // If there are multiple active subscriptions, cancel the old ones
            if (activeSubscriptions.data.length > 1) {
              console.log(`Found ${activeSubscriptions.data.length} active subscriptions, checking for old ones to cancel`);
              
              // Filter out the current subscription
              const oldSubscriptions = activeSubscriptions.data.filter(sub => sub.id !== subscriptionId);
              
              if (oldSubscriptions.length > 0) {
                console.log(`Found ${oldSubscriptions.length} old subscriptions to cancel`);
                
                // Cancel each old subscription at period end
                for (const oldSub of oldSubscriptions) {
                  console.log(`Canceling old subscription ${oldSub.id} at period end`);
                  await stripe.subscriptions.update(oldSub.id, {
                    cancel_at_period_end: true,
                    proration_behavior: 'none' // Don't prorate
                  });
                }
                
                console.log("Successfully canceled old subscriptions at period end");
              }
            }
          } catch (error) {
            console.error("Error checking/canceling old subscriptions:", error);
          }
        }
        
        // Determine credits to add
        let creditsToAdd = 0;
        
        if (isRenewal) {
          // For renewals, add the plan units
          creditsToAdd = planUnits;
          console.log(`Adding ${creditsToAdd} credits for renewal`);
          
          // Add to renewal history
          subscriptionInfo.renewalHistory = [
            ...(subscriptionInfo.renewalHistory || []),
            {
              date: new Date().toISOString(),
              creditsAdded: creditsToAdd,
              priceId
            }
          ];
        } else if (isNewSubscription) {
          // For new subscriptions, add the plan units
          // The checkout.session.completed handler might have failed to add credits
          creditsToAdd = planUnits;
          console.log(`Adding ${creditsToAdd} credits for new subscription`);
        } else if (isPlanChange) {
          // For plan changes, add the difference in units
          creditsToAdd = planUnits;
          console.log(`Adding ${creditsToAdd} credits for plan change`);
        }
        
        // Update the student record
        const currentCredits = student.credits || 0;
        const newTotalCredits = currentCredits + creditsToAdd;
        
        console.log(`Current credits: ${currentCredits}, Adding: ${creditsToAdd}, New total: ${newTotalCredits}`);
        
        await prisma.student.update({
          where: { id: student.id },
          data: {
            hasAccess: true,
            hasCompletedOnboarding: true,
            priceId,
            credits: newTotalCredits,
            packageName: plan?.tier,
            packageExpiration,
            subscriptionInfo: JSON.stringify(subscriptionInfo)
          }
        });
        
        console.log(`✅ Successfully added ${creditsToAdd} credits to student account`);
        break;
      }

      case "invoice.payment_failed": {
        console.log("❌ Processing invoice.payment_failed");
        // A payment failed (for instance the customer does not have a valid payment method)
        const stripeObject: Stripe.Invoice = event.data.object as Stripe.Invoice;
        const customerId = stripeObject.customer as string;
        
        // Log the payment failure for monitoring
        console.error("Invoice payment failed:", {
          customerId,
          invoiceId: stripeObject.id,
          amount: stripeObject.amount_due,
          status: stripeObject.status
        });
        
        // Note: We don't immediately revoke access as Stripe will retry payment
        // and we'll receive a customer.subscription.deleted event if all retries fail
        break;
      }

      default:
        // Unhandled event type - log for monitoring
        console.log(`Unhandled Stripe event type: ${eventType}`);
    }
  } catch (e: any) {
    console.error("Stripe webhook error:", {
      event: eventType,
      error: e.message,
      stack: e.stack,
      data: event.data.object
    });
    return NextResponse.json({ error: e.message }, { status: 500 });
  }

  console.log("✅ Stripe webhook processed successfully");
  return NextResponse.json({ received: true });
}