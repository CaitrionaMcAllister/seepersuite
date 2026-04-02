import { createServiceClient } from '@/lib/supabase/server'
import { generateDailyDigest } from '@/lib/claude'
import { fetchNewsForDigest } from '@/lib/news'
import { MOCK_NEWS, MOCK_DIGEST_STORIES } from '@/lib/constants'
import { NextRequest, NextResponse } from 'next/server'
import type { DigestStory } from '@/types'

export async function GET(req: NextRequest) {
  const force = req.nextUrl.searchParams.get('force') === 'true'

  try {
    const serviceClient = createServiceClient()
    const today = new Date().toISOString().split('T')[0]

    if (!force) {
      const { data: cached } = await serviceClient
        .from('daily_digest')
        .select('content, generated_at')
        .eq('date', today)
        .single()

      if (cached) {
        const sixHoursAgo = Date.now() - 6 * 3600000
        const generatedAt = new Date(cached.generated_at).getTime()
        if (generatedAt > sixHoursAgo) {
          try {
            const stories: DigestStory[] = JSON.parse(cached.content)
            if (Array.isArray(stories) && stories.length > 0)
              return NextResponse.json({ stories, cached: true })
          } catch { /* fall through */ }
        }
      }
    }

    // Try real RSS news first, fall back to mock headlines
    const realArticles = await fetchNewsForDigest()
    const articles = realArticles.length >= 4
      ? realArticles
      : MOCK_NEWS.map(n => ({ title: n.title, url: n.sourceUrl, source: n.source, sourceUrl: n.sourceUrl, description: n.summary, publishedAt: n.publishedAt }))

    const stories = await generateDailyDigest(articles)

    const content = JSON.stringify(stories)
    const { error: upsertError } = await serviceClient
      .from('daily_digest')
      .upsert({ content, date: today }, { onConflict: 'date' })
    if (upsertError) {
      console.error('[digest] Failed to cache digest:', upsertError.message)
    }

    return NextResponse.json({ stories, cached: false })
  } catch (err) {
    console.error('[digest] Error:', err)
    return NextResponse.json({ stories: MOCK_DIGEST_STORIES, cached: false, error: true })
  }
}
