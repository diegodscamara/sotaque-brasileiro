"use server";

import { createClient } from "@/libs/supabase/server";
import { prisma } from "@/libs/prisma";
import { z } from "zod";

import { type TeacherAvailability } from "@/types";
import { standardizeDate, logDateInfo, formatDateInTimezone } from "@/app/utils/timezone";

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

    // Parse the date to get start and end of day in UTC
    const startDate = new Date(date);
    startDate.setUTCHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setUTCHours(23, 59, 59, 999);

    console.log(`Fetching availability for teacher ${teacherId} on ${date}`);
    console.log(`  - UTC start date: ${startDate.toISOString()}`);
    console.log(`  - UTC end date: ${endDate.toISOString()}`);

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

    console.log(`Found ${availability.length} availability slots`);
    
    // Log the first few slots for debugging
    if (availability.length > 0) {
      availability.slice(0, 3).forEach((slot, index) => {
        console.log(`Slot ${index + 1}:`);
        console.log(`  - ID: ${slot.id}`);
        console.log(`  - Start: ${slot.startDateTime.toISOString()}`);
        console.log(`  - End: ${slot.endDateTime.toISOString()}`);
        console.log(`  - Available: ${slot.isAvailable}`);
      });
    }

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

    // Parse the dates to ensure UTC consistency
    const parsedStartDate = new Date(startDate);
    parsedStartDate.setUTCHours(0, 0, 0, 0);
    
    const parsedEndDate = new Date(endDate);
    parsedEndDate.setUTCHours(23, 59, 59, 999);

    console.log(`Fetching availability range for teacher ${teacherId} from ${startDate} to ${endDate}`);
    console.log(`  - UTC start date: ${parsedStartDate.toISOString()}`);
    console.log(`  - UTC end date: ${parsedEndDate.toISOString()}`);

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

    console.log(`Found ${availability.length} availability slots in range`);
    
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
 * @returns {Promise<{reservationId: string, expiresAt: Date}>} The reservation ID and expiration time
 */
export async function createTemporaryReservation(
  teacherId: string,
  startDateTime: Date,
  endDateTime: Date,
  studentId: string
): Promise<{reservationId: string, expiresAt: Date}> {
  try {
    // Standardize dates to ensure consistent time zone handling
    const standardizedStartDateTime = standardizeDate(startDateTime);
    const standardizedEndDateTime = standardizeDate(endDateTime);
    
    // Log timezone information for debugging
    console.log(`Creating temporary reservation with UTC times:`);
    console.log(`  - UTC startDateTime: ${standardizedStartDateTime.toISOString()}`);
    console.log(`  - UTC endDateTime: ${standardizedEndDateTime.toISOString()}`);
    
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

    // Verify the student exists and get their timezone
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        timeZone: true
      }
    });

    if (!student) {
      throw new Error("Student not found");
    }

    // Log the student's timezone for debugging
    const studentTimezone = student.timeZone || 'UTC';
    console.log(`Student timezone: ${studentTimezone}`);
    
    // Format times in student's timezone for logging
    if (studentTimezone) {
      try {
        const localStartTime = formatDateInTimezone(standardizedStartDateTime, studentTimezone, 'HH:mm');
        const localEndTime = formatDateInTimezone(standardizedEndDateTime, studentTimezone, 'HH:mm');
        console.log(`  - Student local time: ${localStartTime}-${localEndTime}`);
      } catch (error) {
        console.error("Error formatting time in student timezone:", error);
      }
    }

    // Check if the student already has a reservation for this time slot
    const existingReservation = await prisma.class.findFirst({
      where: {
        teacherId,
        studentId,
        startDateTime: standardizedStartDateTime,
        endDateTime: standardizedEndDateTime,
        status: 'PENDING',
        notes: 'TEMPORARY_RESERVATION'
      }
    });

    if (existingReservation) {
      console.log(`Student ${studentId} already has reservation ${existingReservation.id} for this time slot, returning it`);
      
      // If the student already has a reservation for this time slot, return it
      // Set expiration time (15 minutes from now)
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 15);

      return {
        reservationId: existingReservation.id,
        expiresAt
      };
    }

    // Check if there are any conflicting classes from other students
    const conflictingClasses = await prisma.class.findMany({
      where: {
        teacherId,
        status: { in: ['PENDING', 'CONFIRMED', 'SCHEDULED'] },
        studentId: { not: studentId }, // Exclude this student's reservations
        OR: [
          // Class starts during the requested time slot
          {
            startDateTime: {
              gte: standardizedStartDateTime,
              lt: standardizedEndDateTime,
            },
          },
          // Class ends during the requested time slot
          {
            endDateTime: {
              gt: standardizedStartDateTime,
              lte: standardizedEndDateTime,
            },
          },
          // Class completely encompasses the requested time slot
          {
            startDateTime: {
              lte: standardizedStartDateTime,
            },
            endDateTime: {
              gte: standardizedEndDateTime,
            },
          },
        ],
      },
    });

    // If there are any conflicting classes from other students, the time slot is not available
    if (conflictingClasses.length > 0) {
      console.log(`Time slot is taken by another student: ${conflictingClasses[0].id}`);
      throw new Error("Time slot is no longer available");
    }

    // Check if there's teacher availability for this time slot
    const date = new Date(standardizedStartDateTime);
    date.setUTCHours(0, 0, 0, 0);
    const dateStr = date.toISOString().split('T')[0];

    // Get all availability for this day
    const availabilityList = await getTeacherAvailability(teacherId, dateStr);
    
    if (!availabilityList || availabilityList.length === 0) {
      console.log(`No availability found for teacher ${teacherId} on ${dateStr}`);
      throw new Error("Teacher is not available on this date");
    }

    // Check if the requested time slot falls within any available time slot
    const isWithinAvailability = availabilityList.some(slot => {
      const slotStart = standardizeDate(slot.startDateTime);
      const slotEnd = standardizeDate(slot.endDateTime);
      
      const isAvailable = (
        slotStart <= standardizedStartDateTime &&
        slotEnd >= standardizedEndDateTime &&
        slot.isAvailable
      );
      
      if (isAvailable) {
        console.log(`Found matching availability slot: ${slot.id}`);
        console.log(`  - Slot start: ${slotStart.toISOString()}`);
        console.log(`  - Slot end: ${slotEnd.toISOString()}`);
        console.log(`  - Requested start: ${standardizedStartDateTime.toISOString()}`);
        console.log(`  - Requested end: ${standardizedEndDateTime.toISOString()}`);
      }
      
      return isAvailable;
    });

    if (!isWithinAvailability) {
      console.log(`Time slot is not within teacher's availability`);
      throw new Error("This time slot is not available in the teacher's schedule");
    }

    console.log(`Creating new reservation for student ${studentId} with teacher ${teacherId}`);

    // Create a temporary reservation in the database
    const reservation = await prisma.class.create({
      data: {
        teacherId,
        studentId,
        startDateTime: standardizedStartDateTime,
        endDateTime: standardizedEndDateTime,
        duration: Math.round((standardizedEndDateTime.getTime() - standardizedStartDateTime.getTime()) / (1000 * 60)),
        status: 'PENDING', // Using PENDING status for reservations
        notes: 'TEMPORARY_RESERVATION', // Mark as temporary
      }
    });

    // Set expiration time (15 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    console.log(`Created reservation ${reservation.id} expiring at ${expiresAt.toISOString()}`);

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
 * Checks if a time slot is available for a teacher
 * @param {string} teacherId - The ID of the teacher
 * @param {Date} startDateTime - The start time of the slot
 * @param {Date} endDateTime - The end time of the slot
 * @param {string} studentId - The ID of the student (to exclude their own reservations)
 * @returns {Promise<boolean>} Whether the time slot is available
 */
