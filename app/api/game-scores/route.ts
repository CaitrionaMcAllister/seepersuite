import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

const SCORED_GAMES = ['seeWord', 'seeQuiz', 'seeLinks', 'seeScope'] as const

// GET /api/game-scores?game=seeWord&day_index=123
// Returns top scores for the given game+day with player names
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const game = searchParams.get('game')
  const dayIndex = searchParams.get('day_index')

  if (!game || !dayIndex) {
    return NextResponse.json({ error: 'Missing game or day_index' }, { status: 400 })
  }

  const svc = createServiceClient()
  const { data, error } = await svc
    .from('game_scores')
    .select('score, user_id, profiles(display_name, full_name)')
    .eq('game', game)
    .eq('day_index', parseInt(dayIndex))
    .order('score', { ascending: false })
    .limit(20)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Supabase returns joined rows as arrays; normalise to single object
  const rows = (data ?? []).map((row) => {
    const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles
    return {
      score: row.score as number,
      name: (profile?.display_name ?? profile?.full_name ?? 'Team member') as string,
    }
  })

  return NextResponse.json(rows)
}

// POST /api/game-scores  { game, day_index, score }
export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { game, day_index, score } = await req.json()

  if (!SCORED_GAMES.includes(game) || typeof day_index !== 'number' || typeof score !== 'number') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const svc = createServiceClient()
  const { error } = await svc
    .from('game_scores')
    .upsert({ user_id: user.id, game, day_index, score }, { onConflict: 'user_id,game,day_index' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
