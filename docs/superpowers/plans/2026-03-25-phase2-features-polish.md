# seeper wiki Phase 2 — Plan C: Features & Polish

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Prerequisite:** Plans A and B must be complete before starting this plan.

**Goal:** Add the notification panel, admin panel, AI digest wiring, AppShell final assembly, and apply all performance polish (loading states, error states, empty states, animations) across every page.

**Architecture:** Notification state is managed client-side with mock data + Supabase reads for authenticated users. The admin panel is a tabbed Server Component page (auth-gated to admin role). All polish is applied by updating existing components — no new architecture.

**Tech Stack:** Next.js 14 App Router, TypeScript strict, Supabase, Claude API, Vitest

---

## File Map

**Create:**
- `components/ui/NotificationPanel.tsx`
- `hooks/useNotifications.ts`

**Modify:**
- `components/layout/Header.tsx` — add notification bell with unread badge
- `components/layout/AppShell.tsx` — add page-enter class to main
- `app/admin/page.tsx` — fully build all tabs
- `app/dashboard/page.tsx` — wire digest API + update layout
- `app/api/digest/route.ts` — update to return structured DigestStory[]
- `lib/claude.ts` — update generateDailyDigest + add semanticSearch stub

---

## Task 1: NotificationPanel

**Files:**
- Create: `components/ui/NotificationPanel.tsx`
- Create: `hooks/useNotifications.ts`
- Modify: `components/layout/Header.tsx`

- [ ] **Step 1: Create useNotifications hook**

```typescript
// hooks/useNotifications.ts
'use client'

import { useState } from 'react'
import type { Notification } from '@/types'

// Mock notifications — TODO: replace with Supabase real-time subscription
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    user_id: '',
    type: 'wiki_updated',
    title: 'Chris Brown updated UE5 Pipeline Guide',
    body: null,
    read: false,
    resource_type: 'wiki',
    resource_id: null,
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: '2',
    user_id: '',
    type: 'prompt_upvoted',
    title: 'Your prompt got 5 new upvotes',
    body: null,
    read: false,
    resource_type: 'prompt',
    resource_id: null,
    created_at: new Date(Date.now() - 4 * 3600000).toISOString(),
  },
  {
    id: '3',
    user_id: '',
    type: 'new_member',
    title: 'Asha R joined seeper — welcome!',
    body: null,
    read: true,
    resource_type: null,
    resource_id: null,
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
]

// Initials derived from notification type / title
const TYPE_INITIALS: Record<string, { initials: string; color: string }> = {
  wiki_updated:          { initials: 'CB', color: '#ED693A' },
  prompt_upvoted:        { initials: 'CM', color: '#B0A9CF' },
  new_member:            { initials: 'AR', color: '#8ACB8F' },
  contribution_approved: { initials: '✓',  color: '#DCFEAD' },
  digest_ready:          { initials: '◉',  color: '#ED693A' },
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS)

  const unreadCount = notifications.filter(n => !n.read).length

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const markRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  return { notifications, unreadCount, markAllRead, markRead }
}

export { TYPE_INITIALS }
```

- [ ] **Step 2: Create NotificationPanel**

