import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";
import { prisma } from "@/libs/prisma";
import { findCheckoutSession } from "@/libs/stripe";
import messages from "@/messages/en.json";
import { SupabaseClient } from "@supabase/supabase-js";

// Initialize Stripe client
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-08-16",
  typescript: true,
});
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

// Type definitions for better type safety
type SubscriptionInfo = {
  renewalHistory: Array<{
    date: string;
    creditsAdded: number;
    priceId: string;
  }>;
  planChangeHistory?: Array<{
    date: string;
    fromPriceId: string;
    toPriceId: string;
    creditsAdded: number;
    totalCreditsAfterChange: number;
  }>;
  planInterval: string;
  planUnits: number;
  lastUpdated: string;
  isUpgradeOrDowngrade?: boolean;
  previousSubscriptionId?: string;
  currentSubscriptionId?: string | null;
  currentPlanId?: string;
  [key: string]: any;
};

/**
 * Stripe webhook handler
 * Processes various Stripe events and updates the database accordingly
 * 
 * @param req - The incoming request containing the Stripe event
 * @returns NextResponse with status indicating success or failure
 */
export async function POST(req: NextRequest) {
  try {
    const event = await verifyStripeWebhook(req);
    await handleStripeEvent(event);
    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Unhandled Stripe webhook error:", err);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: err.status || 500 }
    );
  }
}

/**
 * Verifies the Stripe webhook signature
 * 
 * @param req - The incoming request
 * @returns The verified Stripe event
 * @throws Error if verification fails
 */
async function verifyStripeWebhook(req: NextRequest): Promise<Stripe.Event> {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature") as string;

  try {
    return stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`⚠️ Webhook signature verification failed: ${err.message}`);
    err.status = 400;
    throw err;
  }
}

/**
 * Handles a Stripe event based on its type
 * 
 * @param event - The Stripe event to handle
 */
async function handleStripeEvent(event: Stripe.Event): Promise<void> {
  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription, event.data.previous_attributes);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      case "invoice.paid":
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;
      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      default:
        // Unhandled event type - log for monitoring
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (err: any) {
    console.error("Stripe webhook error:", {
      eventType: event.type,
      error: err.message,
      stack: err.stack,
      data: event.data.object
    });
    
    // For Ruby-style hash errors, try to recover
    if (err.message && err.message.includes("unexpected token at")) {
      // Ensure we have the event data
      if (!event || !event.data || !event.data.object) {
        console.error("Event data is missing in Ruby-style hash error handler");
      }
    } else {
      // For other errors, rethrow
      throw err;
    }
  }
}

/**
 * Handles a checkout.session.completed event
 * 
 * @param session - The Stripe checkout session
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
  await processCheckoutSession(session);
}

/**
 * Handles a customer.subscription.updated event
 * 
 * @param subscription - The Stripe subscription
 * @param previousAttributes - The previous attributes of the subscription
 */
async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription, 
  previousAttributes: any
): Promise<void> {
  const subscriptionId = subscription.id;
  const retrievedSubscription = await stripe.subscriptions.retrieve(subscriptionId);
  const priceId = retrievedSubscription.items.data[0]?.price.id;
  const customerId = subscription.customer as string;
  
  // Check if this is a plan change by comparing with previous_attributes
  const isPlanChange = previousAttributes?.items?.data?.[0]?.price?.id !== undefined;
  
  if (isPlanChange) {
    await handlePlanChange(retrievedSubscription, previousAttributes, customerId, priceId);
  } else {
    // Update packageExpiration based on current_period_end
    await updateSubscriptionExpiration(retrievedSubscription);
  }
}

/**
 * Handles a plan change in a subscription
 * 
 * @param subscription - The Stripe subscription
 * @param previousAttributes - The previous attributes of the subscription
 * @param customerId - The customer ID
 * @param priceId - The price ID
 */
async function handlePlanChange(
  subscription: Stripe.Subscription,
  previousAttributes: any,
  customerId: string,
  priceId: string
): Promise<void> {
  const oldPriceId = previousAttributes?.items?.data?.[0]?.price?.id;
  
  // Get plan details for the new plan
  const { plan, planVariant } = getPlanDetails(priceId);
  const newPlanUnits = planVariant?.units || 0;
  const planInterval = planVariant?.interval || 'monthly';
  
  // Find the student record
  const student = await findStudentByCustomerId(customerId);
  
  if (!student) {
    console.error("Student not found for customer:", customerId);
    return;
  }
  
  // Add the new plan's units to the existing credits
  const updatedCredits = student.credits + newPlanUnits;
  
  // Parse existing subscription info if available
  const subscriptionInfo = parseSubscriptionInfo(student.subscriptionInfo);
  
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
          ...(subscriptionInfo.planChangeHistory || []),
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
}

