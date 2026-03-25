'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { CheckCircle } from 'lucide-react'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-seeper-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative blurred circles */}
      <div
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'rgba(237,105,58,0.08)' }}
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'rgba(176,169,207,0.08)' }}
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

        {sent ? (
          /* Success state */
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-plasma/10 flex items-center justify-center">
                <CheckCircle size={32} className="text-plasma" />
              </div>
            </div>
            <h2 className="heading-display text-lg mb-2">Check your email</h2>
            <p className="font-body text-seeper-steel text-sm leading-relaxed">
              We sent a magic link to <span className="text-seeper-white">{email}</span>.
              Click it to sign in — no password needed.
            </p>
          </div>
        ) : (
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
