import { createClient } from '@/lib/supabase/server'
import { ingestNews } from '@/lib/newsIngest'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const result = await ingestNews()
    return NextResponse.json({ success: true, ...result })
  } catch (err) {
    console.error('[news-ingest] API error:', err)
    return NextResponse.json({ error: 'Ingest failed' }, { status: 500 })
  }
}