export async function checkTimeSlotAvailability(
  teacherId: string,
  startDateTime: Date,
  endDateTime: Date,
  studentId?: string
): Promise<boolean> {
  try {
    // Standardize dates to ensure consistent time zone handling
    const standardizedStartDateTime = standardizeDate(startDateTime);
    const standardizedEndDateTime = standardizeDate(endDateTime);
    
    // Log timezone information for debugging
    logDateInfo("Checking availability - Original startDateTime", startDateTime);
    logDateInfo("Checking availability - Standardized startDateTime", standardizedStartDateTime);
    
    // If studentId is provided, get their timezone for logging
    if (studentId) {
      try {
        const student = await prisma.student.findUnique({
          where: { id: studentId },
          select: { timeZone: true }
        });
        
        if (student && student.timeZone) {
          console.log(`Checking availability with student timezone: ${student.timeZone}`);
        }
      } catch (error) {
        console.error("Error fetching student timezone:", error);
      }
    }
    
    // Check for existing classes or reservations that would conflict
    const conflictingClassesQuery: any = {
      teacherId,
      status: { in: ['PENDING', 'CONFIRMED', 'SCHEDULED'] },
      OR: [
        // Class starts during the requested time slot
        {
          startDateTime: {
            gte: standardizedStartDateTime,
            lt: standardizedEndDateTime,
          },
        },
        // Class ends during the requested time slot
        {
          endDateTime: {
            gt: standardizedStartDateTime,
            lte: standardizedEndDateTime,
          },
        },
        // Class completely encompasses the requested time slot
        {
          startDateTime: {
            lte: standardizedStartDateTime,
          },
          endDateTime: {
            gte: standardizedEndDateTime,
          },
        },
      ],
    };

    // If studentId is provided, exclude their own reservations
    if (studentId) {
      conflictingClassesQuery.studentId = { not: studentId };
    }

    const conflictingClasses = await prisma.class.findMany({
      where: conflictingClassesQuery,
    });

    // If there are any conflicting classes from other students, the time slot is not available
    if (conflictingClasses.length > 0) {
      console.log(`Time slot is taken by another student: ${conflictingClasses[0].id}`);
      return false;
    }

    // Check if there's teacher availability for this time slot
    const date = new Date(standardizedStartDateTime);
    date.setUTCHours(0, 0, 0, 0);
    const dateStr = date.toISOString().split('T')[0];

    // Get all availability for this day
    const availabilityList = await getTeacherAvailability(teacherId, dateStr);
    
    if (!availabilityList || availabilityList.length === 0) {
      console.log(`No availability found for teacher ${teacherId} on ${dateStr}`);
      return false;
    }

    // Check if the requested time slot falls within any available time slot
    const isWithinAvailability = availabilityList.some(slot => {
      const slotStart = standardizeDate(slot.startDateTime);
      const slotEnd = standardizeDate(slot.endDateTime);
      
      const isAvailable = (
        slotStart <= standardizedStartDateTime &&
        slotEnd >= standardizedEndDateTime &&
        slot.isAvailable
      );
      
      if (isAvailable) {
        console.log(`Found matching availability slot: ${slot.id}`);
        console.log(`  - Slot start: ${slotStart.toISOString()}`);
        console.log(`  - Slot end: ${slotEnd.toISOString()}`);
        console.log(`  - Requested start: ${standardizedStartDateTime.toISOString()}`);
        console.log(`  - Requested end: ${standardizedEndDateTime.toISOString()}`);
      }
      
      return isAvailable;
    });

    if (!isWithinAvailability) {
      console.log(`Time slot is not within teacher's availability`);
      return false;
    }

    return true;
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
