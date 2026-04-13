import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const promptIndex = parseInt(searchParams.get('prompt_index') ?? '-1')
  if (promptIndex < 0) return NextResponse.json({ error: 'Missing prompt_index' }, { status: 400 })

  const svc = createServiceClient()
  const { data, error } = await svc
    .from('seespark_responses')
    .select('response, submitted_at')
    .eq('prompt_index', promptIndex)
    .order('submitted_at', { ascending: false })
    .limit(100)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { prompt_index, response } = await req.json()
  if (typeof prompt_index !== 'number' || !response?.trim()) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const svc = createServiceClient()
  const { error } = await svc
    .from('seespark_responses')
    .insert({ prompt_index, response: response.trim() })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
