import { NextRequest, NextResponse } from 'next/server'
import { tagContent } from '@/lib/claude'

export async function POST(req: NextRequest) {
  try {
    const { title, description, category } = await req.json()
    if (!title) return NextResponse.json({ tags: [] })
    const tags = await tagContent(title, description ?? category ?? '')
    return NextResponse.json({ tags })
  } catch {
    return NextResponse.json({ tags: [] })
  }
}
