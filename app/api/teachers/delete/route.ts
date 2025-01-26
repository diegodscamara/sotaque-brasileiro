import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/libs/supabase/server';
import { z } from 'zod';

const deleteSchema = z.object({
  teacherId: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { teacherId } = await req.json();

  const validation = deleteSchema.safeParse({ teacherId });
  if (!validation.success) {
    console.error('Invalid teacher ID:', validation.error);
    return NextResponse.json({ message: "Invalid teacher ID" }, { status: 400 });
  }

  const { data: existingTeacherData, error: teacherError } = await supabase.from('users').select('*').eq('id', teacherId).single();
  if (!existingTeacherData || existingTeacherData.role !== 'teacher') {
    return NextResponse.json({ message: "Teacher not found" }, { status: 400 });
  }
  if (teacherError) {
    return NextResponse.json({ message: teacherError.message }, { status: 500 });
  }

  const { error: deleteError } = await supabase.from("users").delete().eq("id", teacherId);
  if (deleteError) {
    return NextResponse.json({ message: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Teacher deleted successfully' }, { status: 200 });
} 