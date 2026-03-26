'use client'
// Must be a Client Component so that date/greeting are computed from the
// user's actual local time, not frozen at server render / build time.
import { useMemo, useState, useEffect } from 'react'
import Avatar from '@/components/ui/Avatar'
import { SearchModal } from '@/components/ui/SearchModal'
import { formatDate, getGreeting } from '@/lib/utils'
import type { Profile } from '@/types'
import { useTheme } from '@/components/providers/ThemeProvider'

interface HeaderProps {
  profile: Profile | null
}

export default function Header({ profile }: HeaderProps) {
  const name = profile?.display_name ?? profile?.full_name ?? 'there'
  const { theme, toggleTheme } = useTheme()
  const [searchOpen, setSearchOpen] = useState(false)

  // Compute once per render — these read the client's local clock
  const greeting = useMemo(() => getGreeting(name), [name])
  const dateString = useMemo(() => formatDate(new Date()), [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <header className="sticky top-0 z-30 bg-seeper-bg/95 backdrop-blur-sm">
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

        {/* Right: date, greeting, search, theme toggle, avatar */}
        <div className="flex items-center gap-6">
          <div className="text-right hidden md:block">
            <p className="font-display text-sm text-seeper-white">{dateString}</p>
            <p className="font-body text-sm text-seeper-steel">{greeting}</p>
          </div>
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-raised)] border border-seeper-border/40 text-sm text-[var(--color-muted)] hover:border-seeper-border transition-all"
          >
            🔍 <span className="text-xs">Search</span>
            <span className="ml-2 px-1.5 py-0.5 rounded border border-seeper-border/40 text-[10px]">⌘K</span>
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border border-seeper-border/40 hover:border-plasma/60 transition-all duration-300"
          >
            {theme === 'dark' ? '☀ Light' : '☾ Dark'}
          </button>
          <Avatar
            src={profile?.avatar_url}
            name={profile?.display_name ?? profile?.full_name}
            size={40}
          />
        </div>
      </div>
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  )
}
