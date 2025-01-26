import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/libs/supabase/server';
import { z } from 'zod';

const deleteSchema = z.object({
  studentId: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { studentId } = await req.json();

  const validation = deleteSchema.safeParse({ studentId });
  if (!validation.success) {
    console.error('Invalid student ID:', validation.error);
    return NextResponse.json({ message: "Invalid student ID" }, { status: 400 });
  }

  const { data: existingStudentData, error: studentError } = await supabase.from('users').select('*').eq('id', studentId).single();
  if (!existingStudentData || existingStudentData.role !== 'student') {
    return NextResponse.json({ message: "Student not found" }, { status: 400 });
  }
  if (studentError) {
    return NextResponse.json({ message: studentError.message }, { status: 500 });
  }

  const { error: deleteError } = await supabase.from("users").delete().eq("id", studentId);
  if (deleteError) {
    return NextResponse.json({ message: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Student deleted successfully' }, { status: 200 });
} 