/**
 * Updates a subscription's expiration date
 * 
 * @param subscription - The Stripe subscription
 */
async function updateSubscriptionExpiration(subscription: Stripe.Subscription): Promise<void> {
  const packageExpiration = new Date(subscription.current_period_end * 1000);
  const customerId = subscription.customer as string;
  
  try {
    await prisma.student.updateMany({
      where: { customerId },
      data: { 
        packageExpiration,
        hasAccess: true,
        hasCompletedOnboarding: true
      }
    });
  } catch (updateError: any) {
    console.error("Failed to update student record:", updateError);
    throw updateError;
  }
}

/**
 * Handles a customer.subscription.deleted event
 * 
 * @param subscription - The Stripe subscription
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
  const retrievedSubscription = await stripe.subscriptions.retrieve(subscription.id);
  const customerId = retrievedSubscription.customer as string;

  try {
    await prisma.student.updateMany({
      where: { customerId },
      data: { 
        hasAccess: false,
        packageExpiration: null
      }
    });
  } catch (updateError: any) {
    console.error("Failed to update student record:", updateError);
    throw updateError;
  }
}

/**
 * Handles an invoice.paid event
 * 
 * @param invoice - The Stripe invoice
 */
async function handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
  // Extract key data from the invoice
  const customerId = invoice.customer;
  const priceId = invoice.lines.data[0]?.price?.id;
  const subscriptionId = invoice.subscription;
          
  if (!customerId || !priceId) {
    console.error("Missing required Stripe data");
    throw new Error("Missing required Stripe data");
  }
  
  // Ensure customerId is a string
  const customerIdString = normalizeCustomerId(customerId);
  
  // Find the student record
  const student = await findOrCreateStudentRecord(customerIdString);
  
  if (!student) {
    console.error("Student not found for customer:", customerIdString);
    throw new Error("Student not found");
  }
    
  // Get the subscription details
  const subscription = await stripe.subscriptions.retrieve(subscriptionId as string);
  
  // Get plan details
  const { plan, planVariant } = getPlanDetails(priceId);
  const planUnits = planVariant?.units || 0;
  const planInterval = planVariant?.interval || 'monthly';
          
  // Calculate subscription dates
  const billingReason = invoice.billing_reason;
  
  // Determine if this is a renewal, new subscription, or plan change
  const isRenewal = billingReason === 'subscription_cycle';
  const isNewSubscription = billingReason === 'subscription_create';
  const isPlanChange = billingReason === 'subscription_update';
  
  // Set package expiration based on subscription end date
  const packageExpiration = new Date(subscription.current_period_end * 1000);
  
  // Parse existing subscription info
  const subscriptionInfo = parseSubscriptionInfo(student.subscriptionInfo, {
    planInterval,
    planUnits
  });
  
  // Check for multiple active subscriptions and cancel old ones
  if (isNewSubscription || isPlanChange) {
    await handleMultipleSubscriptions(customerIdString, subscriptionId as string);
  }
  
  // Determine credits to add
  const creditsToAdd = calculateCreditsToAdd(isRenewal, isNewSubscription, isPlanChange, planUnits);
  
  // Update renewal history if this is a renewal
  if (isRenewal) {
    subscriptionInfo.renewalHistory = [
      ...(subscriptionInfo.renewalHistory || []),
      {
        date: new Date().toISOString(),
        creditsAdded: creditsToAdd,
        priceId
      }
    ];
  }
  
  // Update the student record
  const currentCredits = student.credits || 0;
  const newTotalCredits = currentCredits + creditsToAdd;
          
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
}

/**
 * Handles an invoice.payment_failed event
 * 
 * @param invoice - The Stripe invoice
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  const customerId = invoice.customer as string;
  
  // Log the payment failure for monitoring
  console.error("Invoice payment failed:", {
    customerId,
    invoiceId: invoice.id,
    amount: invoice.amount_due,
    status: invoice.status
  });
  
  // Note: We don't immediately revoke access as Stripe will retry payment
  // and we'll receive a customer.subscription.deleted event if all retries fail
}

/**
 * Normalizes a customer ID to a string
 * 
 * @param customerId - The customer ID to normalize
 * @returns The normalized customer ID as a string
 */
