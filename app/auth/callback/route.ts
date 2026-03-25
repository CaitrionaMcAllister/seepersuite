// Supabase magic link callback — exchanges the code for a session
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // Use NEXT_PUBLIC_APP_URL if set; fall back to request origin for local dev
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? origin

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${baseUrl}/dashboard`)
    }
  }

  // Something went wrong — redirect back to auth with an error indicator
  return NextResponse.redirect(`${baseUrl}/auth?error=auth_callback_failed`)
}
