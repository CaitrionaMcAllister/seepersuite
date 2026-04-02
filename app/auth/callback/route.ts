// Supabase auth callback — handles both PKCE code exchange and OTP token_hash verification
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? origin
  const supabase = createClient()

  // PKCE flow — code exchanged for session
  const code = searchParams.get('code')
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(`${baseUrl}/dashboard`)
    console.error('[auth/callback] exchangeCodeForSession error:', error.message)
  }

  // OTP / magic-link flow — token_hash verified directly
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type })
    if (!error) return NextResponse.redirect(`${baseUrl}/dashboard`)
    console.error('[auth/callback] verifyOtp error:', error.message)
  }

  return NextResponse.redirect(`${baseUrl}/auth?error=auth_callback_failed`)
}
