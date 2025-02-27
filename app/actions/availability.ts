"use server";

import { createClient } from "@/libs/supabase/server";
import { prisma } from "@/libs/prisma";
import { z } from "zod";

import { type TeacherAvailability } from "@/types";

const availabilitySchema = z.object({
  teacherId: z.string().uuid(),
  startDateTime: z.coerce.date(),
  endDateTime: z.coerce.date(),
  isAvailable: z.boolean().default(true),
  recurringRules: z.record(z.any()).optional(),
  notes: z.string().optional(),
});

/**
 * Adds teacher availability
 * @param {Omit<TeacherAvailability, 'id' | 'createdAt' | 'updatedAt'>} data - The availability data to create
 * @returns {Promise<TeacherAvailability>} The created availability data
 */
export async function addTeacherAvailability(data: Omit<TeacherAvailability, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("Unauthorized");
    }

    // Validate availability data
    const validatedData = availabilitySchema.parse(data);

    // Verify the teacher exists
    const teacher = await prisma.teacher.findUnique({
      where: { id: validatedData.teacherId }
    });

    if (!teacher) {
      throw new Error("Teacher not found");
    }

    // Validate that start time is before end time
    if (validatedData.startDateTime >= validatedData.endDateTime) {
      throw new Error("Start time must be before end time");
    }

    // Validate that availability is at least 30 minutes
    const durationMs = validatedData.endDateTime.getTime() - validatedData.startDateTime.getTime();
    const durationMinutes = durationMs / (1000 * 60);
    if (durationMinutes < 30) {
      throw new Error("Availability slot must be at least 30 minutes");
    }

    // Check for overlapping availability
    const overlappingAvailability = await prisma.teacherAvailability.findFirst({
      where: {
        teacherId: validatedData.teacherId,
        OR: [
          {
            startDateTime: { lte: validatedData.startDateTime },
            endDateTime: { gt: validatedData.startDateTime }
          },
          {
            startDateTime: { lt: validatedData.endDateTime },
            endDateTime: { gte: validatedData.endDateTime }
          },
          {
            startDateTime: { gte: validatedData.startDateTime },
            endDateTime: { lte: validatedData.endDateTime }
          }
        ]
      }
    });

    if (overlappingAvailability) {
      throw new Error("Overlapping availability found");
    }

    // Create availability directly using Prisma
    const newAvailability = await prisma.teacherAvailability.create({
      data: {
        teacherId: validatedData.teacherId,
        startDateTime: validatedData.startDateTime,
        endDateTime: validatedData.endDateTime,
        isAvailable: validatedData.isAvailable,
        recurringRules: validatedData.recurringRules ? validatedData.recurringRules : undefined,
        notes: validatedData.notes
      },
    });

    return newAvailability;
  } catch (error) {
    console.error("Error adding availability:", error);
    throw error;
  }
}

/**
 * Gets teacher availability
 * @param {string} teacherId - The ID of the teacher
 * @param {string} date - The date to get availability for
 * @returns {Promise<TeacherAvailability[]>} Array of availability data
 */
export async function getTeacherAvailability(teacherId: string, date: string) {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("Unauthorized");
    }

    // Verify the teacher exists
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId }
    });

    if (!teacher) {
      throw new Error("Teacher not found");
    }

    // Parse the date to get start and end of day
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    // Query availability directly using Prisma
    const availability = await prisma.teacherAvailability.findMany({
      where: {
        teacherId,
        startDateTime: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        startDateTime: 'asc',
      },
    });

    return availability;
  } catch (error) {
    console.error("Error fetching availability:", error);
    throw error;
  }
}

/**
 * Updates an existing availability slot
 * @param {string} availabilityId - The ID of the availability to update
 * @param {Omit<TeacherAvailability, 'id' | 'createdAt' | 'updatedAt'>} data - The updated availability data
 * @returns {Promise<TeacherAvailability>} The updated availability data
 */
