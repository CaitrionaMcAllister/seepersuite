import { createServiceClient } from '@/lib/supabase/server'
import { generateDailyDigest } from '@/lib/claude'
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
            if (Array.isArray(stories)) return NextResponse.json({ stories, cached: true })
          } catch {
            // Fall through to regenerate if content isn't valid JSON stories
          }
        }
      }
    }

    const headlines = MOCK_NEWS.map(n => `${n.title} (${n.source})`)
    const stories = await generateDailyDigest(headlines)

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