```typescript
// components/ui/NotificationPanel.tsx
'use client'

import { useEffect, useRef } from 'react'
import { useNotifications, TYPE_INITIALS } from '@/hooks/useNotifications'
import { Avatar } from '@/components/ui/Avatar'
import type { Notification } from '@/types'
import { cn, relativeTime } from '@/lib/utils'

// relativeTime is imported from @/lib/utils — it was added there in Plan A Task 2

interface NotificationPanelProps {
  open: boolean
  onClose: () => void
}

export function NotificationPanel({ open, onClose }: NotificationPanelProps) {
  const { notifications, unreadCount, markAllRead, markRead } = useNotifications()
  const panelRef = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    setTimeout(() => document.addEventListener('mousedown', handler), 0)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full mt-2 w-[300px] max-h-[420px] flex flex-col rounded-2xl bg-[var(--color-surface)] border border-seeper-border/40 shadow-2xl z-[500] animate-[slideInFromBottom_0.2s_ease]"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-seeper-border/40">
        <span className="text-sm font-bold">Notifications</span>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-xs text-plasma hover:underline"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-xs text-[var(--color-muted)]">
            No notifications yet
          </div>
        ) : (
          notifications.map(n => {
            const { initials, color } = TYPE_INITIALS[n.type] ?? { initials: '?', color: '#ED693A' }
            return (
              <button
                key={n.id}
                onClick={() => markRead(n.id)}
                className={cn(
                  'w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-[var(--color-raised)] transition-colors border-b border-seeper-border/20',
                  !n.read && 'bg-plasma/5'
                )}
              >
                <Avatar name={initials} size={32} style={{ backgroundColor: color, flexShrink: 0 }} />
                <div className="flex-1 min-w-0">
                  <p className={cn('text-xs leading-snug', !n.read && 'font-semibold text-[var(--color-text)]', n.read && 'text-[var(--color-subtext)]')}>
                    {n.title}
                  </p>
                  <p className="text-[10px] text-[var(--color-muted)] mt-0.5">
                    {relativeTime(n.created_at)}
                  </p>
                </div>
                {!n.read && (
                  <div className="w-2 h-2 rounded-full bg-plasma flex-shrink-0 mt-1" />
                )}
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Add notification bell to Header.tsx**

```typescript
// In Header.tsx, add NotificationPanel alongside the theme toggle:
import { useState } from 'react'
import { NotificationPanel } from '@/components/ui/NotificationPanel'
import { useNotifications } from '@/hooks/useNotifications'

// In component:
const [notifOpen, setNotifOpen] = useState(false)
const { unreadCount } = useNotifications()

// In JSX, before the theme toggle:
<div className="relative">
  <button
    onClick={() => setNotifOpen(p => !p)}
    className="relative w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--color-raised)] transition-colors"
    aria-label="Notifications"
  >
    🔔
    {unreadCount > 0 && (
      <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-plasma" />
    )}
  </button>
  <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
</div>
```

- [ ] **Step 4: Build**

```bash
npm run build
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add NotificationPanel with bell badge and mock data"
```

---

## Task 2: Admin panel

**Files:**
- Modify: `app/admin/page.tsx`

The admin page already has the auth guard (role !== 'admin' → redirect). Build the full tabbed UI.

- [ ] **Step 1: Build admin page**

Replace the placeholder in `app/admin/page.tsx` with a fully built tabbed admin panel. The page is a Server Component; the tabbed UI is in `app/admin/AdminPageClient.tsx`.

```typescript
// app/admin/page.tsx
import AppShell from '@/components/layout/AppShell'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Profile } from '@/types'
import { AdminPageClient } from './AdminPageClient'

export default async function AdminPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')
  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  // Fetch admin data server-side
  const serviceClient = createServiceClient()
  const [
    { count: userCount },
    { count: wikiCount },
    { count: promptCount },
    { data: recentActivity },
    { data: pendingContributions },
  ] = await Promise.all([
    serviceClient.from('profiles').select('*', { count: 'exact', head: true }),
    serviceClient.from('wiki_pages').select('*', { count: 'exact', head: true }),
    serviceClient.from('prompts').select('*', { count: 'exact', head: true }),
    serviceClient.from('activity_log').select('*').order('created_at', { ascending: false }).limit(50),
    serviceClient.from('contributions').select('*').eq('status', 'pending').order('submitted_at', { ascending: false }),
  ])

  return (
    <AppShell profile={profile as Profile | null}>
      <AdminPageClient
        profile={profile as Profile}
        stats={{ userCount: userCount ?? 0, wikiCount: wikiCount ?? 0, promptCount: promptCount ?? 0 }}
        recentActivity={recentActivity ?? []}
        pendingContributions={pendingContributions ?? []}
      />
    </AppShell>
  )
}
```

`app/admin/AdminPageClient.tsx` — `'use client'` component with tabs:

**OVERVIEW tab:**
- Stat cards row: Total users, Wiki pages, Prompts, Contributions this week (use card grid)
- Recent activity table: Timestamp | User | Action | Resource

```typescript
const ACTION_COLORS: Record<string, string> = {
  created_wiki:         '#B0A9CF',
  edited_wiki:          '#DCFEAD',
  added_prompt:         '#EDDE5C',
  published_newsletter: '#ED693A',
  contributed:          '#ED693A',
  upvoted:              '#8ACB8F',
  signed_in:            '#555555',
}
```

**USERS tab:**
- Table: Avatar | Name | Email | Department | Role | Joined | Actions
- Role change: dropdown to toggle between 'member' and 'admin'
- On role change: `supabase.from('profiles').update({ role }).eq('id', userId)`

**CONTENT tab:**
- List of pending contributions (from `contributions` table)
- Each row: Title | Category | Submitter | Date | Approve / Reject buttons
- Approve: updates `contributions.status = 'approved'`, inserts into target table
- Reject: updates `contributions.status = 'rejected'`

**SETTINGS tab:**
- Manual digest trigger button → calls `/api/digest` with `force=true` query param
- Shows last generated timestamp from `daily_digest` table

- [ ] **Step 2: Build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: build admin panel with overview, users, content, and settings tabs"
```

