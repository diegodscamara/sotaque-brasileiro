import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/libs/supabase/server';
import { getUserTimeZone } from '@/libs/utils/timezone';

export async function POST(req: NextRequest) {
    const supabase = createClient();
    const { userId, classData } = await req.json();

    // Check if the user exists in the students table
    const { data: user, error: userError } = await supabase.from('students').select('*').eq('id', userId).single();
    if (userError || !user) {
        console.error('User not found or error fetching user:', userError);
        return NextResponse.json({ message: userError.message || "User not found" }, { status: 400 });
    }

    // Check if the teacher exists
    const { data: teacher, error: teacherError } = await supabase.from('teachers').select('*').eq('id', classData.teacher_id).single();
    if (teacherError || !teacher) {
        console.error('Teacher not found or error fetching teacher:', teacherError);
        return NextResponse.json({ message: teacherError.message || "Teacher not found" }, { status: 400 });
    }

    // Get the user's time zone
    const timeZone = getUserTimeZone();

    // Insert the new class
    const { error: insertError } = await supabase.from("classes").insert([{
        student_id: userId,
        teacher_id: classData.teacher_id,
        title: classData.title,
        start_time: classData.start_time,
        end_time: classData.end_time,
        notes: classData.notes,
        time_zone: timeZone,
    }]);

    if (insertError) {
        console.error('Error inserting class:', insertError);
        return NextResponse.json({ message: insertError.message || "Error scheduling class" }, { status: 500 });
    }

    // Update the student's credits
    const { error: updateError } = await supabase
        .from('students')
        .update({ credits: user.credits - 1 }) // Deduct 1 credit
        .eq('id', userId);

    if (updateError) {
        console.error('Error updating student credits:', updateError);
        return NextResponse.json({ message: updateError.message || "Error updating credits" }, { status: 500 });
    }

    return NextResponse.json({ message: 'Class scheduled successfully' }, { status: 200 });
} 