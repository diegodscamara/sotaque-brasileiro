import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/libs/supabase/server';

export async function POST(req: NextRequest) {
    const supabase = createClient();
    const { teacherId, date, start_time, end_time } = await req.json();

    const { error } = await supabase.from('teacher_availability').insert([
        { teacher_id: teacherId, date, start_time, end_time }
    ]);

    if (error) return NextResponse.json({ message: error.message }, { status: 500 });

    return NextResponse.json({ message: 'Availability added successfully' }, { status: 200 });
} 