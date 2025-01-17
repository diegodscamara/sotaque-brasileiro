import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/libs/supabase/server';

export async function GET(req: NextRequest) {
    const supabase = createClient();
    const { searchParams } = new URL(req.url);
    const teacherId = searchParams.get('teacherId');
    const date = searchParams.get('date');

    const { data, error } = await supabase
        .from('teacher_availability')
        .select('*')
        .eq('teacher_id', teacherId)
        .eq('date', date);

    if (error) return NextResponse.json({ message: error.message }, { status: 500 });

    return NextResponse.json(data, { status: 200 });
} 