import AppShell from '@/components/layout/AppShell'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Profile } from '@/types'
import { AdminPageClient } from './AdminPageClient'
import { MOCK_WIKI_PAGES, MOCK_PROMPTS, MOCK_TOOLS, MOCK_RESOURCES } from '@/lib/constants'

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
    { count: contributionCount },
    { count: newsCount },
    { data: pendingContributions },
    { data: approvedContributions },
    { data: recentContributions },
    { data: newsSources },
    { data: newsArticles },
  ] = await Promise.all([
    serviceClient.from('profiles').select('*', { count: 'exact', head: true }),
    serviceClient.from('contributions').select('*', { count: 'exact', head: true }).neq('status', 'rejected'),
    serviceClient.from('news_cache').select('*', { count: 'exact', head: true }),
    serviceClient.from('contributions').select('*').eq('status', 'pending').order('submitted_at', { ascending: false }),
    serviceClient.from('contributions').select('id, title, category, submitter_name, submitted_at, is_featured, is_blocked').eq('status', 'approved').order('submitted_at', { ascending: false }).limit(100),
    serviceClient.from('contributions').select('id, title, category, submitter_name, submitted_at, status, description').order('submitted_at', { ascending: false }).limit(20),
    serviceClient.from('news_sources').select('*').order('created_at', { ascending: true }),
    serviceClient.from('news_cache').select('id, title, url, source, category, published_at, is_featured, is_blocked').order('published_at', { ascending: false }).limit(100),
  ])

  const wikiCount = (contributionCount ?? 0) + MOCK_WIKI_PAGES.length
  const promptCount = MOCK_PROMPTS.length
  const toolCount = MOCK_TOOLS.length
  const resourceCount = MOCK_RESOURCES.length

  return (
    <AppShell profile={profile as Profile | null}>
      <AdminPageClient
        profile={profile as Profile}
        stats={{ userCount: userCount ?? 0, wikiCount, promptCount, newsCount: newsCount ?? 0, toolCount, resourceCount }}
        recentContributions={recentContributions ?? []}
        pendingContributions={pendingContributions ?? []}
        approvedContributions={approvedContributions ?? []}
        newsSources={newsSources ?? []}
        newsArticles={newsArticles ?? []}
      />
    </AppShell>
  )
}
