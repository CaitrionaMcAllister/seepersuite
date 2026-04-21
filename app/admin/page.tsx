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
    { data: profiles },
    { data: wikiEditorPages },
    authUsersResult,
  ] = await Promise.all([
    serviceClient.from('profiles').select('*', { count: 'exact', head: true }),
    serviceClient.from('contributions').select('*', { count: 'exact', head: true }).neq('status', 'rejected'),
    serviceClient.from('news_cache').select('*', { count: 'exact', head: true }),
    serviceClient.from('contributions').select('*').eq('status', 'pending').order('submitted_at', { ascending: false }),
    serviceClient.from('contributions').select('id, title, category, submitter_name, submitted_at, is_featured, is_blocked').eq('status', 'approved').order('submitted_at', { ascending: false }).limit(100),
    serviceClient.from('contributions').select('id, title, category, submitter_name, submitted_at, status, description').order('submitted_at', { ascending: false }).limit(50),
    serviceClient.from('news_sources').select('*').order('created_at', { ascending: true }),
    serviceClient.from('news_cache').select('id, title, url, source, category, published_at, is_featured, is_blocked').order('published_at', { ascending: false }).limit(100),
    serviceClient.from('profiles').select('id, full_name, display_name, role, job_title, department, created_at').order('created_at', { ascending: true }),
    serviceClient.from('wiki_pages').select('id, slug, title, category, published, author_id, views, updated_at, profiles!wiki_pages_author_id_fkey(full_name, display_name)').order('updated_at', { ascending: false }).limit(200),
    serviceClient.auth.admin.listUsers({ perPage: 1000 }),
  ])

  // Join profiles with auth emails
  const emailMap: Record<string, string> = {}
  for (const u of authUsersResult.data?.users ?? []) {
    emailMap[u.id] = u.email ?? ''
  }
  const users = (profiles ?? []).map(p => ({ ...p, email: emailMap[p.id] ?? '' }))

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
        wikiEditorPages={wikiEditorPages ?? []}
        mockWikiPages={MOCK_WIKI_PAGES}
        users={users}
      />
    </AppShell>
  )
}
