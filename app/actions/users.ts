"use server";

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { z } from "zod";

import { type User } from "@/types";

const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  role: z.enum(["STUDENT", "TEACHER", "ADMIN"]).default("STUDENT"),
  country: z.string().optional(),
  gender: z.string().optional(),
});

/**
 * Fetches a single user by ID
 */
export async function getUser(userId: string) {
  try {
    const supabase = createServerComponentClient({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("Unauthorized");
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/users/get?id=${userId}`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch user: ${response.statusText}`);
    }

    const data = await response.json();
    return data[0] || null;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
}

/**
 * Fetches all users with optional role filter
 */
export async function getUsers(role?: "STUDENT" | "TEACHER" | "ADMIN") {
  try {
    const supabase = createServerComponentClient({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("Unauthorized");
    }

    const queryString = role ? `?role=${role}` : "";
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/users/get${queryString}`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

/**
 * Updates a user's information
 */
export async function editUser(userId: string, userData: Partial<User>) {
  try {
    const supabase = createServerComponentClient({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("Unauthorized");
    }

    // Validate user data
    const validatedData = userSchema.partial().parse(userData);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/users/edit`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ userId, userData: validatedData }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to edit user: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error editing user:", error);
    throw error;
  }
}

/**
 * Deletes a user
 */
export async function deleteUser(userId: string) {
  try {
    const supabase = createServerComponentClient({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("Unauthorized");
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/users/delete`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ userId }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to delete user: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}

/**
 * Gets the current authenticated user
 */
export async function getCurrentUser() {
  try {
    const supabase = createServerComponentClient({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return null;
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/users/me`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch current user: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching current user:", error);
    throw error;
  }
}
