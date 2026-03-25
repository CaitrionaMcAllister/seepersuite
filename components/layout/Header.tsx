'use client'
// Must be a Client Component so that date/greeting are computed from the
// user's actual local time, not frozen at server render / build time.
import { useMemo } from 'react'
import Avatar from '@/components/ui/Avatar'
import { formatDate, getGreeting } from '@/lib/utils'
import type { Profile } from '@/types'

interface HeaderProps {
  profile: Profile | null
}

export default function Header({ profile }: HeaderProps) {
  const name = profile?.display_name ?? profile?.full_name ?? 'there'

  // Compute once per render — these read the client's local clock
  const greeting = useMemo(() => getGreeting(name), [name])
  const dateString = useMemo(() => formatDate(new Date()), [])

  return (
    <header className="sticky top-0 z-30 bg-seeper-bg/95 backdrop-blur-sm border-b border-seeper-border/40">
      <div
        className="flex items-center justify-between px-8 py-4"
        style={{ borderBottom: '1px solid rgba(237,105,58,0.4)' }}
      >
        {/* Left: wordmark */}
        <div>
          <div className="font-display font-light text-seeper-white text-2xl leading-none">
            seeper<span className="text-plasma">●</span>
          </div>
          <div className="text-quantum text-sm font-display">wiki</div>
        </div>

        {/* Right: date, greeting, avatar */}
        <div className="flex items-center gap-6">
          <div className="text-right hidden md:block">
            <p className="font-display text-sm text-seeper-white">{dateString}</p>
            <p className="font-body text-sm text-seeper-steel">{greeting}</p>
          </div>
          <Avatar
            src={profile?.avatar_url}
            name={profile?.display_name ?? profile?.full_name}
            size={40}
          />
        </div>
      </div>
    </header>
  )
}