---

## Task 3: Update digest API to return structured stories

**Files:**
- Modify: `app/api/digest/route.ts`
- Modify: `lib/claude.ts`
- Modify: `app/dashboard/page.tsx`
- Create: `components/dashboard/DigestStoryCard.tsx`

The current digest returns a single text string. Phase 2 requires an array of `DigestStory` objects with arrow navigation.

- [ ] **Step 1: Add `MOCK_DIGEST_STORIES` to lib/constants.ts FIRST**

This must be done before updating `lib/claude.ts`, because `claude.ts` imports it.

  try {
    const client = getClient()
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 800,
      messages: [{
        role: 'user',
        content: `You are the editorial AI for seeper, an immersive experience design studio. Write 4 brief digest stories from these headlines for the seeper team. Each story should be 2-3 sentences, written in a direct, knowledgeable tone — no fluff. Focus on relevance to immersive experience design, creative technology, and the studio's work.

Headlines:
${headlines.join('\n')}

Return ONLY valid JSON in this exact format, no other text:
[
  {
    "title": "short title",
    "summary": "2-3 sentence summary relevant to seeper",
    "sources": ["Source 1"],
    "category": "AI & ML"
  }
]`,
      }],
    })
    const text = extractText(response)
    // Strip any markdown code fences if present
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed: unknown = JSON.parse(clean)
    if (Array.isArray(parsed)) return parsed as DigestStory[]
    return MOCK_DIGEST_STORIES
  } catch {
    return MOCK_DIGEST_STORIES
  }
}
```

```typescript
// lib/constants.ts — add this export:
export const MOCK_DIGEST_STORIES: DigestStory[] = [
  {
    title: 'Runway Gen-4 raises the bar for AI video',
    summary: "Runway's new model handles multi-shot sequences without temporal flickering — directly relevant to seeper's projection content pipeline. Early tests show 3x improvement in scene consistency.",
    sources: ['The Verge'],
    category: 'AI & ML',
  },
  {
    title: 'GCC immersive entertainment market hits $2B',
    summary: "Saudi Arabia's PIF has earmarked significant capital for experiential design — opening major brief opportunities for studios with large-scale attraction experience.",
    sources: ['Dezeen'],
    category: 'Industry',
  },
  {
    title: 'TouchDesigner 2026 adds native Notch integration',
    summary: 'GPU instancing improvements deliver 40% better performance on particle-heavy scenes. Worth testing on the next attraction build.',
    sources: ['Derivative Blog'],
    category: 'Tools',
  },
  {
    title: 'SXSW names immersive design top creative sector',
    summary: 'Three of the top five Tribeca Immersive finalists use projection mapping. Industry momentum is at an all-time high for 2026.',
    sources: ['Creative Applications'],
    category: 'Industry',
  },
]
```

- [ ] **Step 2: Update lib/claude.ts to replace `generateDailyDigest`**

Update the import line at the top of `lib/claude.ts` to include the new constant (replace the old MOCK_DIGEST import):

```typescript
// Replace:
import { MOCK_DIGEST } from '@/lib/constants'
// With:
import { MOCK_DIGEST_STORIES } from '@/lib/constants'
import type { DigestStory } from '@/types'
```

Then replace the existing `generateDailyDigest` function entirely with:

```typescript
export async function generateDailyDigest(headlines: string[]): Promise<DigestStory[]> {
  if (headlines.length === 0) return MOCK_DIGEST_STORIES

  try {
    const client = getClient()
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 800,
      messages: [{
        role: 'user',
        content: `You are the editorial AI for seeper, an immersive experience design studio. Write 4 brief digest stories from these headlines for the seeper team. Each story should be 2-3 sentences, written in a direct, knowledgeable tone — no fluff. Focus on relevance to immersive experience design, creative technology, and the studio's work.\n\nHeadlines:\n${headlines.join('\n')}\n\nReturn ONLY valid JSON in this exact format, no other text:\n[\n  {\n    "title": "short title",\n    "summary": "2-3 sentence summary relevant to seeper",\n    "sources": ["Source 1"],\n    "category": "AI & ML"\n  }\n]`,
      }],
    })
    const text = extractText(response)
    const clean = text.replace(/\`\`\`json\n?/g, '').replace(/\`\`\`\n?/g, '').trim()
    const parsed: unknown = JSON.parse(clean)
    if (Array.isArray(parsed)) return parsed as DigestStory[]
    return MOCK_DIGEST_STORIES
  } catch {
    return MOCK_DIGEST_STORIES
  }
}
```

Also add the `semanticSearch` stub to `lib/claude.ts`:
```typescript
import type { SearchableItem } from '@/types'

export async function semanticSearch(
  query: string,
  content: SearchableItem[]
): Promise<SearchableItem[]> {
  // TODO: Replace client-side filter with Claude embeddings:
  // 1. Embed the query using claude-3-haiku (fast, cheap)
  // 2. Compare cosine similarity against pre-embedded content
  // 3. Return top N results by similarity score
  // For now: client-side string match
  const q = query.toLowerCase()
  return content.filter(item =>
    item.title.toLowerCase().includes(q) ||
    item.description?.toLowerCase().includes(q) ||
    item.tags?.some(t => t.includes(q))
  )
}
```

- [ ] **Step 2: Update /api/digest/route.ts**

```typescript
// app/api/digest/route.ts
import { createServiceClient, createClient } from '@/lib/supabase/server'
import { generateDailyDigest } from '@/lib/claude'
import { MOCK_NEWS, MOCK_DIGEST_STORIES } from '@/lib/constants'
import { NextRequest, NextResponse } from 'next/server'
import type { DigestStory } from '@/types'

export async function GET(req: NextRequest) {
  const force = req.nextUrl.searchParams.get('force') === 'true'

  try {
    const serviceClient = createServiceClient()
    const today = new Date().toISOString().split('T')[0]

    // Check cache (unless force refresh)
    if (!force) {
      const { data: cached } = await serviceClient
        .from('daily_digest')
        .select('content, generated_at')
        .eq('date', today)
        .single()

      if (cached) {
        const sixHoursAgo = Date.now() - 6 * 3600000
        const generatedAt = new Date(cached.generated_at).getTime()
        if (generatedAt > sixHoursAgo) {
          try {
            const stories: DigestStory[] = JSON.parse(cached.content)
            if (Array.isArray(stories)) return NextResponse.json({ stories, cached: true })
          } catch {
            // Fall through to regenerate if content isn't valid JSON stories
          }
        }
      }
    }

    // Generate new digest using MOCK_NEWS titles as input
    // TODO: Replace with live news_cache entries
    const headlines = MOCK_NEWS.map(n => `${n.title} (${n.source})`)
    const stories = await generateDailyDigest(headlines)

    // Cache to database
    const content = JSON.stringify(stories)
    const { error: upsertError } = await serviceClient
      .from('daily_digest')
      .upsert({ content, date: today }, { onConflict: 'date' })
    if (upsertError) {
      console.error('[digest] Failed to cache digest:', upsertError.message)
    }

    return NextResponse.json({ stories, cached: false })
  } catch (err) {
    console.error('[digest] Error:', err)
    return NextResponse.json({ stories: MOCK_DIGEST_STORIES, cached: false, error: true })
  }
}
```

- [ ] **Step 3: Update DailyDigest component**

`components/dashboard/DailyDigest.tsx` — update to:
- Receive `stories: DigestStory[]` as prop
- Show stories with ‹ › arrow navigation
- Dot indicators (one per story, active in plasma-orange)
- Current index shown as "1 / 4"
- Story content: title + summary + sources row
- Fade animation between stories (150ms out, 200ms in)
- Newspaper icon (Lucide `Newspaper`) instead of ✦

```typescript
// components/dashboard/DailyDigest.tsx
'use client'

import { useState, useEffect } from 'react'
import { Newspaper } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DigestStory } from '@/types'

interface DailyDigestProps {
  initialStories?: DigestStory[]
}

export function DailyDigest({ initialStories = [] }: DailyDigestProps) {
  const [stories, setStories] = useState<DigestStory[]>(initialStories)
  const [current, setCurrent] = useState(0)
  const [visible, setVisible] = useState(true)
  const [loading, setLoading] = useState(initialStories.length === 0)

  useEffect(() => {
    if (initialStories.length > 0) return
    fetch('/api/digest')
      .then(r => r.json())
      .then(d => {
        if (d.stories) setStories(d.stories)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [initialStories.length])

  const navigate = (next: number) => {
    if (next === current) return
    setVisible(false)
    setTimeout(() => {
      setCurrent(next)
      setVisible(true)
    }, 150)
  }

  const story = stories[current]

  return (
    <div className="seeper-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Newspaper size={14} className="text-plasma" />
          <span className="text-xs font-bold uppercase tracking-widest text-plasma">today&apos;s digest</span>
        </div>
        {stories.length > 1 && (
          <span className="text-[10px] text-[var(--color-muted)]">
            {current + 1} / {stories.length}
          </span>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          <div className="skeleton-shimmer h-4 w-3/4 rounded" />
          <div className="skeleton-shimmer h-3 w-full rounded" />
          <div className="skeleton-shimmer h-3 w-2/3 rounded" />
        </div>
      ) : story ? (
        <div
          className={cn(
            'transition-opacity duration-[200ms]',
            visible ? 'opacity-100' : 'opacity-0'
          )}
        >
          <p className="text-xs font-bold text-[var(--color-subtext)] uppercase tracking-widest mb-1">
            {story.category}
          </p>
          <h3 className="font-bold text-sm mb-2 leading-snug">{story.title}</h3>
          <p className="text-[11px] text-[var(--color-subtext)] leading-relaxed mb-3">
            {story.summary}
          </p>
          {story.sources.length > 0 && (
            <div className="flex gap-1.5">
              {story.sources.map(s => (
                <span key={s} className="px-2 py-0.5 rounded-full bg-[var(--color-raised)] text-[9px] text-[var(--color-muted)]">
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {/* Navigation */}
      {stories.length > 1 && (
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => navigate((current - 1 + stories.length) % stories.length)}
            className="w-7 h-7 flex items-center justify-center rounded-full border border-seeper-border/40 text-sm hover:border-plasma/60 transition-colors"
          >
            ‹
          </button>
          <div className="flex gap-1.5">
            {stories.map((_, i) => (
              <button
                key={i}
                onClick={() => navigate(i)}
                className={cn(
                  'w-1.5 h-1.5 rounded-full transition-all duration-150',
                  i === current ? 'bg-plasma w-3' : 'bg-seeper-border hover:bg-seeper-steel'
                )}
              />
            ))}
          </div>
          <button
            onClick={() => navigate((current + 1) % stories.length)}
            className="w-7 h-7 flex items-center justify-center rounded-full border border-seeper-border/40 text-sm hover:border-plasma/60 transition-colors"
          >
            ›
          </button>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Update dashboard page to pass stories**

In `app/dashboard/page.tsx`, update the `getTodaysDigest()` call to return `DigestStory[]` and pass to `DailyDigest`:

Add these imports to the top of `app/dashboard/page.tsx`:
```typescript
import type { DigestStory } from '@/types'
import { MOCK_NEWS, MOCK_DIGEST_STORIES } from '@/lib/constants'
// generateDailyDigest is already imported from '@/lib/claude'
```

Then replace the existing `getTodaysDigest` function with:
```typescript
async function getTodaysDigest(): Promise<DigestStory[]> {
  try {
    const serviceClient = createServiceClient()
    const today = new Date().toISOString().split('T')[0]

    const { data: cached } = await serviceClient
      .from('daily_digest').select('content, generated_at').eq('date', today).single()

    if (cached) {
      try {
        const stories: DigestStory[] = JSON.parse(cached.content)
        if (Array.isArray(stories) && stories.length > 0) return stories
      } catch { /* fall through */ }
    }

    // Generate new
    const headlines = MOCK_NEWS.map(n => n.title)
    const stories = await generateDailyDigest(headlines)

    const { error: upsertError } = await serviceClient
      .from('daily_digest')
      .upsert({ content: JSON.stringify(stories), date: today }, { onConflict: 'date' })
    if (upsertError) console.error('[digest] Cache error:', upsertError.message)

    return stories
  } catch {
    return MOCK_DIGEST_STORIES
  }
}

// In the page component:
const stories = await getTodaysDigest()
// Pass to DailyDigest:
<DailyDigest initialStories={stories} />
```

- [ ] **Step 5: Build + test**

```bash
npm run build && npm run test:run
```

Expected: Clean build, all tests pass.

The existing `claude.test.ts` has a `generateDailyDigest` describe block with tests that assert `typeof result === 'string'`. These tests will now fail because the return type is `DigestStory[]`.

**IMPORTANT: Replace the entire `generateDailyDigest` describe block — do NOT just append new tests. Delete the old tests first, then add these:**

```typescript
// In __tests__/lib/claude.test.ts:
// REPLACE the entire describe('generateDailyDigest', ...) block with:
describe('generateDailyDigest', () => {
  it('returns MOCK_DIGEST_STORIES array for empty headlines (no API call)', async () => {
    const result = await generateDailyDigest([])
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBeGreaterThan(0)
    expect(result[0]).toHaveProperty('title')
    expect(result[0]).toHaveProperty('summary')
  })

  it('calls Claude and returns parsed DigestStory[] on success', async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: 'text', text: '[{"title":"T","summary":"S","sources":["X"],"category":"AI"}]' }]
    })
    const result = await generateDailyDigest(['headline 1'])
    expect(Array.isArray(result)).toBe(true)
    expect(result[0]).toHaveProperty('title', 'T')
    expect(result[0]).toHaveProperty('summary', 'S')
  })

  it('returns MOCK_DIGEST_STORIES when Claude API fails', async () => {
    mockCreate.mockRejectedValueOnce(new Error('API error'))
    const result = await generateDailyDigest(['headline 1'])
    expect(Array.isArray(result)).toBe(true)
  })
})
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: update digest to return structured stories with arrow navigation"
```

---

## Task 4: AppShell final assembly

**Files:**
- Modify: `components/layout/AppShell.tsx`

Ensure AppShell has all the pieces wired up:
1. `page-enter` class on `<main>` for page transitions
2. `FAB` component included
3. App-wide `NewsTicker` at the bottom
4. Correct layout structure (no extra scrollbars)

- [ ] **Step 1: Final AppShell structure**

```typescript
// components/layout/AppShell.tsx
'use client'

