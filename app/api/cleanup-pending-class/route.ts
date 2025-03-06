import { NextRequest, NextResponse } from "next/server";
import { cancelPendingClass } from "@/app/actions/classes";
import { logger } from "@/libs/logger";

/**
 * API endpoint for cleaning up pending classes
 * This is used when a user leaves the page during onboarding
 * @param {NextRequest} request - The request object
 * @returns {NextResponse} The response object
 */
export async function GET(request: NextRequest) {
  try {
    // Get the class ID from the query parameters
    const classId = request.nextUrl.searchParams.get("classId");
    
    if (!classId) {
      logger.warn("No class ID provided for cleanup");
      return NextResponse.json({ success: false, error: "No class ID provided" }, { status: 400 });
    }
    
    logger.info(`Cleaning up pending class: ${classId}`);
    
    // Cancel the pending class
    await cancelPendingClass(classId);
    
    logger.info(`Successfully cleaned up pending class: ${classId}`);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Error cleaning up pending class:", error);
    return NextResponse.json(
      { success: false, error: "Failed to clean up pending class" },
      { status: 500 }
    );
  }
} 