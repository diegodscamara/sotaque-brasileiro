"use server";

import { createClient } from "@/libs/supabase/server";
import { prisma } from "@/libs/prisma";
import { z } from "zod";
import { cache } from "react";

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
 * Fetches a single student by ID with caching
 * @param {string} studentId - The ID of the student to fetch
 * @returns {Promise<Student | null>} The student data or null if not found
 */
export const getStudent = cache(async (studentId: string) => {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    // Find the student by userId using where clause
    const student = await prisma.student.findFirst({
      where: {
        userId: studentId
      }
    });

    if (student) {
      // Ensure boolean fields are properly returned as booleans
      return {
        ...student,
        hasCompletedOnboarding: Boolean(student.hasCompletedOnboarding),
        hasAccess: Boolean(student.hasAccess),
        learningGoals: student.learningGoals || [],
        otherLanguages: student.otherLanguages || [],
      };
    }

    return null;
  } catch (error) {
    console.error("Error fetching student:", error);
    return null;
  }
});

/**
 * Fetches all students
 * @returns {Promise<Student[]>} Array of student data
 */
export async function getStudents() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    // Query all students directly using Prisma
    const students = await prisma.student.findMany();

    return students;
  } catch (error) {
    console.error("Error fetching students:", error);
    throw error;
  }
}

/**
 * Updates a student's information
 * @param {string} studentId - The ID of the student to update
 * @param {Student} studentData - The updated student data
 * @returns {Promise<Student>} The updated student data
 */
export async function editStudent(studentId: string, studentData: Student) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    // Validate student data
    const validatedData = studentSchema.parse(studentData);

    // First find the student by userId to get the actual id
    const student = await prisma.student.findFirst({
      where: {
        userId: studentId
      }
    });

    if (!student) {
      throw new Error("Student not found");
    }

    // Update student directly using Prisma with the correct id
    const updatedStudent = await prisma.student.update({
      where: { id: student.id },
      data: validatedData,
    });

    return updatedStudent;
  } catch (error) {
    console.error("Error editing student:", error);
    throw error;
  }
}

/**
 * Deletes a student
 * @param {string} studentId - The ID of the student to delete
 * @returns {Promise<{ success: boolean }>} Success status
 */
export async function deleteStudent(studentId: string) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    // First find the student by userId to get the actual id
    const student = await prisma.student.findFirst({
      where: {
        userId: studentId
      }
    });

    if (!student) {
      throw new Error("Student not found");
    }

    // Delete student directly using Prisma with the correct id
    await prisma.student.delete({
      where: { id: student.id },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting student:", error);
    throw error;
  }
}

/**
 * Updates a student's profile
 * @param {string} studentId - The ID of the student to update
 * @param {Partial<Student>} studentData - The student data to update
 * @returns {Promise<Student | null>} The updated student data or null if not found
 */
export async function updateStudent(studentId: string, studentData: Partial<any>): Promise<any> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    // Find the student by ID
    const student = await prisma.student.findFirst({
      where: {
        id: studentId
      }
    });

    if (!student) {
      throw new Error("Student not found");
    }

    // Update student data
    const updatedStudent = await prisma.student.update({
      where: {
        id: studentId
      },
      data: {
        portugueseLevel: studentData.portugueseLevel,
        nativeLanguage: studentData.nativeLanguage,
        otherLanguages: studentData.otherLanguages,
        learningGoals: studentData.learningGoals,
        timeZone: studentData.timeZone,
      }
    });

    return {
      ...updatedStudent,
      hasCompletedOnboarding: Boolean(updatedStudent.hasCompletedOnboarding),
      hasAccess: Boolean(updatedStudent.hasAccess),
      learningGoals: updatedStudent.learningGoals || [],
      otherLanguages: updatedStudent.otherLanguages || [],
    };
  } catch (error) {
    console.error("Error updating student:", error);
    throw error;
  }
}
