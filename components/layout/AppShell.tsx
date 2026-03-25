'use client'
import { useRouter } from 'next/navigation'
import { type ReactNode } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'

interface AppShellProps {
  profile: Profile | null
  children: ReactNode
}

export default function AppShell({ profile, children }: AppShellProps) {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.refresh()
    router.push('/auth')
  }

  return (
    <div className="flex h-screen bg-seeper-bg overflow-hidden">
      <Sidebar profile={profile} onSignOut={handleSignOut} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header profile={profile} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
