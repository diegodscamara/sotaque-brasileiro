import { TeacherComplete } from "@/types/teacher";

/**
 * User gender type
 */
export type UserGender = "male" | "female" | "other" | "prefer_not_to_say";

/**
 * Time slot interface for class scheduling
 */
export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  startDateTime: Date;
  endDateTime: Date;
  displayStartTime: string;
  displayEndTime: string;
  isAvailable: boolean;
}

/**
 * Pending class data interface
 */
export interface PendingClass {
  teacherId: string;
  studentId: string;
  startDateTime: Date;
  endDateTime: Date;
  duration: number;
  notes?: string | null;
  status: "PENDING";
}

/**
 * Base form data interface
 */
interface BaseFormData {
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  gender: UserGender;
  timeZone: string;
  portugueseLevel: string;
  nativeLanguage: string;
  learningGoals: string[];
  otherLanguages: string[];
}

/**
 * Form data interface for step 1 of the onboarding process
 */
export interface Step1FormData extends Omit<BaseFormData, 'gender'> {
  gender: UserGender;
}

/**
 * Form data interface for step 2 of the onboarding process
 */
export interface Step2FormData {
  selectedTeacher: TeacherComplete | null;
  selectedDate: Date | null;
  selectedTimeSlot: TimeSlot | null;
  timeZone: string;
  notes: string;
  classStartDateTime?: Date;
  classEndDateTime?: Date;
  pendingClass?: PendingClass;
  studentId?: string;
}

/**
 * Complete onboarding form data interface
 */
export interface OnboardingFormData extends BaseFormData, Step2FormData {
  // Package details
  customerId: string;
  priceId: string;
  packageName: string;
  
  // Additional fields for class scheduling
  classStartDateTime?: Date;
  classEndDateTime?: Date;
  pendingClass?: PendingClass;
}

/**
 * Class data interface for scheduling
 */
export interface ClassData {
  id: string;
  teacherId: string;
  studentId: string;
  startDateTime: Date;
  endDateTime: Date;
  duration: number;
  notes: string;
  status: "PENDING";
  createdAt: Date;
  updatedAt: Date;
  feedback?: string;
  rating?: number;
  recurringGroupId?: string;
}

/**
 * Props for Step2TeacherSelection component
 */
export interface Step2TeacherSelectionProps {
  formData: Step2FormData;
  errors: Record<string, string>;
  handleInputChange: (name: string, value: any) => void;
  t: any;
  setIsStepValid: (isValid: boolean) => void;
} 