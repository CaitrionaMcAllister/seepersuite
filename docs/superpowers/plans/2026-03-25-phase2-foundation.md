# seeper wiki Phase 2 — Plan A: Foundation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the design system updates, dark/light mode, navigation restructure, auth polish, profile page, contribute drawer, search modal, toast system, skeleton loader, and new DB schema needed before any content pages can be built.

**Architecture:** All UI primitives live in `components/ui/`, providers in `components/providers/`. The ThemeProvider wraps the app at `app/layout.tsx`. Section colours are encoded in `tailwind.config.ts` and `globals.css` as CSS custom properties. New DB tables are added via `supabase/migrations/002_phase2.sql`.

**Tech Stack:** Next.js 14 App Router, TypeScript strict, Tailwind CSS, Supabase, `@tiptap/*`, Lucide React, Vitest

---

## File Map

**Modify:**
- `tailwind.config.ts` — add section colours, light mode palette
- `app/globals.css` — light mode CSS variables, new animations, shimmer
- `app/layout.tsx` — wrap with ThemeProvider
- `lib/constants.ts` — update nav (remove newsletter, add inside/seeInside)
- `lib/utils.ts` — add `relativeTime()` helper
- `types/index.ts` — add Phase 2 types (Tool, Resource, Contribution, Notification, etc.)
- `components/layout/Sidebar.tsx` — section colours, new nav structure
- `components/layout/Header.tsx` — theme toggle button, Cmd+K search trigger, notification bell
- `components/layout/AppShell.tsx` — include FAB + global NewsTicker
- `app/auth/page.tsx` — rate-limit silent catch, improved copy
- `lib/claude.ts` — add `semanticSearch` stub

**Create:**
- `components/providers/ThemeProvider.tsx`
- `components/ui/Skeleton.tsx`
- `components/ui/ToastProvider.tsx`
- `hooks/useToast.ts`
- `components/ui/FAB.tsx`
- `components/ui/ContributeDrawer.tsx`
- `components/ui/SearchModal.tsx`
- `components/ui/NewsTicker.tsx` (app-wide version — replaces dashboard-only one)
- `app/profile/page.tsx`
- `app/inside/page.tsx` (route shell — full build in Plan B)
- `app/api/contribute/route.ts`
- `supabase/migrations/002_phase2.sql`
- `__tests__/components/ui/Skeleton.test.tsx`
- `__tests__/hooks/useToast.test.ts`

---

## Task 1: ThemeProvider + dark/light mode

**Files:**
- Create: `components/providers/ThemeProvider.tsx`
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`
- Modify: `tailwind.config.ts`

- [ ] **Step 1: Add light mode CSS variables to globals.css**

In `app/globals.css`, inside `:root` (below the existing dark-mode tokens), add:

```css
/* Dark mode (default) — already exists */
:root {
  --color-bg: #0d0d0d;
  --color-surface: #1a1a1a;
  --color-raised: #242424;
  --color-border: #333333;
  --color-text: #f0f0f0;
  --color-subtext: #aaaaaa;
  --color-muted: #555555;

  /* Section colours */
  --color-news: #ED693A;
  --color-wiki: #B0A9CF;
  --color-tools: #DCFEAD;
  --color-resources: #8ACB8F;
  --color-prompts: #EDDE5C;
  --color-inside: #D4537E;
  --color-us: #1D9E75;
  --color-labs: #7F77DD;
  --color-dashboard: #ED693A;
}

/* Light mode — applied when <html class="light"> */
html.light {
  --color-bg: #f5f5f3;
  --color-surface: #ffffff;
  --color-raised: #f0ede8;
  --color-border: #dddddd;
  --color-text: #111111;
  --color-subtext: #555555;
  --color-muted: #999999;
}

/* Smooth transition for theme switch */
*, *::before, *::after {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}
```

Also add animations:
```css
/* Page transition */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
.page-enter {
  animation: fadeInUp 0.25s ease;
}

/* Skeleton shimmer */
@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
.skeleton-shimmer {
  background: linear-gradient(90deg,
    var(--color-surface) 25%,
    var(--color-raised)  50%,
    var(--color-surface) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

/* Upvote pop */
@keyframes upvotePop {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.25); }
  100% { transform: scale(1); }
}
.upvote-pop { animation: upvotePop 0.3s ease; }
```

- [ ] **Step 2: Update Tailwind to reference CSS variables**

In `tailwind.config.ts`, extend the theme to reference CSS custom properties for the tokens that need to switch in light mode:

```typescript
// In theme.extend.colors, add/replace:
bg: 'var(--color-bg)',
surface: 'var(--color-surface)',
raised: 'var(--color-raised)',
border: 'var(--color-border)',  // Note: Tailwind uses 'border-color' key
text: 'var(--color-text)',
subtext: 'var(--color-subtext)',
muted: 'var(--color-muted)',

// Section colours (these don't change in light mode)
'section-news':       'var(--color-news)',
'section-wiki':       'var(--color-wiki)',
'section-tools':      'var(--color-tools)',
'section-resources':  'var(--color-resources)',
'section-prompts':    'var(--color-prompts)',
'section-inside':     'var(--color-inside)',
'section-us':         'var(--color-us)',
'section-labs':       'var(--color-labs)',
'section-dashboard':  'var(--color-dashboard)',
```

- [ ] **Step 3: Create ThemeProvider**

```typescript
// components/providers/ThemeProvider.tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light'

interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  toggleTheme: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    const stored = localStorage.getItem('seeper-theme') as Theme | null
    const initial = stored ?? 'dark'
    setTheme(initial)
    document.documentElement.classList.toggle('light', initial === 'light')
  }, [])

  function toggleTheme() {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark'
      localStorage.setItem('seeper-theme', next)
      document.documentElement.classList.toggle('light', next === 'light')
      return next
    })
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
```

- [ ] **Step 4: Wrap app/layout.tsx with ThemeProvider**

In `app/layout.tsx`, import `ThemeProvider` and wrap the body children:

```typescript
import { ThemeProvider } from '@/components/providers/ThemeProvider'

// Inside the return:
<body className={`${dmSans.variable} ${inter.variable} font-body bg-[var(--color-bg)] text-[var(--color-text)]`}>
  <ThemeProvider>
    {children}
  </ThemeProvider>
