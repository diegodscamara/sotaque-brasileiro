import { NextResponse } from 'next/server'
import { createClient } from '@/libs/supabase/server'
import { getUserTimeZone } from '@/libs/utils/timezone'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const queryParams = {
    code: searchParams.get('code'),
    token: searchParams.get('token'),
    email: searchParams.get('email'),
  };

  const { code, token, email } = queryParams;
  const supabase = createClient();

  // Extract base URL without locale
  const baseUrl = origin.replace(/\/(en|fr|pt)(\/|$)/, '/');

  if (token && email) {
    // If a token is present, verify it
    const { error } = await supabase.auth.verifyOtp({ type: 'magiclink', token, email });
    if (error) {
      console.error('Error verifying magic link:', error);
      return NextResponse.redirect(`${baseUrl}/auth/auth-code-error`);
    }
  } else if (code) {
    // If a code is present, exchange it for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error('Error exchanging code for session:', error);
      return NextResponse.redirect(`${baseUrl}/auth/auth-code-error`);
    }
  } else {
    console.error('No token or code provided.');
    return NextResponse.redirect(`${baseUrl}/auth/auth-code-error`);
  }

  // Fetch user metadata to check role and access
  const { data: { user } } = await supabase.auth.getUser();

  let { data: existingUser, error: userFetchError } = await supabase
    .from('User')
    .select('*')
    .eq('id', user.id)
    .single();

  const userTimeZone = getUserTimeZone();

  if (userFetchError && userFetchError.code === 'PGRST116') {
    // User does not exist, create a new entry
    const googleName = user.user_metadata?.name || 'Unknown User';
    const googleAvatar = user.user_metadata?.avatar_url || null;
    const [firstName, ...lastNameParts] = googleName.split(' ');
    const lastName = lastNameParts.join(' ');

    const currentDate = new Date().toLocaleString('en-US', { timeZone: userTimeZone });

    const { data: newUser, error: createUserError } = await supabase
      .from('User')
      .insert({
        id: user.id,
        email: user.email,
        firstName: firstName,
        lastName: lastName,
        avatarUrl: googleAvatar,
        role: 'STUDENT',
        updatedAt: currentDate,
        createdAt: currentDate,
      })
      .select()
      .single();

    const { data: student, error: studentError } = await supabase
      .from('Student')
      .insert({
        id: user.id,
        userId: user.id,
        createdAt: currentDate,
        updatedAt: currentDate,
      })
      .select()
      .single();

    if (studentError) {
      console.error('Error creating student:', studentError);
      return NextResponse.redirect(`${baseUrl}/auth/auth-code-error`);
    }

    if (student) {
      console.log('Student created:', student);
    }

    if (createUserError) {
      console.error('Error creating user:', createUserError);
      return NextResponse.redirect(`${baseUrl}/auth/auth-code-error`);
    }

    existingUser = newUser;
  } else if (userFetchError) {
    console.error('Error fetching user data:', userFetchError);
    return NextResponse.redirect(`${baseUrl}/auth/auth-code-error`);
  }

  // Fetch the corresponding student record to check access
  const { data: studentRecord, error: studentFetchError } = await supabase
    .from('Student')
    .select('hasAccess')
    .eq('id', user.id) // Assuming user.id corresponds to student.id
    .single();

  if (studentFetchError) {
    console.error('Error fetching student data:', studentFetchError);
    return NextResponse.redirect(`${baseUrl}/auth/auth-code-error`);
  }

  // Redirect logic for student and teacher
  const isLocalEnv = process.env.NODE_ENV === 'development'
  const redirectUrl = isLocalEnv ? baseUrl : `https://${request.headers.get('x-forwarded-host')}`;

  if (existingUser.role === 'STUDENT') {
    if (studentRecord.hasAccess) {
      return NextResponse.redirect(`${redirectUrl}/dashboard`);
    } else {
      return NextResponse.redirect(`${redirectUrl}/pricing`);
    }
  } else {
    return NextResponse.redirect(`${redirectUrl}/dashboard`);
  }
}

// New POST method for email/password sign-up
export async function POST(request: Request) {
  const supabase = createClient();
  const { email, password, signIn } = await request.json(); // Added signIn flag

  if (signIn) {
    // Sign in with email and password
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Error signing in:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const user = data?.user; // Safely access the user property

    if (!user) {
      return NextResponse.json({ error: 'User sign-in failed.' }, { status: 400 });
    }

    // Fetch user entry in the database
    const { data: existingUser, error: userFetchError } = await supabase
      .from('User')
      .select('*')
      .eq('id', user.id)
      .single();

    if (userFetchError) {
      console.error('Error fetching user data:', userFetchError);
      return NextResponse.json({ error: userFetchError.message }, { status: 400 });
    }

    return NextResponse.json({ user: existingUser }, { status: 200 });
  } else {
    // Sign up with email and password
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error('Error signing up:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const user = data?.user; // Safely access the user property

    if (!user) {
      return NextResponse.json({ error: 'User creation failed.' }, { status: 400 });
    }

    // Create user entry in the database
    const userTimeZone = getUserTimeZone();
    const currentDate = new Date().toLocaleString('en-US', { timeZone: userTimeZone });

    const { data: newUser, error: createUserError } = await supabase
      .from('User')
      .insert({
        id: user.id,
        email: user.email,
        firstName: '', // You can modify this to accept first name
        lastName: '',  // You can modify this to accept last name
        avatarUrl: null,
        role: 'STUDENT',
        updatedAt: currentDate,
        createdAt: currentDate,
      })
      .select()
      .single();

    if (createUserError) {
      console.error('Error creating user in database:', createUserError);
      return NextResponse.json({ error: createUserError.message }, { status: 400 });
    }

    return NextResponse.json({ user: newUser }, { status: 201 });
  }
}