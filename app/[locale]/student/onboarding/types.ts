/**
 * Form data for the student onboarding process
 */
export interface OnboardingFormData {
  // Personal Details
  firstName: string;
  lastName: string;
  email: string;
  timeZone: string;
  country: string;
  gender: string;
  
  // Learning Preferences
  portugueseLevel: string;
  nativeLanguage: string;
  learningGoals: string[];
  otherLanguages: string[];

  // Step 2: Teacher Selection & Class Scheduling
  selectedTeacherId?: string;
  classStartDateTime?: Date;
  classEndDateTime?: Date;
  classDuration?: number;
  classNotes?: string;
  
  // Package Details (added with default values if not purchased yet)
  customerId: string;
  priceId: string;
  packageName: string;
}

/**
 * Student data from the API
 */
export interface StudentData {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  credits: number;
  customerId?: string;
  priceId?: string;
  hasAccess: boolean;
  packageName?: string;
  packageExpiration?: string;
  portugueseLevel?: string;
  learningGoals: string[];
  nativeLanguage?: string;
  otherLanguages: string[];
  timeZone?: string;
  hasCompletedOnboarding: boolean;
}

/**
 * Data structure for updating a student
 */
export interface StudentUpdateData {
  userId: string;
  credits?: number;
  customerId?: string;
  priceId?: string;
  hasAccess?: boolean;
  packageName?: string;
  packageExpiration?: string;
  portugueseLevel?: string;
  learningGoals: string[];
  nativeLanguage?: string;
  otherLanguages: string[];
  timeZone?: string;
  hasCompletedOnboarding: boolean;
} 