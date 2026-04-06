import AppShell from '@/components/layout/AppShell'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Profile } from '@/types'
import { NewsPageClient } from './NewsPageClient'
import { ingestIfStale } from '@/lib/newsIngest'
import { fillFeatured } from '@/lib/newsFeatured'

export default async function NewsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  // Auto-ingest if cache is stale (>6 hours) — non-blocking if it fails
  await ingestIfStale()

  const serviceClient = createServiceClient()
  // Fetch latest 200 articles (excluding blocked) + total count of non-blocked
  const [{ data: articles }, { count: totalCount }] = await Promise.all([
    serviceClient
      .from('news_cache')
      .select('id, title, url, source, source_url, author, summary, category, tags, image_url, upvotes, views, is_featured, published_at')
      .eq('is_blocked', false)
      .order('published_at', { ascending: false })
      .limit(200),
    serviceClient
      .from('news_cache')
      .select('*', { count: 'exact', head: true })
      .eq('is_blocked', false),
  ])

  const filledArticles = fillFeatured(articles ?? [])

  return (
    <AppShell profile={profile as Profile | null}>
      <NewsPageClient articles={filledArticles} totalCount={totalCount ?? 0} />
    </AppShell>
  )
}
