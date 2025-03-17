"use server";

import { createClient } from "@/libs/supabase/server";
import { prisma } from "@/libs/prisma";
import { z } from "zod";
import { cache } from "react";

import { type Teacher } from "@/types";

const teacherSchema = z.object({
  userId: z.string().uuid(),
  biography: z.string().optional(),
  specialties: z.array(z.string()),
  languages: z.array(z.string()),
});

/**
 * Fetches a single teacher by ID with caching
 * @param {string} teacherId - The ID of the teacher to fetch
 * @returns {Promise<Teacher | null>} The teacher data or null if not found
 */
export const getTeacher = cache(async (teacherId: string) => {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    // Validate teacherId is a valid UUID
    if (!teacherId || teacherId.length < 32) {
      console.warn(`Invalid teacherId format: ${teacherId}`);
      return null;
    }

    // Find the teacher by userId
    const teacher = await prisma.teacher.findFirst({
      where: {
        userId: teacherId
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true
          }
        }
      }
    });

    if (teacher) {
      return {
        ...teacher,
        specialties: teacher.specialties || [],
        languages: teacher.languages || [],
      };
    }

    return null;
  } catch (error) {
    console.error("Error fetching teacher:", error);
    return null;
  }
});

/**
 * Fetches all teachers
 * @returns {Promise<Teacher[]>} Array of teacher data
 */
export async function getTeachers() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    // Query all teachers with user information
    const teachers = await prisma.teacher.findMany({
      include: {
        user: true
      }
    });

    return teachers;
  } catch (error) {
    console.error("Error fetching teachers:", error);
    throw error;
  }
}

/**
 * Updates a teacher's information
 * @param {string} teacherId - The ID of the teacher to update
 * @param {Teacher} teacherData - The updated teacher data
 * @returns {Promise<Teacher>} The updated teacher data
 */
export async function editTeacher(teacherId: string, teacherData: Teacher) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    // Validate teacher data
    const validatedData = teacherSchema.parse(teacherData);

    // First find the teacher by userId to get the actual id
    const teacher = await prisma.teacher.findFirst({
      where: {
        userId: teacherId
      }
    });

    if (!teacher) {
      throw new Error("Teacher not found");
    }

    // Update teacher directly using Prisma with the correct id
    const updatedTeacher = await prisma.teacher.update({
      where: { id: teacher.id },
      data: validatedData,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true
          }
        }
      }
    });

    return updatedTeacher;
  } catch (error) {
    console.error("Error editing teacher:", error);
    throw error;
  }
}

/**
 * Deletes a teacher
 * @param {string} teacherId - The ID of the teacher to delete
 * @returns {Promise<{ success: boolean }>} Success status
 */
export async function deleteTeacher(teacherId: string) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    // First find the teacher by userId to get the actual id
    const teacher = await prisma.teacher.findFirst({
      where: {
        userId: teacherId
      }
    });

    if (!teacher) {
      throw new Error("Teacher not found");
    }

    // Check if teacher has any classes
    const classesCount = await prisma.class.count({
      where: {
        teacherId: teacher.id
      }
    });

    if (classesCount > 0) {
      throw new Error("Cannot delete teacher with existing classes");
    }

    // Delete teacher's availability records first
    await prisma.teacherAvailability.deleteMany({
      where: {
        teacherId: teacher.id
      }
    });

    // Delete teacher directly using Prisma with the correct id
    await prisma.teacher.delete({
      where: { id: teacher.id },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting teacher:", error);
    throw error;
  }
}

/**
 * Updates a teacher's profile
 * @param {string} teacherId - The ID of the teacher to update
 * @param {Partial<Teacher>} teacherData - The teacher data to update
 * @returns {Promise<Teacher | null>} The updated teacher data or null if not found
 */
export async function updateTeacher(teacherId: string, teacherData: Partial<any>): Promise<any> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    // Find the teacher by ID
    const teacher = await prisma.teacher.findFirst({
      where: {
        id: teacherId
      }
    });

    if (!teacher) {
      throw new Error("Teacher not found");
    }

    // Update teacher data
    const updatedTeacher = await prisma.teacher.update({
      where: {
        id: teacherId
      },
      data: {
        biography: teacherData.biography,
        specialties: teacherData.specialties,
        languages: teacherData.languages,
      }
    });

    return {
      ...updatedTeacher,
      specialties: updatedTeacher.specialties || [],
      languages: updatedTeacher.languages || [],
    };
  } catch (error) {
    console.error("Error updating teacher:", error);
    throw error;
  }
}
