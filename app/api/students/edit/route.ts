import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/libs/supabase/server';

export async function POST(req: NextRequest) {
    const supabase = createClient();
    const { studentId, studentData } = await req.json();

    // Check if the student exists
    const { data: existingStudentData, error: studentError } = await supabase.from('students').select('*').eq('id', studentId).single();
    if (!existingStudentData) return NextResponse.json({ message: "Student not found" }, { status: 400 });
    if (studentError) return NextResponse.json({ message: studentError.message }, { status: 500 });

    // Update the student
    const { error } = await supabase.from("students").update(studentData).eq("id", studentId);
    if (error) return NextResponse.json({ message: error.message }, { status: 500 });

    return NextResponse.json({ message: 'Student updated successfully' }, { status: 200 });
} 