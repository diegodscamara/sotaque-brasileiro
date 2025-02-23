"use server";

import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { z } from "zod";

import { type TeacherAvailability } from "@/types";

const availabilitySchema = z.object({
  teacherId: z.string().uuid(),
  startDateTime: z.coerce.date(),
  endDateTime: z.coerce.date(),
  isAvailable: z.boolean().default(true),
  recurringRules: z.record(z.any()).optional(),
  notes: z.string().optional(),
});

/**
 * Adds teacher availability
 */
export async function addTeacherAvailability(data: Omit<TeacherAvailability, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const supabase = createServerComponentClient({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("Unauthorized");
    }

    // Validate availability data
    const validatedData = availabilitySchema.parse(data);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/teacher_availability/create`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(validatedData),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to add availability: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error adding availability:", error);
    throw error;
  }
}

/**
 * Gets teacher availability
 */
export async function getTeacherAvailability(teacherId: string, date: string) {
  try {
    const supabase = createServerComponentClient({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("Unauthorized");
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/teacher_availability/get?teacherId=${teacherId}&date=${date}`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch availability: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching availability:", error);
    throw error;
  }
}
