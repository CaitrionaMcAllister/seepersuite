import { redirect } from 'next/navigation'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { generateDailyDigest } from '@/lib/claude'
import { MOCK_DIGEST, MOCK_TICKER_HEADLINES } from '@/lib/constants'
import AppShell from '@/components/layout/AppShell'
import DailyDigest from '@/components/dashboard/DailyDigest'
import QuickLinks from '@/components/dashboard/QuickLinks'
import WikiUpdates from '@/components/dashboard/WikiUpdates'
import NewsletterPreview from '@/components/dashboard/NewsletterPreview'
import ActivityFeed from '@/components/dashboard/ActivityFeed'
import NewsTicker from '@/components/dashboard/NewsTicker'
import type { Profile } from '@/types'

async function getTodaysDigest(): Promise<string> {
  const today = new Date().toISOString().split('T')[0]

  // Read uses anon client (RLS: authenticated read allowed)
  const anonClient = createClient()
  const { data: cached } = await anonClient
    .from('daily_digest')
    .select('content')
    .eq('date', today)
    .single()

  if (cached?.content) return cached.content

  // Generate via Claude — pass mock headlines in Phase 1 so the API is actually called.
  // Phase 2: replace MOCK_TICKER_HEADLINES with freshly fetched RSS headlines.
  const content = await generateDailyDigest([...MOCK_TICKER_HEADLINES])

  // Write uses service-role client — daily_digest has no authenticated INSERT policy.
  const serviceClient = createServiceClient()
  const { error: upsertError } = await serviceClient
    .from('daily_digest')
    .upsert({ content, date: today }, { onConflict: 'date' })
  if (upsertError) {
    console.error('[digest] Failed to cache digest:', upsertError.message)
  }

  return content
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

  // Fetch today's digest (cached or freshly generated).
  // Falls back to MOCK_DIGEST if Supabase or Claude is unavailable.
  let digestContent = MOCK_DIGEST
  try {
    digestContent = await getTodaysDigest()
  } catch {
    // Use mock digest if anything fails — never break the dashboard
  }

  return (
    <AppShell profile={profile as Profile | null}>
      <div className="flex flex-col min-h-full">
        {/* Main scrollable content */}
        <div className="flex-1 p-8 flex flex-col gap-6 max-w-screen-2xl mx-auto w-full">
          {/* Daily Digest hero */}
          <DailyDigest content={digestContent} />

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

        {/* News ticker — pinned to bottom of content area */}
        <NewsTicker />
      </div>
    </AppShell>
  )
}
