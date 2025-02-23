"use server";

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { z } from "zod";

import { type ClassData } from "@/types";

const classDataSchema = z.object({
  teacherId: z.string().uuid(),
  studentId: z.string().uuid(),
  status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']).default('PENDING'),
  startDateTime: z.coerce.date(),
  endDateTime: z.coerce.date(),
  duration: z.number().int().positive(),
  notes: z.string().optional(),
  feedback: z.string().optional(),
  rating: z.number().int().min(1).max(5).optional(),
  recurringGroupId: z.string().uuid().optional(),
});

/**
 * Fetches classes with optional filtering and pagination
 */
export async function fetchClasses(
  filters = {},
  pagination = { page: 1, limit: 10 }
) {
  try {
    const supabase = createServerComponentClient({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("Unauthorized");
    }

    const queryString = new URLSearchParams({
      ...filters,
      page: pagination.page.toString(),
      limit: pagination.limit.toString(),
    }).toString();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/classes/get?${queryString}`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch classes: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching classes:", error);
    throw error;
  }
}

/**
 * Edits an existing class
 */
export async function editClass(classId: string, classData: ClassData) {
  try {
    const supabase = createServerComponentClient({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("Unauthorized");
    }

    // Validate class data
    const validatedData = classDataSchema.parse(classData);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/classes/edit`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ classId, classData: validatedData }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to edit class: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error editing class:", error);
    throw error;
  }
}

/**
 * Cancels a class
 */
export async function cancelClass(classId: string) {
  try {
    const supabase = createServerComponentClient({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("Unauthorized");
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/classes/cancel`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ classId }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to cancel class: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error canceling class:", error);
    throw error;
  }
}

/**
 * Schedules a new class
 */
export async function scheduleClass(classData: ClassData) {
  try {
    const supabase = createServerComponentClient({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("Unauthorized");
    }

    // Validate class data
    const validatedData = classDataSchema.parse(classData);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/classes/schedule`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          userId: session.user.id,
          classData: validatedData,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to schedule class: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error scheduling class:", error);
    throw error;
  }
}
