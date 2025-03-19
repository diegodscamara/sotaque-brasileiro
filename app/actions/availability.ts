"use server";

import { createClient } from "@/libs/supabase/server";
import { prisma } from "@/libs/prisma";
import { z } from "zod";

import { type TeacherAvailability } from "@/types";
import { standardizeDate, logDateInfo, formatDateInTimezone } from "@/app/utils/timezone";

const availabilitySchema = z.object({
  teacherId: z.string().uuid(),
  startDateTime: z.union([z.string(), z.date()]).transform(val => 
    typeof val === 'string' ? new Date(val) : val
  ),
  endDateTime: z.union([z.string(), z.date()]).transform(val => 
    typeof val === 'string' ? new Date(val) : val
  ),
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
 * @param {boolean} includeUnavailable - Whether to include unavailable slots (default: true)
 * @returns {Promise<TeacherAvailability[]>} Array of availability data
 */
export async function getTeacherAvailability(
  teacherId: string, 
  date: string, 
  includeUnavailable: boolean = true
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

    // Parse the date to get start and end of day in UTC
    const startDate = new Date(date);
    startDate.setUTCHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setUTCHours(23, 59, 59, 999);

    console.log(`Fetching availability for teacher ${teacherId} on ${date}`);
    console.log(`  - UTC start date: ${startDate.toISOString()}`);
    console.log(`  - UTC end date: ${endDate.toISOString()}`);
    console.log(`  - Including unavailable slots: ${includeUnavailable}`);

    // Prepare the query
    const query: any = {
      teacherId,
      startDateTime: {
        gte: startDate,
        lte: endDate,
      },
    };
    
    // Add isAvailable filter if we don't want unavailable slots
    if (!includeUnavailable) {
      query.isAvailable = true;
    }

    // Query availability directly using Prisma
    const availability = await prisma.teacherAvailability.findMany({
      where: query,
      orderBy: {
        startDateTime: 'asc',
      },
    });

    console.log(`Found ${availability.length} availability slots`);
    
    // Log available vs unavailable slots
    const availableSlots = availability.filter(slot => slot.isAvailable);
    const unavailableSlots = availability.filter(slot => !slot.isAvailable);
    console.log(`Available slots: ${availableSlots.length}, Unavailable slots: ${unavailableSlots.length}`);
    
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
    
    // Special logging for UI display - what's actually being sent back
    console.log(`Will return ${availability.filter(slot => includeUnavailable || slot.isAvailable).length} slots to UI`);

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
  data: Omit<z.infer<typeof availabilitySchema>, 'id'>
): Promise<TeacherAvailability> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    // Validate data
    try {
      availabilitySchema.parse({ ...data, id: availabilityId });
    } catch (error) {
      console.error("Validation error:", error);
      throw error;
    }

    // Verify start time is before end time
    if (new Date(data.startDateTime) >= new Date(data.endDateTime)) {
      throw new Error("Start time must be before end time");
    }

    // Find the availability
    const availability = await prisma.teacherAvailability.findUnique({
      where: { id: availabilityId },
    });

    if (!availability) {
      throw new Error("Availability not found");
    }

    // IMPORTANT CHANGE: If marking as unavailable, allow it regardless of existing classes
    if (availability.isAvailable && data.isAvailable === false) {
      console.log(`Marking availability slot ${availabilityId} as unavailable`);
      
      // Just check and log classes, but don't block the update
      const existingClasses = await prisma.class.findMany({
        where: {
          teacherId: availability.teacherId,
          startDateTime: {
            gte: availability.startDateTime,
            lt: availability.endDateTime,
          },
        },
      });
      
      if (existingClasses.length > 0) {
        console.log(`Found ${existingClasses.length} existing classes that overlap with this slot. Continuing anyway since we're marking as unavailable.`);
      }
    } 
    // Only check for classes if making a slot available
    else if (data.isAvailable === true && !availability.isAvailable) {
      console.log(`Attempting to mark availability slot ${availabilityId} as available`);
      
      // Check for overlapping classes before making available
      const existingClasses = await prisma.class.findMany({
        where: {
          teacherId: availability.teacherId,
          status: { not: 'CANCELLED' },
          startDateTime: {
            gte: availability.startDateTime,
            lt: availability.endDateTime,
          },
        },
      });
      
      if (existingClasses.length > 0) {
        console.log(`Cannot make slot available - found ${existingClasses.length} active classes`);
        throw new Error("Cannot make slot available because there are scheduled classes during this time");
      }
    }

    // Update the availability
    const updatedAvailability = await prisma.teacherAvailability.update({
      where: { id: availabilityId },
      data: {
        ...data,
        startDateTime: new Date(data.startDateTime),
        endDateTime: new Date(data.endDateTime),
      },
    });

    console.log(`Updated availability ${availabilityId} - isAvailable: ${updatedAvailability.isAvailable}`);
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

/**
 * Find availability slots that contain a specific time range
 * @param {string} teacherId - The ID of the teacher
 * @param {Date} startDateTime - The start date/time to search for
 * @param {Date} endDateTime - The end date/time to search for
 * @returns {Promise<any[]>} The matching availability slots
 */
export async function findAvailabilitySlotsForTimeRange(
  teacherId: string,
  startDateTime: Date,
  endDateTime: Date
): Promise<any[]> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    console.log(`Finding availability slots for time range:
      Teacher: ${teacherId}
      Start: ${startDateTime.toISOString()}
      End: ${endDateTime.toISOString()}`);

    // Find any slots that contain the specified time range
    const availabilitySlots = await prisma.teacherAvailability.findMany({
      where: {
        teacherId,
        startDateTime: { lte: startDateTime },
        endDateTime: { gte: endDateTime },
      }
    });

    console.log(`Found ${availabilitySlots.length} slots containing the time range`);
    
    return availabilitySlots;
  } catch (error) {
    console.error("Error finding availability slots:", error);
    throw error;
  }
}

