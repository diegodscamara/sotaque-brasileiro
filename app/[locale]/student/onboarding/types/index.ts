/**
 * Types for the onboarding process
 */

export interface OnboardingFormData {
  // Step 1 - Student Information
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  language?: string;
  level?: string;
  goals?: string[];
  
  // Step 2 - Teacher Selection
  selectedTeacherId?: string;
  classStartDateTime?: Date;
  classEndDateTime?: Date;
  classDuration?: string;
  classNotes?: string;
  
  // Step 3 - Payment
  paymentMethod?: string;
  
  // Pending class information
  pendingClass?: {
    studentId: string;
    [key: string]: any;
  };
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  id: string;
  startDateTime: Date;
  endDateTime: Date;
}

export interface Reservation {
  id: string;
  expiresAt: Date;
  timeoutId?: NodeJS.Timeout;
} 