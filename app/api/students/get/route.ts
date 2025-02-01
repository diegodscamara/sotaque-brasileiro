import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/libs/supabase/server';

export async function GET(req: NextRequest) {
  const supabase = createClient();
  const { searchParams } = new URL(req.url);
  const queryParams = {
    id: searchParams.get('id'),
  };

  const { id: studentId } = queryParams;
  let query = supabase.from('users').select('*').eq('role', 'student');

  if (studentId) {
    query = query.eq('id', studentId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 200 });
} 