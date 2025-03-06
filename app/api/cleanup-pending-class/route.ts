import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";

/**
 * API endpoint to clean up pending classes when a user abandons the site
 * This is called via navigator.sendBeacon when the user leaves the page
 */
export async function GET(req: NextRequest) {
  try {
    const classId = req.nextUrl.searchParams.get("classId");
    
    if (!classId) {
      return NextResponse.json({ error: "Class ID is required" }, { status: 400 });
    }
    
    // Check if the class exists and is in PENDING status
    const existingClass = await prisma.class.findUnique({
      where: { id: classId }
    });
    
    if (!existingClass) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }
    
    if (existingClass.status !== 'PENDING') {
      return NextResponse.json({ 
        message: "Class is not in PENDING status, no action taken",
        status: existingClass.status
      });
    }
    
    // Cancel the pending class
    await prisma.class.update({
      where: { id: classId },
      data: { status: 'CANCELLED' }
    });
    
    return NextResponse.json({ 
      message: "Successfully cancelled pending class",
      classId
    });
  } catch (error) {
    console.error("Error cleaning up pending class:", error);
    return NextResponse.json({ error: "Failed to clean up pending class" }, { status: 500 });
  }
} 