/**
 * Restores availability after a class is canceled
 * @param {string} teacherId - The ID of the teacher
 * @param {Date} startDateTime - The start time of the class
 * @param {Date} endDateTime - The end time of the class
 * @returns {Promise<boolean>} Whether the operation was successful
 */
export async function restoreAvailabilityForCancelledClass(
  teacherId: string,
  startDateTime: Date,
  endDateTime: Date
): Promise<boolean> {
  console.log(`[RESTORE] Restoring availability for teacher ${teacherId} from ${startDateTime.toISOString()} to ${endDateTime.toISOString()}`);
  
  try {
    // Find overlapping availability slots
    const overlappingSlots = await prisma.teacherAvailability.findMany({
      where: {
        teacherId,
        startDateTime: { lte: endDateTime },
        endDateTime: { gte: startDateTime },
      },
    });
    
    console.log(`[RESTORE] Found ${overlappingSlots.length} overlapping availability slots`);
    
    if (overlappingSlots.length === 0) {
      console.log(`[RESTORE] No availability slots found for this time period`);
      return false;
    }
    
    // Loop through each slot and restore it directly with Prisma
    for (const slot of overlappingSlots) {
      console.log(`[RESTORE] Processing slot ${slot.id} (currently ${slot.isAvailable ? 'available' : 'unavailable'})`);
      
      // Only update if the slot is currently unavailable
      if (!slot.isAvailable) {
        try {
          // Try direct update first - bypass all validation
          const updatedSlot = await prisma.teacherAvailability.updateMany({
            where: { id: slot.id },
            data: { 
              isAvailable: true,
              notes: slot.notes ? `${slot.notes} (Auto-restored after class cancellation)` : "Auto-restored after class cancellation"
            }
          });
          
          console.log(`[RESTORE] Successfully restored availability for slot ${slot.id} - affected rows: ${updatedSlot.count}`);
        } catch (error) {
          console.error(`[RESTORE] Error restoring availability for slot ${slot.id}:`, error);
        }
      } else {
        console.log(`[RESTORE] Slot ${slot.id} is already available, skipping`);
      }
    }
    
    console.log(`[RESTORE] Completed restoration process`);
    return true;
  } catch (error) {
    console.error(`[RESTORE] Error in restoreAvailabilityForCancelledClass:`, error);
    return false;
  }
}
