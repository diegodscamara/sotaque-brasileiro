"use server";

import { createClient } from "@/libs/supabase/server";
import { prisma } from "@/libs/prisma";
import { z } from "zod";

import { type ClassData } from "@/types";

const classDataSchema = z.object({
  teacherId: z.string().uuid(),
  studentId: z.string().uuid(),
  status: z.enum(['SCHEDULED', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']).default('PENDING'),
  startDateTime: z.coerce.date(),
  endDateTime: z.coerce.date(),
  duration: z.number().int().positive().min(30, "Class duration must be at least 30 minutes").max(180, "Class duration cannot exceed 3 hours"),
  notes: z.string().optional(),
  feedback: z.string().optional(),
  rating: z.number().int().min(1).max(5).optional(),
  recurringGroupId: z.string().uuid().optional(),
});

/**
 * Fetches classes with optional filtering and pagination
 * @param {object} filters - Optional filters for the query
 * @param {object} pagination - Pagination options
 * @returns {Promise<{ data: ClassData[], total: number }>} Paginated class data
 */
export async function fetchClasses(
  filters = {},
  pagination = { page: 1, limit: 10 }
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    // Calculate skip for pagination
    const skip = (pagination.page - 1) * pagination.limit;

    // Build where clause from filters
    const where = { ...filters };

    // Query classes directly using Prisma with related data
    const [classes, total] = await Promise.all([
      prisma.class.findMany({
        where,
        skip,
        take: pagination.limit,
        orderBy: { startDateTime: 'desc' },
        include: {
          teacher: {
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
          },
          student: {
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
          }
        }
      }),
      prisma.class.count({ where }),
    ]);

    return {
      data: classes,
      total,
    };
  } catch (error) {
    console.error("Error fetching classes:", error);
    throw error;
  }
}

/**
 * Edits an existing class
 * @param {string} classId - The ID of the class to update
 * @param {ClassData} classData - The updated class data
 * @returns {Promise<ClassData>} The updated class data
 */
export async function editClass(classId: string, classData: ClassData) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    // Validate class data
    const validatedData = classDataSchema.parse(classData);

    // Ensure the class exists
    const existingClass = await prisma.class.findUnique({
      where: { id: classId }
    });

    if (!existingClass) {
      throw new Error("Class not found");
    }

    // Rule: Classes can be rescheduled only 24 hours in advance
    const classStartTime = new Date(existingClass.startDateTime);
    const currentTime = new Date();
    const timeDifference = classStartTime.getTime() - currentTime.getTime();

    if (timeDifference < 24 * 60 * 60 * 1000) {
      throw new Error("Class cannot be changed less than 24 hours before the scheduled time");
    }

    // Validate time conflicts for teacher
    if (validatedData.startDateTime && validatedData.endDateTime) {
      const conflictingClasses = await prisma.class.findMany({
        where: {
          id: { not: classId },
          teacherId: validatedData.teacherId,
          status: { not: 'CANCELLED' },
          OR: [
            {
              startDateTime: {
                lt: validatedData.endDateTime,
              },
              endDateTime: {
                gt: validatedData.startDateTime,
              },
            },
          ],
        },
      });

      if (conflictingClasses.length > 0) {
        throw new Error("Teacher has a scheduling conflict");
      }
    }

    // Update class directly using Prisma
    const updatedClass = await prisma.class.update({
      where: { id: classId },
      data: validatedData as any,
      include: {
        teacher: {
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
        },
        student: {
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
        }
      }
    });

    return updatedClass;
  } catch (error) {
    console.error("Error editing class:", error);
    throw error;
  }
}

/**
 * Cancels a class
 * @param {string} classId - The ID of the class to cancel
 * @returns {Promise<ClassData>} The cancelled class data
 */
export async function cancelClass(classId: string) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    // Ensure the class exists
    const existingClass = await prisma.class.findUnique({
      where: { id: classId }
    });

    if (!existingClass) {
      throw new Error("Class not found");
    }

    // Check if class is already cancelled
    if (existingClass.status === 'CANCELLED') {
      throw new Error("Class is already cancelled");
    }

    // Check if class is already completed
    if (existingClass.status === 'COMPLETED') {
      throw new Error("Cannot cancel a completed class");
    }

    // Rule: Only future classes can be cancelled
    const classStartTime = new Date(existingClass.startDateTime);
    const currentTime = new Date();
    const timeDifference = classStartTime.getTime() - currentTime.getTime();

    if (timeDifference <= 0) {
      throw new Error("Only future classes can be cancelled");
    }

    // Rule: Classes cancelled at least 24 hours in advance are refunded credits
    if (timeDifference >= 24 * 60 * 60 * 1000) {
      // Get the student to refund credits
      const student = await prisma.student.findUnique({
        where: { id: existingClass.studentId }
      });

      if (student && !student.hasAccess) {
        // Refund credits based on class duration
        await prisma.student.update({
          where: { id: student.id },
          data: {
            credits: student.credits + existingClass.duration
          }
        });
      }
    }

    // Update class status to CANCELLED using Prisma
    const cancelledClass = await prisma.class.update({
      where: { id: classId },
      data: { status: 'CANCELLED' },
      include: {
        teacher: {
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
        },
        student: {
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
        }
      }
    });

    // If the class is part of a recurring group and it's in the future, handle it
    if (existingClass.recurringGroupId && existingClass.startDateTime > new Date()) {
      // You could add logic here to handle recurring classes if needed
    }

    return cancelledClass;
  } catch (error) {
    console.error("Error canceling class:", error);
    throw error;
  }
}

