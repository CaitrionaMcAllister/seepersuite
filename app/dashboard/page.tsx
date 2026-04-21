export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { MOCK_DIGEST_STORIES } from '@/lib/constants'
import { fillFeatured } from '@/lib/newsFeatured'
import AppShell from '@/components/layout/AppShell'
import { DailyDigest } from '@/components/dashboard/DailyDigest'
import QuickLinks from '@/components/dashboard/QuickLinks'
import WikiUpdates from '@/components/dashboard/WikiUpdates'
import NewsletterPreview from '@/components/dashboard/NewsletterPreview'
import ActivityFeed from '@/components/dashboard/ActivityFeed'
import WordOfDay from '@/components/dashboard/WordOfDay'
import GameOfDay from '@/components/dashboard/GameOfDay'
import type { Profile, DigestStory } from '@/types'

// Visual config keyed by news_cache category strings
const CATEGORY_VISUALS: Record<string, { icon: string; color: string; label: string }> = {
  'AI & ML':       { icon: '◈', color: '#7F77DD', label: 'AI & ML' },
  'Spatial':       { icon: '◉', color: '#B0A9CF', label: 'XR / Spatial' },
  'Immersive':     { icon: '◉', color: '#ED693A', label: 'Immersive' },
  'Tools':         { icon: '⬡', color: '#DCFEAD', label: 'Tools & Tech' },
  'Creative Tech': { icon: '✦', color: '#ED693A', label: 'Creative Tech' },
  'Audio':         { icon: '◎', color: '#8ACB8F', label: 'Audio' },
  'Industry':      { icon: '◎', color: '#EDDE5C', label: 'Industry' },
  'Events':        { icon: '◆', color: '#D4537E', label: 'Events' },
}
const SOURCE_COLORS = ['#ED693A', '#B0A9CF', '#7F77DD', '#8ACB8F', '#EDDE5C', '#D4537E']

function rgba(hex: string, a: number) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${a})`
}

async function getFeaturedDigest(): Promise<DigestStory[]> {
  try {
    // Fetch recent articles so fillFeatured can auto-select if fewer than 3 are manually featured
    const { data } = await createServiceClient()
      .from('news_cache')
      .select('id, title, summary, category, source, source_url, url, published_at, is_featured')
      .eq('is_blocked', false)
      .order('published_at', { ascending: false })
      .limit(50)

    if (!data || data.length === 0) return MOCK_DIGEST_STORIES

    const filled = fillFeatured(data)
    const featured = filled.filter(a => a.is_featured).slice(0, 10)
    if (featured.length === 0) return MOCK_DIGEST_STORIES

    return featured.map((article, i) => {
      const vis = CATEGORY_VISUALS[article.category ?? ''] ?? { icon: '✦', color: '#ED693A', label: 'News' }
      return {
        icon: vis.icon,
        iconBg: rgba(vis.color, 0.12),
        iconColor: vis.color,
        catBg: rgba(vis.color, 0.15),
        catColor: vis.color,
        category: article.category ?? 'News',
        imageLabel: vis.label,
        title: article.title,
        summary: article.summary ?? article.title,
        sources: [{
          label: article.source,
          abbreviation: article.source.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase(),
          color: SOURCE_COLORS[i % SOURCE_COLORS.length],
          url: article.url,
        }],
      }
    })
  } catch {
    return MOCK_DIGEST_STORIES
  }
}

export default async function DashboardPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const stories = await getFeaturedDigest()

  // Fetch recent contributions for dashboard widgets
  const serviceClient = createServiceClient()

  const [
    { data: recentContributions },
    { data: approvedContributions },
    { data: recentWikiPages },
  ] = await Promise.all([
    // Activity feed — all contributions regardless of status
    serviceClient
      .from('contributions')
      .select('id, submitter_name, title, category, submitted_at')
      .order('submitted_at', { ascending: false })
      .limit(8),
    // Wiki updates — approved contributions only
    serviceClient
      .from('contributions')
      .select('id, submitter_name, title, category, submitted_at')
      .eq('status', 'approved')
      .eq('is_blocked', false)
      .order('submitted_at', { ascending: false })
      .limit(5),
    // Wiki editor pages — published
    serviceClient
      .from('wiki_pages')
      .select('id, title, category, updated_at, profiles!wiki_pages_author_id_fkey(full_name, display_name)')
      .eq('published', true)
      .order('updated_at', { ascending: false })
      .limit(8),
  ])

  // Normalise wiki_pages to the same shape as contributions
  type FeedItem = { id: string; submitter_name: string; title: string; category: string; submitted_at: string; action?: string }

  const wikiPageItems: FeedItem[] = (recentWikiPages ?? []).map(p => {
    const prof = Array.isArray(p.profiles) ? p.profiles[0] : p.profiles
    return {
      id: p.id,
      submitter_name: (prof as { display_name?: string; full_name?: string } | null)?.display_name
        ?? (prof as { display_name?: string; full_name?: string } | null)?.full_name
        ?? 'Unknown',
      title: p.title,
      category: p.category ?? 'general',
      submitted_at: p.updated_at,
      action: 'published a page to seeWiki',
    }
  })

  const wikiPageItemsForUpdates: FeedItem[] = wikiPageItems.slice(0, 5)

  // Merge + sort for WikiUpdates (approved contributions + published wiki pages)
  const allWikiUpdates: FeedItem[] = [
    ...(approvedContributions ?? []),
    ...wikiPageItemsForUpdates,
  ].sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()).slice(0, 5)

  // Merge + sort for ActivityFeed
  const allRecentContributions: FeedItem[] = [
    ...(recentContributions ?? []).map(c => ({ ...c, action: 'submitted a contribution to' })),
    ...wikiPageItems,
  ].sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()).slice(0, 8)

  return (
    <AppShell profile={profile as Profile | null}>
      <div className="flex flex-col gap-6 max-w-screen-2xl mx-auto w-full">
        {/* Daily Digest hero */}
        <DailyDigest initialStories={stories} />

        {/* Quick links */}
        <QuickLinks />

        {/* Word of the day + Game of the day */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
          <WordOfDay />
          <GameOfDay />
        </div>

        {/* Two-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[65fr_35fr] gap-6">
          {/* Left column */}
          <div className="flex flex-col gap-6">
            <WikiUpdates contributions={allWikiUpdates} />
            <NewsletterPreview />
          </div>

          {/* Right column */}
          <ActivityFeed contributions={allRecentContributions ?? []} />
        </div>
      </div>
    </AppShell>
  )
}
