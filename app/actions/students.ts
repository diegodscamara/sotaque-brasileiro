"use server";

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { z } from "zod";

import { type Student } from "@/types";

const studentSchema = z.object({
  userId: z.string().uuid(),
  credits: z.number().int().default(0),
  customerId: z.string().optional(),
  priceId: z.string().optional(),
  hasAccess: z.boolean().default(false),
  packageName: z.string().optional(),
  packageExpiration: z.coerce.date().optional(),
  portugueseLevel: z.string().optional(),
  learningGoals: z.array(z.string()),
  nativeLanguage: z.string().optional(),
  otherLanguages: z.array(z.string()),
  timeZone: z.string().optional(),
  hasCompletedOnboarding: z.boolean().default(false),
});

/**
 * Fetches a single student by ID
 */
export async function getStudent(studentId: string) {
  try {
    const supabase = createServerComponentClient({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("Unauthorized");
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/students/get?id=${studentId}`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch student: ${response.statusText}`);
    }

    const data = await response.json();
    return data[0] || null;
  } catch (error) {
    console.error("Error fetching student:", error);
    throw error;
  }
}

/**
 * Fetches all students
 */
export async function getStudents() {
  try {
    const supabase = createServerComponentClient({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("Unauthorized");
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/students/get`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch students: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching students:", error);
    throw error;
  }
}

/**
 * Updates a student's information
 */
export async function editStudent(studentId: string, studentData: Student) {
  try {
    const supabase = createServerComponentClient({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("Unauthorized");
    }

    // Validate student data
    const validatedData = studentSchema.parse(studentData);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/students/edit`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ studentId, studentData: validatedData }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to edit student: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error editing student:", error);
    throw error;
  }
}

/**
 * Deletes a student
 */
export async function deleteStudent(studentId: string) {
  try {
    const supabase = createServerComponentClient({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("Unauthorized");
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/students/delete`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ studentId }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to delete student: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting student:", error);
    throw error;
  }
}
