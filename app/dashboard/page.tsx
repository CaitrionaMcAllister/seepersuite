import { redirect } from 'next/navigation'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { generateDailyDigest } from '@/lib/claude'
import { MOCK_NEWS, MOCK_DIGEST_STORIES } from '@/lib/constants'
import AppShell from '@/components/layout/AppShell'
import { DailyDigest } from '@/components/dashboard/DailyDigest'
import QuickLinks from '@/components/dashboard/QuickLinks'
import WikiUpdates from '@/components/dashboard/WikiUpdates'
import NewsletterPreview from '@/components/dashboard/NewsletterPreview'
import ActivityFeed from '@/components/dashboard/ActivityFeed'
import type { Profile, DigestStory } from '@/types'

async function getTodaysDigest(): Promise<DigestStory[]> {
  try {
    const serviceClient = createServiceClient()
    const today = new Date().toISOString().split('T')[0]

    const { data: cached } = await serviceClient
      .from('daily_digest').select('content, generated_at').eq('date', today).single()

    if (cached) {
      try {
        const stories: DigestStory[] = JSON.parse(cached.content)
        if (Array.isArray(stories) && stories.length > 0) return stories
      } catch { /* fall through */ }
    }

    const headlines = MOCK_NEWS.map(n => n.title)
    const stories = await generateDailyDigest(headlines)

    const { error: upsertError } = await serviceClient
      .from('daily_digest')
      .upsert({ content: JSON.stringify(stories), date: today }, { onConflict: 'date' })
    if (upsertError) console.error('[digest] Cache error:', upsertError.message)

    return stories
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

  const stories = await getTodaysDigest()

  return (
    <AppShell profile={profile as Profile | null}>
      <div className="flex flex-col gap-6 max-w-screen-2xl mx-auto w-full">
        {/* Daily Digest hero */}
        <DailyDigest initialStories={stories} />

        {/* Quick links */}
        <QuickLinks />

        {/* Two-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[65fr_35fr] gap-6">
          {/* Left column */}
          <div className="flex flex-col gap-6">
            <WikiUpdates />
            <NewsletterPreview />
          </div>

          {/* Right column */}
          <ActivityFeed />
        </div>
      </div>
    </AppShell>
  )
}
