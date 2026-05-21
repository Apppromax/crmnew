import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // next is the path to redirect to after successful verification, defaults to /auth/confirm
  const next = searchParams.get('next') ?? '/auth/confirm'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data?.user) {
      const user = data.user

      try {
        // Sync user to database Profile table
        await prisma.profile.upsert({
          where: { id: user.id },
          update: {
            email: user.email,
          },
          create: {
            id: user.id,
            email: user.email,
            role: 'user',
            balance: 0,
            isPro: false,
          },
        })
      } catch (dbError) {
        console.error('Database Sync Error during Auth Callback:', dbError)
        // Even if DB sync fails, we let them proceed to confirm since the Supabase session is established.
      }

      return NextResponse.redirect(new URL(next, request.url))
    } else {
      console.error('Supabase Auth Callback Error:', error)
    }
  }

  // Return the user to an error page if verification fails
  return NextResponse.redirect(new URL('/login?error=auth_failed', request.url))
}
