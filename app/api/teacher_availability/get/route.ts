import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/libs/supabase/server';

export async function GET(req: NextRequest) {
  const supabase = createClient();
  const { searchParams } = new URL(req.url);
  const queryParams = {
    teacherId: searchParams.get('teacherId'),
    date: searchParams.get('date'),
  };

  const { teacherId, date } = queryParams;
  let query = supabase.from('teacher_availability').select('*').eq('teacher_id', teacherId);

  if (date) {
    query = query.eq('date', date);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 200 });
} 