</body>
```

- [ ] **Step 5: Add theme toggle button to Header.tsx**

In `components/layout/Header.tsx`, import `useTheme` and add the toggle button in the right side of the header:

```typescript
import { useTheme } from '@/components/providers/ThemeProvider'

// Inside the component:
const { theme, toggleTheme } = useTheme()

// In JSX, before the avatar:
<button
  onClick={toggleTheme}
  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border border-seeper-border/40 hover:border-plasma/60 transition-all duration-300"
>
  {theme === 'dark' ? '☀ Light' : '☾ Dark'}
</button>
```

- [ ] **Step 6: Run tests to verify no regressions**

```bash
cd "/Users/caitmc/Documents/Experiments/Vibe coding/seeperwiki v1"
npm run test:run
```

Expected: All existing tests pass (22 tests).

- [ ] **Step 7: Build to verify TypeScript**

```bash
npm run build
```

Expected: Compiles successfully, 22 pages.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add ThemeProvider with dark/light mode toggle"
```

---

## Task 2: Section colours and updated navigation

**Files:**
- Modify: `lib/constants.ts`
- Modify: `components/layout/Sidebar.tsx`

- [ ] **Step 1: Update NAV_SECTIONS in constants.ts**

Replace the existing `NAV_SECTIONS` with the new structure (remove newsletter, add inside):

```typescript
export const NAV_SECTIONS: NavSection[] = [
  {
    label: 'DISCOVER',
    items: [
      { label: 'Dashboard',   href: '/dashboard', icon: 'Home',    color: '#ED693A' },
      { label: 'seeNews',     href: '/news',       icon: 'Radio',   color: '#ED693A' },
      { label: 'seeWiki',     href: '/wiki',       icon: 'BookOpen',color: '#B0A9CF' },
    ],
  },
  {
    label: 'STUDIO',
    items: [
      { label: 'seeTools',     href: '/tools',     icon: 'Settings2',  color: '#DCFEAD' },
      { label: 'seeResources', href: '/resources', icon: 'LayoutGrid', color: '#8ACB8F' },
      { label: 'seePrompts',   href: '/prompts',   icon: 'Sparkles',   color: '#EDDE5C' },
    ],
  },
  {
    label: 'TEAM',
    items: [
      { label: 'seeInside',   href: '/inside',    icon: 'Star',       color: '#D4537E' },
      { label: 'seeUs',       href: '/team',      icon: 'Users',      color: '#1D9E75' },
      { label: 'seeLabs',     href: '/labs',      icon: 'FlaskConical',color: '#7F77DD' },
    ],
  },
  {
    label: '',
    divider: true,
    items: [
      { label: 'Admin', href: '/admin', icon: 'Shield', color: '#ED693A', adminOnly: true },
    ],
  },
]
```

Update `NavItem` type in `types/index.ts` to include `color: string`. Also update `NavSection` type:
- Rename `title` to `label`
- Add `divider?: boolean`

```typescript
// In types/index.ts, update NavSection:
export interface NavSection {
  label: string
  divider?: boolean
  items: NavItem[]
}

// Update NavItem to add color and rename label from name/title if needed:
export interface NavItem {
  label: string
  href: string
  icon: string
  color: string
  adminOnly?: boolean
}
```

Also update `__tests__/lib/constants.test.ts` — the `NAV_SECTIONS` array now has 4 entries (DISCOVER, STUDIO, TEAM, divider+Admin). Update the length assertion:

```typescript
// Replace:
expect(NAV_SECTIONS).toHaveLength(3)
// With:
expect(NAV_SECTIONS).toHaveLength(4)
```

- [ ] **Step 2: Update Sidebar.tsx to use section colours**

In `components/layout/Sidebar.tsx`, update the active nav item styling to use the item's `color` property:

```typescript
// For each nav item, instead of hardcoded plasma color:
const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

const itemStyle = isActive ? {
  borderLeftColor: item.color,
  backgroundColor: `${item.color}14`, // ~8% opacity hex
} : {}

const iconStyle = isActive ? { backgroundColor: item.color } : {}
const textStyle = isActive ? { color: item.color } : {}
```

In the JSX:
```typescript
<Link
  href={item.href}
  style={itemStyle}
  className={cn(
    'flex items-center gap-3 px-3 py-2 rounded-lg border-l-2 border-transparent',
    'transition-all duration-150 ease',
    isActive ? 'border-l-2' : 'hover:bg-white/5'
  )}
>
  <span
    style={iconStyle}
    className={cn(
      'w-7 h-7 flex items-center justify-center rounded-md transition-all duration-150',
      !isActive && 'bg-white/5'
    )}
  >
    <NavIcon name={item.icon} size={14} />
  </span>
  {!collapsed && (
    <span style={textStyle} className="text-sm transition-all duration-150">
      {item.label}
    </span>
  )}
</Link>
```

Also update the section header rendering in `Sidebar.tsx` to use `section.label` instead of `section.title` (the field was renamed):

```typescript
// Replace all occurrences of:
section.title
// With:
section.label
```

- [ ] **Step 3: Add `relativeTime` utility to lib/utils.ts**

This helper is used by `NotificationPanel` (Plan C) and should live in utils:

```typescript
// Add to lib/utils.ts:
export function relativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (minutes < 1)  return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24)   return `${hours}h ago`
  return `${days}d ago`
}
```

Add a test in `__tests__/lib/utils.test.ts`:
```typescript
describe('relativeTime', () => {
  it('returns "just now" for < 1 minute', () => {
    const recent = new Date(Date.now() - 30000).toISOString()
    expect(relativeTime(recent)).toBe('just now')
  })
  it('returns minutes ago', () => {
    const fiveMin = new Date(Date.now() - 5 * 60000).toISOString()
    expect(relativeTime(fiveMin)).toBe('5m ago')
  })
})
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: update nav structure with section colours, remove newsletter"
```

---

## Task 3: Phase 2 types

**Files:**
- Modify: `types/index.ts`

- [ ] **Step 1: Add Phase 2 types to types/index.ts**

Add these interfaces (do not remove existing ones):

