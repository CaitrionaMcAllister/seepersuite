import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(req: NextRequest) {
  try {
    // Verify caller is an admin
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { id, status } = await req.json()
    if (!id || !['approved', 'rejected'].includes(status))
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

    const { error } = await createServiceClient()
      .from('contributions')
      .update({ status })
      .eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
