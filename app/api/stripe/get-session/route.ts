import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/libs/supabase/server";
import { findCheckoutSession } from "@/libs/stripe";

/**
 * API endpoint to retrieve a Stripe checkout session
 * 
 * @param {NextRequest} request - The incoming request
 * @returns {NextResponse} The response with session data or error
 */
export async function GET(request: NextRequest) {
  try {
    // Get the session ID from the query parameters
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Authenticate the user
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Retrieve the session using the findCheckoutSession function
    const session = await findCheckoutSession(sessionId);
    
    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // Return the session data
    return NextResponse.json(session);
  } catch (error) {
    console.error("Error retrieving Stripe session:", error);
    
    return NextResponse.json(
      { 
        error: "Failed to retrieve Stripe session",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
} 