```typescript
// Tool directory
export interface Tool {
  id: string
  name: string
  category: string
  description: string | null
  url: string | null
  version: string | null
  licence_info: string | null
  upvotes: number
  copy_count: number
  added_by: string | null
  created_at: string
  updated_at: string
}

// Resource
export interface Resource {
  id: string
  title: string
  type: 'PDF' | 'DOC' | 'Link' | 'Video' | 'Image'
  category: string
  description: string | null
  url: string | null
  file_path: string | null
  upvotes: number
  added_by: string | null
  created_at: string
}

// Notification
export interface Notification {
  id: string
  user_id: string
  type: 'wiki_updated' | 'prompt_upvoted' | 'contribution_approved' | 'new_member' | 'digest_ready'
  title: string
  body: string | null
  read: boolean
  resource_type: string | null
  resource_id: string | null
  created_at: string
}

// Contribution (from Contribute Drawer)
export interface Contribution {
  id: string
  submitter_name: string
  title: string
  category: string
  description: string
  tags: string[] | null
  url: string | null
  file_path: string | null
  status: 'pending' | 'approved' | 'rejected'
  reviewed_by: string | null
  reviewed_at: string | null
  submitted_at: string
}

// Anonymous vote
export interface AnonymousVote {
  id: string
  resource_type: 'news' | 'prompt' | 'tool' | 'resource' | 'wiki'
  resource_id: string
  browser_id: string | null
  created_at: string
}

// Search result shape
export interface SearchableItem {
  id: string
  title: string
  description?: string
  tags?: string[]
  section: string
  sectionColor: string
  href: string
  category?: string
  author?: string
  excerpt?: string
}

// News item (mock/real)
export interface NewsItem {
  id: string
  title: string
  summary: string
  category: string
  source: string
  sourceUrl: string
  imageUrl: string | null
  publishedAt: string
  tags: string[]
  upvotes: number
  featured?: boolean
}

// Digest story (structured, from Phase 2 Claude prompt)
export interface DigestStory {
  title: string
  summary: string
  sources: string[]
  category: string
  imageUrl?: string | null
}

// Update Profile type to include new fields
// Add these optional fields to the existing Profile interface:
// bio?: string
// skills?: string[]
// location?: string
// linkedin_url?: string
// avatar_color?: string
// notifications_prefs?: Record<string, boolean>
```

- [ ] **Step 2: Run tests**

```bash
npm run test:run
```

Expected: All pass.

- [ ] **Step 3: Commit**

```bash
git add types/index.ts
git commit -m "feat: add Phase 2 TypeScript types"
```

---

## Task 4: Database migration

**Files:**
- Create: `supabase/migrations/002_phase2.sql`

- [ ] **Step 1: Write the migration**

```sql
-- seeper wiki — Phase 2 schema additions
-- Run via Supabase dashboard SQL editor AFTER 001_initial.sql

-- ============================================================
-- TABLE: tools
-- ============================================================
CREATE TABLE IF NOT EXISTS tools (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name         TEXT NOT NULL,
  category     TEXT NOT NULL,
  description  TEXT,
  url          TEXT,
  version      TEXT,
  licence_info TEXT,
  upvotes      INTEGER NOT NULL DEFAULT 0,
  copy_count   INTEGER NOT NULL DEFAULT 0,
  added_by     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER tools_updated_at
  BEFORE UPDATE ON tools
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

-- ============================================================
-- TABLE: resources
-- ============================================================
CREATE TABLE IF NOT EXISTS resources (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title       TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('PDF', 'DOC', 'Link', 'Video', 'Image')),
  category    TEXT NOT NULL,
  description TEXT,
  url         TEXT,
  file_path   TEXT,
  upvotes     INTEGER NOT NULL DEFAULT 0,
  added_by    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: anonymous_votes
-- ============================================================
CREATE TABLE IF NOT EXISTS anonymous_votes (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('news','prompt','tool','resource','wiki')),
  resource_id   TEXT NOT NULL,
  browser_id    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(resource_type, resource_id, browser_id)
);

-- ============================================================
-- TABLE: notifications
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type          TEXT NOT NULL,
  title         TEXT NOT NULL,
  body          TEXT,
  read          BOOLEAN NOT NULL DEFAULT false,
  resource_type TEXT,
  resource_id   UUID,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX notifications_user_id_idx ON notifications(user_id);
CREATE INDEX notifications_read_idx ON notifications(read);

-- ============================================================
-- TABLE: tool_endorsements
-- ============================================================
CREATE TABLE IF NOT EXISTS tool_endorsements (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tool_id    UUID REFERENCES tools(id) ON DELETE CASCADE,
  user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tool_id, user_id)
);

-- ============================================================
-- TABLE: contributions
-- ============================================================
CREATE TABLE IF NOT EXISTS contributions (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  submitter_name TEXT NOT NULL,
  title          TEXT NOT NULL,
  category       TEXT NOT NULL,
  description    TEXT NOT NULL,
  tags           TEXT[],
  url            TEXT,
  file_path      TEXT,
  status         TEXT NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','approved','rejected')),
  reviewed_by    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at    TIMESTAMPTZ,
  submitted_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ALTER existing tables
-- ============================================================
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS bio                TEXT,
  ADD COLUMN IF NOT EXISTS skills             TEXT[],
  ADD COLUMN IF NOT EXISTS location           TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_url       TEXT,
  ADD COLUMN IF NOT EXISTS avatar_color       TEXT DEFAULT '#ED693A',
  ADD COLUMN IF NOT EXISTS notifications_prefs JSONB DEFAULT '{}';

ALTER TABLE prompts
  ADD COLUMN IF NOT EXISTS copy_count INTEGER NOT NULL DEFAULT 0;

ALTER TABLE wiki_pages
  ADD COLUMN IF NOT EXISTS views INTEGER NOT NULL DEFAULT 0;

-- Update activity_log action enum to include Phase 2 actions
-- (Postgres CHECK constraints must be dropped and re-added)
ALTER TABLE activity_log
  DROP CONSTRAINT IF EXISTS activity_log_action_check;
ALTER TABLE activity_log
  ADD CONSTRAINT activity_log_action_check
  CHECK (action IN (
    'created_wiki','edited_wiki','added_prompt','published_newsletter',
    'contributed','upvoted','signed_in'
  ));

-- ============================================================
-- ROW LEVEL SECURITY for new tables
-- ============================================================
ALTER TABLE tools              ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources          ENABLE ROW LEVEL SECURITY;
ALTER TABLE anonymous_votes    ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications      ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_endorsements  ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions      ENABLE ROW LEVEL SECURITY;

-- tools: authenticated read, authenticated insert, owner/admin update
CREATE POLICY "tools: authenticated read"
  ON tools FOR SELECT TO authenticated USING (true);
CREATE POLICY "tools: authenticated insert"
  ON tools FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "tools: owner or admin update"
  ON tools FOR UPDATE TO authenticated
  USING (auth.uid() = added_by OR is_admin());

-- resources: same pattern
CREATE POLICY "resources: authenticated read"
  ON resources FOR SELECT TO authenticated USING (true);
CREATE POLICY "resources: authenticated insert"
  ON resources FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "resources: owner or admin update"
  ON resources FOR UPDATE TO authenticated
  USING (auth.uid() = added_by OR is_admin());

-- anonymous_votes: public read, public insert (no auth required)
CREATE POLICY "anonymous_votes: public read"
  ON anonymous_votes FOR SELECT USING (true);
CREATE POLICY "anonymous_votes: public insert"
  ON anonymous_votes FOR INSERT WITH CHECK (true);

-- notifications: user reads own
CREATE POLICY "notifications: user reads own"
  ON notifications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "notifications: user updates own"
  ON notifications FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- tool_endorsements: authenticated read/insert
CREATE POLICY "tool_endorsements: authenticated read"
  ON tool_endorsements FOR SELECT TO authenticated USING (true);
CREATE POLICY "tool_endorsements: authenticated insert"
  ON tool_endorsements FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "tool_endorsements: user delete own"
  ON tool_endorsements FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- contributions: authenticated read, public insert (no auth needed to submit)
CREATE POLICY "contributions: authenticated read"
  ON contributions FOR SELECT TO authenticated USING (true);
CREATE POLICY "contributions: public insert"
  ON contributions FOR INSERT WITH CHECK (true);
CREATE POLICY "contributions: admin update"
  ON contributions FOR UPDATE TO authenticated USING (is_admin());
```

