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
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const supabase = createClient()

  // Remove language prefix from origin
  const baseUrl = origin.replace(/\/(en|fr|pt)(\/|$)/, '/')

  if (error) {
    return NextResponse.redirect(`${baseUrl}auth/auth-code-error?error=${error}`)
  }

  if (!code) {
    return NextResponse.redirect(`${baseUrl}auth/auth-code-error`)
  }

  try {
    const { data: { session }, error: authError } = await supabase.auth.exchangeCodeForSession(code)

    if (authError) {
      console.error('Error exchanging code for session:', authError)
      return NextResponse.redirect(`${baseUrl}auth/auth-code-error`)
    }

    // Check if user exists
    const { data: existingUser, error: userFetchError } = await supabase
      .from('User')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (userFetchError && userFetchError.code === 'PGRST116') {
      // User doesn't exist, create new user
      await createNewUser(supabase, session, Role.STUDENT)
    } else if (!userFetchError && existingUser) {
      // User exists, update with Google info if available
      await updateUserWithGoogleInfo(supabase, session, existingUser)
    } else if (userFetchError) {
      return NextResponse.json({ error: userFetchError.message }, { status: 400 })
    }

    // Get updated user info for redirect
    const { data: updatedUser } = await supabase
      .from('User')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (!updatedUser) {
      return NextResponse.redirect(`${baseUrl}auth/auth-code-error`)
    }

    // Handle role-based redirect
    const redirectUrl = await handleRoleBasedRedirect(supabase, updatedUser)
    return NextResponse.redirect(`${baseUrl}${redirectUrl.replace(/^\//, '')}`)

  } catch (error) {
    console.error('Error in auth callback:', error)
    return NextResponse.redirect(`${baseUrl}auth/auth-code-error`)
  }
}

/**
 * Updates existing user with Google info if available
 * @param {ReturnType<typeof createClient>} supabase - Supabase client
 * @param {any} session - Auth session
 * @param {any} existingUser - Existing user data
 * @returns {Promise<void>}
 */
async function updateUserWithGoogleInfo(supabase: ReturnType<typeof createClient>, session: any, existingUser: any): Promise<void> {
  if (session.user.user_metadata?.full_name) {
    const googleName = session.user.user_metadata.full_name
    const googleAvatar = session.user.user_metadata.avatar_url || null
    const [firstName, ...lastNameParts] = googleName.split(' ')
    const lastName = lastNameParts.join(' ')

    const updateData: any = {}

    // Only update fields that are empty, null or different from existing values
    if (!existingUser.firstName || existingUser.firstName !== firstName) updateData.firstName = firstName
    if (!existingUser.lastName || existingUser.lastName !== lastName) updateData.lastName = lastName
    if (!existingUser.avatarUrl || existingUser.avatarUrl !== googleAvatar) updateData.avatarUrl = googleAvatar

    if (Object.keys(updateData).length > 0) {
      updateData.updatedAt = new Date().toLocaleString('en-US', { timeZone: getUserTimeZone() })
      const { error } = await supabase
        .from('User')
        .update(updateData)
        .eq('id', session.user.id)

      if (error) throw new Error(`User update failed: ${error.message}`)
    }
  }
}

/**
 * Creates a new user in the database
 * @param {ReturnType<typeof createClient>} supabase - Supabase client
 * @param {any} session - Auth session
 * @param {Role} role - User role
 * @returns {Promise<void>}
 */
async function createNewUser(supabase: ReturnType<typeof createClient>, session: any, role: Role): Promise<void> {
  const userTimeZone = getUserTimeZone()
  const currentDate = new Date().toLocaleString('en-US', { timeZone: userTimeZone })

  // Only extract name for Google sign-ups
  const userData: any = {
    id: session.user.id,
    email: session.user.email,
    role,
    updatedAt: currentDate,
    createdAt: currentDate,
  }

  // Add name and avatar only if it's a Google sign-up
  if (session.user.user_metadata?.full_name) {
    const googleName = session.user.user_metadata.full_name
    const googleAvatar = session.user.user_metadata.avatar_url || null
    const [firstName, ...lastNameParts] = googleName.split(' ')
    const lastName = lastNameParts.join(' ')

    userData.firstName = firstName
    userData.lastName = lastName
    userData.avatarUrl = googleAvatar
  }

  const { error: userError } = await supabase
    .from('User')
    .insert(userData)

  if (userError) throw new Error(`User creation failed: ${userError.message}`)

  if (role === Role.STUDENT) {
    const { error: studentError } = await supabase
      .from('Student')
      .insert({
        id: session.user.id,
        userId: session.user.id,
        createdAt: currentDate,
        updatedAt: currentDate,
      })

    if (studentError) throw new Error(`Student creation failed: ${studentError.message}`)
  } else if (role === Role.TEACHER) {
    const { error: teacherError } = await supabase
      .from('Teacher')
      .insert({
        id: session.user.id,
        userId: session.user.id,
        createdAt: currentDate,
        updatedAt: currentDate,
      })

    if (teacherError) throw new Error(`Teacher creation failed: ${teacherError.message}`)
  }
}

/**
 * Handles email/password authentication
 * @param {Request} request - The incoming request
 * @returns {Promise<NextResponse>} - Response with redirect URL or error
 */
export async function POST(request: Request): Promise<NextResponse> {
  const supabase = createClient()
  const { email, password, signIn, role } = await request.json()

  try {
    if (signIn) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error

      const user = data?.user
      if (!user) throw new Error('User sign-in failed.')

      const { data: existingUser, error: userFetchError } = await supabase
        .from('User')
        .select('*')
        .eq('id', user.id)
        .single()

      if (userFetchError) throw userFetchError
      if (!existingUser) throw new Error('User not found.')

      const redirectUrl = await handleRoleBasedRedirect(supabase, existingUser)
      return NextResponse.json({ success: true, redirectUrl }, { status: 200 })
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) throw error

      const user = data?.user
      if (!user) throw new Error('User creation failed.')

      await createNewUser(supabase, { user }, role as Role)

      const redirectUrl = role === Role.STUDENT ? '/#pricing' : '/dashboard'
      return NextResponse.json({ success: true, redirectUrl }, { status: 201 })
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 400 }
    )
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
      .single()

    if (error) throw error
    return studentRecord?.hasAccess ? '/dashboard' : '/#pricing'
  } else if (user.role === Role.TEACHER) {
    const { error } = await supabase
      .from('Teacher')
      .select('id')
      .eq('userId', user.id)
      .single()

    if (error) throw error
    return '/dashboard'
  }
  throw new Error('Invalid role.')
}