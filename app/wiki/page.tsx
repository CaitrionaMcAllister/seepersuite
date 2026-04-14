import AppShell from '@/components/layout/AppShell'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Profile } from '@/types'
import { WikiPageClient } from './WikiPageClient'

export const dynamic = 'force-dynamic'

export default async function WikiPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const svc = createServiceClient()
  const [{ data: profile }, { data: contributions }, { data: wikiPages }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    svc
      .from('contributions')
      .select('id, submitter_name, title, category, description, tags, submitted_at, status')
      .neq('status', 'rejected')
      .order('submitted_at', { ascending: false })
      .limit(50),
    svc
      .from('wiki_pages')
      .select('id, slug, title, category, tags, author_id, views, updated_at, profiles!wiki_pages_author_id_fkey(full_name, display_name, avatar_color)')
      .eq('published', true)
      .order('updated_at', { ascending: false })
      .limit(100),
  ])

  return (
    <AppShell profile={profile as Profile | null}>
      <WikiPageClient contributions={contributions ?? []} wikiPages={wikiPages ?? []} />
    </AppShell>
  )
}
