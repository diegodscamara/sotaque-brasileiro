import { NextResponse } from 'next/server'
// The client you created from the Server-Side Auth instructions
import { createClient } from '@/libs/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer

      // Fetch user metadata to check role and access
      const { data: { user } } = await supabase.auth.getUser();

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
        console.error('User not found in either table.');
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
      } else if (forwardedHost) {
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
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}