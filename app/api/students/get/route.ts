import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/libs/supabase/server';

export async function GET(req: NextRequest) {
    const supabase = createClient();
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('id');

    let query = supabase.from('students').select('*');

    if (studentId) {
        query = query.eq('id', studentId);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching students:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
} 