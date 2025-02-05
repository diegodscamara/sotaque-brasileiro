import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/libs/supabase/server';

export async function GET(req: NextRequest) {
  const supabase = createClient();
  const { searchParams } = new URL(req.url);
  const queryParams = {
    id: searchParams.get('id'),
  };

 const { id: teacherId } = queryParams;
  let query = supabase.from('Teacher').select('*');

  if (teacherId) {
    query = query.eq('id', teacherId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching teachers:', error);
    return NextResponse.json({ message: error.message || "Error fetching teachers" }, { status: 500 });
  }

  return NextResponse.json(data, { status: 200 });
} 