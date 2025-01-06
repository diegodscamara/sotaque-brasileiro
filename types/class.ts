export interface Class {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  notes?: string;
  time_zone: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  recurring_group_id?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
} 