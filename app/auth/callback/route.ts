import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? origin
  const supabase = createClient()

  const code       = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type       = searchParams.get('type') as EmailOtpType | null
  const errorCode  = searchParams.get('error_code')
  const errorDesc  = searchParams.get('error_description')

  // Supabase redirected here with an error (e.g. otp_expired) — pass it through
  if (errorCode) {
    return NextResponse.redirect(`${baseUrl}/auth?error=${errorCode}&desc=${encodeURIComponent(errorDesc ?? '')}`)
  }

  // PKCE flow
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(`${baseUrl}/dashboard`)
    console.error('[auth/callback] exchangeCodeForSession:', error.message)
    return NextResponse.redirect(`${baseUrl}/auth?error=${encodeURIComponent(error.message)}`)
  }

  // OTP / token_hash flow
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type })
    if (!error) return NextResponse.redirect(`${baseUrl}/dashboard`)
    console.error('[auth/callback] verifyOtp:', error.message)
    return NextResponse.redirect(`${baseUrl}/auth?error=${encodeURIComponent(error.message)}`)
  }

  return NextResponse.redirect(`${baseUrl}/auth?error=no_code`)
}
