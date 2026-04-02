'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function AuthPage() {
  return <Suspense><AuthForm /></Suspense>
}

function AuthForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    const e = searchParams.get('error')
    const desc = searchParams.get('desc')
    if (e) setError(desc ? `${e}: ${desc}` : e)
  }, [searchParams])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        },
      })
      // TODO: Supabase returns 429 rate-limit errors on repeated OTP requests.
      // We intentionally swallow this — showing confirmation avoids confusing
      // "rate limited" messages for users who accidentally double-submitted.
      if (error && error.status !== 429) {
        setError('Something went wrong. Please try again.')
        setLoading(false)
        return
      }
      setSent(true)
    } catch {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-seeper-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative blurred circles */}
      <div
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl pointer-events-none bg-plasma/[0.08]"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-3xl pointer-events-none bg-quantum/[0.08]"
        aria-hidden="true"
      />

      {/* Login card */}
      <div className="seeper-card w-full max-w-[440px] p-10 relative z-10">
        {/* Wordmark */}
        <div className="text-center mb-8">
          <div className="font-display font-light text-seeper-white text-4xl mb-2">
            seeper<span className="text-plasma">●</span>
          </div>
          <p className="font-body text-seeper-muted text-sm">
            crafting awe &amp; wonder — internal
          </p>
        </div>

        {sent && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full border-4 border-plasma flex items-center justify-center mx-auto animate-[fadeInUp_0.4s_ease]">
              <span className="text-plasma text-2xl">✓</span>
            </div>
            <h2 className="text-lg font-bold">Check your inbox</h2>
            <p className="text-sm text-[var(--color-subtext)]">
              We sent a magic link to <strong>{email}</strong>. Click it to sign in — it expires in 60 minutes.
            </p>
            <button
              type="button"
              onClick={() => { setSent(false); setEmail(''); setError(null) }}
              className="text-xs text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
            >
              Try a different email
            </button>
          </div>
        )}
        {!sent && (
          /* Login form */
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              id="email"
              type="email"
              label="Email address"
              placeholder="you@seeper.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
              error={error ?? undefined}
            />
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              disabled={loading || !email}
            >
              {loading ? 'Sending…' : 'Send magic link'}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
