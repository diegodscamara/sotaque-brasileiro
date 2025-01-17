import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/libs/supabase/server';

export async function POST(req: NextRequest) {
    const supabase = createClient();
    const { teacherId } = await req.json();

    // Check if the teacher exists
    const { data: existingTeacherData, error: teacherError } = await supabase.from('teachers').select('*').eq('id', teacherId).single();
    if (!existingTeacherData) return NextResponse.json({ message: "Teacher not found" }, { status: 400 });
    if (teacherError) return NextResponse.json({ message: teacherError.message }, { status: 500 });

    // Delete the teacher
    const { error: deleteError } = await supabase.from("teachers").delete().eq("id", teacherId);
    if (deleteError) return NextResponse.json({ message: deleteError.message }, { status: 500 });

    return NextResponse.json({ message: 'Teacher deleted successfully' }, { status: 200 });
} 