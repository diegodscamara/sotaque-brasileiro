import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/libs/supabase/server';
import { isDateBookable } from '@/libs/utils/date';

export async function POST(req: NextRequest) {
    const supabase = createClient();
    const { userId, classData } = await req.json();

    // Check if the date is bookable
    if (!isDateBookable(new Date(classData.start_time))) {
        return NextResponse.json({ message: "Classes must be scheduled at least 24 business hours in advance" }, { status: 400 });
    }

    // Check if the user has enough credits
    const user = await supabase.from('users').select('*').eq('id', userId).single();
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 400 });
    if (user.data.credits < 1) return NextResponse.json({ message: "User has no credits" }, { status: 400 });

    // Check if the teacher is available
    const teacher = await supabase.from('teachers').select('*').eq('id', classData.teacher_id).single();
    if (!teacher) return NextResponse.json({ message: "Teacher not found" }, { status: 400 });
    if (teacher.data.availability !== "available") return NextResponse.json({ message: "Teacher is not available" }, { status: 400 });

    // Check if the teacher has enough availability
    const teacherAvailability = await supabase.from('teacher_availability').select('*').eq('teacher_id', classData.teacher_id).eq('date', classData.start_time).single();
    if (!teacherAvailability) return NextResponse.json({ message: "Teacher has no availability" }, { status: 400 });
    if (teacherAvailability.data.availability < 1) return NextResponse.json({ message: "Teacher has no availability" }, { status: 400 });

    // Check if the class is already scheduled
    const existingClass = await supabase.from('classes').select('*').eq('teacher_id', classData.teacher_id).eq('start_time', classData.start_time).single();
    if (existingClass) return NextResponse.json({ message: "Class already scheduled" }, { status: 400 });


    // Insert the new class
    const { error } = await supabase.from("classes").insert([classData]);
    if (error) return NextResponse.json({ message: error.message }, { status: 500 });

    return NextResponse.json({ message: 'Class scheduled successfully' }, { status: 200 });
} 