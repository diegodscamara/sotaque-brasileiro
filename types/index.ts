export * from "./config";

export interface User {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  country?: string;
  gender?: string;
}

export interface Teacher {
  id: string;
  userId: string;
  user: User;
  createdAt: Date;
  updatedAt: Date;
  biography?: string;
  specialties: string[];
  languages: string[];
}

export interface Student {
  id: string;
  userId: string;
  user: User;
  createdAt: Date;
  updatedAt: Date;
  credits: number;
  customerId?: string;
  priceId?: string;
  hasAccess: boolean;
  packageName?: string;
  packageExpiration?: Date;
  portugueseLevel?: string;
  learningGoals: string[];
  nativeLanguage?: string;
  otherLanguages: string[];
  timeZone?: string;
  hasCompletedOnboarding: boolean;
}

export interface ClassData {
  id: string;
  teacherId: string;
  studentId: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  startDateTime: Date;
  endDateTime: Date;
  duration: number;
  notes?: string;
  feedback?: string;
  rating?: number;
  recurringGroupId?: string;
}

export interface TeacherAvailability {
  id: string;
  teacherId: string;
  createdAt: Date;
  updatedAt: Date;
  startDateTime: Date;
  endDateTime: Date;
  isAvailable: boolean;
  recurringRules?: Record<string, any>;
  notes?: string;
}
