import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/libs/supabase/server';
import { z } from 'zod';

const cancelSchema = z.object({
  classId: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { classId } = await req.json();

  const validation = cancelSchema.safeParse({ classId });
  if (!validation.success) {
    console.error('Invalid class ID:', validation.error);
    return NextResponse.json({ message: "Invalid class ID" }, { status: 400 });
  }

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