import { useState } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import { FAB } from '@/components/ui/FAB'
import { NewsTicker } from '@/components/ui/NewsTicker'
import type { Profile } from '@/types'

interface AppShellProps {
  profile: Profile | null
  children: React.ReactNode
}

export default function AppShell({ profile, children }: AppShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-bg)]">
      {/* Sidebar */}
      <Sidebar profile={profile} />

      {/* Main column */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Header */}
        <Header profile={profile} />

        {/* Scrollable content + FAB */}
        <main className="flex-1 overflow-y-auto p-6 relative page-enter">
          {children}
          <FAB />
        </main>

        {/* Pinned ticker */}
        <NewsTicker />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add components/layout/AppShell.tsx
git commit -m "feat: finalize AppShell with FAB, NewsTicker, and page transitions"
```

---

## Task 5: Loading and error states

**Files:**
- Create: `app/news/loading.tsx` (already exists — verify)
- Create: `app/wiki/loading.tsx`
- Create: `app/prompts/loading.tsx`
- Create: `app/tools/loading.tsx`
- Create: `app/resources/loading.tsx`
- Create: `app/inside/loading.tsx`
- Create: `app/profile/loading.tsx`

- [ ] **Step 1: Create loading.tsx files for each content route**

Each loading file uses Skeleton components to match the real page layout:

```typescript
// Pattern — customize shapes to match each page layout
// Do NOT import AppShell here — loading.tsx is a Next.js Suspense boundary
// that wraps only the page content. AppShell is provided by the parent layout.
import { SkeletonCard, SkeletonRow } from '@/components/ui/Skeleton'

