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
    return NextResponse.json({ error: userFetchError.message }, { status: 400 });
  }

  if (!existingUser) {
    return NextResponse.json({ error: 'User not found.' }, { status: 404 });
  }

  // Fetch the corresponding student record to check access
  const { data: studentRecord, error: studentFetchError } = await supabase
    .from('Student')
    .select('hasAccess')
    .eq('id', user.id) // Assuming user.id corresponds to student.id
    .single();

  if (studentFetchError) {
    console.error('Error fetching student data:', studentFetchError);
    return NextResponse.json({ error: studentFetchError.message }, { status: 400 });
  }

  if (!studentRecord) {
    return NextResponse.json({ error: 'Student not found.' }, { status: 404 });
  }

  // Redirect logic for student and teacher
  const isLocalEnv = process.env.NODE_ENV === 'development'
  const redirectUrl = isLocalEnv ? baseUrl : `https://${request.headers.get('x-forwarded-host')}`;

  if (existingUser.role === 'STUDENT') {
    if (studentRecord.hasAccess) {
      return NextResponse.redirect(`${redirectUrl}/dashboard`);
    } else {
      return NextResponse.redirect(`${redirectUrl}/#pricing`);
    }
  } else {
    return NextResponse.redirect(`${redirectUrl}/dashboard`);
  }
}

// New POST method for email/password sign-up
export async function POST(request: Request) {
  const supabase = createClient();
  const { email, password, signIn, role } = await request.json();

  if (signIn) {
    // Sign in with email and password
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      console.error('Error signing in:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const user = data?.user;

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

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    // Check role and access
    let roleCheck;
    if (existingUser.role === 'STUDENT') {
      const { data: studentRecord, error: studentFetchError } = await supabase
        .from('Student')
        .select('hasAccess')
        .eq('userId', user.id) // Use userId to match the Student table
        .single();

      if (studentFetchError) {
        console.error('Error fetching student data:', studentFetchError);
        return NextResponse.json({ error: studentFetchError.message }, { status: 400 });
      }

      if (!studentRecord) {
        return NextResponse.json({ error: 'Student not found.' }, { status: 404 });
      }

      roleCheck = studentRecord.hasAccess ? '/dashboard' : '/#pricing';
    } else if (existingUser.role === 'TEACHER') {
      const { data: teacherRecord, error: teacherFetchError } = await supabase
        .from('Teacher')
        .select('id')
        .eq('userId', user.id) // Use userId to match the Teacher table
        .single();

      if (teacherFetchError) {
        console.error('Error fetching teacher data:', teacherFetchError);
        return NextResponse.json({ error: teacherFetchError.message }, { status: 400 });
      }

      if (!teacherRecord) {
        return NextResponse.json({ error: 'Teacher not found.' }, { status: 404 });
      }

      roleCheck = '/dashboard';
    } else {
      return NextResponse.json({ error: 'Invalid role.' }, { status: 400 });
    }

    // Redirect based on role
    return NextResponse.json({ success: true, redirectUrl: roleCheck }, { status: 200 });
  } else {
    // Sign up with email and password
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      console.error('Error signing up:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const user = data?.user;

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
        role,
        createdAt: currentDate,
        updatedAt: currentDate,
      })
      .select()
      .single();

    if (createUserError) {
      console.error('Error creating user in database:', createUserError);
      return NextResponse.json({ error: createUserError.message }, { status: 400 });
    }

    // Create entry in the appropriate table based on role
    if (role === 'STUDENT') {
      await supabase.from('Student').insert({ id: user.id, userId: user.id, createdAt: currentDate, updatedAt: currentDate });
    } else if (role === 'TEACHER') {
      await supabase.from('Teacher').insert({ id: user.id, userId: user.id, createdAt: currentDate, updatedAt: currentDate });
    }

    const redirectUrl = role === 'STUDENT' ? '/#pricing' : '/dashboard';
    return NextResponse.json({ success: true, redirectUrl }, { status: 201 });
  }
}