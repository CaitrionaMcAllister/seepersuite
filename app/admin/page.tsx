import AppShell from '@/components/layout/AppShell'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Profile } from '@/types'
import { AdminPageClient } from './AdminPageClient'

export default async function AdminPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')
  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const serviceClient = createServiceClient()
  const [
    { count: userCount },
    { count: wikiCount },
    { count: promptCount },
    { data: recentActivity },
    { data: pendingContributions },
  ] = await Promise.all([
    serviceClient.from('profiles').select('*', { count: 'exact', head: true }),
    serviceClient.from('wiki_pages').select('*', { count: 'exact', head: true }),
    serviceClient.from('prompts').select('*', { count: 'exact', head: true }),
    serviceClient.from('activity_log').select('*').order('created_at', { ascending: false }).limit(50),
    serviceClient.from('contributions').select('*').eq('status', 'pending').order('submitted_at', { ascending: false }),
  ])

  return (
    <AppShell profile={profile as Profile | null}>
      <AdminPageClient
        profile={profile as Profile}
        stats={{ userCount: userCount ?? 0, wikiCount: wikiCount ?? 0, promptCount: promptCount ?? 0 }}
        recentActivity={recentActivity ?? []}
        pendingContributions={pendingContributions ?? []}
      />
    </AppShell>
  )
}
