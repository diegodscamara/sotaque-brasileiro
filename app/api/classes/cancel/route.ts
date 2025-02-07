import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/libs/supabase/server';

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { classId } = await req.json();

  // Fetch the class details to check the start time
  const { data: existingClassData, error: classError } = await supabase
    .from('Class')
    .select('*')
    .eq('id', classId)
    .single();

  if (!existingClassData) {
    return NextResponse.json({ message: "Class not found" }, { status: 400 });
  }
  if (classError) {
    console.error('Error fetching class data:', classError);
    return NextResponse.json({ message: classError.message }, { status: 500 });
  }

  const classStartTime = new Date(existingClassData.startDateTime);
  const currentTime = new Date();
  const timeDifference = classStartTime.getTime() - currentTime.getTime();

  // Rule: Only future classes can be cancelled
  if (timeDifference <= 0) {
    return NextResponse.json({ message: "Only future classes can be cancelled." }, { status: 400 });
  }

  // Rule: Classes cancelled at least 24 hours in advance are refunded 1 credit
  if (timeDifference >= 24 * 60 * 60 * 1000) {
    const { data: student, error: studentError } = await supabase
      .from('Student')
      .select('credits')
      .eq('id', existingClassData.studentId) // Assuming studentId is stored in the class
      .single();

    if (studentError || !student) {
      console.error('Error fetching student data:', studentError);
      return NextResponse.json({ message: "Error fetching student data." }, { status: 500 });
    }

    // Refund 1 credit
    const updatedCredits = student.credits + 1;
    const { error: updateError } = await supabase
      .from('Student')
      .update({ credits: updatedCredits })
      .eq('id', existingClassData.studentId);

    if (updateError) {
      console.error('Error updating student credits:', updateError);
      return NextResponse.json({ message: updateError.message || "Error updating credits" }, { status: 500 });
    }
  }

  // Update the class status to 'CANCELLED'
  const { error } = await supabase
    .from('Class')
    .update({ status: 'CANCELLED' }) // Ensure status matches the enum in the schema
    .eq('id', classId);

  if (error) {
    console.error('Error cancelling class:', error);
    return NextResponse.json({ message: error.message || "Error cancelling class" }, { status: 500 });
  }

  return NextResponse.json({ message: 'Class cancelled successfully' }, { status: 200 });
} 