'use client'

import Sidebar from './Sidebar'
import Header from './Header'
import { FAB } from '@/components/ui/FAB'
import { NewsTicker } from '@/components/ui/NewsTicker'
import type { Profile } from '@/types'

interface AppShellProps {
  profile: Profile | null
  children: React.ReactNode
}

export default function AppShell({ profile, children }: AppShellProps) {
  const authorName = profile?.display_name ?? profile?.full_name ?? ''
  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-bg)]">
      <Sidebar profile={profile} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header profile={profile} />
        <main className="flex-1 overflow-y-auto p-6 relative">
          {children}
          <FAB authorName={authorName} />
        </main>
        <NewsTicker />
      </div>
    </div>
  )
}
