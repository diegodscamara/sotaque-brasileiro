import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/libs/supabase/server';

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { classId, classData: newClassData } = await req.json();

  const { data: existingClassData, error: classError } = await supabase.from('Class').select('*').eq('id', classId).single();
  if (!existingClassData) {
    return NextResponse.json({ message: "Class not found" }, { status: 400 });
  }
  if (classError) {
    return NextResponse.json({ message: classError.message }, { status: 500 });
  }

  const classStartTime = new Date(existingClassData.startDateTime);
  const currentTime = new Date();
  const timeDifference = classStartTime.getTime() - currentTime.getTime();

  // Rule: Classes can be rescheduled 24 hours in advance
  if (timeDifference < 24 * 60 * 60 * 1000) {
    return NextResponse.json({ message: "Class cannot be changed 24 hours before the class." }, { status: 400 });
  }

  // Validate class duration (minimum 30 minutes, maximum 3 hours)
  const duration = newClassData.duration; // Assuming duration is in minutes
  if (duration < 30 || duration > 180) {
    return NextResponse.json({ message: "Class duration must be between 30 minutes and 3 hours." }, { status: 400 });
  }

  // Rule: Prevent overlapping classes for the same student or teacher
  const overlappingClasses = await supabase
    .from('Class')
    .select('*')
    .or(`(studentId.eq.${existingClassData.studentId},teacherId.eq.${existingClassData.teacherId})`)
    .gte('startDateTime', newClassData.startDateTime)
    .lte('endDateTime', newClassData.endDateTime);

  if (overlappingClasses.data.length > 0) {
    return NextResponse.json({ message: "Class overlaps with an existing class." }, { status: 400 });
  }

  const { error } = await supabase.from("Class").update(newClassData).eq("id", classId);
  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Class updated successfully' }, { status: 200 });
}