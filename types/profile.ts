export interface StudentProfileData {
  id: string;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  country: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url: string;
  has_access: boolean;
  created_at: string;
  package_name: string;
  updated_at: string;
  credits: number;
  portuguese_level: 'beginner' | 'intermediate' | 'advanced' | 'native' | 'unknown';
  learning_goals: string[];
  preferred_schedule: ('morning' | 'afternoon' | 'evening' | 'night')[];
  native_language: string;
  other_languages: string[];
  professional_background: string;
  motivation_for_learning: string;
  has_completed_onboarding: boolean;
  time_zone: string;
} 