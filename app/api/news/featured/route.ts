import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { fillFeatured } from '@/lib/newsFeatured'

export const revalidate = 300 // 5 min cache

export async function GET() {
  // Fetch recent articles so fillFeatured has candidates to auto-select from
  const { data } = await createServiceClient()
    .from('news_cache')
    .select('id, title, url, source, is_featured, category, published_at')
    .eq('is_blocked', false)
    .order('published_at', { ascending: false })
    .limit(50)

  const filled = fillFeatured(data ?? [])
  const featured = filled.filter(a => a.is_featured)

  return NextResponse.json(featured.map(({ id, title, url, source }) => ({ id, title, url, source })))
}
