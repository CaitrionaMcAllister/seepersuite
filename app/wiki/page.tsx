import AppShell from '@/components/layout/AppShell'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Profile } from '@/types'
import { WikiPageClient } from './WikiPageClient'

export default async function WikiPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const [{ data: profile }, { data: contributions }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    createServiceClient()
      .from('contributions')
      .select('id, submitter_name, title, category, description, tags, submitted_at, status')
      .neq('status', 'rejected')
      .order('submitted_at', { ascending: false })
      .limit(50),
  ])

  return (
    <AppShell profile={profile as Profile | null}>
      <WikiPageClient contributions={contributions ?? []} />
    </AppShell>
  )
}
