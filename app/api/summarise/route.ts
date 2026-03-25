// POST /api/summarise — summarise an article using Claude
// Body: { title: string, content: string }
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { summariseArticle } from '@/lib/claude'

interface SummariseBody {
  title: string
  content: string
}

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json() as SummariseBody
    if (!body.title || !body.content) {
      return NextResponse.json({ error: 'title and content are required' }, { status: 400 })
    }

    const summary = await summariseArticle(body.title, body.content)
    return NextResponse.json({ summary })
  } catch {
    return NextResponse.json({ error: 'Failed to summarise article' }, { status: 500 })
  }
}
