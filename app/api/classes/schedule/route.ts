import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/libs/supabase/server';
import { getUserTimeZone } from '@/libs/utils/timezone';

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { userId, classData } = await req.json();

  const { data: user, error: userError } = await supabase.from('users').select('*').eq('id', userId).single();
  if (userError || !user || user.role !== 'student') {
    console.error('User not found or error fetching user:', userError);
    return NextResponse.json({ message: userError?.message || "User not found" }, { status: 400 });
  }

  const { data: teacher, error: teacherError } = await supabase.from('users').select('*').eq('id', classData.teacher_id).single();
  if (teacherError || !teacher || teacher.role !== 'teacher') {
    console.error('Teacher not found or error fetching teacher:', teacherError);
    return NextResponse.json({ message: teacherError?.message || "Teacher not found" }, { status: 400 });
  }

  const timeZone = getUserTimeZone();

  const { error: insertError } = await supabase.from("classes").insert([{
    student_id: userId,
    teacher_id: classData.teacher_id,
    title: classData.title,
    start_time: classData.start_time,
    end_time: classData.end_time,
    metadata: { notes: classData.notes, time_zone: timeZone },
  }]);

  if (insertError) {
    console.error('Error inserting class:', insertError);
    return NextResponse.json({ message: insertError.message || "Error scheduling class" }, { status: 500 });
  }

  const { error: updateError } = await supabase
    .from('users')
    .update({ credits: user.credits - 1 })
    .eq('id', userId);

  if (updateError) {
    console.error('Error updating student credits:', updateError);
    return NextResponse.json({ message: updateError.message || "Error updating credits" }, { status: 500 });
  }

  return NextResponse.json({ message: 'Class scheduled successfully' }, { status: 200 });
} 