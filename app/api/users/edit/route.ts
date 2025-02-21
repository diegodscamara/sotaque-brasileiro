import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/libs/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { userId, userData } = await req.json();

  const { data: existingUserData, error: userError } = await supabase
    .from("User")
    .select("*")
    .eq("id", userId)
    .single();

  if (!existingUserData) {
    return NextResponse.json({ message: "User not found" }, { status: 400 });
  }
  if (userError) {
    return NextResponse.json({ message: userError.message }, { status: 500 });
  }

  const { error } = await supabase
    .from("User")
    .update(userData)
    .eq("id", userId);
  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json(
    { message: "User updated successfully" },
    { status: 200 }
  );
}
