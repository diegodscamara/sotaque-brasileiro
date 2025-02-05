import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/libs/supabase/server';

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { userId, classData } = await req.json();

  const { data: user, error: userError } = await supabase.from('User').select('*').eq('id', userId).single();
  if (userError || !user || user.role !== 'STUDENT') {
    console.error('User not found or error fetching user:', userError);
    return NextResponse.json({ message: userError?.message || "User not found" }, { status: 400 });
  }

  const { data: teacher, error: teacherError } = await supabase.from('User').select('*').eq('id', classData.teacherId).single();
  if (teacherError || !teacher || teacher.role !== 'TEACHER') {
    console.error('Teacher not found or error fetching teacher:', teacherError);
    return NextResponse.json({ message: teacherError?.message || "Teacher not found" }, { status: 400 });
  }

  const classStartTime = new Date(classData.startDateTime);
  const currentTime = new Date();
  const timeDifference = classStartTime.getTime() - currentTime.getTime();

  // Rule: Students can only schedule a class 24 hours in advance
  if (timeDifference < 24 * 60 * 60 * 1000) {
    return NextResponse.json({ message: "Class must be scheduled at least 24 hours in advance." }, { status: 400 });
  }

  // Rule: Students cannot schedule a class without sufficient credits
  if (user.credits <= 0) {
    return NextResponse.json({ message: "Insufficient credits to schedule a class." }, { status: 400 });
  }

  // Validate class duration (minimum 30 minutes, maximum 3 hours)
  const duration = classData.duration; // Assuming duration is in minutes
  if (duration < 30 || duration > 180) {
    return NextResponse.json({ message: "Class duration must be between 30 minutes and 3 hours." }, { status: 400 });
  }

  // Rule: Prevent overlapping classes for the same student or teacher
  const overlappingClasses = await supabase
    .from('Class')
    .select('*')
    .or(`(studentId.eq.${userId},teacherId.eq.${classData.teacherId})`)
    .gte('startDateTime', classData.startDateTime)
    .lte('endDateTime', classData.endDateTime);

  if (overlappingClasses.data.length > 0) {
    return NextResponse.json({ message: "Class overlaps with an existing class." }, { status: 400 });
  }

  const { error: insertError } = await supabase.from("Class").insert([{
    studentId: userId,
    teacherId: classData.teacherId,
    title: classData.title,
    startDateTime: classData.startDateTime,
    endDateTime: classData.endDateTime,
    notes: classData.notes,
    status: 'PENDING',
    duration: classData.duration,
  }]);

  if (insertError) {
    console.error('Error inserting class:', insertError);
    return NextResponse.json({ message: insertError.message || "Error scheduling class" }, { status: 500 });
  }

  const { error: updateError } = await supabase
    .from('Student')
    .update({ credits: user.credits - 1 })
    .eq('id', userId);

  if (updateError) {
    console.error('Error updating student credits:', updateError);
    return NextResponse.json({ message: updateError.message || "Error updating credits" }, { status: 500 });
  }

  return NextResponse.json({ message: 'Class scheduled successfully' }, { status: 200 });
} 