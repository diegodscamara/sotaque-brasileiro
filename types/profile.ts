export interface StudentProfileData {
  id: string;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  country: string;
  name: string;
  email: string;
  image: string;
  has_access: boolean;
  created_at: string;
  updated_at: string;
  credits: number;
  portuguese_level: 'beginner' | 'intermediate' | 'advanced' | 'native' | 'unknown';
  learning_goals: string[];
  availability_hours: number;
  preferred_schedule: ('morning' | 'afternoon' | 'evening' | 'night')[];
  native_language: string;
  other_languages: string[];
  learning_style: ('visual' | 'auditory' | 'reading' | 'kinesthetic')[];
  interests: string[];
  professional_background: string;
  motivation_for_learning: string;
  has_completed_onboarding: boolean;
  preferred_class_type: ('one-on-one' | 'group' | 'self-paced' | 'intensive')[];
  time_zone: string;
} 