"use server";

import { createClient } from "@/libs/supabase/server";
import { prisma } from "@/libs/prisma";
import { Role } from "@prisma/client";

/**
 * Creates mock teachers in the database for testing purposes
 * @returns {Promise<{ success: boolean, message: string, teacherIds?: string[] }>} Success status, message, and created teacher IDs
 */
export async function createMockTeachers(): Promise<{ 
  success: boolean; 
  message: string; 
  teacherIds?: string[];
}> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    // Check if user is an admin
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true }
    });

    if (userData?.role !== Role.ADMIN) {
      throw new Error("Only admins can create mock data");
    }

    // Mock teacher data with more detailed profiles
    const mockTeachers = [
      {
        user: {
          email: "ana.silva@example.com",
          firstName: "Ana",
          lastName: "Silva",
          avatarUrl: "https://i.pravatar.cc/150?img=1",
          role: Role.TEACHER,
          country: "Brazil",
          gender: "female"
        },
        teacher: {
          biography: "I'm a certified language teacher with 5 years of experience teaching Brazilian Portuguese. I specialize in conversational Portuguese and can help you sound like a native speaker in no time! My teaching approach is dynamic and focused on real-life situations.",
          specialties: ["Conversation", "Pronunciation", "Grammar"],
          languages: ["Portuguese", "English", "Spanish"]
        }
      },
      {
        user: {
          email: "pedro.costa@example.com",
          firstName: "Pedro",
          lastName: "Costa",
          avatarUrl: "https://i.pravatar.cc/150?img=3",
          role: Role.TEACHER,
          country: "Brazil",
          gender: "male"
        },
        teacher: {
          biography: "Former university professor with 10+ years of experience teaching Portuguese to international students. My approach focuses on practical language skills for everyday situations. I tailor my lessons to each student's needs and learning style.",
          specialties: ["Academic Portuguese", "Business Portuguese", "Cultural Context"],
          languages: ["Portuguese", "English", "French"]
        }
      },
      {
        user: {
          email: "camila.oliveira@example.com",
          firstName: "Camila",
          lastName: "Oliveira",
          avatarUrl: "https://i.pravatar.cc/150?img=5",
          role: Role.TEACHER,
          country: "Brazil",
          gender: "female"
        },
        teacher: {
          biography: "Passionate about Brazilian culture and language. I create personalized lessons based on your interests, whether that's music, literature, or just casual conversation. My goal is to make learning Portuguese fun and engaging!",
          specialties: ["Brazilian Culture", "Slang & Idioms", "Conversation"],
          languages: ["Portuguese", "English", "Italian"]
        }
      }
    ];

    // Array to store created teacher IDs
    const teacherIds: string[] = [];

    // Create teachers in the database
    for (const mockTeacher of mockTeachers) {
      try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: mockTeacher.user.email }
        });

        let teacherId: string;

        if (existingUser) {
          // Update existing user
          await prisma.user.update({
            where: { id: existingUser.id },
            data: mockTeacher.user
          });

          // Check if teacher profile exists
          const existingTeacher = await prisma.teacher.findFirst({
            where: { userId: existingUser.id }
          });

          if (existingTeacher) {
            // Update existing teacher
            const updatedTeacher = await prisma.teacher.update({
              where: { id: existingTeacher.id },
              data: mockTeacher.teacher
            });
            teacherId = updatedTeacher.id;
            console.log(`Updated existing teacher: ${mockTeacher.user.firstName} ${mockTeacher.user.lastName} (ID: ${teacherId})`);
          } else {
            // Create new teacher profile
            const newTeacher = await prisma.teacher.create({
              data: {
                ...mockTeacher.teacher,
                userId: existingUser.id
              }
            });
            teacherId = newTeacher.id;
            console.log(`Created new teacher profile for existing user: ${mockTeacher.user.firstName} ${mockTeacher.user.lastName} (ID: ${teacherId})`);
          }
        } else {
          // Create new user and teacher
          console.log(`Creating new user: ${mockTeacher.user.email}`);
          const newUser = await prisma.user.create({
            data: mockTeacher.user
          });
          console.log(`Created new user: ${mockTeacher.user.firstName} ${mockTeacher.user.lastName} (ID: ${newUser.id})`);

          console.log(`Creating new teacher profile for user: ${newUser.id}`);
          const newTeacher = await prisma.teacher.create({
            data: {
              ...mockTeacher.teacher,
              userId: newUser.id
            }
          });
          teacherId = newTeacher.id;
          console.log(`Created new teacher: ${mockTeacher.user.firstName} ${mockTeacher.user.lastName} (ID: ${teacherId})`);
        }

        teacherIds.push(teacherId);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Error creating/updating teacher ${mockTeacher.user.email}:`, error);
        console.error(`Error details: ${errorMessage}`);
        
        // Continue with the next teacher instead of failing the entire process
      }
    }

    if (teacherIds.length === 0) {
      throw new Error("Failed to create any teachers");
    }

    // Create mock availability for teachers
    await createMockAvailability(teacherIds);

    return { 
      success: true, 
      message: `Successfully created ${teacherIds.length} mock teachers with availability`, 
      teacherIds
    };
  } catch (error) {
    console.error("Error creating mock teachers:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}

/**
 * Creates mock availability for teachers
 * @param {string[]} teacherIds - Array of teacher IDs to create availability for
 * @returns {Promise<void>}
 */
async function createMockAvailability(teacherIds: string[]): Promise<void> {
  console.log(`Creating availability for ${teacherIds.length} teachers: ${teacherIds.join(', ')}`);
  
  // Generate availability for the next 30 days (increased from 14)
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 30);

  for (const teacherId of teacherIds) {
    try {
      // Delete existing availability
      const deletedCount = await prisma.teacherAvailability.deleteMany({
        where: { teacherId }
      });
      console.log(`Deleted ${deletedCount.count} existing availability slots for teacher ${teacherId}`);

      let totalSlotsCreated = 0;

      // Create availability for each day
      for (let day = 0; day < 30; day++) {
        const currentDate = new Date();
        currentDate.setDate(currentDate.getDate() + day);
        
        // Skip weekends (0 = Sunday, 6 = Saturday)
        if (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
          continue;
        }

        // Create availability slots - 30-minute intervals
        const slots = [];
        
        // Morning slots (9:00 AM - 12:00 PM)
        for (let hour = 9; hour < 12; hour++) {
          slots.push({ start: hour, startMinute: 0, end: hour, endMinute: 30 });
          slots.push({ start: hour, startMinute: 30, end: hour + 1, endMinute: 0 });
        }
        
        // Afternoon slots (1:00 PM - 6:00 PM)
        for (let hour = 13; hour < 18; hour++) {
          slots.push({ start: hour, startMinute: 0, end: hour, endMinute: 30 });
          slots.push({ start: hour, startMinute: 30, end: hour + 1, endMinute: 0 });
        }

        // Create a consistent pattern of availability
        // Each teacher has a different availability pattern
        const teacherIndex = teacherIds.indexOf(teacherId);
        let availableSlots;
        
        if (teacherIndex === 0) {
          // First teacher: available mostly in the morning
          availableSlots = slots.filter(slot => 
            (slot.start < 12) || // Morning slots
            (Math.random() > 0.7) // Some afternoon slots
          );
        } else if (teacherIndex === 1) {
          // Second teacher: available mostly in the afternoon
          availableSlots = slots.filter(slot => 
            (slot.start >= 13) || // Afternoon slots
            (Math.random() > 0.7) // Some morning slots
          );
        } else {
          // Third teacher: mixed availability
          availableSlots = slots.filter(() => Math.random() > 0.3);
        }

        // Create the availability slots in the database
        for (const slot of availableSlots) {
          const startDateTime = new Date(currentDate);
          startDateTime.setHours(slot.start, slot.startMinute, 0, 0);
          
          const endDateTime = new Date(currentDate);
          endDateTime.setHours(slot.end, slot.endMinute, 0, 0);

          await prisma.teacherAvailability.create({
            data: {
              teacherId,
              startDateTime,
              endDateTime,
              isAvailable: true
            }
          });
          totalSlotsCreated++;
        }
      }
      
      console.log(`Created ${totalSlotsCreated} availability slots for teacher ${teacherId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error creating availability for teacher ${teacherId}:`, error);
      console.error(`Error details: ${errorMessage}`);
      // Continue with the next teacher instead of failing the entire process
    }
  }
}

/**
 * Creates all mock data for the application (teachers, availability, etc.)
 * @returns {Promise<{ success: boolean, message: string, teacherIds?: string[] }>} Success status, message, and created teacher IDs
 */
export async function createMockData(): Promise<{ 
  success: boolean; 
  message: string; 
  teacherIds?: string[];
}> {
  try {
    console.log("Starting comprehensive mock data generation process...");
    
    // Create mock teachers and their availability
    const result = await createMockTeachers();
    
    if (!result.success) {
      throw new Error(`Failed to create mock teachers: ${result.message}`);
    }
    
    console.log("Mock data generation completed successfully!");
    return { 
      success: true, 
      message: "All mock data created successfully", 
      teacherIds: result.teacherIds 
    };
  } catch (error) {
    console.error("Error creating mock data:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Unknown error creating mock data" 
    };
  }
}