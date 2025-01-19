import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/libs/supabase/server';

export async function POST(req: NextRequest) {
    const supabase = createClient();
    const { classId, classData: newClassData } = await req.json();

    // Check if the class exists
    const { data: existingClassData, error: classError } = await supabase.from('classes').select('*').eq('id', classId).single();
    if (!existingClassData) return NextResponse.json({ message: "Class not found" }, { status: 400 });
    if (classError) return NextResponse.json({ message: classError.message }, { status: 500 });

    // Convert start_time to a Date object
    const classStartTime = new Date(existingClassData.start_time);

    // Check if the student is changing the time or date of the class 24 hours before the class
    if (classStartTime.getTime() - new Date().getTime() < 24 * 60 * 60 * 1000) {
        return NextResponse.json({ message: "Class cannot be changed 24 hours before the class" }, { status: 400 });
    }

    // Update the class
    const { error } = await supabase.from("classes").update(newClassData).eq("id", classId);
    if (error) return NextResponse.json({ message: error.message }, { status: 500 });

    return NextResponse.json({ message: 'Class updated successfully' }, { status: 200 });
}