export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="h-7 w-32 skeleton-shimmer rounded" />
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Add error boundaries**

For each content page client component, wrap the content in try/catch and show a branded error card on failure:

```typescript
// Error card component (inline where needed, or create components/ui/ErrorCard.tsx)
function ErrorCard({ section }: { section: string }) {
  return (
    <div className="seeper-card p-8 text-center">
      <div className="w-12 h-12 rounded-full border-2 border-red-500/30 mx-auto mb-4 flex items-center justify-center">
        <span className="text-red-400 text-lg">✕</span>
      </div>
      <p className="font-bold text-sm mb-1">Something went wrong loading {section}</p>
      <p className="text-xs text-[var(--color-muted)] mb-4">
        Don&apos;t worry — your data is safe. Try refreshing the page.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 rounded-full border border-seeper-border/40 text-xs hover:border-plasma/60 transition-colors"
      >
        Retry
      </button>
    </div>
  )
}
```

- [ ] **Step 3: Build**

```bash
npm run build
```

Expected: All loading routes appear in build output.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add loading skeletons and error cards for all content pages"
```

---

## Task 6: Final animations and polish

**Files:**
- Modify: `app/globals.css`
- Modify: `tailwind.config.ts`

- [ ] **Step 1: Add remaining animations to globals.css**

```css
/* Card hover lift — applied via Tailwind hover class on .seeper-card */
/* Already handled by hover:-translate-y-0.5 on cards */

