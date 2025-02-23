"use server";

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { z } from "zod";

import { type Teacher } from "@/types";

const teacherSchema = z.object({
  userId: z.string().uuid(),
  biography: z.string().optional(),
  specialties: z.array(z.string()),
  languages: z.array(z.string()),
});

/**
 * Fetches a single teacher by ID
 */
export async function getTeacher(teacherId: string) {
  try {
    const supabase = createServerComponentClient({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("Unauthorized");
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/teachers/get?id=${teacherId}`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch teacher: ${response.statusText}`);
    }

    const data = await response.json();
    return data[0] || null;
  } catch (error) {
    console.error("Error fetching teacher:", error);
    throw error;
  }
}

/**
 * Fetches all teachers
 */
export async function getTeachers() {
  try {
    const supabase = createServerComponentClient({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("Unauthorized");
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/teachers/get`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch teachers: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching teachers:", error);
    throw error;
  }
}

/**
 * Updates a teacher's information
 */
export async function editTeacher(teacherId: string, teacherData: Teacher) {
  try {
    const supabase = createServerComponentClient({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("Unauthorized");
    }

    // Validate teacher data
    const validatedData = teacherSchema.parse(teacherData);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/teachers/edit`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ teacherId, teacherData: validatedData }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to edit teacher: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error editing teacher:", error);
    throw error;
  }
}

/**
 * Deletes a teacher
 */
export async function deleteTeacher(teacherId: string) {
  try {
    const supabase = createServerComponentClient({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("Unauthorized");
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/teachers/delete`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ teacherId }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to delete teacher: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting teacher:", error);
    throw error;
  }
}