function normalizeCustomerId(customerId: string | Stripe.Customer | Stripe.DeletedCustomer): string {
  return typeof customerId === 'object' && customerId !== null && 'id' in customerId 
    ? customerId.id 
    : customerId as string;
}

/**
 * Finds a student by customer ID
 * 
 * @param customerId - The customer ID to find the student by
 * @returns The student record, or null if not found
 */
async function findStudentByCustomerId(customerId: string) {
  return await prisma.student.findFirst({
    where: { customerId }
  });
}

/**
 * Finds or creates a student record
 * 
 * @param customerId - The customer ID to find the student by
 * @returns The student record, or null if not found
 */
async function findOrCreateStudentRecord(customerId: string) {
  // Try to find the student by customerId
  let student = await findStudentByCustomerId(customerId);
  
  if (!student) {
    // Try to find the student by email
    const customer = await stripe.customers.retrieve(customerId);
    if (customer && !customer.deleted && 'email' in customer && customer.email) {
      const user = await prisma.user.findUnique({
        where: { email: customer.email }
      });
      
      if (user) {
        student = await prisma.student.findFirst({
          where: { userId: user.id }
        });
        
        if (student) {
          // Update the student record with the customerId
          student = await prisma.student.update({
            where: { id: student.id },
            data: { customerId }
          });
        }
      }
    }
  }
  
  return student;
}

/**
 * Gets plan details from a price ID
 * 
 * @param priceId - The price ID to get plan details for
 * @returns The plan and plan variant
 */
function getPlanDetails(priceId: string) {
  const plan = messages.landing.pricing.plans.find(p => 
    p.variants.some(v => v.priceId.production === priceId)
  );
  const planVariant = plan?.variants.find(v => v.priceId.production === priceId);
  
  return { plan, planVariant };
}

/**
 * Parses subscription info from a string
 * 
 * @param subscriptionInfoStr - The subscription info string to parse
 * @param defaults - Default values to use if parsing fails
 * @returns The parsed subscription info
 */
function parseSubscriptionInfo(
  subscriptionInfoStr: string | null | undefined, 
  defaults: Partial<SubscriptionInfo> = {}
): SubscriptionInfo {
  const defaultInfo: SubscriptionInfo = {
    renewalHistory: [],
    planInterval: defaults.planInterval || 'monthly',
    planUnits: defaults.planUnits || 0,
    lastUpdated: new Date().toISOString(),
    ...defaults
  };
  
  if (!subscriptionInfoStr) {
    return defaultInfo;
  }
  
  try {
    const parsedInfo = JSON.parse(subscriptionInfoStr);
    return {
      ...parsedInfo,
      renewalHistory: Array.isArray(parsedInfo.renewalHistory) ? parsedInfo.renewalHistory : [],
      planInterval: parsedInfo.planInterval || defaultInfo.planInterval,
      planUnits: parsedInfo.planUnits || defaultInfo.planUnits,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error parsing subscription info:", error);
    return defaultInfo;
  }
}

/**
 * Handles multiple active subscriptions for a customer
 * 
 * @param customerId - The customer ID
 * @param currentSubscriptionId - The current subscription ID
 */
async function handleMultipleSubscriptions(
  customerId: string, 
  currentSubscriptionId: string
): Promise<void> {
  try {
    // Get all active subscriptions for this customer
    const activeSubscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active'
    });
    
    // If there are multiple active subscriptions, cancel the old ones
    if (activeSubscriptions.data.length > 1) {
      // Filter out the current subscription
      const oldSubscriptions = activeSubscriptions.data.filter(sub => sub.id !== currentSubscriptionId);
      
      if (oldSubscriptions.length > 0) {
        // Cancel each old subscription at period end
        for (const oldSub of oldSubscriptions) {
          await stripe.subscriptions.update(oldSub.id, {
            cancel_at_period_end: true,
            proration_behavior: 'none' // Don't prorate
          });
        }
      }
    }
  } catch (error) {
    console.error("Error checking/canceling old subscriptions:", error);
  }
}

