// POST /api/tag — auto-tag content using Claude
// Body: { title: string, excerpt: string }
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { tagContent } from '@/lib/claude'

interface TagBody {
  title: string
  excerpt: string
}

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json() as TagBody
    if (!body.title || !body.excerpt) {
      return NextResponse.json({ error: 'title and excerpt are required' }, { status: 400 })
    }

    const tags = await tagContent(body.title, body.excerpt)
    return NextResponse.json({ tags })
  } catch {
    return NextResponse.json({ error: 'Failed to tag content' }, { status: 500 })
  }
}
