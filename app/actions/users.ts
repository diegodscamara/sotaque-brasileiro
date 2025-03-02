/* eslint-disable no-unused-vars */
"use server";

import { createClient } from "@/libs/supabase/server";
import { createServerClient } from "@supabase/ssr";
import { prisma } from "@/libs/prisma";
import { z } from "zod";
import { User as SupabaseUser } from "@supabase/supabase-js";

import { type User } from "@/types";

const userSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  avatarUrl: z.union([
    z.string().url(),
    z.string().length(0),
    z.null(),
    z.undefined()
  ]),
  role: z.enum(["STUDENT", "TEACHER", "ADMIN"]).default("STUDENT"),
  country: z.string().optional(),
  gender: z.string().optional(),
});

/**
 * Creates a Supabase client with service role permissions
 * @returns {ReturnType<typeof createServerClient>} A Supabase client with admin privileges
 */
function createAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get(_name: string) {
          return '';
        },
        set(_name: string, _value: string, _options: any) {
          // Do nothing, we don't need to set cookies for admin operations
        },
        remove(_name: string, _options: any) {
          // Do nothing, we don't need to remove cookies for admin operations
        }
      }
    }
  );
}

/**
 * Gets the current user's data
 * @returns {Promise<User | null>} The user data or null if not authenticated
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const supabase = createClient();
    
    // Use getUser instead of getSession for better security
    const { data: { user: authUser }, error } = await supabase.auth.getUser();
    
    if (error || !authUser) {
      return null;
    }

    const userId = authUser.id;

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
 * @returns {Promise<User | null>} The user data or null if not found
 */
