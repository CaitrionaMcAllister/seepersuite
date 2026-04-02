import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export const revalidate = 300 // 5 min cache

export async function GET() {
  const { data } = await createServiceClient()
    .from('news_cache')
    .select('id, title, url, source')
    .eq('is_featured', true)
    .order('published_at', { ascending: false })
    .limit(20)

  return NextResponse.json(data ?? [])
}