- [ ] **Step 2: Run migration in Supabase dashboard**

Go to Supabase → SQL Editor → paste the contents of `002_phase2.sql` → Run.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/002_phase2.sql
git commit -m "feat: add Phase 2 database schema (tools, resources, notifications, contributions)"
```

---

## Task 5: Skeleton + Toast system

**Files:**
- Create: `components/ui/Skeleton.tsx`
- Create: `components/ui/ToastProvider.tsx`
- Create: `hooks/useToast.ts`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Create Skeleton component**

```typescript
// components/ui/Skeleton.tsx
import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  width?: string
  height?: string
}

export function Skeleton({ className, width, height }: SkeletonProps) {
  return (
    <div
      className={cn('skeleton-shimmer rounded-lg', className)}
      style={{ width, height }}
      aria-hidden="true"
    />
  )
}

// Pre-built skeleton shapes for common UI patterns
export function SkeletonCard() {
  return (
    <div className="p-4 rounded-2xl border border-seeper-border/40 space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-2/3" />
      <div className="flex gap-2 pt-1">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-12 rounded-full" />
      </div>
    </div>
  )
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 py-3">
      <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Write Skeleton test**

```typescript
// __tests__/components/ui/Skeleton.test.tsx
import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Skeleton, SkeletonCard, SkeletonRow } from '@/components/ui/Skeleton'

describe('Skeleton', () => {
  it('renders with aria-hidden', () => {
    const { container } = render(<Skeleton />)
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true')
  })
  it('applies custom className', () => {
    const { container } = render(<Skeleton className="h-4 w-full" />)
    expect(container.firstChild).toHaveClass('h-4', 'w-full')
  })
  it('SkeletonCard renders', () => {
    const { container } = render(<SkeletonCard />)
    expect(container.firstChild).toBeTruthy()
  })
  it('SkeletonRow renders', () => {
    const { container } = render(<SkeletonRow />)
    expect(container.firstChild).toBeTruthy()
  })
})
```

- [ ] **Step 3: Run Skeleton test — expect pass**

```bash
npm run test:run -- __tests__/components/ui/Skeleton.test.tsx
```

Expected: 4 tests pass.

- [ ] **Step 4: Create ToastProvider and useToast**

```typescript
// hooks/useToast.ts
'use client'

import { createContext, useContext, useState, useCallback } from 'react'

export type ToastVariant = 'success' | 'error' | 'info'

export interface Toast {
  id: string
  message: string
  variant: ToastVariant
}

interface ToastContextValue {
  toasts: Toast[]
  addToast: (message: string, variant?: ToastVariant) => void
  removeToast: (id: string) => void
}

export const ToastContext = createContext<ToastContextValue>({
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
})

export function useToast() {
  const ctx = useContext(ToastContext)
  return {
    toast: (message: string, variant: ToastVariant = 'success') =>
      ctx.addToast(message, variant),
    toasts: ctx.toasts,
    removeToast: ctx.removeToast,
  }
}
```

```typescript
// components/ui/ToastProvider.tsx
'use client'

import { useState, useCallback, useEffect } from 'react'
import { ToastContext, Toast, ToastVariant } from '@/hooks/useToast'
import { cn } from '@/lib/utils'

const VARIANT_STYLES: Record<ToastVariant, { border: string; icon: string }> = {
  success: { border: 'border-l-green-500',  icon: '✓' },
  error:   { border: 'border-l-red-500',    icon: '✕' },
  info:    { border: 'border-l-quantum',     icon: 'ℹ' },
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onRemove, 3000)
    return () => clearTimeout(timer)
  }, [onRemove])

  const { border, icon } = VARIANT_STYLES[toast.variant]

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 pr-4 rounded-xl border border-seeper-border/40 border-l-[3px]',
        'bg-[var(--color-surface)] shadow-card text-sm',
        'animate-[slideInFromBottom_0.3s_ease]',
        border
      )}
    >
      <span className="text-base leading-none mt-0.5">{icon}</span>
      <span className="flex-1 text-[var(--color-text)]">{toast.message}</span>
      <button
        onClick={onRemove}
        className="text-[var(--color-muted)] hover:text-[var(--color-text)] text-xs"
      >
        ✕
      </button>
    </div>
  )
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, variant: ToastVariant = 'success') => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { id, message, variant }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 w-[320px]">
        {toasts.map(toast => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onRemove={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  )
}
```

Add `@keyframes slideInFromBottom` to `globals.css`:
```css
@keyframes slideInFromBottom {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

- [ ] **Step 5: Write useToast test**

```typescript
// __tests__/hooks/useToast.test.ts
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ToastContext } from '@/hooks/useToast'
import { useToast } from '@/hooks/useToast'
import React from 'react'

