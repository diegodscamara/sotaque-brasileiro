import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/libs/prisma";
import { createClient } from "@/libs/supabase/server";
import Stripe from "stripe";
import messages from "@/messages/en.json";

/**
 * Schema for validating the request body
 */
const UpdateStudentSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
});

/**
 * Updates a student record after a successful checkout
 * This is a fallback mechanism in case the webhook fails
 * 
 * @param req - Next.js request object
 * @returns NextResponse with success status or error
 */
export async function POST(req: NextRequest) {
  const supabase = createClient();

  // Validate authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json(
      { error: "User not authenticated" },
      { status: 401 }
    );
  }

  try {
    // Validate and parse request body
    const body = await req.json();
    const { sessionId } = UpdateStudentSchema.parse(body);

    // Initialize Stripe
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("Missing Stripe secret key");
      return NextResponse.json(
        { error: "Stripe is not properly configured" },
        { status: 500 }
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-08-16",
      typescript: true,
    });

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items", "customer", "subscription"],
    });

    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Payment not completed" },
        { status: 400 }
      );
    }

    // Get the necessary data from the session
    const customerId = session.customer as string;
    const priceId = session.line_items?.data[0]?.price?.id;

    if (!customerId || !priceId) {
      return NextResponse.json(
        { error: "Missing required Stripe data" },
        { status: 400 }
      );
    }

    // Get plan details
    const plan = messages.landing.pricing.plans.find(p => 
      p.variants.some(v => v.priceId.production === priceId)
    );
    const planVariant = plan?.variants.find(v => v.priceId.production === priceId);
    const newPlanUnits = planVariant?.units || 0;
    const planName = plan?.tier;
    const planInterval = planVariant?.interval || 'monthly';

    // Get subscription details to set package expiration
    let packageExpiration: Date | undefined;
    let isUpgradeOrDowngrade = false;
    let previousSubscriptionId: string | undefined;
    
    if (session.subscription) {
      const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
      packageExpiration = new Date(subscription.current_period_end * 1000);
      
      // Store the userId in the subscription metadata
      console.log("Storing userId in subscription metadata:", user.id);
      await stripe.subscriptions.update(subscription.id, {
        metadata: { 
          userId: user.id,
          planName: planName || null,
          planUnits: newPlanUnits.toString(),
          planInterval: planInterval || null
        }
      });
      
      // Check if this is an upgrade/downgrade by looking for other active subscriptions
      const existingSubscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: 'active'
      });
      
      // Filter out the newly created subscription
      const oldSubscriptions = existingSubscriptions.data.filter(
        sub => sub.id !== subscription.id
      );
      
      if (oldSubscriptions.length > 0) {
        isUpgradeOrDowngrade = true;
        const currentSubscription = oldSubscriptions[0];
        previousSubscriptionId = currentSubscription.id;
        
        console.log("Found existing subscription:", currentSubscription.id);
        console.log("This is a plan change (upgrade/downgrade)");
        
        // Cancel the old subscription at period end if not already set to cancel
        if (!currentSubscription.cancel_at_period_end) {
          await stripe.subscriptions.update(currentSubscription.id, {
            cancel_at_period_end: true,
            proration_behavior: 'none' // Don't prorate, just add the new subscription
          });
          console.log("Updated existing subscription to cancel at period end");
        }
      }
    }

    // Get current student record
    const student = await prisma.student.findFirst({
      where: { userId: user.id }
    });

    // Calculate total credits
    const currentCredits = student?.credits || 0;
    // For upgrades/downgrades, we add the new plan units to existing credits
    // For new subscriptions, we set the credits to the plan units
    const totalCredits = isUpgradeOrDowngrade 
      ? currentCredits + newPlanUnits 
      : newPlanUnits;

    console.log("Updating student record after checkout:", {
      userId: user.id,
      customerId,
      priceId,
      planName,
      planInterval,
      currentCredits,
      newPlanUnits,
      totalCredits,
      isUpgradeOrDowngrade,
      hasExistingRecord: !!student
    });

    // Parse existing subscription info if available
    let subscriptionInfo = {};
    try {
      if (student?.subscriptionInfo) {
        subscriptionInfo = JSON.parse(student.subscriptionInfo as string);
        console.log("Parsed existing subscription info");
      }
    } catch (error) {
      console.error("Error parsing subscription info:", error);
    }

    // Update the student record
    try {
      await prisma.student.upsert({
        where: { 
          userId: user.id 
        },
        update: {
          customerId,
          priceId,
          hasAccess: true,
          hasCompletedOnboarding: true,
          credits: totalCredits,
          packageName: planName,
          packageExpiration,
          // Update subscription info
          subscriptionInfo: JSON.stringify({
            ...subscriptionInfo,
            isUpgradeOrDowngrade,
            previousSubscriptionId,
            currentSubscriptionId: session.subscription,
            planInterval,
            planUnits: newPlanUnits,
            planChangeHistory: isUpgradeOrDowngrade ? [
              ...((subscriptionInfo as any)?.planChangeHistory || []),
              {
                date: new Date().toISOString(),
                fromPriceId: student?.priceId || 'unknown',
                toPriceId: priceId,
                creditsAdded: newPlanUnits,
                totalCreditsAfterChange: totalCredits
              }
            ] : (subscriptionInfo as any)?.planChangeHistory || [],
            lastUpdated: new Date().toISOString()
          })
        },
        create: {
          userId: user.id,
          customerId,
          priceId,
          hasAccess: true,
          hasCompletedOnboarding: true,
          credits: newPlanUnits,
          packageName: planName,
          packageExpiration,
          learningGoals: [],
          otherLanguages: [],
          // Initialize subscription info
          subscriptionInfo: JSON.stringify({
            currentSubscriptionId: session.subscription,
            planInterval,
            planUnits: newPlanUnits,
            lastUpdated: new Date().toISOString()
          })
        }
      });
      console.log("✅ Successfully updated student record after checkout");
      return NextResponse.json({ 
        success: true,
        message: "Student record updated successfully" 
      });
    } catch (error) {
      console.error("Failed to update student record:", error);
      throw error;
    }
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors.map(e => e.message).join(", ") },
        { status: 400 }
      );
    }

    // Log and return generic error
    console.error("Update Student Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An error occurred while updating the student record" },
      { status: 500 }
    );
  }
} 