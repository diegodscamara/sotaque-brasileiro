import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/libs/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = createClient();
  const { searchParams } = new URL(req.url);
  const queryParams = {
    id: searchParams.get("id"),
  };

  const { id: userId } = queryParams;
  let query = supabase.from("User").select("*");

  if (userId) {
    query = query.eq("id", userId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { message: error.message || "Error fetching users" },
      { status: 500 }
    );
  }

  return NextResponse.json(data, { status: 200 });
}
