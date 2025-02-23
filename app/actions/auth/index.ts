"use server";

import { Role } from "@prisma/client";
import { SupabaseClient } from "@supabase/supabase-js";
import { User } from "@/types/User";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { z } from "zod";

// Input validation schemas
const passwordSchema = z.string().min(8);
const emailSchema = z.string().email();

/**
 * Sends a password reset email to the specified address
 * @param {string} email - The email address to send reset link to
 */
export async function resetPasswordForEmail(email: string) {
  try {
    const supabase = createServerComponentClient({ cookies });
    const validatedEmail = emailSchema.parse(email);

    const { error } = await supabase.auth.resetPasswordForEmail(
      validatedEmail,
      {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/reset-password`,
      }
    );

    if (error) throw error;
  } catch (error) {
    console.error("Error in resetPasswordForEmail:", error);
    throw error;
  }
}

/**
 * Updates the current user's password
 * @param {string} password - The new password
 */
export async function updateUserPassword(password: string) {
  try {
    const supabase = createServerComponentClient({ cookies });
    const validatedPassword = passwordSchema.parse(password);

    const { error } = await supabase.auth.updateUser({
      password: validatedPassword,
    });

    if (error) throw error;
  } catch (error) {
    console.error("Error in updateUserPassword:", error);
    throw error;
  }
}

/**
 * Gets the current authenticated user
 * @returns {Promise<User | null>} The current user or null if not authenticated
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const supabase = createServerComponentClient({ cookies });
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) throw error;
    return user;
  } catch (error) {
    console.error("Error in getCurrentUser:", error);
    return null;
  }
}

/**
 * Signs in a user with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<{success: boolean, redirectUrl: string}>}
 */
export async function signIn(email: string, password: string) {
  try {
    const supabase = createServerComponentClient({ cookies });

    // Validate inputs
    emailSchema.parse(email);
    passwordSchema.parse(password);

    const {
      data: { session },
      error: authError,
    } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return {
        success: false,
        error: authError.message,
      };
    }

    if (!session) {
      return {
        success: false,
        error: "Authentication failed",
      };
    }

    const { data: user, error: userError } = await supabase
      .from("User")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (userError || !user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    try {
      const redirectUrl = await handleRoleBasedRedirect(supabase, user);
      return { success: true, data: { redirectUrl } };
    } catch (error) {
      return {
        success: false,
        error: "Failed to determine redirect URL",
      };
    }
  } catch (error) {
    console.error("Error in signIn:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

/**
 * Signs up a new user
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @param {"STUDENT" | "TEACHER"} role - User's role
 * @returns {Promise<{success: boolean, redirectUrl: string}>}
 */
export async function signUp(
  email: string,
  password: string,
  role: "STUDENT" | "TEACHER"
) {
  try {
    const cookieStore = cookies();
    const supabase = createServerComponentClient({
      cookies: () => cookieStore,
    });

    // Validate inputs
    emailSchema.parse(email);
    passwordSchema.parse(password);

    const {
      data: { user, session },
      error: signUpError,
    } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });

    if (signUpError || !user || !session) {
      return {
        success: false,
        error: signUpError?.message || "Signup failed",
      };
    }

    const now = new Date().toISOString();

    // Create user record
    const { error: userError } = await supabase.from("User").insert([
      {
        id: user.id,
        email: user.email,
        role,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    if (userError) {
      console.error("User creation error:", userError);
      return {
        success: false,
        error: "Failed to create user record",
      };
    }

    // Create role-specific record
    if (role === "STUDENT") {
      const { error: studentError } = await supabase.from("Student").insert([
        {
          userId: user.id,
          createdAt: now,
          updatedAt: now,
        },
      ]);

      if (studentError) {
        console.error("Student creation error:", studentError);
        return {
          success: false,
          error: "Failed to create student record",
        };
      }
    } else if (role === "TEACHER") {
      const { error: teacherError } = await supabase.from("Teacher").insert([
        {
          userId: user.id,
          createdAt: now,
          updatedAt: now,
        },
      ]);

      if (teacherError) {
        console.error("Teacher creation error:", teacherError);
        return {
          success: false,
          error: "Failed to create teacher record",
        };
      }
    }

    const redirectUrl = role === "STUDENT" ? "/#pricing" : "/dashboard";
    return { success: true, data: { redirectUrl } };
  } catch (error) {
    console.error("Error in signUp:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

/**
 * Determines the redirect URL based on user's role and access status
 * @param {SupabaseClient} supabase - Supabase client instance
 * @param {any} user - User object containing role and id
 * @returns {Promise<string>} The redirect URL
 */
async function handleRoleBasedRedirect(
  supabase: SupabaseClient,
  user: any
): Promise<string> {
  if (user.role === Role.STUDENT) {
    const { data: studentRecord, error } = await supabase
      .from("Student")
      .select("hasAccess")
      .eq("userId", user.id)
      .single();

    if (error) throw error;
    return studentRecord?.hasAccess ? "/dashboard" : "/#pricing";
  }

  if (user.role === Role.TEACHER) {
    return "/dashboard";
  }

  if (user.role === Role.ADMIN) {
    return "/admin";
  }

  throw new Error("Invalid role");
}