describe('useToast', () => {
  it('returns toast function', () => {
    const { result } = renderHook(() => useToast(), {
      wrapper: ({ children }) =>
        React.createElement(ToastContext.Provider, {
          value: { toasts: [], addToast: () => {}, removeToast: () => {} },
          children,
        }),
    })
    expect(typeof result.current.toast).toBe('function')
  })
})
```

- [ ] **Step 6: Wrap app/layout.tsx with ToastProvider**

```typescript
import { ToastProvider } from '@/components/ui/ToastProvider'

// Wrap inside ThemeProvider:
<ThemeProvider>
  <ToastProvider>
    {children}
  </ToastProvider>
</ThemeProvider>
```

- [ ] **Step 7: Run tests**

```bash
npm run test:run
```

Expected: All pass.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add Skeleton and Toast system"
```

---

## Task 6: App-wide NewsTicker

**Files:**
- Create: `components/ui/NewsTicker.tsx`
- Modify: `components/layout/AppShell.tsx`

The existing `components/dashboard/NewsTicker.tsx` is dashboard-only. Create a new app-wide version at `components/ui/NewsTicker.tsx`.

- [ ] **Step 1: Create app-wide NewsTicker**

```typescript
// components/ui/NewsTicker.tsx
'use client'

import { MOCK_TICKER_HEADLINES } from '@/lib/constants'

interface NewsTickerProps {
  items?: string[]
}

export function NewsTicker({ items = MOCK_TICKER_HEADLINES }: NewsTickerProps) {
  // Duplicate items to create seamless loop
  const doubled = [...items, ...items]

  return (
    <div
      className="h-[34px] flex items-center overflow-hidden border-t border-seeper-border/40 bg-seeper-black"
      aria-hidden="true"
    >
      <div className="ticker-inner flex items-center gap-0 whitespace-nowrap animate-[ticker_40s_linear_infinite] hover:[animation-play-state:paused]">
        {doubled.map((item, i) => (
          <span key={i} className="flex items-center gap-4">
            <span className="text-xs text-seeper-steel px-4">{item}</span>
            <span className="text-plasma text-[8px]">●</span>
          </span>
        ))}
      </div>
    </div>
  )
}
```

Make sure `globals.css` has the ticker keyframe (it should from Phase 1 but verify):
```css
@keyframes ticker {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
```

- [ ] **Step 2: Add NewsTicker to AppShell**

In `components/layout/AppShell.tsx`, import and render `NewsTicker` at the bottom of the main content area:

```typescript
import { NewsTicker } from '@/components/ui/NewsTicker'

// In the main layout, after the scrollable content area:
<div className="flex flex-col h-screen">
  {/* Header */}
  <Header profile={profile} />
  {/* Main scrollable content */}
  <main className="flex-1 overflow-y-auto p-6">
    {children}
  </main>
  {/* Sticky ticker at bottom */}
  <NewsTicker />
</div>
```

- [ ] **Step 3: Build and verify**

```bash
npm run build
```

Expected: Clean build.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add app-wide NewsTicker to AppShell"
```

---

## Task 7: FAB + ContributeDrawer

**Files:**
- Create: `components/ui/FAB.tsx`
- Create: `components/ui/ContributeDrawer.tsx`
- Modify: `components/layout/AppShell.tsx`

- [ ] **Step 1: Create FAB component**

```typescript
// components/ui/FAB.tsx
'use client'

import { useState } from 'react'
import { ContributeDrawer } from './ContributeDrawer'

export function FAB() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="absolute bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-plasma text-white flex items-center justify-center text-2xl font-light shadow-[0_4px_16px_rgba(237,105,58,0.35)] hover:scale-[1.08] hover:shadow-[0_6px_20px_rgba(237,105,58,0.5)] transition-all duration-150 active:scale-[0.97]"
        aria-label="Contribute to seeper wiki"
      >
        +
      </button>
      <ContributeDrawer open={open} onClose={() => setOpen(false)} />
    </>
  )
}
```

- [ ] **Step 2: Create ContributeDrawer**

```typescript
// components/ui/ContributeDrawer.tsx
'use client'

import { useState, useRef } from 'react'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/lib/utils'

const CATEGORIES = [
  { id: 'seeNews',      label: 'seeNews',      color: '#ED693A' },
  { id: 'seeWiki',      label: 'seeWiki',      color: '#B0A9CF' },
  { id: 'seeTools',     label: 'seeTools',     color: '#DCFEAD' },
  { id: 'seeResources', label: 'seeResources', color: '#8ACB8F' },
  { id: 'seePrompts',   label: 'seePrompts',   color: '#EDDE5C' },
  { id: 'seeInside',    label: 'seeInside',    color: '#D4537E' },
]

const PRESET_TAGS = [
  '#ai','#creative','#production','#tech','#business',
  '#tools','#ue5','#projection','#audio','#xr','#3d',
  '#research','#workflow','#client','#concept',
]

interface ContributeDrawerProps {
  open: boolean
  onClose: () => void
  authorName?: string
}

