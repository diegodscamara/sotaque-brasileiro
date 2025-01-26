import { NextResponse } from 'next/server'
import { createClient } from '@/libs/supabase/server'
import { z } from 'zod'

const validateQueryParams = z.object({
  code: z.string().optional(),
  token: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
});

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const queryParams = {
    code: searchParams.get('code'),
    token: searchParams.get('token'),
    email: searchParams.get('email'),
  };

  const validation = validateQueryParams.safeParse(queryParams);
  if (!validation.success) {
    console.error('Invalid query parameters:', validation.error);
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }

  const { code, token, email } = validation.data;
  const supabase = createClient();

  if (token && email) {
    // If a token is present, verify it
    const { error } = await supabase.auth.verifyOtp({ type: 'magiclink', token, email });
    if (error) {
      console.error('Error verifying magic link:', error);
      return NextResponse.redirect(`${origin}/auth/auth-code-error`);
    }
  } else if (code) {
    // If a code is present, exchange it for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error('Error exchanging code for session:', error);
      return NextResponse.redirect(`${origin}/auth/auth-code-error`);
    }
  } else {
    console.error('No token or code provided.');
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }

  // Fetch user metadata to check role and access
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) {
    console.error('Error fetching user data:', userError);
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }

  const { data: existingUser, error: userFetchError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (userFetchError) {
    console.error('Error fetching user data:', userFetchError);
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }

  // Compare and update user data
  const googleName = user.user_metadata.name; // Full name from Google
  const googleAvatar = user.user_metadata.avatar_url; // Avatar URL from Google

  // Split the full name into first and last names
  const [firstName, ...lastNameParts] = googleName.split(' ');
  const lastName = lastNameParts.join(' ');

  // Check if the name or avatar URL needs to be updated
  let needsUpdate = false;
  const updates: any = {};

  if (existingUser.first_name !== firstName) {
    updates.first_name = firstName;
    needsUpdate = true;
  }

  if (existingUser.last_name !== lastName) {
    updates.last_name = lastName;
    needsUpdate = true;
  }

  if (existingUser.avatar_url !== googleAvatar) {
    updates.avatar_url = googleAvatar;
    needsUpdate = true;
  }

  // Update the user in the database if needed
  if (needsUpdate) {
    const { error: updateError } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating user data:', updateError);
    } else {
      console.log('User data updated successfully:', updates);
    }
  }

  // Redirect logic for student and teacher
  const isLocalEnv = process.env.NODE_ENV === 'development'
  const redirectUrl = isLocalEnv ? origin : `https://${request.headers.get('x-forwarded-host')}`;

  if (existingUser.role === 'student') {
    if (existingUser.has_access) {
      return NextResponse.redirect(`${redirectUrl}/dashboard`);
    } else {
      return NextResponse.redirect(`${redirectUrl}/pricing`);
    }
  } else {
    return NextResponse.redirect(`${redirectUrl}/dashboard`);
  }
}