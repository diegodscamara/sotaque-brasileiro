/**
 * Class related type definitions
 * @module types/class
 */

import { User, Student, Teacher } from "@prisma/client";

/**
 * Represents the status of a class
 */
export enum ClassStatus {
  PENDING = "pending",
  SCHEDULED = "scheduled",
  CONFIRMED = "confirmed",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

/**
 * Represents the recurring frequency options for classes
 */
export enum RecurringFrequency {
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
}

/**
 * Represents the end type for recurring classes
 */
export enum RecurringEndType {
  NEVER = "never",
  AFTER = "after",
  ON_DATE = "on_date",
}

/**
 * Represents the recurring schedule configuration
 */
export interface RecurringSchedule {
  frequency: RecurringFrequency;
  interval: number;
  daysOfWeek?: number[];
  endType: RecurringEndType;
  endDate?: Date;
  occurrences?: number;
}

/**
 * Represents the base class information
 */
export interface ClassBase {
  id: string;
  teacherId: string;
  studentId: string;
  startDateTime: Date;
  endDateTime: Date;
  duration: number;
  status: ClassStatus;
  notes?: string | null;
  feedback?: string | null;
  rating?: number | null;
  recurringGroupId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Represents a class with teacher information
 */
export interface ClassWithTeacher extends ClassBase {
  teacher: Teacher;
}

/**
 * Represents a class with student information
 */
export interface ClassWithStudent extends ClassBase {
  student: Student;
}

/**
 * Represents a complete class with all related information
 */
export interface ClassComplete extends ClassBase {
  teacher: Teacher & { user: User };
  student: Student & { user: User };
  recurringGroup?: {
    id: string;
    schedule: RecurringSchedule;
    occurrences: number;
    endType: RecurringEndType;
    endDate?: Date;
  } | null;
}

/**
 * Represents the data required to create a new class
 */
export interface CreateClassInput {
  teacherId: string;
  studentId: string;
  startDateTime: Date;
  endDateTime: Date;
  notes?: string;
  recurringSchedule?: RecurringSchedule;
}

/**
 * Represents the data required to update a class
 */
export interface UpdateClassInput {
  startDateTime?: Date;
  endDateTime?: Date;
  status?: ClassStatus;
  notes?: string;
  feedback?: string;
  rating?: number;
}

/**
 * Represents the filters for searching classes
 */
export interface ClassSearchFilters {
  teacherId?: string;
  studentId?: string;
  status?: ClassStatus[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  recurringGroupId?: string;
}

/**
 * Represents the sorting options for class lists
 */
export interface ClassSortOptions {
  field: "startDateTime" | "createdAt" | "status";
  direction: "asc" | "desc";
}

/**
 * Represents the pagination options for class lists
 */
export interface ClassPaginationOptions {
  page: number;
  limit: number;
}

/**
 * Represents class feedback data
 */
export interface ClassFeedback {
  rating: number;
  feedback: string;
  teacherId: string;
  studentId: string;
  classId: string;
  createdAt: Date;
}

/**
 * Represents class cancellation data
 */
export interface ClassCancellation {
  classId: string;
  reason: string;
  cancelledBy: {
    id: string;
    role: "student" | "teacher";
  };
  cancellationTime: Date;
  refundCredits?: number;
}

/**
 * Represents class reminder settings
 */
export interface ClassReminder {
  classId: string;
  userId: string;
  reminderType: "email" | "notification" | "sms";
  reminderTime: number; // minutes before class
  isEnabled: boolean;
}

/**
 * Represents class statistics
 */
export interface ClassStatistics {
  totalClasses: number;
  completedClasses: number;
  cancelledClasses: number;
  averageRating?: number;
  totalDuration: number; // in minutes
  creditsCost: number;
} 