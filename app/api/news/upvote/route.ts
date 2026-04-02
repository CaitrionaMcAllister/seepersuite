import { createServiceClient } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id, action } = await req.json()
    if (!id || !['up', 'down'].includes(action))
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

    const delta = action === 'up' ? 1 : -1
    const service = createServiceClient()

    const { data: current } = await service
      .from('news_cache').select('upvotes').eq('id', id).single()

    const newCount = Math.max(0, (current?.upvotes ?? 0) + delta)

    const { error } = await service
      .from('news_cache').update({ upvotes: newCount }).eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, upvotes: newCount })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
