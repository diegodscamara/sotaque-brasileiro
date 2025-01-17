import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/libs/supabase/server';

export async function POST(req: NextRequest) {
    const supabase = createClient();
    const { teacherId, teacherData } = await req.json();

    // Check if the teacher exists
    const { data: existingTeacherData, error: teacherError } = await supabase.from('teachers').select('*').eq('id', teacherId).single();
    if (!existingTeacherData) return NextResponse.json({ message: "Teacher not found" }, { status: 400 });
    if (teacherError) return NextResponse.json({ message: teacherError.message }, { status: 500 });

    // Update the teacher
    const { error } = await supabase.from("teachers").update(teacherData).eq("id", teacherId);
    if (error) return NextResponse.json({ message: error.message }, { status: 500 });

    return NextResponse.json({ message: 'Teacher updated successfully' }, { status: 200 });
} 