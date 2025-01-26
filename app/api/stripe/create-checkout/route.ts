import { NextRequest, NextResponse } from "next/server";

import { createCheckout } from "@/libs/stripe";
import { createClient } from "@/libs/supabase/server";
import { z } from 'zod';

const checkoutSchema = z.object({
  priceId: z.string(),
  mode: z.enum(['payment', 'subscription']),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

// This function is used to create a Stripe Checkout Session (one-time payment or subscription)
// It's called by the <ButtonCheckout /> component
// Users must be authenticated. It will prefill the Checkout data with their email and/or credit card (if any)
export async function POST(req: NextRequest) {
  const body = await req.json();

  const validation = checkoutSchema.safeParse(body);
  if (!validation.success) {
    console.error('Invalid checkout data:', validation.error);
    return NextResponse.json({ message: "Invalid checkout data" }, { status: 400 });
  }

  const supabase = createClient();

  // Check if a user is logged in
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 }); // Return 401 status
  }

  try {
    const { priceId, mode, successUrl, cancelUrl } = validation.data;

    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("id", user?.id)
      .single();

    const stripeSessionURL = await createCheckout({
      priceId,
      mode,
      successUrl,
      cancelUrl,
      // If user is logged in, it will pass the user ID to the Stripe Session so it can be retrieved in the webhook later
      clientReferenceId: user?.id,
      user: {
        email: data?.email,
        // If the user has already purchased, it will automatically prefill it's credit card
        customerId: data?.customer_id,
      },
      // If you send coupons from the frontend, you can pass it here
      // couponId: body.couponId,
    });

    return NextResponse.json({ url: stripeSessionURL });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
