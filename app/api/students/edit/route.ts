import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/libs/supabase/server';
import { z } from 'zod';

const studentDataSchema = z.object({
  first_name: z.string().min(1).optional(),
  last_name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  avatar_url: z.string().url().optional(),
  has_access: z.boolean().optional(),
  credits: z.number().int().optional(),
  // Add other fields as necessary
});

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { studentId, studentData } = await req.json();

  const validation = studentDataSchema.safeParse(studentData);
  if (!validation.success) {
    console.error('Invalid student data:', validation.error);
    return NextResponse.json({ message: "Invalid student data" }, { status: 400 });
  }

  const { data: existingStudentData, error: studentError } = await supabase.from('users').select('*').eq('id', studentId).single();
  if (!existingStudentData || existingStudentData.role !== 'student') {
    return NextResponse.json({ message: "Student not found" }, { status: 400 });
  }
  if (studentError) {
    return NextResponse.json({ message: studentError.message }, { status: 500 });
  }

  const { error } = await supabase.from("users").update(validation.data).eq("id", studentId);
  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Student updated successfully' }, { status: 200 });
} 