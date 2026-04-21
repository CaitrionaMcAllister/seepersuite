import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  const search   = searchParams.get('search')
  const limit    = parseInt(searchParams.get('limit') ?? '50')
  const offset   = parseInt(searchParams.get('offset') ?? '0')

  const supabase = createServiceClient()
  let query = supabase
    .from('wiki_pages')
    .select('id, slug, title, excerpt, category, tags, author_id, views, upvotes, published, created_at, updated_at')
    .eq('published', true)
    .order('updated_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (category && category !== 'All') {
    query = query.eq('category', category.toLowerCase())
  }
  if (search) {
    query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%`)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { title, content, content_json, category, tags, published, slug: rawSlug, table_of_contents } = body

  if (published && !title?.trim()) {
    return NextResponse.json({ error: 'Title required to publish' }, { status: 400 })
  }

  const svc = createServiceClient()

  const excerpt = body.excerpt ||
    (content ? content.replace(/<[^>]+>/g, '').slice(0, 200) : null)

  const payload = {
    title: title?.trim() || 'Untitled',
    content,
    content_json,
    excerpt,
    category,
    tags: tags ?? [],
    published: published ?? false,
    table_of_contents,
    author_id: user.id,
    last_edited_by: user.id,
  }

  if (rawSlug) {
    // Continuation of an existing page — update by slug
    const { data, error } = await supabase
      .from('wiki_pages')
      .upsert({ slug: rawSlug, ...payload }, { onConflict: 'slug' })
      .select('id, slug')
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  // New page — always INSERT with a fresh deduplicated slug
  const baseSlug = (title || 'untitled')
    .toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .slice(0, 80)

  let finalSlug = baseSlug
  let suffix = 2
  while (true) {
    const { data: collision } = await svc
      .from('wiki_pages').select('id').eq('slug', finalSlug).maybeSingle()
    if (!collision) break
    finalSlug = `${baseSlug}-${suffix++}`
  }

  const { data, error } = await supabase
    .from('wiki_pages')
    .insert({ slug: finalSlug, ...payload })
    .select('id, slug')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