/* Button active scale */
button:active, a[role="button"]:active {
  transform: scale(0.97);
}

/* Modal open animation */
@keyframes modalFadeIn {
  from { opacity: 0; transform: scale(0.97); }
  to   { opacity: 1; transform: scale(1); }
}
.modal-enter {
  animation: modalFadeIn 0.2s ease;
}

/* Sidebar width transition — already handled by Tailwind transition classes */

/* Nav item transition — already handled by transition-all duration-150 */
```

- [ ] **Step 2: Verify all seeper-card elements have hover transitions**

Search for `seeper-card` in `globals.css` and ensure it includes:
```css
.seeper-card {
  /* ... existing styles ... */
  transition: transform 0.15s ease;
}
.seeper-card:hover {
  transform: translateY(-2px);
}
```

- [ ] **Step 3: Add logo to Sidebar**

In `components/layout/Sidebar.tsx`, replace the text "seeper" at the top with a logo mark:

```typescript
import Image from 'next/image'

// At the top of the sidebar (in the logo area):
<div className="flex items-center gap-2 px-3 py-4 border-b border-seeper-border/40">
  {/* Try to load the logo; fall back to SVG mark */}
  <div className="w-7 h-7 flex-shrink-0 relative">
    {/* SVG fallback — seeper lens mark */}
    <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
      <circle cx="14" cy="14" r="12.5" stroke="#ED693A" strokeWidth="1.5" />
      <path
        d="M14 4 Q22 14 14 24 Q6 14 14 4Z"
        fill="white"
        fillOpacity="0.9"
      />
      <circle cx="14" cy="14" r="3" fill="#0d0d0d" />
    </svg>
  </div>
  {!collapsed && (
    <div className="flex flex-col leading-none">
      <span className="font-display font-light text-base tracking-tight text-[var(--color-text)]">seeper</span>
      <span className="text-[9px] font-bold tracking-[0.8px] text-quantum">wiki</span>
    </div>
  )}