export async function getUser(userId: string): Promise<User | null> {
  try {
    const supabase = createClient();
    
    // Use getUser instead of getSession for better security
    const { data: { user: authUser }, error } = await supabase.auth.getUser();
    
    if (error || !authUser) {
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
 * @param {Partial<User>} userData - The user data to update
 * @returns {Promise<User>} The updated user data
 */
export async function updateUser(userId: string, userData: Partial<User>): Promise<User> {
  try {
    const supabase = createClient();
    
    // Use getUser instead of getSession for better security
    const { data: { user: authUser }, error } = await supabase.auth.getUser();
    
    if (error || !authUser) {
      throw new Error("Unauthorized");
    }

    // Ensure the user can only update their own profile unless they're an admin
    const currentUser = await prisma.user.findUnique({
      where: { id: authUser.id },
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
 * @returns {Promise<{ data: User[], total: number }>} Paginated user data
 */
export async function getUsers(
  filters: object = {},
  pagination: { page: number; limit: number } = { page: 1, limit: 10 }
): Promise<{ data: User[]; total: number; }> {
  try {
    const supabase = createClient();
    
    // Use getUser instead of getSession for better security
    const { data: { user: authUser }, error } = await supabase.auth.getUser();
    
    if (error || !authUser) {
      throw new Error("Unauthorized");
    }

    // Check if user is admin
    const currentUser = await prisma.user.findUnique({
      where: { id: authUser.id },
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

/**
 * Creates a new user
 * @param {Partial<User>} userData - The user data to create
 * @returns {Promise<User | null>} The created user data or null if creation failed
 */
export async function createUser(userData: Partial<User>): Promise<User | null> {
  try {
    const supabase = createClient();
    
    // Use getUser instead of getSession for better security
    const { data: { user: authUser }, error } = await supabase.auth.getUser();
    
    if (error || !authUser) {
      throw new Error("Unauthorized");
    }

    // Check if user is admin
    const currentUser = await prisma.user.findUnique({
      where: { id: authUser.id },
    });

    if (currentUser?.role !== "ADMIN") {
      throw new Error("Unauthorized to create users");
    }

    // Validate user data
    const validatedData = userSchema.parse(userData);

    // Create a service role client for admin operations
    const supabaseAdmin = createAdminClient();

    // Check if email already exists in Supabase
    const { data: existingUsers, error: lookupError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (lookupError) {
      throw new Error(`Error checking existing users: ${lookupError.message}`);
    }
    
    const emailExists = existingUsers?.users.some((user: SupabaseUser) => {
      const userEmail = user.email;
      const dataEmail = validatedData.email;
      return userEmail && dataEmail && userEmail.toLowerCase() === dataEmail.toLowerCase();
    });
    
    if (emailExists) {
      throw new Error("A user with this email already exists");
    }

    // Generate a secure random password
    const randomPassword = Array(12)
      .fill('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*')
      .map(x => x[Math.floor(Math.random() * x.length)])
      .join('');

    // Create user in Supabase Auth
    const { data: newAuthUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: validatedData.email,
      email_confirm: true,
      password: randomPassword,
      user_metadata: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        role: validatedData.role,
      },
    });

    if (authError) {
      throw new Error(`Error creating user in auth: ${authError.message}`);
    }

    if (!newAuthUser || !newAuthUser.user) {
      throw new Error("Failed to create user in auth system");
    }

    try {
      // Create user in database
      const newUser = await prisma.user.create({
        data: {
          id: newAuthUser.user.id,
          email: validatedData.email,
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          avatarUrl: validatedData.avatarUrl || null,
          role: validatedData.role,
          country: validatedData.country || null,
          gender: validatedData.gender || null,
        },
      });

      // If the user is a student, create a student record
      if (validatedData.role === "STUDENT") {
        await prisma.student.create({
          data: {
            userId: newUser.id,
            credits: 0,
            hasAccess: false,
            learningGoals: [],
            otherLanguages: [],
          }
        });
      }

      // If the user is a teacher, create a teacher record
      if (validatedData.role === "TEACHER") {
        await prisma.teacher.create({
          data: {
            userId: newUser.id,
            specialties: [],
            languages: [],
          }
        });
      }

      return newUser;
    } catch (dbError) {
      // If database creation fails, delete the auth user to maintain consistency
      console.error("Error creating user in database:", dbError);
      await supabaseAdmin.auth.admin.deleteUser(newAuthUser.user.id);
      throw dbError;
    }
  } catch (error) {
    console.error("Error creating user:", error);
    return null;
  }
}

/**
 * Deletes a user
 * @param {string} userId - The ID of the user to delete
 * @returns {Promise<boolean>} Whether the deletion was successful
 */
export async function deleteUser(userId: string): Promise<boolean> {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const supabase = createClient();
    
    // Get the authenticated user
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authUser) {
      throw new Error("Unauthorized");
    }

    // Check if user is admin
    const currentUser = await prisma.user.findUnique({
      where: { id: authUser.id },
    });

    if (currentUser?.role !== "ADMIN") {
      throw new Error("Unauthorized to delete users");
    }

    // Check if user exists
    const userToDelete = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        students: true,
        teachers: true,
        notifications: true,
        errorLogs: true,
      },
    });

    if (!userToDelete) {
      throw new Error("User not found");
    }

    // Create a service role client for admin operations
    const supabaseAdmin = createAdminClient();

    // Start a transaction to ensure all related records are deleted
    await prisma.$transaction(async (tx) => {
      // Delete related records first to avoid foreign key constraints
      
      // Delete student records if they exist
      if (userToDelete.students && userToDelete.students.length > 0) {
        for (const student of userToDelete.students) {
          // Delete classes associated with the student
          await tx.class.deleteMany({
            where: { studentId: student.id }
          });
          
          // Delete the student record
          await tx.student.delete({
            where: { id: student.id }
          });
        }
      }

      // Delete teacher records if they exist
      if (userToDelete.teachers && userToDelete.teachers.length > 0) {
        for (const teacher of userToDelete.teachers) {
          // Delete availability records
          await tx.teacherAvailability.deleteMany({
            where: { teacherId: teacher.id }
          });
          
          // Delete classes associated with the teacher
          await tx.class.deleteMany({
            where: { teacherId: teacher.id }
          });
          
          // Delete the teacher record
          await tx.teacher.delete({
            where: { id: teacher.id }
          });
        }
      }
      
      // Delete notifications
      if (userToDelete.notifications.length > 0) {
        await tx.notification.deleteMany({
          where: { userId }
        });
      }
      
      // Delete error logs
      if (userToDelete.errorLogs.length > 0) {
        await tx.errorLog.deleteMany({
          where: { userId }
        });
      }

      // Delete user from database
      await tx.user.delete({
        where: { id: userId },
      });
    });

    // Delete user from Supabase Auth using admin client
    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteAuthError) {
      console.error("Error deleting user from auth:", deleteAuthError);
      // Even if auth deletion fails, we've already deleted from the database
      // We should log this inconsistency but return true since the user is deleted from our app
      return true;
    }

    return true;
  } catch (error) {
    console.error("Error deleting user:", error);
    return false;
  }
}
