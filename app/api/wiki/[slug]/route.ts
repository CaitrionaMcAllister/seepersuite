import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const svc = createServiceClient()

  const { data: page, error } = await svc
    .from('wiki_pages')
    .select('*, profiles!wiki_pages_author_id_fkey(full_name, display_name, avatar_color, role)')
    .eq('slug', slug)
    .single()

  if (error || !page) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Increment view count (fire and forget)
  svc.from('wiki_pages').update({ views: (page.views ?? 0) + 1 }).eq('slug', slug).then(() => {})

  return NextResponse.json(page)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: page } = await createServiceClient()
    .from('wiki_pages').select('author_id').eq('slug', slug).single()

  if (!page) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (page.author_id !== user.id && profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { data, error } = await supabase
    .from('wiki_pages')
    .update({ ...body, last_edited_by: user.id })
    .eq('slug', slug)
    .select('id, slug')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 })
  }

  const { error } = await supabase
    .from('wiki_pages').update({ published: false }).eq('slug', slug)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
