'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    // Implicit flow: tokens arrive in the URL hash fragment.
    // The Supabase browser client detects them automatically on load.
    // onAuthStateChange fires once the session is established.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        router.replace('/dashboard')
      } else if (event === 'SIGNED_OUT') {
        router.replace('/auth?error=auth_callback_failed')
      }
    })

    // Also handle the case where the session is already set by the time
    // this effect runs (e.g. fast browser token parse)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/dashboard')
    })

    return () => subscription.unsubscribe()
  }, [router])

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[var(--color-bg)]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-6 h-6 border-2 border-plasma/30 border-t-plasma rounded-full animate-spin" />
        <p className="text-xs text-[var(--color-muted)]">Signing you in…</p>
      </div>
    </div>
  )
}
