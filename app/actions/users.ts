"use server";

import { createClient } from "@/libs/supabase/server";
import { prisma } from "@/libs/prisma";
import { z } from "zod";

import { type UserData } from "@/types";

const userSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  avatarUrl: z.string().url().optional(),
  role: z.enum(["STUDENT", "TEACHER", "ADMIN"]).default("STUDENT"),
  country: z.string().optional(),
  gender: z.string().optional(),
});

/**
 * Gets the current user's data
 * @returns {Promise<UserData | null>} The user data or null if not authenticated
 */
export async function getCurrentUser() {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return null;
    }

    const userId = session.user.id;

    // Query user directly using Prisma
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    return user;
  } catch (error) {
    console.error("Error getting current user:", error);
    throw error;
  }
}

/**
 * Gets a user by ID
 * @param {string} userId - The ID of the user to get
 * @returns {Promise<UserData | null>} The user data or null if not found
 */
export async function getUser(userId: string) {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("Unauthorized");
    }

    // Query user directly using Prisma
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error("Error getting user:", error);
    throw error;
  }
}

/**
 * Updates a user's profile
 * @param {string} userId - The ID of the user to update
 * @param {Partial<UserData>} userData - The user data to update
 * @returns {Promise<UserData>} The updated user data
 */
export async function updateUser(userId: string, userData: Partial<UserData>) {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("Unauthorized");
    }

    // Ensure the user can only update their own profile unless they're an admin
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (currentUser?.id !== userId && currentUser?.role !== "ADMIN") {
      throw new Error("Unauthorized to update this user");
    }

    // Validate user data
    const validatedData = userSchema.partial().parse(userData);

    // Update user directly using Prisma
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: validatedData,
    });

    return updatedUser;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
}

/**
 * Gets all users with optional filtering and pagination
 * @param {object} filters - Optional filters for the query
 * @param {object} pagination - Pagination options
 * @returns {Promise<{ data: UserData[], total: number }>} Paginated user data
 */
export async function getUsers(
  filters = {},
  pagination = { page: 1, limit: 10 }
) {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("Unauthorized");
    }

    // Check if user is admin
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (currentUser?.role !== "ADMIN") {
      throw new Error("Unauthorized to view all users");
    }

    // Calculate skip for pagination
    const skip = (pagination.page - 1) * pagination.limit;

    // Build where clause from filters
    const where = { ...filters };

    // Query users directly using Prisma
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data: users,
      total,
    };
  } catch (error) {
    console.error("Error getting users:", error);
    throw error;
  }
}