export function ContributeDrawer({ open, onClose, authorName = '' }: ContributeDrawerProps) {
  const { toast } = useToast()
  const [name, setName] = useState(authorName)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [customTag, setCustomTag] = useState('')
  const [description, setDescription] = useState('')
  const [url, setUrl] = useState('')
  const [fileName, setFileName] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const fileRef = useRef<HTMLInputElement>(null)

  if (!open) return null

  const validate = () => {
    const e: Record<string, string> = {}
    if (!name.trim())              e.name = 'Name is required'
    if (title.trim().length < 5)   e.title = 'Title must be at least 5 characters'
    if (!category)                 e.category = 'Please select a category'
    if (description.trim().length < 20) e.description = 'Description must be at least 20 characters'
    if (url && !/^https?:\/\//.test(url)) e.url = 'URL must start with https://'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const handleCustomTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && customTag.trim()) {
      e.preventDefault()
      const tag = customTag.trim().startsWith('#')
        ? customTag.trim()
        : `#${customTag.trim()}`
      if (!selectedTags.includes(tag)) {
        setSelectedTags(prev => [...prev, tag])
      }
      setCustomTag('')
    }
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      const res = await fetch('/api/contribute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submitter_name: name,
          title,
          category,
          tags: selectedTags,
          description,
          url: url || null,
        }),
      })
      if (!res.ok) throw new Error('Failed')
      toast('Contribution submitted! The team will see it shortly.', 'success')
      onClose()
    } catch {
      toast('Something went wrong. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const isValid = name.trim() && title.trim().length >= 5 && category && description.trim().length >= 20

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[998] bg-black/50"
        onClick={onClose}
      />
      {/* Drawer */}
      <div className="fixed bottom-0 right-0 z-[999] w-[400px] max-h-[85vh] flex flex-col rounded-tl-2xl bg-[var(--color-surface)] border border-seeper-border/40 shadow-2xl animate-[slideInFromBottom_0.3s_ease]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-seeper-border/40">
          <span className="text-sm font-bold tracking-tight">contribute to seeper wiki</span>
          <button onClick={onClose} className="text-seeper-steel hover:text-[var(--color-text)] transition-colors">✕</button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Name */}
          <div>
            <label className="text-xs text-[var(--color-subtext)] mb-1 flex items-center gap-2">
              Your name <span className="px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px]">required</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onBlur={() => !name.trim() && setErrors(p => ({ ...p, name: 'Name is required' }))}
              placeholder="e.g. Caitriona McAllister"
              className={cn(
                'w-full bg-[var(--color-raised)] border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-plasma/60',
                errors.name ? 'border-red-500' : 'border-seeper-border/40'
              )}
            />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Title */}
          <div>
            <label className="text-xs text-[var(--color-subtext)] mb-1 flex items-center gap-2">
              Title <span className="px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px]">required</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Give your contribution a clear, descriptive title"
              className={cn(
                'w-full bg-[var(--color-raised)] border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-plasma/60',
                errors.title ? 'border-red-500' : 'border-seeper-border/40'
              )}
            />
            {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Category grid */}
          <div>
            <label className="text-xs text-[var(--color-subtext)] mb-2 flex items-center gap-2">
              Category <span className="px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px]">required</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  style={category === cat.id ? {
                    borderColor: cat.color,
                    backgroundColor: `${cat.color}14`,
                    color: cat.color,
                  } : {}}
                  className={cn(
                    'py-2 px-2 rounded-lg border text-xs font-medium transition-all duration-150',
                    category === cat.id
                      ? 'border-2'
                      : 'border-seeper-border/40 text-[var(--color-subtext)] hover:border-seeper-border'
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            {errors.category && <p className="text-red-400 text-xs mt-1">{errors.category}</p>}
          </div>

          {/* Tags */}
          <div>
            <label className="text-xs text-[var(--color-subtext)] mb-2 flex items-center gap-2">
              Tags <span className="px-1.5 py-0.5 rounded-full bg-[var(--color-raised)] text-[var(--color-muted)] text-[10px]">optional</span>
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {PRESET_TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={cn(
                    'px-2 py-0.5 rounded-full text-xs border transition-all duration-150',
                    selectedTags.includes(tag)
                      ? 'border-plasma bg-plasma/10 text-plasma'
                      : 'border-seeper-border/40 text-[var(--color-muted)] hover:border-seeper-border'
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={customTag}
              onChange={e => setCustomTag(e.target.value)}
              onKeyDown={handleCustomTag}
              placeholder="Add custom tag..."
              className="w-full bg-[var(--color-raised)] border border-seeper-border/40 rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-plasma/60"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs text-[var(--color-subtext)] mb-1 flex items-center gap-2">
              Description <span className="px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px]">required</span>
            </label>
            <div className="relative">
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value.slice(0, 500))}
                placeholder="Describe what you're contributing and why it's useful to the team..."
                rows={4}
                className={cn(
                  'w-full bg-[var(--color-raised)] border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-plasma/60 resize-none',
                  errors.description ? 'border-red-500' : 'border-seeper-border/40'
                )}
              />
              <span className="absolute bottom-2 right-2 text-[10px] text-[var(--color-muted)]">
                {description.length} / 500
              </span>
            </div>
            {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description}</p>}
          </div>

          {/* URL */}
          <div>
            <label className="text-xs text-[var(--color-subtext)] mb-1 flex items-center gap-2">
              Link / URL <span className="px-1.5 py-0.5 rounded-full bg-[var(--color-raised)] text-[var(--color-muted)] text-[10px]">optional</span>
            </label>
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://..."
              className={cn(
                'w-full bg-[var(--color-raised)] border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-plasma/60',
                errors.url ? 'border-red-500' : 'border-seeper-border/40'
              )}
            />
            {errors.url && <p className="text-red-400 text-xs mt-1">{errors.url}</p>}
          </div>

          {/* File upload */}
          <div>
            <label className="text-xs text-[var(--color-subtext)] mb-1 flex items-center gap-2">
              Attach file <span className="px-1.5 py-0.5 rounded-full bg-[var(--color-raised)] text-[var(--color-muted)] text-[10px]">optional</span>
            </label>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.doc,.docx,.png,.jpg,.mp4"
              className="hidden"
              onChange={e => setFileName(e.target.files?.[0]?.name ?? '')}
            />
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full bg-[var(--color-raised)] border border-seeper-border/40 rounded-lg px-3 py-2 text-sm text-[var(--color-subtext)] text-left hover:border-seeper-border transition-colors"
            >
              {fileName || 'Choose file (PDF, DOC, PNG, JPG, MP4 — max 10MB)'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 pt-3 border-t border-seeper-border/40">
          <button
            onClick={handleSubmit}
            disabled={!isValid || loading}
            className={cn(
              'w-full py-3 rounded-full text-sm font-bold text-white transition-all duration-150',
              isValid && !loading
                ? 'bg-plasma hover:bg-plasma/90 active:scale-[0.97]'
                : 'bg-plasma/40 cursor-not-allowed opacity-50'
            )}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting...
              </span>
            ) : (
              'Submit contribution →'
            )}
          </button>
        </div>
      </div>
    </>
  )
}
```

- [ ] **Step 3: Add FAB to AppShell**

In `components/layout/AppShell.tsx`:
```typescript
import { FAB } from '@/components/ui/FAB'

