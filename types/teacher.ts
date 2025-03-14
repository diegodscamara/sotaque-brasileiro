/**
 * Teacher related type definitions
 * @module types/teacher
 */

import { User, TeacherAvailability, Class } from "@prisma/client";

/**
 * Represents the specialties a teacher can have
 */
export enum TeacherSpecialty {
  CONVERSATION = "conversation",
  GRAMMAR = "grammar",
  BUSINESS = "business",
  EXAM_PREP = "exam_prep",
  PRONUNCIATION = "pronunciation",
  VOCABULARY = "vocabulary",
  CULTURE = "culture",
  BEGINNER = "beginner",
  INTERMEDIATE = "intermediate",
  ADVANCED = "advanced",
}

/**
 * Represents the languages a teacher can speak
 */
export enum TeacherLanguage {
  PORTUGUESE = "portuguese",
  ENGLISH = "english",
  SPANISH = "spanish",
  FRENCH = "french",
  GERMAN = "german",
  ITALIAN = "italian",
  JAPANESE = "japanese",
  CHINESE = "chinese",
  KOREAN = "korean",
}

/**
 * Represents the recurring rules for teacher availability
 */
export interface RecurringRule {
  frequency: "daily" | "weekly" | "monthly";
  interval: number;
  byWeekDay?: number[];
  until?: Date;
  count?: number;
}

/**
 * Represents a teacher's availability slot
 */
export interface TeacherAvailabilitySlot extends Omit<TeacherAvailability, "recurringRules"> {
  recurringRules?: RecurringRule[];
}

/**
 * Represents the base teacher information
 */
export interface TeacherBase {
  id: string;
  userId: string;
  biography?: string | null;
  specialties: TeacherSpecialty[];
  languages: TeacherLanguage[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Represents a teacher with related user information
 */
export interface TeacherWithUser extends TeacherBase {
  user: User;
}

/**
 * Represents a teacher with their availability slots
 */
export interface TeacherWithAvailability extends TeacherBase {
  availability: TeacherAvailabilitySlot[];
}

/**
 * Represents a teacher with their classes
 */
export interface TeacherWithClasses extends TeacherBase {
  classes: Class[];
}

/**
 * Represents a complete teacher profile with all related information
 */
export interface TeacherComplete extends TeacherBase {
  user: User;
  availability: TeacherAvailabilitySlot[];
  classes: Class[];
}

/**
 * Represents the data required to create a new teacher
 */
export interface CreateTeacherInput {
  userId: string;
  biography?: string;
  specialties: TeacherSpecialty[];
  languages: TeacherLanguage[];
}

/**
 * Represents the data required to update a teacher's profile
 */
export interface UpdateTeacherInput {
  biography?: string;
  specialties?: TeacherSpecialty[];
  languages?: TeacherLanguage[];
}

/**
 * Represents the filters for searching teachers
 */
export interface TeacherSearchFilters {
  specialties?: TeacherSpecialty[];
  languages?: TeacherLanguage[];
  availability?: {
    startDateTime: Date;
    endDateTime: Date;
  };
  rating?: number;
}

/**
 * Represents the sorting options for teacher lists
 */
export interface TeacherSortOptions {
  field: "rating" | "createdAt" | "availability";
  direction: "asc" | "desc";
}

/**
 * Represents the pagination options for teacher lists
 */
export interface TeacherPaginationOptions {
  page: number;
  limit: number;
}
