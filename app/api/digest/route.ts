// POST /api/digest — generate and cache today's digest
// Called by the Regenerate button on the dashboard
import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { generateDailyDigest } from '@/lib/claude'
import { MOCK_TICKER_HEADLINES } from '@/lib/constants'

export async function POST() {
  try {
    // Verify the user is authenticated (anon client)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const content = await generateDailyDigest([...MOCK_TICKER_HEADLINES])
    const today = new Date().toISOString().split('T')[0]

    // Write via service-role client — daily_digest has no authenticated INSERT policy
    const serviceClient = createServiceClient()
    const { error: upsertError } = await serviceClient
      .from('daily_digest')
      .upsert({ content, date: today }, { onConflict: 'date' })
    if (upsertError) {
      console.error('[digest] Failed to cache digest:', upsertError.message)
    }

    return NextResponse.json({ content })
  } catch {
    return NextResponse.json({ error: 'Failed to generate digest' }, { status: 500 })
  }
}
