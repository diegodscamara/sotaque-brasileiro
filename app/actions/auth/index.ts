"use server";

import { Role } from "@prisma/client";
import { createClient } from "@/libs/supabase/server";
import { z } from "zod";
import { prisma } from "@/libs/prisma";

// Input validation schemas
const passwordSchema = z.string().min(8, "Password must be at least 8 characters");
const emailSchema = z.string().email("Please enter a valid email address");

/**
 * Signs in a user with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<{success: boolean, data?: {redirectUrl: string}, error?: string}>}
 */
export async function signIn(email: string, password: string) {
  try {
    // Validate inputs
    emailSchema.parse(email);
    passwordSchema.parse(password);

    const supabase = createClient();

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

    // Get user from database using Prisma
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    // Determine redirect URL based on user role
    let redirectUrl = "/dashboard";
    if (user.role === Role.STUDENT) {
      // Check if student has completed onboarding
      const student = await prisma.student.findFirst({
        where: { userId: user.id },
      });
      
      if (student && !student.hasCompletedOnboarding) {
        redirectUrl = "/onboarding";
      } else if (student && !student.hasAccess) {
        redirectUrl = "/#pricing";
      }
    }

    return { 
      success: true, 
      data: { redirectUrl } 
    };
  } catch (error) {
    console.error("Error in signIn:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

/**
 * Signs up a new user
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @param {"STUDENT" | "TEACHER"} role - User's role
 * @returns {Promise<{success: boolean, data?: {redirectUrl: string}, error?: string}>}
 */
export async function signUp(
  email: string,
  password: string,
  role: "STUDENT" | "TEACHER"
) {
  try {
    // Validate inputs
    emailSchema.parse(email);
    passwordSchema.parse(password);

    const supabase = createClient();

    // Check if user already exists
    const { data: existingUser } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (existingUser.session) {
      return {
        success: false,
        error: "User already exists. Please sign in instead.",
      };
    }

    // Create new user in Supabase
    const {
      data: { user },
      error: signUpError,
    } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role },
      },
    });

    if (signUpError || !user) {
      return {
        success: false,
        error: signUpError?.message || "Signup failed",
      };
    }

    // Create user in database using Prisma
    try {
      // Create user record with Prisma transaction to ensure consistency
      await prisma.$transaction(async (tx) => {
        // Create user record
        await tx.user.create({
          data: {
            id: user.id,
            email: user.email!,
            role: role as Role,
          },
        });

        // Create role-specific record
        if (role === "STUDENT") {
          await tx.student.create({
            data: {
              userId: user.id,
            },
          });
        } else if (role === "TEACHER") {
          await tx.teacher.create({
            data: {
              userId: user.id,
            },
          });
        }
      });
    } catch (dbError) {
      console.error("Database error during signup:", dbError);
      
      // Clean up Supabase user if database creation fails
      await supabase.auth.admin.deleteUser(user.id);
      
      return {
        success: false,
        error: "Failed to create user record",
      };
    }

    // Determine redirect URL based on role
    const redirectUrl = role === "STUDENT" ? "/#pricing" : "/dashboard";
    return { success: true, data: { redirectUrl } };
  } catch (error) {
    console.error("Error in signUp:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

/**
 * Signs out the current user
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function signOut() {
  try {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error in signOut:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

/**
 * Gets the current authenticated user
 * @returns {Promise<{user: any, session: any} | null>}
 */
export async function getCurrentUser() {
  try {
    const supabase = createClient();
    
    // Get user authentication data
    const { data: authData, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authData.user) {
      return null;
    }
    
    // Get session data
    const { data: sessionData } = await supabase.auth.getSession();
    
    // Get user from database with additional info using Prisma
    const dbUser = await prisma.user.findUnique({
      where: { id: authData.user.id },
    });
    
    if (!dbUser) {
      return null;
    }
    
    return {
      user: {
        ...authData.user,
        ...dbUser,
      },
      session: sessionData.session,
    };
  } catch (error) {
    console.error("Error in getCurrentUser:", error);
    return null;
  }
}

/**
 * Sends a password reset email to the specified address
 * @param {string} email - The email address to send reset link to
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function resetPasswordForEmail(email: string) {
  try {
    const supabase = createClient();
    const validatedEmail = emailSchema.parse(email);

    const { error } = await supabase.auth.resetPasswordForEmail(
      validatedEmail,
      {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/reset-password`,
      }
    );

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error in resetPasswordForEmail:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

/**
 * Updates the current user's password
 * @param {string} password - The new password
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function updateUserPassword(password: string) {
  try {
    const supabase = createClient();
    const validatedPassword = passwordSchema.parse(password);

    const { error } = await supabase.auth.updateUser({
      password: validatedPassword,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error in updateUserPassword:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}
