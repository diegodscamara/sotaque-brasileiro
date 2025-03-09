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
    const where: Record<string, any> = { ...filters };

    // Get the current user's role and ID
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, role: true }
    });

    if (!dbUser) {
      throw new Error("User not found");
    }

    // If the user is a student, only show their classes
    if (dbUser.role === 'STUDENT') {
      const student = await prisma.student.findFirst({
        where: { userId: user.id }
      });
      
      if (student) {
        where.studentId = student.id;
      }
    }
    
    // If the user is a teacher, only show their classes
    if (dbUser.role === 'TEACHER') {
      const teacher = await prisma.teacher.findFirst({
        where: { userId: user.id }
      });
      
      if (teacher) {
        where.teacherId = teacher.id;
      }
    }

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
        // Refund exactly 1 credit, regardless of class duration
        await prisma.student.update({
          where: { id: student.id },
          data: {
            credits: student.credits + 1
          }
        });
        
        console.log(`Refunded 1 credit to student ${student.id}. New balance: ${student.credits + 1}`);
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
    console.error("Error cancelling class:", error);
    throw error;
  }
}

/**
 * Cancels a pending class during the onboarding process
 * This is a simplified version of cancelClass that skips certain validations
 * @param {string} classId - The ID of the class to cancel
 * @returns {Promise<ClassData>} The cancelled class data
 */
export async function cancelPendingClass(classId: string) {
  try {
    // Ensure the class exists
    const existingClass = await prisma.class.findUnique({
      where: { id: classId }
    });

    if (!existingClass) {
      throw new Error("Class not found");
    }

    // Only cancel if the class is in PENDING status
    if (existingClass.status !== 'PENDING') {
      throw new Error("Only pending classes can be cancelled with this function");
    }

    // Update class status to CANCELLED using Prisma
    const cancelledClass = await prisma.class.update({
      where: { id: classId },
      data: { status: 'CANCELLED' }
    });

    return cancelledClass;
  } catch (error) {
    console.error("Error cancelling pending class:", error);
    throw error;
  }
}

/**
 * Schedules a new class
 * @param {ClassData} classData - The class data to create
 * @param {object} options - Additional options for scheduling
 * @returns {Promise<ClassData>} The created class data
 */
export async function scheduleClass(
  classData: ClassData, 
  options: { isOnboarding?: boolean } = {}
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    // Validate class data
    const validatedData = classDataSchema.parse(classData);

    // Skip certain validations during onboarding
    if (!options.isOnboarding) {
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

      if (!student.hasAccess && student.credits < 1) {
        throw new Error("Student doesn't have enough credits");
      }
    }

    // Check if a class is already scheduled to avoid duplicates (for onboarding)
    if (options.isOnboarding) {
      console.log(`Checking for existing pending classes for student ID ${validatedData.studentId}`);
      
      try {
        // Explicitly filter by the current student's ID to avoid finding classes for other students
        const existingClasses = await prisma.class.findMany({
          where: {
            studentId: validatedData.studentId, // Ensure we only find classes for this specific student
            status: 'PENDING',
            startDateTime: {
              gte: new Date(validatedData.startDateTime.getTime() - 60 * 1000), // 1 minute buffer
              lte: new Date(validatedData.startDateTime.getTime() + 60 * 1000), // 1 minute buffer
            },
          },
          take: 1, // Only need one result to check existence
        });

        if (existingClasses.length > 0) {
          // Double-check that this class belongs to the current student
          if (existingClasses[0].studentId === validatedData.studentId) {
            console.log(`Found existing pending class with ID ${existingClasses[0].id} for student ID ${validatedData.studentId}, returning it instead of creating a new one`);
            return existingClasses[0];
          } else {
            console.log(`Found pending class ID ${existingClasses[0].id} but it belongs to student ID ${existingClasses[0].studentId}, not current student ID ${validatedData.studentId}`);
          }
        } else {
          console.log(`No existing pending classes found for student ID ${validatedData.studentId}, creating a new one`);
        }
      } catch (error) {
        // If there's an error checking for existing classes, log it but continue with creating a new class
        console.error("Error checking for existing classes:", error);
        console.log("Continuing with creating a new class");
      }
    }

    // Create class with minimal includes to improve performance
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
      // Only include essential relations for onboarding to improve performance
      include: options.isOnboarding ? {
        teacher: {
          select: {
            id: true,
            userId: true,
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        },
        student: {
          select: {
            id: true,
            userId: true
          }
        }
      } : {
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

    return newClass;
  } catch (error) {
    console.error("Error scheduling class:", error);
    throw error;
  }
}
