import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

async function requireAdmin() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  return profile?.role === 'admin' ? user : null
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireAdmin()
    if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await req.json()
    const { id } = body
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const update: Record<string, unknown> = {}
    if (body.status && ['pending', 'approved', 'rejected'].includes(body.status)) update.status = body.status
    if (typeof body.is_featured === 'boolean') update.is_featured = body.is_featured
    if (typeof body.is_blocked === 'boolean') update.is_blocked = body.is_blocked
    // Full edit fields
    if (typeof body.title === 'string') update.title = body.title
    if (typeof body.category === 'string') update.category = body.category
    if (typeof body.description === 'string') update.description = body.description
    if (Array.isArray(body.tags)) update.tags = body.tags
    if ('url' in body) update.url = body.url ?? null
    if (typeof body.submitter_name === 'string') update.submitter_name = body.submitter_name
    if (typeof body.submitted_at === 'string') update.submitted_at = body.submitted_at
    if (Object.keys(update).length === 0) return NextResponse.json({ error: 'no valid fields' }, { status: 400 })

    const { error } = await createServiceClient().from('contributions').update(update).eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await requireAdmin()
    if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const { error } = await createServiceClient().from('contributions').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
