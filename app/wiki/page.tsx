import AppShell from '@/components/layout/AppShell'
import PlaceholderPage from '@/components/ui/PlaceholderPage'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Profile } from '@/types'

export default async function WikiPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  return (
    <AppShell profile={profile as Profile | null}>
      <PlaceholderPage
        sectionName="seeWiki"
        title="seeWiki"
        description="Internal knowledge base for the seeper team. Document processes, guides, project learnings, and studio knowledge."
      />
    </AppShell>
  )
}
