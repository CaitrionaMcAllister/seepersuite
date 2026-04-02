import { createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { submitter_name, title, category, description, tags, url } = body

    // Server-side validation
    if (!submitter_name?.trim())
      return NextResponse.json({ error: 'Name required' }, { status: 400 })
    if (!title?.trim() || title.trim().length < 5)
      return NextResponse.json({ error: 'Title must be at least 5 characters' }, { status: 400 })
    if (!category)
      return NextResponse.json({ error: 'Category required' }, { status: 400 })
    if (!description?.trim() || description.trim().length < 20)
      return NextResponse.json({ error: 'Description must be at least 20 characters' }, { status: 400 })

    const supabase = createServiceClient()

    const { data, error } = await supabase.from('contributions').insert({
      submitter_name,
      title,
      category,
      description,
      tags: tags ?? [],
      url: url ?? null,
      status: 'pending',
    }).select('id').single()

    if (error) {
      console.error('[contribute] Insert error:', error.message, error.details, error.hint)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: data.id })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