// In main content area, wrap with relative positioning:
<main className="flex-1 overflow-y-auto p-6 relative">
  {children}
  <FAB />
</main>
```

- [ ] **Step 4: Build**

```bash
npm run build
```

Expected: Clean.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add FAB and ContributeDrawer with validation"
```

---

## Task 8: SearchModal with Cmd+K

**Files:**
- Create: `components/ui/SearchModal.tsx`
- Modify: `components/layout/Header.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Create SearchModal**

```typescript
// components/ui/SearchModal.tsx
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { SearchableItem } from '@/types'

// Mock data for search — TODO: replace with Supabase full-text search
// or semantic vector search via Claude embeddings API
import { MOCK_SEARCH_ITEMS } from '@/lib/constants'

const FILTER_SECTIONS = [
  'All','seeNews','seeWiki','seeTools','seeResources','seePrompts','seeInside',
  '#ai','#creative','#production','#tech',
]

interface SearchModalProps {
  open: boolean
  onClose: () => void
}

function highlight(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = text.split(regex)
  return parts.map((part, i) =>
    regex.test(part)
      ? <mark key={i} style={{ background: 'rgba(237,105,58,0.25)', color: 'inherit' }}>{part}</mark>
      : part
  )
}

export function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState<string[]>(['All'])
  const [results, setResults] = useState<SearchableItem[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Autofocus on open
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
      setQuery('')
      setResults([])
    }
  }, [open])

  // Debounced client-side search
  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    const timer = setTimeout(() => {
      const q = query.toLowerCase()
      const filtered = MOCK_SEARCH_ITEMS.filter(item => {
        const matchesQuery =
          item.title.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q) ||
          item.tags?.some(t => t.includes(q)) ||
          item.author?.toLowerCase().includes(q)
        const matchesSection =
          activeFilters.includes('All') ||
          activeFilters.some(f => {
            if (f.startsWith('#')) return item.tags?.includes(f)
            return item.section === f
          })
        return matchesQuery && matchesSection
      })
      setResults(filtered)
    }, 200)
    return () => clearTimeout(timer)
  }, [query, activeFilters])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  const toggleFilter = (f: string) => {
    if (f === 'All') { setActiveFilters(['All']); return }
    setActiveFilters(prev => {
      const next = prev.includes(f) ? prev.filter(x => x !== f) : [...prev.filter(x => x !== 'All'), f]
      return next.length === 0 ? ['All'] : next
    })
  }

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 z-[1000] bg-black/60" onClick={onClose} />
      <div className="fixed top-[15%] left-1/2 -translate-x-1/2 z-[1001] w-[560px] max-h-[70vh] flex flex-col rounded-2xl bg-[var(--color-surface)] border border-seeper-border/40 shadow-2xl">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-seeper-border/40">
          <span className="text-[var(--color-muted)]">🔍</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search seeper wiki..."
            className="flex-1 bg-transparent text-sm outline-none text-[var(--color-text)] placeholder-[var(--color-muted)]"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-[var(--color-muted)] text-xs">✕</button>
          )}
          <button onClick={onClose} className="text-xs text-[var(--color-muted)] px-2 py-1 rounded border border-seeper-border/40">esc</button>
        </div>

        {/* Filters */}
        <div className="flex gap-1.5 px-4 py-2 border-b border-seeper-border/40 overflow-x-auto">
          {FILTER_SECTIONS.map(f => (
            <button
              key={f}
              onClick={() => toggleFilter(f)}
              className={cn(
                'px-2.5 py-1 rounded-full text-xs whitespace-nowrap border transition-all duration-150',
                activeFilters.includes(f)
                  ? 'border-plasma bg-plasma/10 text-plasma'
                  : 'border-seeper-border/40 text-[var(--color-muted)] hover:border-seeper-border'
              )}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto py-2">
          {query && results.length === 0 && (
            <div className="px-4 py-8 text-center text-[var(--color-muted)] text-sm">
              Nothing found for &quot;{query}&quot;
              <p className="text-xs mt-1">Try contributing it instead.</p>
            </div>
          )}
          {results.map(item => (
            <button
              key={item.id}
              onClick={() => { router.push(item.href); onClose() }}
              className="w-full text-left px-4 py-3 hover:bg-[var(--color-raised)] transition-colors"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold" style={{ color: item.sectionColor }}>
                  {item.section}
                </span>
                {item.category && (
                  <span className="px-1.5 py-0.5 rounded-full bg-[var(--color-raised)] text-[10px] text-[var(--color-muted)]">
                    {item.category}
                  </span>
                )}
                {item.author && (
                  <span className="text-[10px] text-[var(--color-muted)]">· {item.author}</span>
                )}
              </div>
              <div className="text-sm font-medium text-[var(--color-text)]">
                {highlight(item.title, query)}
              </div>
              {item.excerpt && (
                <div className="text-xs text-[var(--color-subtext)] mt-0.5 line-clamp-2">
                  {highlight(item.excerpt, query)}
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-seeper-border/40 text-xs text-[var(--color-muted)]">
          {query ? `${results.length} results across seeper wiki` : 'Start typing to search…'}
        </div>
      </div>
    </>
  )
}
```

Add `MOCK_SEARCH_ITEMS` to `lib/constants.ts` — an array of `SearchableItem` combining wiki, news, prompts mock data so search has something to return. Import mock arrays from their respective page files or inline a small set here.

- [ ] **Step 2: Add Cmd+K global listener and search trigger to Header**

In `components/layout/Header.tsx`:

```typescript
import { useState, useEffect } from 'react'
import { SearchModal } from '@/components/ui/SearchModal'

// In component:
const [searchOpen, setSearchOpen] = useState(false)

useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      setSearchOpen(true)
    }
  }
  window.addEventListener('keydown', handler)
  return () => window.removeEventListener('keydown', handler)
}, [])

// In JSX, add a search button:
<button
  onClick={() => setSearchOpen(true)}
  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-raised)] border border-seeper-border/40 text-sm text-[var(--color-muted)] hover:border-seeper-border transition-all"
>
  🔍 <span className="text-xs">Search</span>
  <span className="ml-2 px-1.5 py-0.5 rounded border border-seeper-border/40 text-[10px]">⌘K</span>
</button>

<SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
```

- [ ] **Step 3: Build**

```bash
npm run build
```

Expected: Clean.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add SearchModal with Cmd+K shortcut"
```

