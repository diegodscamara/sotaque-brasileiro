import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/libs/supabase/server';

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { teacherId, startDateTime, endDateTime } = await req.json();
  
  const { data: existingTeacherData, error: teacherError } = await supabase.from('Teachers').select('*').eq('id', teacherId).single();
  if (!existingTeacherData) {
    return NextResponse.json({ message: "Teacher not found" }, { status: 400 });
  }
  if (teacherError) {
    return NextResponse.json({ message: teacherError.message }, { status: 500 });
  }

  const { error } = await supabase.from('TeacherAvailability').insert([
    { teacherId, startDateTime, endDateTime }
  ]);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Availability added successfully' }, { status: 200 });
} 