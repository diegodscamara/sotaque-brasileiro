import { NextResponse } from 'next/server'
import { Role } from '@prisma/client'
import { createClient } from '@/libs/supabase/server'
import { getUserTimeZone } from '@/libs/utils/timezone'

/**
 * Handles user authentication and account creation
 * @param {Request} request - The incoming request
 * @returns {Promise<NextResponse>} - Response with redirect URL or error
 */
export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams, origin } = new URL(request.url)
  const queryParams = {
    code: searchParams.get('code'),
    token: searchParams.get('token'),
    email: searchParams.get('email'),
  };

  const { code, token, email } = queryParams;
  const supabase = createClient();
  const baseUrl = origin.replace(/\/(en|fr|pt)(\/|$)/, '/');

  if (token && email) {
    const { error } = await supabase.auth.verifyOtp({ type: 'magiclink', token, email });
    if (error) {
      return NextResponse.redirect(`${baseUrl}/auth/auth-code-error`);
    }
  } else if (code) {
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(`${baseUrl}/auth/auth-code-error`);
    }

    const { error: userFetchError } = await supabase
      .from('User')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (userFetchError && userFetchError.code === 'PGRST116') {
      await createNewUser(supabase, session, Role.STUDENT);
    } else if (userFetchError) {
      return NextResponse.json({ error: userFetchError.message }, { status: 400 });
    }
  } else {
    return NextResponse.redirect(`${baseUrl}/auth/auth-code-error`);
  }

  const redirectUrl = process.env.NODE_ENV === 'development'
    ? baseUrl
    : `https://${request.headers.get('x-forwarded-host')}`;
  return NextResponse.redirect(`${redirectUrl}/dashboard`);
}

/**
 * Creates a new user in the database
 * @param {ReturnType<typeof createClient>} supabase - Supabase client
 * @param {any} session - Auth session
 * @param {Role} role - User role
 * @returns {Promise<void>}
 */
async function createNewUser(supabase: ReturnType<typeof createClient>, session: any, role: Role): Promise<void> {
  const userTimeZone = getUserTimeZone();
  const currentDate = new Date().toLocaleString('en-US', { timeZone: userTimeZone });

  // Only extract name for Google sign-ups
  const userData: any = {
    id: session.user.id,
    email: session.user.email,
    role,
    updatedAt: currentDate,
    createdAt: currentDate,
  };

  // Add name and avatar only if it's a Google sign-up
  if (session.user.user_metadata?.full_name) {
    const googleName = session.user.user_metadata.full_name;
    const googleAvatar = session.user.user_metadata.avatar_url || null;
    const [firstName, ...lastNameParts] = googleName.split(' ');
    const lastName = lastNameParts.join(' ');

    userData.firstName = firstName;
    userData.lastName = lastName;
    userData.avatarUrl = googleAvatar;
  }

  const { error: userError } = await supabase
    .from('User')
    .insert(userData);

  if (userError) throw new Error(`User creation failed: ${userError.message}`);

  if (role === Role.STUDENT) {
    const { error: studentError } = await supabase
      .from('Student')
      .insert({
        id: session.user.id,
        userId: session.user.id,
        createdAt: currentDate,
        updatedAt: currentDate,
      });

    if (studentError) throw new Error(`Student creation failed: ${studentError.message}`);
  } else if (role === Role.TEACHER) {
    const { error: teacherError } = await supabase
      .from('Teacher')
      .insert({
        id: session.user.id,
        userId: session.user.id,
        createdAt: currentDate,
        updatedAt: currentDate,
      });

    if (teacherError) throw new Error(`Teacher creation failed: ${teacherError.message}`);
  }
}

/**
 * Handles email/password authentication
 * @param {Request} request - The incoming request
 * @returns {Promise<NextResponse>} - Response with redirect URL or error
 */
export async function POST(request: Request): Promise<NextResponse> {
  const supabase = createClient();
  const { email, password, signIn, role } = await request.json();

  try {
    if (signIn) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const user = data?.user;
      if (!user) throw new Error('User sign-in failed.');

      const { data: existingUser, error: userFetchError } = await supabase
        .from('User')
        .select('*')
        .eq('id', user.id)
        .single();

      if (userFetchError) throw userFetchError;
      if (!existingUser) throw new Error('User not found.');

      const redirectUrl = await handleRoleBasedRedirect(supabase, existingUser);
      return NextResponse.json({ success: true, redirectUrl }, { status: 200 });
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;

      const user = data?.user;
      if (!user) throw new Error('User creation failed.');

      await createNewUser(supabase, { user }, role as Role);

      const redirectUrl = role === Role.STUDENT ? '/#pricing' : '/dashboard';
      return NextResponse.json({ success: true, redirectUrl }, { status: 201 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 400 }
    );
  }
}

/**
 * Handles role-based redirect logic
 * @param {ReturnType<typeof createClient>} supabase - Supabase client
 * @param {any} user - User data
 * @returns {Promise<string>} - Redirect URL
 */
async function handleRoleBasedRedirect(supabase: ReturnType<typeof createClient>, user: any): Promise<string> {
  if (user.role === Role.STUDENT) {
    const { data: studentRecord, error } = await supabase
      .from('Student')
      .select('hasAccess')
      .eq('userId', user.id)
      .single();

    if (error) throw error;
    return studentRecord?.hasAccess ? '/dashboard' : '/#pricing';
  } else if (user.role === Role.TEACHER) {
    const { error } = await supabase
      .from('Teacher')
      .select('id')
      .eq('userId', user.id)
      .single();

    if (error) throw error;
    return '/dashboard';
  }
  throw new Error('Invalid role.');
}