---

## Task 9: Profile page

**Files:**
- Create: `app/profile/page.tsx`
- Create: `app/profile/loading.tsx`

- [ ] **Step 1: Create profile page**

```typescript
// app/profile/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AppShell from '@/components/layout/AppShell'
import type { Profile } from '@/types'
import { ProfilePageClient } from './ProfilePageClient'

export default async function ProfilePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')
  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  return (
    <AppShell profile={profile as Profile | null}>
      <ProfilePageClient profile={profile as Profile | null} email={user.email ?? ''} />
    </AppShell>
  )
}
```

Create `app/profile/ProfilePageClient.tsx` as a `'use client'` component with:
- Three tabs: Overview, Edit, Notifications
- **Overview tab**: avatar (80px circle with initials from `getInitials()`), full_name, display_name, role, department, bio, skills pills, email, location, member-since date
- **Edit tab**: form with all profile fields as specified. On save: `supabase.from('profiles').upsert()`, show success toast
- **Notifications tab**: toggle switches stored in `notifications_prefs` JSON field

Key parts of Edit tab:
```typescript
const AVATAR_COLORS = [
  { label: 'Plasma',  value: '#ED693A' },
  { label: 'Quantum', value: '#B0A9CF' },
  { label: 'Fern',    value: '#8ACB8F' },
  { label: 'Volt',    value: '#EDDE5C' },
  { label: 'Circuit', value: '#DCFEAD' },
  { label: 'Pink',    value: '#D4537E' },
]

const DEPARTMENTS = ['Creative','Production','Technology','Business','Operations','Leadership']

const SKILL_SUGGESTIONS = [
  'UE5','Projection Mapping','TouchDesigner','Show Control',
  'After Effects','3D','AR/VR','Motion Design','Audio Design','Creative Direction'
]
```

Save handler:
```typescript
const handleSave = async () => {
  const { error } = await supabase.from('profiles').upsert({
    id: profile?.id,
    full_name: fullName,
    display_name: displayName,
    role: jobTitle,
    department: department.toLowerCase(),
    bio,
    skills,
    location,
    linkedin_url: linkedinUrl,
    avatar_color: avatarColor,
  })
  if (error) toast('Failed to save profile.', 'error')
  else toast('Profile saved!', 'success')
}
```

- [ ] **Step 2: Add profile popover to Sidebar**

In `components/layout/Sidebar.tsx`, at the bottom where the user avatar is, make it a `<button>` that opens a small popover:

```typescript
// Popover content:
// - Avatar + full_name + role
// - Link to /profile (Edit profile)
// - Link to /profile?tab=notifications (Notifications)
// - Sign out button
```

- [ ] **Step 3: Build**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add profile page with edit and notifications tabs"
```

---

## Task 10: Contribute API route

**Files:**
- Create: `app/api/contribute/route.ts`

- [ ] **Step 1: Create route**

```typescript
// app/api/contribute/route.ts
import { createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { submitter_name, title, category, description, tags, url } = body

    // Server-side validation
    if (!submitter_name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 })
    if (!title?.trim() || title.trim().length < 5)
      return NextResponse.json({ error: 'Title must be at least 5 characters' }, { status: 400 })
    if (!category) return NextResponse.json({ error: 'Category required' }, { status: 400 })
    if (!description?.trim() || description.trim().length < 20)
      return NextResponse.json({ error: 'Description must be at least 20 characters' }, { status: 400 })

    const supabase = createServiceClient()

    // Insert to contributions table
    const { data, error } = await supabase.from('contributions').insert({
      submitter_name,
      title,
      category,
      description,
      tags: tags ?? [],
      url: url ?? null,
      status: 'pending',
    }).select('id').single()

    if (error) {
      console.error('[contribute] Insert error:', error.message)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: data.id })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
```

- [ ] **Step 2: Update /api/tag/route.ts stub**

The existing `app/api/tag/route.ts` is a stub. Fill it in:

```typescript
// app/api/tag/route.ts
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
```

- [ ] **Step 3: Build**

```bash
npm run build
```

Expected: Clean, 23+ pages.

- [ ] **Step 4: Final test run**

```bash
npm run test:run
```

Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add /api/contribute and wire up /api/tag"
```

---

## Task 11: Auth improvements

**Files:**
- Modify: `app/auth/page.tsx`

The callback route already exists and is correct. Only the auth page needs updating.

- [ ] **Step 1: Update auth/page.tsx**

Key change: silently catch rate-limit errors (429) and still show confirmation state:

```typescript
// In the submit handler, replace the error display logic:
try {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })
  // TODO: Supabase returns 429 rate-limit errors on repeated OTP requests.
  // We intentionally catch and swallow this error — showing the confirmation
  // state anyway avoids confusing "rate limited" messages for users who
  // accidentally double-submitted or are re-requesting quickly.
  if (error && error.status !== 429) {
    setError('Something went wrong. Please try again.')
    return
  }
  setSent(true)
} catch {
  setSent(true) // Err on the side of showing confirmation
}
```

Also update the confirmation UI:
- Large circular checkmark animation in plasma-orange (CSS animation, no library needed)
- "Check your inbox" heading
- "We sent a link to [email]. Click it to sign in — it expires in 60 minutes." subtext
- "Try a different email" link to reset

- [ ] **Step 2: Build + test**

```bash
npm run build && npm run test:run
```

Expected: All pass.

- [ ] **Step 3: Commit**

```bash
git add app/auth/page.tsx
git commit -m "feat: improve auth page with silent rate-limit handling and animated confirmation"
```

---

## Task 12: Commit and push Plan A

- [ ] **Step 1: Final verification**

```bash
npm run build
npm run test:run
```

Expected: Clean build, all tests pass.

- [ ] **Step 2: Push to GitHub**

```bash
git push origin main
```

---

## Plan A Complete

After completing all tasks above, seeper wiki Phase 2 Foundation is in place:
- Dark/light mode with persistent preference
- Section-coloured navigation
- Phase 2 types and database migration ready
- Toast system and Skeleton loader
- App-wide NewsTicker
- FAB + Contribute Drawer
- Cmd+K Search Modal
- Profile page
- API routes wired

**Next:** Execute `docs/superpowers/plans/2026-03-25-phase2-content-pages.md`
