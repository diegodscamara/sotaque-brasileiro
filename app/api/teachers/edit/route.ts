import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/libs/supabase/server';
import { z } from 'zod';

const teacherDataSchema = z.object({
  first_name: z.string().min(1).optional(),
  last_name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  avatar_url: z.string().url().optional(),
  biography: z.string().optional(),
  specialties: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  // Add other fields as necessary
});

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { teacherId, teacherData } = await req.json();

  const validation = teacherDataSchema.safeParse(teacherData);
  if (!validation.success) {
    console.error('Invalid teacher data:', validation.error);
    return NextResponse.json({ message: "Invalid teacher data" }, { status: 400 });
  }

  const { data: existingTeacherData, error: teacherError } = await supabase.from('users').select('*').eq('id', teacherId).single();
  if (!existingTeacherData || existingTeacherData.role !== 'teacher') {
    return NextResponse.json({ message: "Teacher not found" }, { status: 400 });
  }
  if (teacherError) {
    return NextResponse.json({ message: teacherError.message }, { status: 500 });
  }

  const { error } = await supabase.from("users").update(validation.data).eq("id", teacherId);
  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Teacher updated successfully' }, { status: 200 });
} 