/**
 * Calculates the number of credits to add
 * 
 * @param isRenewal - Whether this is a renewal
 * @param isNewSubscription - Whether this is a new subscription
 * @param isPlanChange - Whether this is a plan change
 * @param planUnits - The number of units in the plan
 * @returns The number of credits to add
 */
function calculateCreditsToAdd(
  isRenewal: boolean, 
  isNewSubscription: boolean, 
  isPlanChange: boolean, 
  planUnits: number
): number {
  if (isRenewal || isNewSubscription || isPlanChange) {
    return planUnits;
  }
  return 0;
}

/**
 * Process a checkout session
 * @param stripeObject The Stripe checkout session object
 */
async function processCheckoutSession(stripeObject: Stripe.Checkout.Session) {
  const session = await findCheckoutSession(stripeObject.id);
  const customerId = session?.customer;
  const priceId = session?.line_items?.data[0]?.price?.id;
  const userId = stripeObject.client_reference_id || (stripeObject.metadata?.userId as string);
  const { plan, planVariant } = getPlanDetails(priceId || '');
  const newPlanUnits = planVariant?.units || 0;
  const planName = plan?.tier;
  const planInterval = planVariant?.interval || 'monthly';
  
  if (!customerId || !priceId || !plan) {
    console.error("Missing required Stripe data", { customerId, priceId, planFound: !!plan });
    throw new Error("Missing required Stripe data");
  }

  // Ensure customerId is a string
  const customerIdString = normalizeCustomerId(customerId);
  const customer = (await stripe.customers.retrieve(customerIdString)) as Stripe.Customer;  
  
  let user;
  let units = newPlanUnits;
  let packageExpiration: Date | undefined;
  let isUpgradeOrDowngrade = false;
  let previousSubscriptionId: string | undefined;
  let currentSubscriptionId: string | undefined;

  // Get subscription details to set package expiration
  if (session?.subscription) {
    const subscriptionId = normalizeSubscriptionId(session.subscription);
    currentSubscriptionId = subscriptionId;
    
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    // Store the userId in the subscription metadata if available
    if (userId) {
      await updateSubscriptionMetadata(subscription.id, {
        userId,
        planName: planName || null,
        planUnits: newPlanUnits.toString(),
        planInterval
      });
    }
    
    packageExpiration = new Date(subscription.current_period_end * 1000);
  }

  if (!userId) {
    user = await handleUserCreation(customer, newPlanUnits, customerIdString, priceId, planName, packageExpiration);
  } else {    
    const result = await handleExistingUser(
      userId, 
      customerIdString, 
      newPlanUnits, 
      session?.subscription
    );
    
    user = result.user;
    isUpgradeOrDowngrade = result.isUpgradeOrDowngrade;
    previousSubscriptionId = result.previousSubscriptionId;
    units = result.units;
  }

  if (user) {
    await updateStudentRecord(
      user.id, 
      customerIdString, 
      priceId, 
      units, 
      planName, 
      packageExpiration, 
      isUpgradeOrDowngrade, 
      previousSubscriptionId, 
      currentSubscriptionId, 
      planInterval, 
      newPlanUnits
    );
  } else {
    console.error("No user record to update");
  }
}

/**
 * Creates a Supabase client
 * 
 * @returns A Supabase client
 */
function createSupabaseClient(): SupabaseClient {
  return new SupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );
}

/**
 * Normalizes a subscription ID to a string
 * 
 * @param subscription - The subscription ID to normalize
 * @returns The normalized subscription ID as a string
 */
function normalizeSubscriptionId(subscription: string | Stripe.Subscription): string {
  return typeof subscription === 'object' && subscription !== null && 'id' in subscription 
    ? subscription.id 
    : subscription as string;
}

/**
 * Updates subscription metadata
 * 
 * @param subscriptionId - The subscription ID
 * @param metadata - The metadata to update
 */
async function updateSubscriptionMetadata(
  subscriptionId: string, 
  metadata: Record<string, string | null>
): Promise<void> {
  await stripe.subscriptions.update(subscriptionId, { metadata });
}

/**
 * Handles user creation for a new customer
 * 
 * @param customer - The Stripe customer
 * @param newPlanUnits - The number of units in the new plan
 * @param customerId - The customer ID
 * @param priceId - The price ID
 * @param planName - The plan name
 * @param packageExpiration - The package expiration date
 * @returns The created user
 */
