import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/libs/supabase/server";
import { createCustomerPortal } from "@/libs/stripe";
import { z } from 'zod';

const portalSchema = z.object({
  returnUrl: z.string().url(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();

  const validation = portalSchema.safeParse(body);
  if (!validation.success) {
    console.error('Invalid portal data:', validation.error);
    return NextResponse.json({ message: "Invalid portal data" }, { status: 400 });
  }

  try {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in to view billing information." },
        { status: 401 }
      );
    }

    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("id", user?.id)
      .single();

    if (!data?.customer_id) {
      return NextResponse.json(
        {
          error: "You don't have a billing account yet. Make a purchase first.",
        },
        { status: 400 }
      );
    }

    const stripePortalUrl = await createCustomerPortal({
      customerId: data.customer_id,
      returnUrl: validation.data.returnUrl,
    });

    return NextResponse.json({
      url: stripePortalUrl,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
