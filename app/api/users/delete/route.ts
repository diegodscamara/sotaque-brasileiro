import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/libs/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { userId } = await req.json();

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

  const { error: deleteError } = await supabase
    .from("User")
    .delete()
    .eq("id", userId);
  if (deleteError) {
    return NextResponse.json({ message: deleteError.message }, { status: 500 });
  }

  return NextResponse.json(
    { message: "User deleted successfully" },
    { status: 200 }
  );
}