/**
 * Schedules a new class
 * @param {ClassData} classData - The class data to create
 * @returns {Promise<ClassData>} The created class data
 */
export async function scheduleClass(classData: ClassData) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    // Validate class data
    const validatedData = classDataSchema.parse(classData);

    // Rule: Students can only schedule a class 24 hours in advance
    const classStartTime = new Date(validatedData.startDateTime);
    const currentTime = new Date();
    const timeDifference = classStartTime.getTime() - currentTime.getTime();

    if (timeDifference < 24 * 60 * 60 * 1000) {
      throw new Error("Class must be scheduled at least 24 hours in advance");
    }

    // Validate time conflicts for teacher
    const conflictingClasses = await prisma.class.findMany({
      where: {
        teacherId: validatedData.teacherId,
        status: { not: 'CANCELLED' },
        OR: [
          {
            startDateTime: {
              lt: validatedData.endDateTime,
            },
            endDateTime: {
              gt: validatedData.startDateTime,
            },
          },
        ],
      },
    });

    if (conflictingClasses.length > 0) {
      throw new Error("Teacher has a scheduling conflict");
    }

    // Check if student has enough credits
    const student = await prisma.student.findFirst({
      where: { id: validatedData.studentId }
    });

    if (!student) {
      throw new Error("Student not found");
    }

    if (!student.hasAccess && student.credits < validatedData.duration) {
      throw new Error("Student doesn't have enough credits");
    }

    // Create class directly using Prisma
    const newClass = await prisma.class.create({
      data: {
        teacherId: validatedData.teacherId,
        studentId: validatedData.studentId,
        status: validatedData.status as any,
        startDateTime: validatedData.startDateTime,
        endDateTime: validatedData.endDateTime,
        duration: validatedData.duration,
        notes: validatedData.notes,
        recurringGroupId: validatedData.recurringGroupId
      },
      include: {
        teacher: {
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
        },
        student: {
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
        }
      }
    });

    // Deduct credits from student if they don't have unlimited access
    if (!student.hasAccess) {
      await prisma.student.update({
        where: { id: student.id },
        data: {
          credits: student.credits - validatedData.duration
        }
      });
    }

    return newClass;
  } catch (error) {
    console.error("Error scheduling class:", error);
    throw error;
  }
}

/**
 * Schedules a class for a student during the onboarding process
 * This is a special version of scheduleClass that handles onboarding-specific logic
 */
export async function scheduleOnboardingClass(
  classData: Omit<ClassData, 'id' | 'createdAt' | 'updatedAt' | 'feedback' | 'rating'>
) {
  try {
    console.log("scheduleOnboardingClass called with data:", JSON.stringify(classData, null, 2));
    
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error("scheduleOnboardingClass: User not authenticated");
      throw new Error("Unauthorized");
    }

    // Validate class data (without requiring status to be PENDING)
    try {
      const validatedData = classDataSchema.omit({ status: true }).parse({
        ...classData,
        status: 'SCHEDULED' // Force status to be SCHEDULED
      });
      
      console.log("scheduleOnboardingClass: Data validated successfully");

      // Rule: Students can only schedule a class 24 hours in advance
      const classStartTime = new Date(validatedData.startDateTime);
      const currentTime = new Date();
      const timeDifference = classStartTime.getTime() - currentTime.getTime();

      if (timeDifference < 24 * 60 * 60 * 1000) {
        console.error("scheduleOnboardingClass: Class time is less than 24 hours in advance");
        throw new Error("Class must be scheduled at least 24 hours in advance");
      }

      // Validate time conflicts for teacher
      console.log("scheduleOnboardingClass: Checking for teacher conflicts");
      const conflictingClasses = await prisma.class.findMany({
        where: {
          teacherId: validatedData.teacherId,
          status: { in: ['PENDING', 'CONFIRMED'] },
          OR: [
            {
              startDateTime: {
                lt: validatedData.endDateTime,
              },
              endDateTime: {
                gt: validatedData.startDateTime,
              },
            },
          ],
        },
      });

      if (conflictingClasses.length > 0) {
        console.error("scheduleOnboardingClass: Teacher has a scheduling conflict", conflictingClasses);
        throw new Error("Teacher has a scheduling conflict");
      }

      // Verify that the student exists
      console.log("scheduleOnboardingClass: Verifying student exists with ID:", validatedData.studentId);
      const student = await prisma.student.findUnique({
        where: { id: validatedData.studentId }
      });
      
      if (!student) {
        console.error("scheduleOnboardingClass: Student not found with ID:", validatedData.studentId);
        throw new Error(`Student not found with ID: ${validatedData.studentId}`);
      }

      // Create class directly using Prisma with SCHEDULED status
      console.log("scheduleOnboardingClass: Creating class in database");
      const newClass = await prisma.class.create({
        data: {
          teacherId: validatedData.teacherId,
          studentId: validatedData.studentId,
          status: 'SCHEDULED' as any, // Set status to SCHEDULED
          startDateTime: validatedData.startDateTime,
          endDateTime: validatedData.endDateTime,
          duration: validatedData.duration,
          notes: validatedData.notes || "",
          recurringGroupId: validatedData.recurringGroupId
        },
        include: {
          teacher: {
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
          },
          student: {
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
          }
        }
      });

      console.log("scheduleOnboardingClass: Class created successfully with ID:", newClass.id);
      return newClass;
    } catch (validationError) {
      console.error("scheduleOnboardingClass: Validation error:", validationError);
      throw validationError;
    }
  } catch (error) {
    console.error("Error scheduling onboarding class:", error);
    throw error;
  }
}
