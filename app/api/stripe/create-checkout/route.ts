import { NextRequest, NextResponse } from "next/server";

import { createCheckout } from "@/libs/stripe";
import { createClient } from "@/libs/supabase/server";
import { z } from "zod";

/**
 * Schema for validating the request body
 */
const CreateCheckoutSchema = z.object({
  priceId: z.string().min(1, "Price ID is required"),
  mode: z.enum(["payment", "subscription"]),
  successUrl: z.string().url("Invalid success URL"),
  cancelUrl: z.string().url("Invalid cancel URL"),
});

/**
 * Creates a Stripe Checkout Session for authenticated users
 * @param req - Next.js request object
 * @returns NextResponse with checkout session URL or error
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
    const { priceId, mode, successUrl, cancelUrl } = CreateCheckoutSchema.parse(body);

    // Fetch user data in parallel
    const [userData, studentData] = await Promise.all([
      supabase.from("User").select("*").eq("id", user.id).single(),
      supabase.from("Student").select("*").eq("userId", user.id).single(),
    ]);

    // Create Stripe checkout session
    const stripeSessionURL = await createCheckout({
      priceId,
      mode,
      successUrl,
      cancelUrl,
      clientReferenceId: user.id,
      user: {
        email: userData.data?.email,
        customerId: studentData.data?.customerId,
      },
    });

    return NextResponse.json({ url: stripeSessionURL });
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors.map(e => e.message).join(", ") },
        { status: 400 }
      );
    }

    // Log and return generic error
    console.error("Stripe Checkout Error:", error);
    return NextResponse.json(
      { error: "An error occurred while creating the checkout session" },
      { status: 500 }
    );
  }
}
