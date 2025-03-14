/**
 * Student related type definitions
 * @module types/student
 */

import { User, Class } from "@prisma/client";

/**
 * Represents the Portuguese proficiency levels
 */
export enum PortugueseLevel {
  BEGINNER = "beginner",
  ELEMENTARY = "elementary",
  INTERMEDIATE = "intermediate",
  UPPER_INTERMEDIATE = "upper_intermediate",
  ADVANCED = "advanced",
  PROFICIENT = "proficient",
}

/**
 * Represents the learning goals a student can have
 */
export enum LearningGoal {
  GENERAL_CONVERSATION = "general_conversation",
  BUSINESS_PORTUGUESE = "business_portuguese",
  ACADEMIC_PORTUGUESE = "academic_portuguese",
  EXAM_PREPARATION = "exam_preparation",
  CULTURAL_UNDERSTANDING = "cultural_understanding",
  PRONUNCIATION = "pronunciation",
  GRAMMAR_MASTERY = "grammar_mastery",
  READING_COMPREHENSION = "reading_comprehension",
  WRITING_SKILLS = "writing_skills",
  TRAVEL_PREPARATION = "travel_preparation",
}

/**
 * Represents the package types available for students
 */
export enum PackageType {
  BASIC = "basic",
  STANDARD = "standard",
  PREMIUM = "premium",
  CUSTOM = "custom",
}

/**
 * Represents the base student information
 */
export interface StudentBase {
  id: string;
  userId: string;
  credits: number;
  customerId?: string | null;
  priceId?: string | null;
  hasAccess: boolean;
  packageName?: string | null;
  packageExpiration?: Date | null;
  portugueseLevel?: PortugueseLevel | null;
  learningGoals: LearningGoal[];
  nativeLanguage?: string | null;
  otherLanguages: string[];
  timeZone?: string | null;
  hasCompletedOnboarding: boolean;
  subscriptionInfo?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Represents a student with related user information
 */
export interface StudentWithUser extends StudentBase {
  user: User;
}

/**
 * Represents a student with their classes
 */
export interface StudentWithClasses extends StudentBase {
  classes: Class[];
}

/**
 * Represents a complete student profile with all related information
 */
export interface StudentComplete extends StudentBase {
  user: User;
  classes: Class[];
}

/**
 * Represents the data required to create a new student
 */
export interface CreateStudentInput {
  userId: string;
  nativeLanguage?: string;
  otherLanguages?: string[];
  portugueseLevel?: PortugueseLevel;
  learningGoals?: LearningGoal[];
  timeZone?: string;
}

/**
 * Represents the data required to update a student's profile
 */
export interface UpdateStudentInput {
  portugueseLevel?: PortugueseLevel;
  learningGoals?: LearningGoal[];
  nativeLanguage?: string;
  otherLanguages?: string[];
  timeZone?: string;
}

/**
 * Represents the onboarding data for a student
 */
export interface StudentOnboardingData {
  portugueseLevel: PortugueseLevel;
  learningGoals: LearningGoal[];
  nativeLanguage: string;
  otherLanguages: string[];
  timeZone: string;
  hasCompletedOnboarding: boolean;
}

/**
 * Represents the subscription data for a student
 */
export interface StudentSubscriptionData {
  customerId: string;
  priceId: string;
  packageName: string;
  packageExpiration: Date;
  credits: number;
  hasAccess: boolean;
}

/**
 * Represents the filters for searching students
 */
export interface StudentSearchFilters {
  portugueseLevel?: PortugueseLevel;
  learningGoals?: LearningGoal[];
  nativeLanguage?: string;
  hasCompletedOnboarding?: boolean;
  hasAccess?: boolean;
}

/**
 * Represents the sorting options for student lists
 */
export interface StudentSortOptions {
  field: "createdAt" | "credits" | "packageExpiration";
  direction: "asc" | "desc";
}

/**
 * Represents the pagination options for student lists
 */
export interface StudentPaginationOptions {
  page: number;
  limit: number;
}

/**
 * Represents the credit transaction types for students
 */
export enum CreditTransactionType {
  PURCHASE = "purchase",
  CLASS_BOOKING = "class_booking",
  CLASS_CANCELLATION = "class_cancellation",
  BONUS = "bonus",
  EXPIRATION = "expiration",
  REFUND = "refund",
}

/**
 * Represents a credit transaction for a student
 */
export interface CreditTransaction {
  id: string;
  studentId: string;
  type: CreditTransactionType;
  amount: number;
  description: string;
  createdAt: Date;
  metadata?: Record<string, any>;
}