export async function updateTeacherAvailability(
  availabilityId: string,
  data: Omit<TeacherAvailability, 'id' | 'createdAt' | 'updatedAt'>
) {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("Unauthorized");
    }

    // Validate availability data
    const validatedData = availabilitySchema.parse(data);

    // Verify the availability exists
    const existingAvailability = await prisma.teacherAvailability.findUnique({
      where: { id: availabilityId }
    });

    if (!existingAvailability) {
      throw new Error("Availability not found");
    }

    // Validate that start time is before end time
    if (validatedData.startDateTime >= validatedData.endDateTime) {
      throw new Error("Start time must be before end time");
    }

    // Validate that availability is at least 30 minutes
    const durationMs = validatedData.endDateTime.getTime() - validatedData.startDateTime.getTime();
    const durationMinutes = durationMs / (1000 * 60);
    if (durationMinutes < 30) {
      throw new Error("Availability slot must be at least 30 minutes");
    }

    // Check for overlapping availability (excluding this one)
    const overlappingAvailability = await prisma.teacherAvailability.findFirst({
      where: {
        id: { not: availabilityId },
        teacherId: validatedData.teacherId,
        OR: [
          {
            startDateTime: { lte: validatedData.startDateTime },
            endDateTime: { gt: validatedData.startDateTime }
          },
          {
            startDateTime: { lt: validatedData.endDateTime },
            endDateTime: { gte: validatedData.endDateTime }
          },
          {
            startDateTime: { gte: validatedData.startDateTime },
            endDateTime: { lte: validatedData.endDateTime }
          }
        ]
      }
    });

    if (overlappingAvailability) {
      throw new Error("Overlapping availability found");
    }

    // Check if there are any classes scheduled during this availability
    const classesInAvailability = await prisma.class.findFirst({
      where: {
        teacherId: validatedData.teacherId,
        status: { not: 'CANCELLED' },
        startDateTime: { gte: validatedData.startDateTime },
        endDateTime: { lte: validatedData.endDateTime }
      }
    });

    if (classesInAvailability && !validatedData.isAvailable) {
      throw new Error("Cannot mark as unavailable with scheduled classes");
    }

    // Update availability directly using Prisma
    const updatedAvailability = await prisma.teacherAvailability.update({
      where: { id: availabilityId },
      data: {
        teacherId: validatedData.teacherId,
        startDateTime: validatedData.startDateTime,
        endDateTime: validatedData.endDateTime,
        isAvailable: validatedData.isAvailable,
        recurringRules: validatedData.recurringRules ? validatedData.recurringRules : undefined,
        notes: validatedData.notes
      }
    });

    return updatedAvailability;
  } catch (error) {
    console.error("Error updating availability:", error);
    throw error;
  }
}

/**
 * Deletes an availability slot
 * @param {string} availabilityId - The ID of the availability to delete
 * @returns {Promise<TeacherAvailability>} The deleted availability data
 */
export async function deleteTeacherAvailability(availabilityId: string) {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("Unauthorized");
    }

    // Verify the availability exists
    const existingAvailability = await prisma.teacherAvailability.findUnique({
      where: { id: availabilityId }
    });

    if (!existingAvailability) {
      throw new Error("Availability not found");
    }

    // Check if there are any classes scheduled during this availability
    const classesInAvailability = await prisma.class.findFirst({
      where: {
        teacherId: existingAvailability.teacherId,
        status: { not: 'CANCELLED' },
        startDateTime: { gte: existingAvailability.startDateTime },
        endDateTime: { lte: existingAvailability.endDateTime }
      }
    });

    if (classesInAvailability) {
      throw new Error("Cannot delete availability with scheduled classes");
    }

    // Delete availability directly using Prisma
    const deletedAvailability = await prisma.teacherAvailability.delete({
      where: { id: availabilityId }
    });

    return deletedAvailability;
  } catch (error) {
    console.error("Error deleting availability:", error);
    throw error;
  }
}

/**
 * Gets teacher availability for a date range
 * @param {string} teacherId - The ID of the teacher
 * @param {string} startDate - The start date of the range
 * @param {string} endDate - The end date of the range
 * @returns {Promise<TeacherAvailability[]>} Array of availability data
 */
export async function getTeacherAvailabilityRange(
  teacherId: string,
  startDate: string,
  endDate: string
) {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("Unauthorized");
    }

    // Verify the teacher exists
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId }
    });

    if (!teacher) {
      throw new Error("Teacher not found");
    }

    // Parse the dates
    const parsedStartDate = new Date(startDate);
    parsedStartDate.setHours(0, 0, 0, 0);
    
    const parsedEndDate = new Date(endDate);
    parsedEndDate.setHours(23, 59, 59, 999);

    // Query availability directly using Prisma
    const availability = await prisma.teacherAvailability.findMany({
      where: {
        teacherId,
        startDateTime: {
          gte: parsedStartDate,
          lte: parsedEndDate,
        },
      },
      orderBy: {
        startDateTime: 'asc',
      },
    });

    return availability;
  } catch (error) {
    console.error("Error fetching availability range:", error);
    throw error;
  }
}
