import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/libs/supabase/server';

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { classId } = await req.json();

  // Update the class status to 'cancelled'
  const { error } = await supabase
    .from('classes')
    .update({ status: 'cancelled' })
    .eq('id', classId);

  if (error) {
    console.error('Error cancelling class:', error);
    return NextResponse.json({ message: error.message || "Error cancelling class" }, { status: 500 });
  }

  return NextResponse.json({ message: 'Class cancelled successfully' }, { status: 200 });
} 