</div>
```

- [ ] **Step 4: Build**

```bash
npm run build
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add logo to sidebar and finalize all animations"
```

---

## Task 7: Final audit

- [ ] **Step 1: Run all tests**

```bash
npm run test:run
```

Expected: All tests pass. Fix any failures before proceeding.

- [ ] **Step 2: Full build**

```bash
npm run build
```

Expected: Clean build, no TypeScript errors, all routes present.

- [ ] **Step 3: Route audit — verify these are all in build output**

```
/                    → redirect to /dashboard
/auth                → magic link login
/auth/callback       → token exchange
/dashboard           → digest + quick links + activity
/news                → seeNews full page
/wiki                → seeWiki home
/wiki/[slug]         → wiki page view
/wiki/new            → wiki editor (new)
/wiki/edit/[slug]    → wiki editor (edit)
/prompts             → seePrompts
/tools               → seeTools
/resources           → seeResources
/inside              → seeInside (onboarding)
/team                → seeUs (placeholder OK for Phase 2)
/labs                → seeLabs (placeholder OK for Phase 2)
/profile             → profile editor
/admin               → admin panel (admin only)
/api/digest          → GET
/api/tag             → POST
/api/contribute      → POST
/api/summarise       → POST (stub)
```

- [ ] **Step 4: Console error check**

Open the dev server and navigate through each page. No red console errors should appear (warnings about deprecated packages are OK).

```bash
npm run dev
```

Visit: dashboard, news, wiki, prompts, tools, resources, inside, profile, admin.

- [ ] **Step 5: Fix any issues found in audit**

Address TypeScript errors, broken imports, missing default exports. Do not mark this step complete until all errors are resolved.

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "feat: Phase 2 complete — all content pages, admin, digest, notifications, and polish"
```

