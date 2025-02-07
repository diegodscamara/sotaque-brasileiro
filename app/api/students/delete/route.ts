import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/libs/supabase/server';

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { studentId } = await req.json();

  const { data: existingStudentData, error: studentError } = await supabase
    .from('Student')
    .select('*')
    .eq('id', studentId)
    .single();

  if (!existingStudentData) {
    return NextResponse.json({ message: "Student not found" }, { status: 400 });
  }
  if (studentError) {
    return NextResponse.json({ message: studentError.message }, { status: 500 });
  }

  const { error: deleteError } = await supabase.from("Student").delete().eq("id", studentId);
  if (deleteError) {
    return NextResponse.json({ message: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Student deleted successfully' }, { status: 200 });
} 