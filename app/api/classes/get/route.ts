import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/libs/supabase/server';

export async function GET(req: NextRequest) {
  const supabase = createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error('Unauthorized access attempt:', userError);
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const queryParams = {
    teacherId: searchParams.get('teacherId'),
    status: searchParams.get('status'),
    startDate: searchParams.get('startDate'),
    endDate: searchParams.get('endDate'),
  };

  const { teacherId, status, startDate, endDate } = queryParams;
  const userId = user.id;

  let query = supabase.from('classes').select('*');

  if (teacherId) {
    query = query.eq('teacher_id', teacherId);
  }
  if (userId) {
    query = query.eq('student_id', userId);
  }
  if (status) {
    query = query.eq('status', status);
  }
  if (startDate && endDate) {
    query = query.gte('start_time', startDate).lte('end_time', endDate);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching classes:', error);
    return NextResponse.json({ message: error.message || "Error fetching classes" }, { status: 500 });
  }

  return NextResponse.json(data, { status: 200 });
} 