- [ ] **Step 7: Push to GitHub**

```bash
git push origin main
```

---

## Phase 2 Complete — Summary

After completing Plans A, B, and C, the seeper wiki Phase 2 delivers:

**Design System:**
- Dark/light mode with localStorage persistence
- Section-coloured navigation (each section has its own accent colour)
- Logo mark in sidebar
- Page transitions, card hover animations, button interactions
- Toast notifications, skeleton loaders

**Auth & Profile:**
- Silent rate-limit handling on magic link
- Full profile editor (overview, edit, notifications tabs)
- Initials avatars everywhere with customisable colour

**Global Components:**
- FAB + ContributeDrawer (anonymous contributions, all sections)
- Cmd+K search modal with live filtering
- App-wide NewsTicker
- Notification bell with panel

**Content Pages:**
- seeNews — 8 mock stories, filtering, featured card, anonymous upvoting
- seeWiki — list + page view + full TipTap editor
- seePrompts — prompt library, copy button, upvoting
- seeTools — tool directory with endorsements
- seeResources — resource list with filtering
- seeInside — onboarding checklist with localStorage persistence

**AI Features:**
- Structured digest (4 stories with arrow navigation)
- /api/tag — auto-tagging via Claude
- /api/contribute — submission pipeline
- semanticSearch stub for Phase 3

**Admin:**
- Full admin panel (overview, users, content, settings)
- Pending contribution review workflow

**TODOs for Phase 3:**
- seeUs (team directory) — fully build
- seeLabs — fully build
- Real RSS feed ingestion → news_cache
- Supabase real-time notifications
- Semantic search via Claude embeddings
- Newsletter publishing workflow
- File upload to Supabase Storage
- Analytics / view count tracking

**Commands:**

Run migrations:
```bash
# In Supabase SQL Editor:
# 1. Run supabase/migrations/001_initial.sql (if not done)
# 2. Run supabase/migrations/002_phase2.sql
```

Start dev server:
```bash
cd "/Users/caitmc/Documents/Experiments/Vibe coding/seeperwiki v1"
npm run dev
```

Run tests:
```bash
npm run test:run
```

Environment variables (all required — set in Vercel and .env.local):
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ANTHROPIC_API_KEY
NEXT_PUBLIC_APP_URL
```
