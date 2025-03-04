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
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
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
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
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
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
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
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
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
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
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

/**
 * Creates a temporary reservation for a time slot
 * @param {string} teacherId - The ID of the teacher
 * @param {Date} startDateTime - The start date and time of the reservation
 * @param {Date} endDateTime - The end date and time of the reservation
 * @param {string} studentId - The ID of the student making the reservation
 * @returns {Promise<{ reservationId: string; expiresAt: Date }>} The reservation ID and expiration time
 */
export async function createTemporaryReservation(
  teacherId: string,
  startDateTime: Date,
  endDateTime: Date,
  studentId: string
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    // Verify the teacher exists
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId }
    });

    if (!teacher) {
      throw new Error("Teacher not found");
    }

    // Verify the student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId }
    });

    if (!student) {
      throw new Error("Student not found");
    }

    // Check if the time slot is available
    const isAvailable = await checkTimeSlotAvailability(teacherId, startDateTime, endDateTime);
    
    if (!isAvailable) {
      throw new Error("Time slot is no longer available");
    }

    // Create a temporary reservation in the database
    // We'll use a custom table or field to track these
    // For now, we'll create a class with a special status
    const reservation = await prisma.class.create({
      data: {
        teacherId,
        studentId,
        startDateTime,
        endDateTime,
        duration: Math.round((endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60)),
        status: 'PENDING', // Using PENDING status for reservations
        notes: 'TEMPORARY_RESERVATION', // Mark as temporary
      }
    });

    // Set expiration time (15 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    return {
      reservationId: reservation.id,
      expiresAt
    };
  } catch (error) {
    console.error("Error creating temporary reservation:", error);
    throw error;
  }
}

/**
 * Checks if a time slot is still available
 * @param {string} teacherId - The ID of the teacher
 * @param {Date} startDateTime - The start date and time to check
 * @param {Date} endDateTime - The end date and time to check
 * @returns {Promise<boolean>} Whether the time slot is available
 */
export async function checkTimeSlotAvailability(
  teacherId: string,
  startDateTime: Date,
  endDateTime: Date
): Promise<boolean> {
  try {
    // Check for existing classes or reservations that would conflict
    const conflictingClasses = await prisma.class.findMany({
      where: {
        teacherId,
        status: { in: ['PENDING', 'CONFIRMED', 'SCHEDULED'] },
        OR: [
          // Class starts during the requested time slot
          {
            startDateTime: {
              gte: startDateTime,
              lt: endDateTime,
            },
          },
          // Class ends during the requested time slot
          {
            endDateTime: {
              gt: startDateTime,
              lte: endDateTime,
            },
          },
          // Class completely encompasses the requested time slot
          {
            startDateTime: {
              lte: startDateTime,
            },
            endDateTime: {
              gte: endDateTime,
            },
          },
        ],
      },
    });

    // If there are any conflicting classes, the time slot is not available
    if (conflictingClasses.length > 0) {
      return false;
    }

    // Check if there's teacher availability for this time slot
    const date = new Date(startDateTime);
    date.setHours(0, 0, 0, 0);
    const dateStr = date.toISOString().split('T')[0];

    // Get all availability for this day
    const availabilityList = await getTeacherAvailability(teacherId, dateStr);
    
    if (!availabilityList || availabilityList.length === 0) {
      return false;
    }

    // Check if the requested time slot falls within any available time slot
    const isWithinAvailability = availabilityList.some(slot => {
      const slotStart = new Date(slot.startDateTime);
      const slotEnd = new Date(slot.endDateTime);
      
      return (
        slotStart <= startDateTime &&
        slotEnd >= endDateTime &&
        slot.isAvailable
      );
    });

    return isWithinAvailability;
  } catch (error) {
    console.error("Error checking time slot availability:", error);
    return false;
  }
}

/**
 * Cancels a temporary reservation
 * @param {string} reservationId - The ID of the reservation to cancel
 * @returns {Promise<boolean>} Whether the cancellation was successful
 */
export async function cancelTemporaryReservation(reservationId: string): Promise<boolean> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    // Find the reservation
    const reservation = await prisma.class.findUnique({
      where: { id: reservationId }
    });

    // Only delete if it's a temporary reservation
    if (reservation && reservation.notes === 'TEMPORARY_RESERVATION') {
      await prisma.class.delete({
        where: { id: reservationId }
      });
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error canceling temporary reservation:", error);
    return false;
  }
}

/**
 * Refreshes availability data for a teacher on a specific date
 * @param {string} teacherId - The ID of the teacher
 * @param {string} date - The date to refresh availability for
 * @returns {Promise<any[]>} The updated availability data
 */
export async function refreshAvailability(
  teacherId: string,
  date: string
): Promise<any[]> {
  try {
    // This is just a wrapper around getTeacherAvailability that ensures we get fresh data
    return await getTeacherAvailability(teacherId, date);
  } catch (error) {
    console.error("Error refreshing availability:", error);
    throw error;
  }
}
