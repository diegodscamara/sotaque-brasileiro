export interface Class {
  id: string;
  student_id: string;
  title: string;
  start_time: string;
  end_time: string;
  notes?: string;
  status: 'scheduled' | 'confirmed' | 'cancelled';
  type: 'private' | 'group';
  credits_cost: number;
  recurring_group_id?: string | null;
  created_at: string;
  updated_at: string;
  time_zone?: string;
} 