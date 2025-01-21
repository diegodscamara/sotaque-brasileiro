import { NextResponse } from 'next/server'
// The client you created from the Server-Side Auth instructions
import { createClient } from '@/libs/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token = searchParams.get('token'); // Extract the token for magic link
  const email = searchParams.get('email'); // Extract the email from the query parameters

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

  // Check if the user is a student
  const { data: studentData } = await supabase
    .from('students')
    .select('*')
    .eq('id', user.id)
    .single();

  // Check if the user is a teacher
  const { data: teacherData } = await supabase
    .from('teachers')
    .select('*')
    .eq('id', user.id)
    .single();

  // Determine if the user is a student or teacher
  let existingUser;
  let isStudent = false;

  if (studentData) {
    existingUser = studentData;
    isStudent = true;
  } else if (teacherData) {
    existingUser = teacherData;
  } else {
    // User does not exist in either table, create a new entry as a student
    const newUser = {
      id: user.id,
      email: user.email,
      first_name: user.user_metadata.first_name || '',
      last_name: user.user_metadata.last_name || '',
      avatar_url: user.user_metadata.avatar_url || '',
      has_access: false, // Set default access as needed
      role: 'student',
    };

    // Create the user as a student
    const { error: createStudentError } = await supabase
      .from('students')
      .insert(newUser);
    if (createStudentError) {
      console.error('Error creating student:', createStudentError);
      return NextResponse.redirect(`${origin}/auth/auth-code-error`);
    }
    existingUser = newUser;
    isStudent = true; // Set isStudent to true since we created a student
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
      .from(isStudent ? 'students' : 'teachers') // Update the correct table
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
  if (isLocalEnv) {
    // Check for student access
    if (isStudent) {
      if (existingUser.has_access) {
        return NextResponse.redirect(`${origin}/dashboard`);
      } else {
        return NextResponse.redirect(`${origin}/pricing`);
      }
    }
    // If not a student, check if they are a teacher
    else {
      return NextResponse.redirect(`${origin}/dashboard`);
    }
  } else {
    const forwardedHost = request.headers.get('x-forwarded-host');
    // Check for student access
    if (isStudent) {
      if (existingUser.has_access) {
        return NextResponse.redirect(`https://${forwardedHost}/dashboard`);
      } else {
        return NextResponse.redirect(`https://${forwardedHost}/pricing`);
      }
    }
    // If not a student, check if they are a teacher
    else {
      return NextResponse.redirect(`https://${forwardedHost}/dashboard`);
    }
  }
}