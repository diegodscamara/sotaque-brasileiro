export interface Class {
  id: string;
  title: string;
  start_time: Date;
  end_time: Date;
  notes?: string;
  time_zone: string;
  status: 'scheduled' | 'pending' | 'confirmed' | 'completed' | 'cancelled';
  recurring_group_id?: string;
  user_id: string;
  created_at: Date;
  updated_at: Date;
  teacher_id: string;
  student_id: string;
  teacherName?: string;
} 