export interface StudentProfileData {
  id: string;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  country: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string;
  role: 'student' | 'teacher';
  hasAccess: boolean;
  createdAt: string;
  packageName: string;
  updatedAt: string;
  credits: number;
  portugueseLevel: 'beginner' | 'intermediate' | 'advanced' | 'native' | 'unknown';
  learningGoals: string[];
  preferredSchedule: ('morning' | 'afternoon' | 'evening' | 'night')[];
  nativeLanguage: string;
  otherLanguages: string[];
  professionalBackground: string;
  motivationForLearning: string;
  hasCompletedOnboarding: boolean;
  timeZone: string;
} 