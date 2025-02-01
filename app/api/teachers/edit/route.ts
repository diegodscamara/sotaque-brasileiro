import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/libs/supabase/server';

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { teacherId, teacherData } = await req.json();

  const { data: existingTeacherData, error: teacherError } = await supabase.from('users').select('*').eq('id', teacherId).single();
  if (!existingTeacherData || existingTeacherData.role !== 'teacher') {
    return NextResponse.json({ message: "Teacher not found" }, { status: 400 });
  }
  if (teacherError) {
    return NextResponse.json({ message: teacherError.message }, { status: 500 });
  }

  const { error } = await supabase.from("users").update(teacherData).eq("id", teacherId);
  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Teacher updated successfully' }, { status: 200 });
} 