async function handleUserCreation(
  customer: Stripe.Customer,
  newPlanUnits: number,
  customerId: string,
  priceId: string,
  planName: string | undefined,
  packageExpiration: Date | undefined
) {
  // Check if user exists in User table by email
  if (!customer.email) {
    throw new Error("Customer email is required");
  }
  
  const existingUser = await prisma.user.findUnique({
    where: { email: customer.email }
  });

  if (existingUser) {
    // Check if student record exists
    const student = await prisma.student.findFirst({
      where: { userId: existingUser.id }
    });

    return student || existingUser;
  } else {
    // Create new user and student record via Supabase Auth
    // Extract name information from customer data if available
    const firstName = customer.name ? customer.name.split(' ')[0] : undefined;
    const lastName = customer.name ? customer.name.split(' ').slice(1).join(' ') : undefined;
    
    const supabase = createSupabaseClient();
    const { data: newUser, error } = await supabase.auth.admin.createUser({
      email: customer.email,
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
      // Create User record in database
      await prisma.user.create({
        data: {
          id: newUser.user.id,
          email: customer.email,
          firstName: firstName || null,
          lastName: lastName || null
        }
      });

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
      return newStudent;
    }
  }
  
  return null;
}

/**
 * Handles an existing user
 * 
 * @param userId - The user ID
 * @param customerId - The customer ID
 * @param newPlanUnits - The number of units in the new plan
 * @param subscription - The subscription
 * @returns The user and subscription details
 */
async function handleExistingUser(
  userId: string,
  customerId: string,
  newPlanUnits: number,
  subscription: string | Stripe.Subscription | null | undefined
): Promise<{
  user: any;
  isUpgradeOrDowngrade: boolean;
  previousSubscriptionId?: string;
  units: number;
}> {
  // Check for existing student record
  const student = await prisma.student.findFirst({
    where: { userId }
  });

  if (!student) {
    console.error("Student record not found for userId:", userId);
    throw new Error("Student record not found");
  }
  
  let isUpgradeOrDowngrade = false;
  let previousSubscriptionId: string | undefined;
  let units = newPlanUnits;
  
  // Handle plan upgrade/downgrade
  const existingSubscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: 'active'
  });

  if (existingSubscriptions.data.length > 0) {
    // Filter out the newly created subscription
    const oldSubscriptions = existingSubscriptions.data.filter(
      sub => subscription ? normalizeSubscriptionId(subscription) !== sub.id : true
    );
    
    if (oldSubscriptions.length > 0) {
      isUpgradeOrDowngrade = true;
      const currentSubscription = oldSubscriptions[0];
      previousSubscriptionId = currentSubscription.id;
      
      // Cancel the old subscription at period end
      await stripe.subscriptions.update(currentSubscription.id, {
        cancel_at_period_end: true,
        proration_behavior: 'none' // Don't prorate, just add the new subscription
      });
      
      // Calculate total credits: current credits + new plan's units
      // We keep the existing credits and add the new plan's units
      units = student.credits + newPlanUnits;
    }
  }
  
  return {
    user: student,
    isUpgradeOrDowngrade,
    previousSubscriptionId,
    units
  };
}

/**
 * Updates a student record
 * 
 * @param userId - The user ID
 * @param customerId - The customer ID
 * @param priceId - The price ID
 * @param units - The number of units
 * @param planName - The plan name
 * @param packageExpiration - The package expiration date
 * @param isUpgradeOrDowngrade - Whether this is an upgrade or downgrade
 * @param previousSubscriptionId - The previous subscription ID
 * @param currentSubscriptionId - The current subscription ID
 * @param planInterval - The plan interval
 * @param planUnits - The number of units in the plan
 */
async function updateStudentRecord(
  userId: string,
  customerId: string,
  priceId: string,
  units: number,
  planName: string | undefined,
  packageExpiration: Date | undefined,
  isUpgradeOrDowngrade: boolean,
  previousSubscriptionId: string | undefined,
  currentSubscriptionId: string | undefined,
  planInterval: string,
  planUnits: number
): Promise<void> {
  try {
    await prisma.student.updateMany({
      where: { userId },
      data: {
        customerId,
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
          currentSubscriptionId,
          planInterval,
          planUnits,
          lastUpdated: new Date().toISOString()
        })
      }
    });
  } catch (dbError: any) {
    console.error("Failed to update student record:", dbError);
    throw dbError;
  }
}