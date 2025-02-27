"use server";

import { createClient } from "@/libs/supabase/server";
import { prisma } from "@/libs/prisma";
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
 * @param {string} studentId - The ID of the student to fetch
 * @returns {Promise<Student | null>} The student data or null if not found
 */
export async function getStudent(studentId: string) {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("Unauthorized");
    }

    // Find the student by userId using where clause
    const student = await prisma.student.findFirst({
      where: {
        userId: studentId
      }
    });

    return student;
  } catch (error) {
    console.error("Error fetching student:", error);
    throw error;
  }
}

/**
 * Fetches all students
 * @returns {Promise<Student[]>} Array of student data
 */
export async function getStudents() {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
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
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
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
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
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
