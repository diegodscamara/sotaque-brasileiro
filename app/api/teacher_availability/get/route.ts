import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/libs/supabase/server';

export async function GET(req: NextRequest) {
  const supabase = createClient();
  const { searchParams } = new URL(req.url);
  const queryParams = {
    teacherId: searchParams.get('teacherId'),
    startDateTime: searchParams.get('startDateTime'),
  };

  const { teacherId, startDateTime } = queryParams;
  let query = supabase.from('TeacherAvailability').select('*').eq('teacherId', teacherId);

  if (startDateTime) {
    query = query.eq('startDateTime', startDateTime);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 200 });
} 