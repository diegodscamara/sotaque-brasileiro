import { NextResponse } from 'next/server'
import { Role } from '@prisma/client'
import { createClient } from '@/libs/supabase/server'
import { prisma } from '@/libs/prisma'

/**
 * Handles authentication callback from Supabase
 * @param {Request} request - The incoming request
 * @returns {Promise<NextResponse>} - Response with redirect URL or error
 */
export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') || ''
  const error = searchParams.get('error')
  const supabase = createClient()

  // Handle errors
  if (error) {
    return NextResponse.redirect(`${origin}/auth/error?error=${error}`)
  }

  // Handle missing code
  if (!code) {
    return NextResponse.redirect(`${origin}/auth/error?error=missing_code`)
  }

  try {
    // Exchange code for session
    const { data: { session }, error: authError } = await supabase.auth.exchangeCodeForSession(code)

    if (authError) {
      console.error('Error exchanging code for session:', authError)
      return NextResponse.redirect(`${origin}/auth/error?error=auth_error`)
    }

    // Check if user exists in database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    // If user doesn't exist in database, create it
    if (!user) {
      try {
        // Get user metadata from Supabase
        const role = session.user.user_metadata?.role || Role.STUDENT
        
        // Create user in database with transaction to ensure consistency
        await prisma.$transaction(async (tx) => {
          // Create user record
          await tx.user.create({
            data: {
              id: session.user.id,
              email: session.user.email!,
              role: role as Role,
            },
          })

          // Create role-specific record
          if (role === Role.STUDENT) {
            await tx.student.create({
              data: {
                userId: session.user.id,
              },
            })
          } else if (role === Role.TEACHER) {
            await tx.teacher.create({
              data: {
                userId: session.user.id,
              },
            })
          }
        })
      } catch (dbError) {
        console.error('Error creating user in database:', dbError)
        return NextResponse.redirect(`${origin}/auth/error?error=database_error`)
      }
    }

    // Handle specific redirects
    if (next) {
      return NextResponse.redirect(`${origin}${next}`)
    }

    // Get user from database for role-based redirect
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!dbUser) {
      return NextResponse.redirect(`${origin}/auth/error?error=user_not_found`)
    }

    // Determine redirect URL based on user role
    let redirectUrl = '/dashboard'
    if (dbUser.role === Role.STUDENT) {
      // Check if student has completed onboarding
      const student = await prisma.student.findFirst({
        where: { userId: dbUser.id },
      })
      
      if (student && !student.hasCompletedOnboarding) {
        redirectUrl = '/onboarding'
      } else if (student && !student.hasAccess) {
        redirectUrl = '/#pricing'
      }
    }

    return NextResponse.redirect(`${origin}${redirectUrl}`)
  } catch (error) {
    console.error('Error in auth callback:', error)
    return NextResponse.redirect(`${origin}/auth/error?error=unknown_error`)
  }
}

/**
 * Handles email/password authentication
 * @param {Request} request - The incoming request
 * @returns {Promise<NextResponse>} - Response with redirect URL or error
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { email, password, signIn, role } = await request.json()
    const supabase = createClient()

    if (signIn) {
      // Sign in flow
      const { data: { session }, error: authError } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      })

      if (authError) {
        return NextResponse.json({ 
          success: false, 
          error: authError.message 
        }, { status: 400 })
      }

      // Get user from database
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
      })

      if (!user) {
        return NextResponse.json({ 
          success: false, 
          error: 'User not found' 
        }, { status: 404 })
      }

      // Determine redirect URL based on user role
      let redirectUrl = '/dashboard'
      if (user.role === Role.STUDENT) {
        // Check if student has completed onboarding
        const student = await prisma.student.findFirst({
          where: { userId: user.id },
        })
        
        if (student && !student.hasCompletedOnboarding) {
          redirectUrl = '/onboarding'
        } else if (student && !student.hasAccess) {
          redirectUrl = '/#pricing'
        }
      }

      return NextResponse.json({ 
        success: true, 
        redirectUrl 
      }, { status: 200 })
    } else {
      // Sign up flow
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: role || Role.STUDENT
          }
        }
      })

      if (signUpError) {
        return NextResponse.json({ 
          success: false, 
          error: signUpError.message 
        }, { status: 400 })
      }

      if (!user) {
        return NextResponse.json({ 
          success: false, 
          error: 'Signup failed' 
        }, { status: 400 })
      }

      try {
        // Create user in database with transaction to ensure consistency
        await prisma.$transaction(async (tx) => {
          // Create user record
          await tx.user.create({
            data: {
              id: user.id,
              email: user.email!,
              role: (role || Role.STUDENT) as Role,
            },
          })

          // Create role-specific record
          if (role === Role.STUDENT) {
            await tx.student.create({
              data: {
                userId: user.id,
              },
            })
          } else if (role === Role.TEACHER) {
            await tx.teacher.create({
              data: {
                userId: user.id,
              },
            })
          }
        })
      } catch (dbError) {
        console.error('Database error during signup:', dbError)
        
        // Clean up Supabase user if database creation fails
        await supabase.auth.admin.deleteUser(user.id)
        
        return NextResponse.json({ 
          success: false, 
          error: 'Failed to create user record' 
        }, { status: 500 })
      }

      // Determine redirect URL based on role
      const redirectUrl = role === Role.STUDENT ? '/#pricing' : '/dashboard'
      return NextResponse.json({ 
        success: true, 
        redirectUrl 
      }, { status: 200 })
    }
  } catch (error) {
    console.error('Error in auth API:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    }, { status: 500 })
  }
}