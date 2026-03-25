# seeper wiki Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-ready internal knowledge hub for seeper studio — fully functional auth, a polished dashboard, and scaffolded routing for all sections.

**Architecture:** Next.js 14 App Router with Supabase for auth/database and the Claude API for AI features. All routes are server-protected via root middleware. Phase 1 delivers a fully built Dashboard and Auth page; all other routes are branded placeholders. Dashboard uses mock data except for the Daily Digest which calls Claude directly from the server component.

**Tech Stack:** Next.js 14, TypeScript strict, Tailwind CSS, Supabase SSR, @anthropic-ai/sdk, Lucide React, DM Sans + Inter (Google Fonts), Vitest + React Testing Library, Netlify

---

## File Map

### Config & root
| File | Purpose |
|---|---|
| `package.json` | All dependencies |
| `next.config.ts` | Next.js config (images, env) |
| `tailwind.config.ts` | Full seeper custom theme |
| `app/globals.css` | Google Fonts import + custom utility classes |
| `tsconfig.json` | Strict TypeScript |
| `vitest.config.ts` | Test runner config |
| `middleware.ts` | Root auth guard — redirects unauthenticated users to /auth |
| `netlify.toml` | Netlify deployment config |
| `.env.local.example` | Documented env var template |

### Types & lib
| File | Purpose |
|---|---|
| `types/index.ts` | All shared TypeScript interfaces |
| `lib/constants.ts` | Nav config, categories, departments, mock data |
| `lib/utils.ts` | `cn()`, `getGreeting()`, `formatDate()`, `getInitials()` |
| `lib/claude.ts` | Claude API helpers: generateDailyDigest, summariseArticle, tagContent, generateNewsletterIntro |
| `lib/rss.ts` | RSS parser stub (Phase 2 shell) |
| `lib/supabase/client.ts` | Supabase browser client (`createBrowserClient`) |
| `lib/supabase/server.ts` | Supabase server client (`createServerClient` + cookies) |
| `lib/supabase/middleware.ts` | Supabase SSR client for middleware context |

### UI components (`components/ui/`)
| File | Purpose |
|---|---|
| `Button.tsx` | primary / secondary / ghost variants, rounded-full |
| `Card.tsx` | seeper-card and seeper-card-raised base cards |
| `Badge.tsx` | Category pill tags with jewel tone variants |
| `Avatar.tsx` | Circular avatar with initials fallback |
| `Input.tsx` | Styled form input |
| `Textarea.tsx` | Styled textarea |
| `Modal.tsx` | Accessible modal dialog |
| `CircleDecor.tsx` | Decorative SVG circle/arc for placeholder pages |
| `LoadingSpinner.tsx` | Animated circular spinner |
| `Ticker.tsx` | CSS-animated horizontal scrolling text strip |

### Layout components (`components/layout/`)
| File | Purpose |
|---|---|
| `Sidebar.tsx` | Collapsible nav sidebar (240px / 60px), all nav sections, active states, user profile, sign out |
| `Header.tsx` | Top bar: wordmark, date, greeting, avatar |
| `AppShell.tsx` | Sidebar + Header + main content area wrapper |

### Dashboard components (`components/dashboard/`)
| File | Purpose |
|---|---|
| `DailyDigest.tsx` | Hero digest card with Claude content, Regenerate button |
| `QuickLinks.tsx` | 6-tile navigation grid |
| `WikiUpdates.tsx` | Latest wiki entries list (mock data) |
| `NewsletterPreview.tsx` | Most recent newsletter card (mock data) |
| `ActivityFeed.tsx` | Team activity list (mock data) |
| `NewsTicker.tsx` | Bottom scrolling news strip (mock data) |

### Wiki / News / Prompts components (scaffolded shells)
| File | Purpose |
|---|---|
| `components/wiki/WikiCard.tsx` | Shell |
| `components/wiki/WikiEditor.tsx` | TipTap editor wrapper shell |
| `components/wiki/WikiSearch.tsx` | Shell |
| `components/news/NewsCard.tsx` | Shell |
| `components/news/NewsFilter.tsx` | Shell |
| `components/prompts/PromptCard.tsx` | Shell |
| `components/prompts/PromptForm.tsx` | Shell |

### App routes
| File | Purpose |
|---|---|
| `app/layout.tsx` | Root layout: fonts, body bg, providers |
| `app/page.tsx` | Redirect to /dashboard |
| `app/dashboard/page.tsx` | Full dashboard — 5 sections |
| `app/auth/page.tsx` | Magic link login page |
| `app/auth/callback/route.ts` | Supabase code exchange → redirect to /dashboard |
| `app/api/digest/route.ts` | POST: generate + cache daily digest |
| `app/api/summarise/route.ts` | POST: summarise article |
| `app/api/tag/route.ts` | POST: auto-tag content |
| `app/news/page.tsx` | seeNews placeholder |
| `app/news/loading.tsx` | Loading skeleton |
| `app/wiki/page.tsx` | seeWiki placeholder |
| `app/wiki/[slug]/page.tsx` | Wiki page view placeholder |
| `app/wiki/new/page.tsx` | New wiki page placeholder |
| `app/wiki/edit/[slug]/page.tsx` | Edit wiki page placeholder |
| `app/prompts/page.tsx` | seePrompts placeholder |
| `app/newsletter/page.tsx` | seeNewsletter placeholder |
| `app/newsletter/[id]/page.tsx` | Newsletter issue placeholder |
| `app/newsletter/new/page.tsx` | New newsletter placeholder |
| `app/tools/page.tsx` | seeTools placeholder |
| `app/resources/page.tsx` | seeResources placeholder |
| `app/team/page.tsx` | seeUs placeholder |
| `app/admin/page.tsx` | Admin placeholder |
| `app/labs/page.tsx` | seeLabs placeholder |

### Infrastructure
| File | Purpose |
|---|---|
| `supabase/migrations/001_initial.sql` | All 7 tables, RLS, policies, is_admin() function |

---

## Task 1: Bootstrap project + install dependencies

**Files:**
- Create: `package.json` (via create-next-app, then augmented)
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`

- [ ] **Step 1: Scaffold Next.js 14 project in current directory**

```bash
cd "/Users/caitmc/Documents/Experiments/Vibe coding/seeperwiki v1"
npx create-next-app@14 . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*" --use-npm --yes
```

Expected: Next.js project created with `app/`, `components/`, `public/`, `tailwind.config.ts`, `next.config.ts`, `tsconfig.json`, `package.json`.

- [ ] **Step 2: Install additional dependencies**

```bash
cd "/Users/caitmc/Documents/Experiments/Vibe coding/seeperwiki v1"
npm install @supabase/supabase-js @supabase/ssr @anthropic-ai/sdk lucide-react @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder
npm install --save-dev vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 3: Create `vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
```

- [ ] **Step 4: Create `vitest.setup.ts`**

```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 5: Add test script to `package.json`**

Add to the `scripts` section:
```json
"test": "vitest",
"test:run": "vitest run"
```

- [ ] **Step 6: Verify install**

```bash
cd "/Users/caitmc/Documents/Experiments/Vibe coding/seeperwiki v1"
npm run test:run
```

Expected: 0 tests found, exits cleanly (no error about missing config).

- [ ] **Step 7: Verify `.gitignore` excludes secrets before first commit**

```bash
grep -E "\.env\.local$" "/Users/caitmc/Documents/Experiments/Vibe coding/seeperwiki v1/.gitignore"
```

Expected: `.env.local` appears in `.gitignore`. If it doesn't, add it manually before proceeding.

- [ ] **Step 8: Commit**

```bash
git init
git add -A
git commit -m "feat: bootstrap seeper wiki — Next.js 14 + dependencies"
```

---

## Task 2: Tailwind config + global styles

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `app/globals.css`

- [ ] **Step 1: Replace `tailwind.config.ts` with full seeper theme**

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        seeper: {
          black:   '#000000',
          bg:      '#0d0d0d',
          surface: '#222222',
          raised:  '#2a2a2a',
          border:  '#3a3a3a',
          muted:   '#626262',
          steel:   '#C3C3C3',
          white:   '#FFFFFF',
        },
        plasma:  { DEFAULT: '#ED693A', glow: 'rgba(237,105,58,0.15)' },
        volt:    { DEFAULT: '#EDDE5C' },
        quantum: { DEFAULT: '#B0A9CF' },
        fern:    { DEFAULT: '#8ACB8F' },
        circuit: { DEFAULT: '#DCFEAD' },
        mossy:   { DEFAULT: '#DDDDCE' },
      },
      fontFamily: {
        display: ['DM Sans', 'sans-serif'],
        body:    ['Inter', 'sans-serif'],
      },
      borderRadius: {
        pill: '9999px',
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        'glow-orange': '0 0 20px rgba(237,105,58,0.2)',
        'glow-purple': '0 0 20px rgba(176,169,207,0.2)',
        card:          '0 4px 24px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
}

export default config
```

- [ ] **Step 2: Replace `app/globals.css`**

```css
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-seeper-bg text-seeper-white font-body;
  }
}

@layer components {
  .seeper-card {
    @apply bg-seeper-surface border border-seeper-border rounded-2xl;
  }
  .seeper-card-raised {
    @apply bg-seeper-raised border border-seeper-border rounded-2xl;
  }
  .pill-tag {
    @apply rounded-full px-3 py-1 text-xs font-medium font-display;
  }
  .glow-on-hover {
    @apply transition-shadow duration-200 hover:shadow-glow-orange;
  }
  .section-label {
    @apply text-xs font-display font-semibold tracking-widest uppercase text-seeper-muted;
  }
  .heading-display {
    @apply font-display font-bold text-seeper-white;
  }
}

/* News ticker scroll animation */
@keyframes ticker-scroll {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.ticker-track {
  animation: ticker-scroll 40s linear infinite;
  display: flex;
  width: max-content;
}
```

- [ ] **Step 3: Verify dev server starts and Tailwind classes resolve**

```bash
cd "/Users/caitmc/Documents/Experiments/Vibe coding/seeperwiki v1"
npm run build
```

Expected: Build succeeds with no Tailwind errors.

- [ ] **Step 4: Commit**

```bash
git add tailwind.config.ts app/globals.css
git commit -m "feat: add seeper brand theme to Tailwind + global styles"
```

---

## Task 3: Types + constants

**Files:**
- Create: `types/index.ts`
- Create: `lib/constants.ts`
- Create: `__tests__/lib/constants.test.ts`

- [ ] **Step 1: Write failing test for constants**

Create `__tests__/lib/constants.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { NAV_SECTIONS, CATEGORIES, DEPARTMENTS } from '@/lib/constants'

describe('NAV_SECTIONS', () => {
  it('contains three top-level sections', () => {
    expect(NAV_SECTIONS).toHaveLength(3)
  })

  it('all nav items have required fields', () => {
    NAV_SECTIONS.forEach(section => {
      section.items.forEach(item => {
        expect(item).toHaveProperty('label')
        expect(item).toHaveProperty('href')
        expect(item).toHaveProperty('icon')
      })
    })
  })
})

describe('CATEGORIES', () => {
  it('includes expected categories', () => {
    const values = CATEGORIES.map(c => c.value)
    expect(values).toContain('creative')
    expect(values).toContain('tech')
    expect(values).toContain('ai')
  })
})

describe('DEPARTMENTS', () => {
  it('includes all seeper departments', () => {
    const values = DEPARTMENTS.map(d => d.value)
    expect(values).toContain('creative')
    expect(values).toContain('production')
    expect(values).toContain('tech')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd "/Users/caitmc/Documents/Experiments/Vibe coding/seeperwiki v1"
npm run test:run -- __tests__/lib/constants.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create `types/index.ts`**

```typescript
// All shared TypeScript interfaces for seeper wiki

export interface Profile {
  id: string
  full_name: string | null
  display_name: string | null
  role: 'admin' | 'member'
  department: Department | null
  avatar_url: string | null
  created_at: string
}

export type Department = 'creative' | 'production' | 'tech' | 'business' | 'operations'

export type WikiCategory = 'creative' | 'production' | 'tech' | 'business' | 'ai' | 'general'

export type PromptCategory = 'image-gen' | 'copy' | 'code' | 'research' | 'video' | '3d' | 'general'

export type AiTool = 'claude' | 'midjourney' | 'runway' | 'sora' | 'dalle' | 'other'

export interface WikiPage {
  id: string
  slug: string
  title: string
  content: string | null
  excerpt: string | null
  category: WikiCategory | null
  tags: string[] | null
  author_id: string | null
  last_edited_by: string | null
  views: number
  published: boolean
  created_at: string
  updated_at: string
  author?: Profile
}

export interface Prompt {
  id: string
  title: string
  content: string
  category: PromptCategory | null
  ai_tool: AiTool | null
  tags: string[] | null
  upvotes: number
  author_id: string | null
  created_at: string
  author?: Profile
}

export interface NewsletterIssue {
  id: string
  title: string
  content: string | null
  issue_number: number | null
  published: boolean
  published_at: string | null
  author_id: string | null
  created_at: string
  author?: Profile
}

export interface NewsItem {
  id: string
  title: string
  url: string
  source: string | null
  summary: string | null
  category: string | null
  published_at: string | null
  fetched_at: string
}

export interface DailyDigest {
  id: string
  content: string
  generated_at: string
  date: string
}

export interface ActivityLogItem {
  id: string
  user_id: string | null
  action: ActivityAction
  resource_type: string | null
  resource_id: string | null
  resource_title: string | null
  created_at: string
  user?: Profile
}

export type ActivityAction =
  | 'created_wiki'
  | 'edited_wiki'
  | 'added_prompt'
  | 'published_newsletter'

export interface NavItem {
  label: string
  href: string
  icon: string // Lucide icon name
  adminOnly?: boolean
}

export interface NavSection {
  title: string
  items: NavItem[]
}
```

- [ ] **Step 4: Create `lib/constants.ts`**

```typescript
import type { NavSection } from '@/types'

// seeper division naming — see[X] convention
export const SECTION_NAMES = {
  news:       'seeNews',
  wiki:       'seeWiki',
  prompts:    'seePrompts',
  newsletter: 'seeNewsletter',
  tools:      'seeTools',
  resources:  'seeResources',
  team:       'seeUs',
  labs:       'seeLabs',
  insights:   'seeInsights',
} as const

export const CATEGORIES = [
  { value: 'creative',   label: 'Creative',   color: 'bg-plasma/20 text-plasma' },
  { value: 'tech',       label: 'Tech',        color: 'bg-circuit/20 text-circuit' },
  { value: 'production', label: 'Production',  color: 'bg-quantum/20 text-quantum' },
  { value: 'business',   label: 'Business',    color: 'bg-volt/20 text-volt' },
  { value: 'ai',         label: 'AI',          color: 'bg-fern/20 text-fern' },
  { value: 'general',    label: 'General',     color: 'bg-seeper-raised text-seeper-steel' },
] as const

export const DEPARTMENTS = [
  { value: 'creative',   label: 'Creative' },
  { value: 'production', label: 'Production' },
  { value: 'tech',       label: 'Technology' },
  { value: 'business',   label: 'Business Development' },
  { value: 'operations', label: 'Operations' },
] as const

// Navigation config — icon strings are Lucide icon names
export const NAV_SECTIONS: NavSection[] = [
  {
    title: 'MAIN',
    items: [
      { label: 'Dashboard',        href: '/dashboard',   icon: 'LayoutDashboard' },
      { label: SECTION_NAMES.news, href: '/news',        icon: 'Newspaper' },
      { label: SECTION_NAMES.wiki, href: '/wiki',        icon: 'BookOpen' },
    ],
  },
  {
    title: 'STUDIO',
    items: [
      { label: SECTION_NAMES.prompts,    href: '/prompts',    icon: 'Sparkles' },
      { label: SECTION_NAMES.newsletter, href: '/newsletter', icon: 'Mail' },
      { label: SECTION_NAMES.tools,      href: '/tools',      icon: 'Wrench' },
      { label: SECTION_NAMES.resources,  href: '/resources',  icon: 'FolderOpen' },
    ],
  },
  {
    title: 'TEAM',
    items: [
      { label: SECTION_NAMES.team, href: '/team', icon: 'Users' },
      { label: SECTION_NAMES.labs, href: '/labs', icon: 'FlaskConical' },
      { label: 'Admin', href: '/admin', icon: 'Settings', adminOnly: true },
    ],
  },
]

// Quick links for dashboard tiles — each with a jewel tone accent
export const QUICK_LINKS = [
  { label: SECTION_NAMES.news,       href: '/news',        icon: 'Newspaper',  accent: 'bg-plasma' },
  { label: SECTION_NAMES.wiki,       href: '/wiki',        icon: 'BookOpen',   accent: 'bg-quantum' },
  { label: SECTION_NAMES.prompts,    href: '/prompts',     icon: 'Sparkles',   accent: 'bg-volt' },
  { label: SECTION_NAMES.newsletter, href: '/newsletter',  icon: 'Mail',       accent: 'bg-fern' },
  { label: SECTION_NAMES.tools,      href: '/tools',       icon: 'Wrench',     accent: 'bg-circuit' },
  { label: SECTION_NAMES.resources,  href: '/resources',   icon: 'FolderOpen', accent: 'bg-mossy' },
] as const

// Mock ticker headlines for Phase 1 (replaced by live RSS in Phase 2)
export const MOCK_TICKER_HEADLINES = [
  'OpenAI releases real-time API updates enabling lower-latency voice for installations',
  'Runway Gen-3 Alpha benchmarks set new standard for AI video quality',
  'GCC theme park operator announces $2B immersive experience investment',
  'Adobe Firefly 3 adds generative fill to video for the first time',
  'SXSW 2026: XR and spatial computing dominate experience design track',
  'Meta Quest 4 leak suggests under-display eye tracking for next-gen presence',
  'Luma AI Dream Machine 2.0 launches with physics-aware video synthesis',
  'UK Creative Industries tax relief expanded to include immersive experiences',
  'Google DeepMind unveils world model for real-time 3D environment generation',
  'Framestore opens new immersive studio division in London',
] as const

// Mock activity feed for Phase 1
export const MOCK_ACTIVITY = [
  { initials: 'AJ', name: 'Alex J', action: 'created wiki page', title: 'Unreal Engine Lighting Guide', time: '2 min ago', dept: 'tech' },
  { initials: 'SC', name: 'Sarah C', action: 'published newsletter', title: 'Issue 12 — March Edition', time: '1 hr ago', dept: 'creative' },
  { initials: 'MK', name: 'Marcus K', action: 'added prompt', title: 'Midjourney Architectural Render', time: '3 hr ago', dept: 'creative' },
  { initials: 'LT', name: 'Laura T', action: 'edited wiki page', title: 'Production Pipeline Overview', time: '5 hr ago', dept: 'production' },
  { initials: 'RB', name: 'Ryan B', action: 'created wiki page', title: 'AWS Cost Optimisation Notes', time: 'Yesterday', dept: 'tech' },
  { initials: 'NP', name: 'Nadia P', action: 'added prompt', title: 'ChatGPT Proposal Template', time: 'Yesterday', dept: 'business' },
  { initials: 'JW', name: 'Jamie W', action: 'edited wiki page', title: 'Health & Safety Checklist', time: '2 days ago', dept: 'operations' },
  { initials: 'EC', name: 'Emma C', action: 'created wiki page', title: 'Brand Guidelines 2026', time: '2 days ago', dept: 'creative' },
] as const

// Mock wiki updates for Phase 1
export const MOCK_WIKI_UPDATES = [
  { initials: 'AJ', title: 'Unreal Engine Lighting Guide', category: 'tech', author: 'Alex J', time: '2 min ago' },
  { initials: 'LT', title: 'Production Pipeline Overview', category: 'production', author: 'Laura T', time: '5 hr ago' },
  { initials: 'EC', title: 'Brand Guidelines 2026', category: 'creative', author: 'Emma C', time: '2 days ago' },
  { initials: 'RB', title: 'AWS Cost Optimisation Notes', category: 'tech', author: 'Ryan B', time: 'Yesterday' },
  { initials: 'SC', title: 'Client Presentation Framework', category: 'business', author: 'Sarah C', time: '3 days ago' },
] as const

// Mock newsletter for Phase 1
export const MOCK_NEWSLETTER = {
  issueNumber: 12,
  title: 'The seeper Digest — March 2026',
  excerpt: 'This month: our LED volume wrap-up, the AI tools shaping our pipeline, and a preview of what\'s next from seeper Labs.',
  publishedAt: 'March 2026',
} as const

// Mock digest for Phase 1 fallback
export const MOCK_DIGEST =
  'This week in AI and immersive tech: OpenAI released significant updates to their real-time API enabling lower-latency voice interactions for installations. Runway\'s Gen-3 Alpha continues to set benchmarks for video generation quality relevant to seeper\'s content pipeline. Meanwhile, a major theme park operator in the GCC has announced a $2B immersive experience investment that could signal new brief opportunities in the region.'

export const DIGEST_SOURCES = ['The Verge', 'Hugging Face', 'Creative Applications']
```

- [ ] **Step 5: Run test to verify it passes**

```bash
npm run test:run -- __tests__/lib/constants.test.ts
```

Expected: 3 passing tests.

- [ ] **Step 6: Commit**

```bash
git add types/index.ts lib/constants.ts __tests__/lib/constants.test.ts
git commit -m "feat: add shared types and app constants"
```

---

## Task 4: Utility functions

**Files:**
- Create: `lib/utils.ts`
- Create: `__tests__/lib/utils.test.ts`

- [ ] **Step 1: Write failing tests**

Create `__tests__/lib/utils.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { cn, getGreeting, formatDate, getInitials } from '@/lib/utils'

describe('cn', () => {
  it('merges class strings', () => {
    expect(cn('a', 'b')).toBe('a b')
  })

  it('handles conditional classes', () => {
    expect(cn('a', false && 'b', 'c')).toBe('a c')
  })

  it('deduplicates Tailwind conflicts', () => {
    // tailwind-merge keeps the last conflicting class
    expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500')
  })
})

describe('getGreeting', () => {
  it('returns Good morning before noon', () => {
    const date = new Date()
    date.setHours(9)
    expect(getGreeting('Alex', date)).toBe('Good morning, Alex')
  })

  it('returns Good afternoon between noon and 17', () => {
    const date = new Date()
    date.setHours(14)
    expect(getGreeting('Alex', date)).toBe('Good afternoon, Alex')
  })

  it('returns Good evening at 18 or later', () => {
    const date = new Date()
    date.setHours(19)
    expect(getGreeting('Alex', date)).toBe('Good evening, Alex')
  })
})

describe('getInitials', () => {
  it('returns two initials from full name', () => {
    expect(getInitials('Alex Johnson')).toBe('AJ')
  })

  it('returns single initial for single name', () => {
    expect(getInitials('Alex')).toBe('A')
  })

  it('returns ?? for empty string', () => {
    expect(getInitials('')).toBe('??')
  })

  it('uppercases initials', () => {
    expect(getInitials('john doe')).toBe('JD')
  })
})

describe('formatDate', () => {
  it('formats a date string as weekday, day month year', () => {
    const result = formatDate('2026-03-25')
    expect(result).toContain('2026')
    expect(result).toContain('March')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run test:run -- __tests__/lib/utils.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Install `tailwind-merge` and `clsx`**

```bash
npm install tailwind-merge clsx
```

- [ ] **Step 4: Create `lib/utils.ts`**

```typescript
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Merge Tailwind classes safely, resolving conflicts */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/** Return a time-of-day greeting for the given name */
export function getGreeting(name: string, date: Date = new Date()): string {
  const hour = date.getHours()
  if (hour < 12) return `Good morning, ${name}`
  if (hour < 17) return `Good afternoon, ${name}`
  return `Good evening, ${name}`
}

/** Format a date as "Wednesday, 25 March 2026" */
export function formatDate(dateInput: string | Date = new Date()): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/** Get initials from a full name (up to 2 characters) */
export function getInitials(name: string): string {
  if (!name.trim()) return '??'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
npm run test:run -- __tests__/lib/utils.test.ts
```

Expected: all passing.

- [ ] **Step 6: Commit**

```bash
git add lib/utils.ts __tests__/lib/utils.test.ts package.json package-lock.json
git commit -m "feat: add utility functions (cn, getGreeting, formatDate, getInitials)"
```

---

## Task 5: Claude API helper

**Files:**
- Create: `lib/claude.ts`
- Create: `__tests__/lib/claude.test.ts`

- [ ] **Step 1: Write failing tests**

Create `__tests__/lib/claude.test.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest'

// Mock the Anthropic SDK before importing the module
vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: {
      create: vi.fn().mockResolvedValue({
        content: [{ type: 'text', text: 'Mocked Claude response.' }],
      }),
    },
  })),
}))

import { generateDailyDigest, summariseArticle, tagContent, generateNewsletterIntro } from '@/lib/claude'

describe('generateDailyDigest', () => {
  it('returns a string', async () => {
    const result = await generateDailyDigest(['headline 1', 'headline 2'])
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('returns fallback string when given empty headlines', async () => {
    const result = await generateDailyDigest([])
    expect(typeof result).toBe('string')
  })
})

describe('summariseArticle', () => {
  it('returns a string summary', async () => {
    const result = await summariseArticle('Test Title', 'Some article content.')
    expect(typeof result).toBe('string')
  })
})

describe('tagContent', () => {
  it('returns an array of strings', async () => {
    // Mock returns a JSON array as text
    const { default: Anthropic } = await import('@anthropic-ai/sdk')
    const mockInstance = (Anthropic as ReturnType<typeof vi.fn>).mock.results[0].value
    mockInstance.messages.create.mockResolvedValueOnce({
      content: [{ type: 'text', text: '["ai", "tech"]' }],
    })
    const result = await tagContent('AI News', 'Some excerpt about machine learning.')
    expect(Array.isArray(result)).toBe(true)
  })
})

describe('generateNewsletterIntro', () => {
  it('returns a string', async () => {
    const result = await generateNewsletterIntro(['item 1', 'item 2'])
    expect(typeof result).toBe('string')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run test:run -- __tests__/lib/claude.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create `lib/claude.ts`**

```typescript
// Claude API helpers — all functions are server-side only.
// Never import this module in client components.
//
// Called from:
//   - generateDailyDigest: app/dashboard/page.tsx (direct server call) + app/api/digest/route.ts
//   - summariseArticle:    app/api/summarise/route.ts
//   - tagContent:          app/api/tag/route.ts
//   - generateNewsletterIntro: app/newsletter/new/page.tsx (Phase 2)

import Anthropic from '@anthropic-ai/sdk'
import { MOCK_DIGEST } from '@/lib/constants'

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set')
  return new Anthropic({ apiKey })
}

function extractText(response: Anthropic.Message): string {
  const block = response.content[0]
  if (block.type === 'text') return block.text
  return ''
}

/**
 * Generate a 3-sentence daily digest from a list of headlines.
 * Tone: direct, knowledgeable, creative-industry-aware, written for seeper's team.
 *
 * In Phase 1, callers pass MOCK_TICKER_HEADLINES as the headlines array so that
 * Claude is actually invoked. Passing an empty array is also safe — it falls back
 * to MOCK_DIGEST without an API call (useful for tests and offline dev).
 */
export async function generateDailyDigest(headlines: string[]): Promise<string> {
  if (headlines.length === 0) return MOCK_DIGEST

  try {
    const client = getClient()
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: `Summarise these headlines into a 3-sentence digest for seeper's team — an immersive experience design studio. Be direct, knowledgeable, and creative-industry-aware. Focus on what matters to the team's work.\n\nHeadlines:\n${headlines.join('\n')}`,
        },
      ],
    })
    return extractText(response)
  } catch {
    // Return fallback content if API call fails
    return MOCK_DIGEST
  }
}

/**
 * Summarise a single article in one sentence.
 */
export async function summariseArticle(title: string, content: string): Promise<string> {
  try {
    const client = getClient()
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 100,
      messages: [
        {
          role: 'user',
          content: `Summarise this article in one sentence.\n\nTitle: ${title}\n\nContent: ${content.slice(0, 2000)}`,
        },
      ],
    })
    return extractText(response)
  } catch {
    return `${title} — summary unavailable.`
  }
}

/**
 * Return an array of category tags for a piece of content.
 * Tags come from seeper's taxonomy: creative, production, tech, business, ai, general.
 */
export async function tagContent(title: string, excerpt: string): Promise<string[]> {
  try {
    const client = getClient()
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 100,
      messages: [
        {
          role: 'user',
          content: `Return a JSON array of 1-3 category tags for this content. Use only these values: creative, production, tech, business, ai, general. Return only the JSON array, nothing else.\n\nTitle: ${title}\nExcerpt: ${excerpt}`,
        },
      ],
    })
    const text = extractText(response)
    const parsed: unknown = JSON.parse(text)
    if (Array.isArray(parsed)) return parsed as string[]
    return ['general']
  } catch {
    return ['general']
  }
}

/**
 * Write a short newsletter opener in seeper's voice.
 */
export async function generateNewsletterIntro(items: string[]): Promise<string> {
  try {
    const client = getClient()
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 200,
      messages: [
        {
          role: 'user',
          content: `Write a short newsletter opener (2-3 sentences) in seeper's voice — an immersive experience design studio that crafts moments of awe and wonder. Warm, direct, creative. Based on these items:\n\n${items.join('\n')}`,
        },
      ],
    })
    return extractText(response)
  } catch {
    return 'Welcome to this issue of the seeper digest. Here\'s what\'s been happening across the studio.'
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm run test:run -- __tests__/lib/claude.test.ts
```

Expected: all passing.

- [ ] **Step 5: Create `lib/rss.ts` stub**

```typescript
// RSS feed parser — Phase 2 implementation
// Will be used by the seeNews section to fetch and cache news articles.
// TODO (Phase 2): implement feed fetching, parsing, and news_cache writes

export interface RssItem {
  title: string
  url: string
  source: string
  publishedAt: string | null
  content: string | null
}

/** Fetch and parse an RSS feed URL — stub for Phase 2 */
export async function fetchFeed(_url: string): Promise<RssItem[]> {
  // TODO (Phase 2): implement with a parser like 'rss-parser'
  return []
}
```

- [ ] **Step 6: Commit**

```bash
git add lib/claude.ts lib/rss.ts __tests__/lib/claude.test.ts
git commit -m "feat: add Claude API helpers and RSS stub"
```

---

## Task 6: Supabase library + middleware

**Files:**
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`
- Create: `lib/supabase/middleware.ts`
- Create: `middleware.ts` (root)
- Create: `app/auth/callback/route.ts`

- [ ] **Step 1: Create `lib/supabase/client.ts`**

```typescript
'use client'
// Browser Supabase client — use in Client Components only
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 2: Create `lib/supabase/server.ts`**

```typescript
// Server Supabase client — use in Server Components and Route Handlers.
//
// IMPORTANT: In Next.js 14 App Router, `cookies().set()` throws inside Server
// Components during a render (read-only). The catch block is intentional —
// it means session cookie refresh only takes effect in middleware and Route
// Handlers, not during Server Component renders. This is expected behaviour
// with @supabase/ssr. Middleware handles token refresh for all page requests.
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Expected in Server Components — middleware handles refresh
          }
        },
      },
    }
  )
}

/**
 * Service-role client — bypasses RLS. Use ONLY in server-side API routes
 * for writes to news_cache and daily_digest (which have no authenticated
 * write policies). Never use this in Server Components or client code.
 */
export function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    }
  )
}
```

- [ ] **Step 3: Create `lib/supabase/middleware.ts`**

```typescript
// Supabase SSR client for use inside Next.js middleware context
import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — do not remove this call
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Redirect unauthenticated users to /auth.
  // Use startsWith('/auth') not === '/auth' so that /auth/callback is
  // also excluded — otherwise the magic link code exchange is interrupted
  // before the session can be established.
  if (!user && !pathname.startsWith('/auth')) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
```

- [ ] **Step 4: Create root `middleware.ts`**

```typescript
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimisation)
     * - favicon.ico
     * - public folder
     * - /auth and /auth/* (login page and callback)
     * - /api/auth/* (auth API routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|auth|api/auth).*)',
  ],
}
```

- [ ] **Step 5: Create `app/auth/callback/route.ts`**

```typescript
// Supabase magic link callback — exchanges the code for a session
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}/dashboard`)
    }
  }

  // Something went wrong — redirect back to auth with an error indicator
  return NextResponse.redirect(`${origin}/auth?error=auth_callback_failed`)
}
```

- [ ] **Step 6: Verify build still passes**

```bash
npm run build
```

Expected: Build succeeds. (It will warn about missing env vars, which is expected.)

- [ ] **Step 7: Commit**

```bash
git add lib/supabase/ middleware.ts app/auth/callback/route.ts
git commit -m "feat: add Supabase SSR clients and auth middleware"
```

---

## Task 7: UI primitive components

**Files:**
- Create: `components/ui/Button.tsx`
- Create: `components/ui/Card.tsx`
- Create: `components/ui/Badge.tsx`
- Create: `components/ui/Avatar.tsx`
- Create: `components/ui/Input.tsx`
- Create: `components/ui/Textarea.tsx`
- Create: `components/ui/CircleDecor.tsx`
- Create: `components/ui/LoadingSpinner.tsx`
- Create: `components/ui/Modal.tsx`

- [ ] **Step 1: Create `components/ui/Button.tsx`**

```typescript
'use client'
import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-display font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-plasma/50 disabled:opacity-50 disabled:cursor-not-allowed',
          // Variants
          variant === 'primary' && 'bg-plasma text-seeper-white rounded-full hover:bg-plasma/90 active:scale-95',
          variant === 'secondary' && 'bg-seeper-raised text-seeper-white border border-seeper-border rounded-xl hover:border-plasma/50',
          variant === 'ghost' && 'bg-transparent text-plasma border border-plasma rounded-full hover:bg-plasma/10',
          // Sizes
          size === 'sm' && 'px-4 py-1.5 text-sm',
          size === 'md' && 'px-6 py-2.5 text-sm',
          size === 'lg' && 'px-8 py-3 text-base',
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
export default Button
```

- [ ] **Step 2: Create `components/ui/Card.tsx`**

```typescript
import { type HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  raised?: boolean
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ raised = false, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          raised ? 'seeper-card-raised' : 'seeper-card',
          'shadow-card',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'
export default Card
```

- [ ] **Step 3: Create `components/ui/Badge.tsx`**

```typescript
import { type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import { CATEGORIES } from '@/lib/constants'
import type { WikiCategory } from '@/types'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  category?: WikiCategory | string
  custom?: string // custom colour class override
}

export default function Badge({ category, custom, className, children, ...props }: BadgeProps) {
  const categoryDef = CATEGORIES.find(c => c.value === category)
  const colorClass = custom ?? categoryDef?.color ?? 'bg-seeper-raised text-seeper-steel'

  return (
    <span
      className={cn('pill-tag', colorClass, className)}
      {...props}
    >
      {children ?? categoryDef?.label ?? category}
    </span>
  )
}
```

- [ ] **Step 4: Create `components/ui/Avatar.tsx`**

```typescript
import { cn } from '@/lib/utils'
import { getInitials } from '@/lib/utils'

interface AvatarProps {
  src?: string | null
  name?: string | null
  size?: number // px
  className?: string
}

export default function Avatar({ src, name, size = 40, className }: AvatarProps) {
  const initials = getInitials(name ?? '')
  const style = { width: size, height: size, minWidth: size, fontSize: size * 0.38 }

  if (src) {
    return (
      <img
        src={src}
        alt={name ?? 'avatar'}
        style={style}
        className={cn('rounded-full object-cover', className)}
      />
    )
  }

  return (
    <div
      style={style}
      className={cn(
        'rounded-full bg-plasma flex items-center justify-center font-display font-semibold text-seeper-white select-none',
        className
      )}
    >
      {initials}
    </div>
  )
}
```

- [ ] **Step 5: Create `components/ui/Input.tsx`**

```typescript
import { type InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={id} className="text-sm font-display font-medium text-seeper-steel">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            'w-full bg-seeper-raised border border-seeper-border rounded-xl px-4 py-3',
            'font-body text-seeper-white placeholder:text-seeper-muted',
            'focus:outline-none focus:ring-2 focus:ring-plasma/50 focus:border-plasma/50',
            'transition-colors duration-200',
            error && 'border-red-500 focus:ring-red-500/50',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-400 font-body">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
export default Input
```

- [ ] **Step 6: Create `components/ui/Textarea.tsx`**

```typescript
import { type TextareaHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, className, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={id} className="text-sm font-display font-medium text-seeper-steel">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          className={cn(
            'w-full bg-seeper-raised border border-seeper-border rounded-xl px-4 py-3',
            'font-body text-seeper-white placeholder:text-seeper-muted',
            'focus:outline-none focus:ring-2 focus:ring-plasma/50 focus:border-plasma/50',
            'transition-colors duration-200 resize-y min-h-[120px]',
            className
          )}
          {...props}
        />
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
export default Textarea
```

- [ ] **Step 7: Create `components/ui/CircleDecor.tsx`**

```typescript
// Decorative SVG circle/arc — used on placeholder pages and as background accents
interface CircleDecorProps {
  size?: number
  color?: string // Tailwind stroke colour class
  opacity?: number
  filled?: boolean
  className?: string
}

export default function CircleDecor({
  size = 200,
  color = 'stroke-plasma',
  opacity = 0.15,
  filled = false,
  className = '',
}: CircleDecorProps) {
  const r = size / 2 - 2
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      className={`${color} ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    >
      {filled ? (
        <circle cx={size / 2} cy={size / 2} r={r} className="fill-current" />
      ) : (
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth="1.5" className="stroke-current" />
      )}
    </svg>
  )
}
```

- [ ] **Step 8: Create `components/ui/LoadingSpinner.tsx`**

```typescript
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: number
  className?: string
}

export default function LoadingSpinner({ size = 24, className }: LoadingSpinnerProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn('animate-spin text-plasma', className)}
      aria-label="Loading"
    >
      <circle
        cx="12" cy="12" r="10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="32"
        strokeDashoffset="12"
        className="opacity-25"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="opacity-75"
      />
    </svg>
  )
}
```

- [ ] **Step 9: Create `components/ui/Modal.tsx`**

```typescript
'use client'
import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  className?: string
}

export default function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-seeper-black/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Panel */}
      <div className={cn('relative seeper-card-raised shadow-card w-full max-w-lg p-6', className)}>
        <div className="flex items-center justify-between mb-4">
          {title && (
            <h2 className="font-display font-semibold text-seeper-white text-lg">{title}</h2>
          )}
          <button
            onClick={onClose}
            className="ml-auto text-seeper-muted hover:text-seeper-white transition-colors"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
```

- [ ] **Step 9b: Create `components/ui/Ticker.tsx`**

```typescript
// Generic reusable ticker — wraps any child items in the CSS scroll animation.
// Used by NewsTicker. Kept as a primitive for future reuse.
import { type ReactNode } from 'react'

interface TickerProps {
  children: ReactNode
  className?: string
}

export default function Ticker({ children, className = '' }: TickerProps) {
  return (
    <div className={`overflow-hidden flex items-center ${className}`}>
      <div className="ticker-track">
        {children}
      </div>
    </div>
  )
}
```

- [ ] **Step 10: Verify build passes with all new components**

```bash
npm run build
```

Expected: Build succeeds.

- [ ] **Step 11: Commit**

```bash
git add components/ui/
git commit -m "feat: add UI primitive components (Button, Card, Badge, Avatar, Input, Textarea, CircleDecor, LoadingSpinner, Modal)"
```

---

## Task 8: Layout components (Sidebar + Header + AppShell)

**Files:**
- Create: `components/layout/Sidebar.tsx`
- Create: `components/layout/Header.tsx`
- Create: `components/layout/AppShell.tsx`

- [ ] **Step 1: Create `components/layout/Sidebar.tsx`**

```typescript
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Newspaper, BookOpen, Sparkles, Mail, Wrench,
  FolderOpen, Users, FlaskConical, Settings, ChevronLeft, ChevronRight,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { NAV_SECTIONS } from '@/lib/constants'
import Avatar from '@/components/ui/Avatar'
import type { Profile } from '@/types'

// Map icon name strings from constants to actual Lucide components
const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  LayoutDashboard, Newspaper, BookOpen, Sparkles, Mail, Wrench,
  FolderOpen, Users, FlaskConical, Settings,
}

interface SidebarProps {
  profile: Profile | null
  onSignOut: () => void
}

export default function Sidebar({ profile, onSignOut }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const isAdmin = profile?.role === 'admin'

  return (
    <aside
      className={cn(
        'flex flex-col h-screen sticky top-0 bg-seeper-surface border-r border-seeper-border transition-all duration-300 z-40',
        collapsed ? 'w-[60px]' : 'w-[240px]'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-seeper-border">
        {!collapsed && (
          <div>
            <span className="font-display font-light text-seeper-white text-xl">
              seeper<span className="text-plasma">●</span>
            </span>
            <div className="text-quantum text-xs font-display">wiki</div>
          </div>
        )}
        {collapsed && (
          <span className="font-display font-light text-plasma text-xl mx-auto">●</span>
        )}
        <button
          onClick={() => setCollapsed(c => !c)}
          className={cn(
            'text-seeper-muted hover:text-seeper-white transition-colors ml-auto',
            collapsed && 'mx-auto'
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {NAV_SECTIONS.map(section => (
          <div key={section.title} className="mb-6">
            {!collapsed && (
              <p className="section-label px-2 mb-2">{section.title}</p>
            )}
            {section.items.map(item => {
              // Hide admin item for non-admins
              if (item.adminOnly && !isAdmin) return null

              const Icon = ICON_MAP[item.icon]
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-2 py-2 mb-1 transition-all duration-150 group',
                    isActive
                      ? 'border-l-[3px] border-plasma bg-plasma/10 pl-[5px]'
                      : 'border-l-[3px] border-transparent hover:bg-seeper-raised'
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <div
                    className={cn(
                      'flex items-center justify-center rounded-full w-9 h-9 flex-shrink-0',
                      isActive ? 'bg-plasma' : 'bg-seeper-raised group-hover:bg-seeper-border'
                    )}
                  >
                    {Icon && (
                      <Icon
                        size={16}
                        className={isActive ? 'text-seeper-white' : 'text-seeper-steel'}
                      />
                    )}
                  </div>
                  {!collapsed && (
                    <span
                      className={cn(
                        'font-display font-medium text-sm truncate',
                        isActive ? 'text-plasma' : 'text-seeper-steel group-hover:text-seeper-white'
                      )}
                    >
                      {item.label}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* User profile + sign out */}
      <div className="border-t border-seeper-border p-3">
        <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
          <Avatar
            src={profile?.avatar_url}
            name={profile?.display_name ?? profile?.full_name}
            size={36}
          />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="font-display font-medium text-seeper-white text-sm truncate">
                {profile?.display_name ?? profile?.full_name ?? 'seeper team'}
              </p>
              {profile?.department && (
                <p className="text-seeper-muted text-xs capitalize">{profile.department}</p>
              )}
            </div>
          )}
          {!collapsed && (
            <button
              onClick={onSignOut}
              className="text-seeper-muted hover:text-seeper-white transition-colors"
              aria-label="Sign out"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}
```

- [ ] **Step 2: Create `components/layout/Header.tsx`**

```typescript
'use client'
// Must be a Client Component so that date/greeting are computed from the
// user's actual local time, not frozen at server render / build time.
import { useMemo } from 'react'
import Avatar from '@/components/ui/Avatar'
import { formatDate, getGreeting } from '@/lib/utils'
import type { Profile } from '@/types'

interface HeaderProps {
  profile: Profile | null
}

export default function Header({ profile }: HeaderProps) {
  const name = profile?.display_name ?? profile?.full_name ?? 'there'

  // Compute once per render — these read the client's local clock
  const greeting = useMemo(() => getGreeting(name), [name])
  const dateString = useMemo(() => formatDate(new Date()), [])

  return (
    <header className="sticky top-0 z-30 bg-seeper-bg/95 backdrop-blur-sm border-b border-seeper-border/40">
      <div
        className="flex items-center justify-between px-8 py-4"
        style={{ borderBottom: '1px solid rgba(237,105,58,0.4)' }}
      >
        {/* Left: wordmark */}
        <div>
          <div className="font-display font-light text-seeper-white text-2xl leading-none">
            seeper<span className="text-plasma">●</span>
          </div>
          <div className="text-quantum text-sm font-display">wiki</div>
        </div>

        {/* Right: date, greeting, avatar */}
        <div className="flex items-center gap-6">
          <div className="text-right hidden md:block">
            <p className="font-display text-sm text-seeper-white">{dateString}</p>
            <p className="font-body text-sm text-seeper-steel">{greeting}</p>
          </div>
          <Avatar
            src={profile?.avatar_url}
            name={profile?.display_name ?? profile?.full_name}
            size={40}
          />
        </div>
      </div>
    </header>
  )
}
```

- [ ] **Step 3: Create `components/layout/AppShell.tsx`**

```typescript
'use client'
import { useRouter } from 'next/navigation'
import { type ReactNode } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'

interface AppShellProps {
  profile: Profile | null
  children: ReactNode
}

export default function AppShell({ profile, children }: AppShellProps) {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth')
    router.refresh()
  }

  return (
    <div className="flex h-screen bg-seeper-bg overflow-hidden">
      <Sidebar profile={profile} onSignOut={handleSignOut} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header profile={profile} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Verify build passes**

```bash
npm run build
```

Expected: Build succeeds.

- [ ] **Step 5: Commit**

```bash
git add components/layout/
git commit -m "feat: add AppShell layout with collapsible Sidebar and Header"
```

---

## Task 9: Root layout + root page

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Replace `app/layout.tsx`**

```typescript
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'seeper wiki',
  description: 'internal knowledge hub for seeper studio',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-seeper-bg text-seeper-white antialiased">
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Replace `app/page.tsx`**

```typescript
import { redirect } from 'next/navigation'

// Root route — redirect to dashboard (middleware handles auth guard)
export default function RootPage() {
  redirect('/dashboard')
}
```

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx app/page.tsx
git commit -m "feat: add root layout and redirect to dashboard"
```

---

## Task 10: Auth page

**Files:**
- Create: `app/auth/page.tsx`

- [ ] **Step 1: Create `app/auth/page.tsx`**

```typescript
'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { CheckCircle } from 'lucide-react'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-seeper-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative blurred circles */}
      <div
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'rgba(237,105,58,0.08)' }}
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'rgba(176,169,207,0.08)' }}
        aria-hidden="true"
      />

      {/* Login card */}
      <div className="seeper-card w-full max-w-[440px] p-10 relative z-10">
        {/* Wordmark */}
        <div className="text-center mb-8">
          <div className="font-display font-light text-seeper-white text-4xl mb-2">
            seeper<span className="text-plasma">●</span>
          </div>
          <p className="font-body text-seeper-muted text-sm">
            crafting awe &amp; wonder — internal
          </p>
        </div>

        {sent ? (
          /* Success state */
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-plasma/10 flex items-center justify-center">
                <CheckCircle size={32} className="text-plasma" />
              </div>
            </div>
            <h2 className="heading-display text-lg mb-2">Check your email</h2>
            <p className="font-body text-seeper-steel text-sm leading-relaxed">
              We sent a magic link to <span className="text-seeper-white">{email}</span>.
              Click it to sign in — no password needed.
            </p>
          </div>
        ) : (
          /* Login form */
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              id="email"
              type="email"
              label="Email address"
              placeholder="you@seeper.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
              error={error ?? undefined}
            />
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              disabled={loading || !email}
            >
              {loading ? 'Sending…' : 'Send magic link'}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/auth/
git commit -m "feat: build auth page with magic link form and success state"
```

---

## Task 11: Dashboard components

**Files:**
- Create: `components/dashboard/DailyDigest.tsx`
- Create: `components/dashboard/QuickLinks.tsx`
- Create: `components/dashboard/WikiUpdates.tsx`
- Create: `components/dashboard/NewsletterPreview.tsx`
- Create: `components/dashboard/ActivityFeed.tsx`
- Create: `components/dashboard/NewsTicker.tsx`

- [ ] **Step 1: Create `components/dashboard/DailyDigest.tsx`**

```typescript
'use client'
import { useState } from 'react'
import { Sparkles, RotateCcw } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { DIGEST_SOURCES } from '@/lib/constants'
import Badge from '@/components/ui/Badge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface DailyDigestProps {
  content: string
}

export default function DailyDigest({ content: initialContent }: DailyDigestProps) {
  const [content, setContent] = useState(initialContent)
  const [loading, setLoading] = useState(false)

  async function handleRegenerate() {
    setLoading(true)
    try {
      const res = await fetch('/api/digest', { method: 'POST' })
      if (res.ok) {
        const data = await res.json() as { content: string }
        setContent(data.content)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="rounded-3xl p-8 border border-seeper-border shadow-card relative overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at center, #1a1a1a 0%, #0d0d0d 100%)',
        borderLeft: '3px solid #ED693A',
      }}
    >
      {/* Top row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-plasma" />
          <span className="section-label">today&#39;s digest</span>
          <span className="text-seeper-muted text-xs font-body ml-2">{formatDate()}</span>
        </div>
        <button
          onClick={handleRegenerate}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs font-display font-medium text-plasma border border-plasma/30 rounded-full px-3 py-1 hover:bg-plasma/10 transition-colors disabled:opacity-50"
        >
          {loading ? <LoadingSpinner size={12} /> : <RotateCcw size={12} />}
          Regenerate
        </button>
      </div>

      {/* Digest content */}
      <p className="font-body text-seeper-steel leading-relaxed text-sm mb-6">
        {content}
      </p>

      {/* Bottom row */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {DIGEST_SOURCES.map(source => (
            <span
              key={source}
              className="pill-tag"
              style={{ background: 'rgba(176,169,207,0.15)', color: '#B0A9CF' }}
            >
              {source}
            </span>
          ))}
        </div>
        <span
          className="pill-tag text-xs"
          style={{ background: 'rgba(237,105,58,0.1)', color: '#ED693A' }}
        >
          Powered by Claude
        </span>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `components/dashboard/QuickLinks.tsx`**

```typescript
import Link from 'next/link'
import {
  Newspaper, BookOpen, Sparkles, Mail, Wrench, FolderOpen, ArrowRight,
} from 'lucide-react'
import { QUICK_LINKS } from '@/lib/constants'
import { cn } from '@/lib/utils'

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Newspaper, BookOpen, Sparkles, Mail, Wrench, FolderOpen,
}

export default function QuickLinks() {
  return (
    <div className="grid grid-cols-3 xl:grid-cols-6 gap-3">
      {QUICK_LINKS.map(link => {
        const Icon = ICON_MAP[link.icon]
        return (
          <Link
            key={link.href}
            href={link.href}
            className="seeper-card glow-on-hover p-4 flex flex-col items-center gap-3 hover:bg-seeper-raised transition-colors duration-200 group"
          >
            {/* Circular icon */}
            <div
              className={cn(
                'w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0',
                link.accent
              )}
              style={{ opacity: 0.85 }}
            >
              {Icon && <Icon size={22} className="text-seeper-black" />}
            </div>
            <span className="font-display font-semibold text-seeper-white text-sm text-center leading-tight">
              {link.label}
            </span>
            <ArrowRight
              size={14}
              className="text-seeper-muted group-hover:text-plasma transition-colors mt-auto"
            />
          </Link>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 3: Create `components/dashboard/WikiUpdates.tsx`**

```typescript
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { MOCK_WIKI_UPDATES } from '@/lib/constants'
import Avatar from '@/components/ui/Avatar'

// CSS colour values for each category — cannot be derived from Tailwind class strings at runtime
const CATEGORY_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  creative:   { bg: 'rgba(237,105,58,0.2)',  text: '#ED693A', label: 'Creative' },
  tech:       { bg: 'rgba(220,254,173,0.2)', text: '#DCFEAD', label: 'Tech' },
  production: { bg: 'rgba(176,169,207,0.2)', text: '#B0A9CF', label: 'Production' },
  business:   { bg: 'rgba(237,222,92,0.2)',  text: '#EDDE5C', label: 'Business' },
  ai:         { bg: 'rgba(138,203,143,0.2)', text: '#8ACB8F', label: 'AI' },
  general:    { bg: 'rgba(98,98,98,0.2)',    text: '#C3C3C3', label: 'General' },
}

export default function WikiUpdates() {
  return (
    <div className="seeper-card p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="section-label">latest from seeWiki</span>
        <Link
          href="/wiki"
          className="text-plasma text-xs font-display font-medium hover:underline flex items-center gap-1"
        >
          view all <ArrowRight size={12} />
        </Link>
      </div>

      <div className="flex flex-col divide-y divide-seeper-border">
        {MOCK_WIKI_UPDATES.map((item, i) => {
          const style = CATEGORY_STYLES[item.category] ?? CATEGORY_STYLES.general
          return (
            <div
              key={i}
              className="flex items-center gap-3 py-3 rounded-lg hover:bg-seeper-raised px-2 -mx-2 transition-colors cursor-pointer"
            >
              <Avatar name={item.initials} size={32} />
              <span className="font-display font-medium text-seeper-white text-sm flex-1 min-w-0 truncate">
                {item.title}
              </span>
              <span
                className="pill-tag text-xs flex-shrink-0"
                style={{ background: style.bg, color: style.text }}
              >
                {style.label}
              </span>
              <span className="text-seeper-muted text-xs flex-shrink-0">{item.time}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create `components/dashboard/NewsletterPreview.tsx`**

```typescript
import Link from 'next/link'
import { MOCK_NEWSLETTER } from '@/lib/constants'

export default function NewsletterPreview() {
  return (
    <div className="seeper-card p-6 flex flex-col gap-4">
      <span className="section-label">from seeNewsletter</span>

      <div className="flex items-start gap-3">
        <span
          className="pill-tag flex-shrink-0"
          style={{ background: 'rgba(237,105,58,1)', color: '#fff' }}
        >
          Issue {MOCK_NEWSLETTER.issueNumber}
        </span>
        <h3 className="heading-display text-base leading-snug">
          {MOCK_NEWSLETTER.title}
        </h3>
      </div>

      <p className="font-body text-seeper-steel text-sm leading-relaxed line-clamp-2">
        {MOCK_NEWSLETTER.excerpt}
      </p>

      <div className="flex items-center justify-between mt-auto pt-2">
        <span className="text-seeper-muted text-xs font-body">
          {MOCK_NEWSLETTER.publishedAt}
        </span>
        <Link
          href="/newsletter"
          className="text-plasma text-xs font-display font-medium border border-plasma rounded-full px-4 py-1.5 hover:bg-plasma/10 transition-colors"
        >
          Read full issue →
        </Link>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Create `components/dashboard/ActivityFeed.tsx`**

```typescript
import { MOCK_ACTIVITY } from '@/lib/constants'
import Avatar from '@/components/ui/Avatar'

export default function ActivityFeed() {
  return (
    <div className="seeper-card p-6 h-full">
      <span className="section-label mb-4 block">team activity</span>

      <div className="flex flex-col gap-3">
        {MOCK_ACTIVITY.map((item, i) => (
          <div
            key={i}
            className={`flex items-start gap-3 pl-3 border-l-2 ${i === 0 ? 'border-plasma' : 'border-seeper-border'}`}
          >
            <Avatar name={item.initials} size={28} className="flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="font-body text-seeper-steel text-xs leading-snug">
                <span className="text-seeper-white font-medium">{item.name}</span>
                {' '}{item.action}{' '}
                <span className="text-seeper-white font-medium">{item.title}</span>
              </p>
              <p className="text-seeper-muted text-xs mt-0.5">{item.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Create `components/dashboard/NewsTicker.tsx`**

```typescript
import { MOCK_TICKER_HEADLINES } from '@/lib/constants'

export default function NewsTicker() {
  // Duplicate headlines so the scroll loops seamlessly
  const items = [...MOCK_TICKER_HEADLINES, ...MOCK_TICKER_HEADLINES]

  return (
    <div className="h-10 bg-seeper-black border-t border-seeper-border overflow-hidden flex items-center">
      <div className="ticker-track">
        {items.map((headline, i) => (
          <span key={i} className="flex items-center gap-3 pr-8">
            <span className="text-plasma text-xs">●</span>
            <span className="font-body text-seeper-steel text-xs whitespace-nowrap">
              {headline}
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 7: Commit**

```bash
git add components/dashboard/
git commit -m "feat: add all dashboard components (DailyDigest, QuickLinks, WikiUpdates, NewsletterPreview, ActivityFeed, NewsTicker)"
```

---

## Task 12: Dashboard page

**Files:**
- Create: `app/dashboard/page.tsx`

- [ ] **Step 1: Create `app/dashboard/page.tsx`**

```typescript
import { redirect } from 'next/navigation'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { generateDailyDigest } from '@/lib/claude'
import { MOCK_DIGEST, MOCK_TICKER_HEADLINES } from '@/lib/constants'
import AppShell from '@/components/layout/AppShell'
import DailyDigest from '@/components/dashboard/DailyDigest'
import QuickLinks from '@/components/dashboard/QuickLinks'
import WikiUpdates from '@/components/dashboard/WikiUpdates'
import NewsletterPreview from '@/components/dashboard/NewsletterPreview'
import ActivityFeed from '@/components/dashboard/ActivityFeed'
import NewsTicker from '@/components/dashboard/NewsTicker'
import type { Profile } from '@/types'

async function getTodaysDigest(): Promise<string> {
  const today = new Date().toISOString().split('T')[0]

  // Read uses anon client (RLS: authenticated read allowed)
  const anonClient = createClient()
  const { data: cached } = await anonClient
    .from('daily_digest')
    .select('content')
    .eq('date', today)
    .single()

  if (cached?.content) return cached.content

  // Generate via Claude — pass mock headlines in Phase 1 so the API is actually called.
  // Phase 2: replace MOCK_TICKER_HEADLINES with freshly fetched RSS headlines.
  const content = await generateDailyDigest([...MOCK_TICKER_HEADLINES])

  // Write uses service-role client — daily_digest has no authenticated INSERT policy.
  const serviceClient = createServiceClient()
  await serviceClient
    .from('daily_digest')
    .upsert({ content, date: today }, { onConflict: 'date' })

  return content
}

export default async function DashboardPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch today's digest (cached or freshly generated).
  // Falls back to MOCK_DIGEST if Supabase or Claude is unavailable.
  let digestContent = MOCK_DIGEST
  try {
    digestContent = await getTodaysDigest()
  } catch {
    // Use mock digest if anything fails — never break the dashboard
  }

  return (
    <AppShell profile={profile as Profile | null}>
      <div className="flex flex-col min-h-full">
        {/* Main scrollable content */}
        <div className="flex-1 p-8 flex flex-col gap-6 max-w-screen-2xl mx-auto w-full">
          {/* Daily Digest hero */}
          <DailyDigest content={digestContent} />

          {/* Quick links */}
          <QuickLinks />

          {/* Two-column grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[65fr_35fr] gap-6">
            {/* Left column */}
            <div className="flex flex-col gap-6">
              <WikiUpdates />
              <NewsletterPreview />
            </div>

            {/* Right column */}
            <ActivityFeed />
          </div>
        </div>

        {/* News ticker — pinned to bottom of content area */}
        <NewsTicker />
      </div>
    </AppShell>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/dashboard/
git commit -m "feat: build full dashboard page with all 5 sections"
```

---

## Task 13: API routes

**Files:**
- Create: `app/api/digest/route.ts`
- Create: `app/api/summarise/route.ts`
- Create: `app/api/tag/route.ts`

- [ ] **Step 1: Create `app/api/digest/route.ts`**

```typescript
// POST /api/digest — generate and cache today's digest
// Called by the Regenerate button on the dashboard
import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { generateDailyDigest } from '@/lib/claude'
import { MOCK_TICKER_HEADLINES } from '@/lib/constants'

export async function POST() {
  try {
    // Verify the user is authenticated (anon client)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const content = await generateDailyDigest([...MOCK_TICKER_HEADLINES])
    const today = new Date().toISOString().split('T')[0]

    // Write via service-role client — daily_digest has no authenticated INSERT policy
    const serviceClient = createServiceClient()
    await serviceClient
      .from('daily_digest')
      .upsert({ content, date: today }, { onConflict: 'date' })

    return NextResponse.json({ content })
  } catch {
    return NextResponse.json({ error: 'Failed to generate digest' }, { status: 500 })
  }
}
```

- [ ] **Step 2: Create `app/api/summarise/route.ts`**

```typescript
// POST /api/summarise — summarise an article using Claude
// Body: { title: string, content: string }
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { summariseArticle } from '@/lib/claude'

interface SummariseBody {
  title: string
  content: string
}

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json() as SummariseBody
    if (!body.title || !body.content) {
      return NextResponse.json({ error: 'title and content are required' }, { status: 400 })
    }

    const summary = await summariseArticle(body.title, body.content)
    return NextResponse.json({ summary })
  } catch {
    return NextResponse.json({ error: 'Failed to summarise article' }, { status: 500 })
  }
}
```

- [ ] **Step 3: Create `app/api/tag/route.ts`**

```typescript
// POST /api/tag — auto-tag content using Claude
// Body: { title: string, excerpt: string }
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { tagContent } from '@/lib/claude'

interface TagBody {
  title: string
  excerpt: string
}

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json() as TagBody
    if (!body.title || !body.excerpt) {
      return NextResponse.json({ error: 'title and excerpt are required' }, { status: 400 })
    }

    const tags = await tagContent(body.title, body.excerpt)
    return NextResponse.json({ tags })
  } catch {
    return NextResponse.json({ error: 'Failed to tag content' }, { status: 500 })
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add app/api/
git commit -m "feat: add API routes for digest, summarise, and tag"
```

---

## Task 14: Scaffolded component shells + placeholder pages

**Files:**
- Create: `components/wiki/WikiCard.tsx`, `WikiEditor.tsx`, `WikiSearch.tsx`
- Create: `components/news/NewsCard.tsx`, `NewsFilter.tsx`
- Create: `components/prompts/PromptCard.tsx`, `PromptForm.tsx`
- Create: all placeholder page routes

- [ ] **Step 1: Create component shells**

`components/wiki/WikiCard.tsx`:
```typescript
// TODO (Phase 2): build out wiki card component
export default function WikiCard() {
  return <div />
}
```

`components/wiki/WikiEditor.tsx`:
```typescript
// TODO (Phase 2): TipTap rich text editor wrapper
export default function WikiEditor() {
  return <div />
}
```

`components/wiki/WikiSearch.tsx`:
```typescript
// TODO (Phase 2): wiki search with Supabase full-text search
export default function WikiSearch() {
  return <div />
}
```

`components/news/NewsCard.tsx`:
```typescript
// TODO (Phase 2): news article card component
export default function NewsCard() {
  return <div />
}
```

`components/news/NewsFilter.tsx`:
```typescript
// TODO (Phase 2): news category filter
export default function NewsFilter() {
  return <div />
}
```

`components/prompts/PromptCard.tsx`:
```typescript
// TODO (Phase 2): prompt library card with copy + upvote
export default function PromptCard() {
  return <div />
}
```

`components/prompts/PromptForm.tsx`:
```typescript
// TODO (Phase 2): add new prompt form
export default function PromptForm() {
  return <div />
}
```

- [ ] **Step 2: Create a shared placeholder component**

Create `components/ui/PlaceholderPage.tsx`:

```typescript
import CircleDecor from '@/components/ui/CircleDecor'

interface PlaceholderPageProps {
  sectionName: string   // e.g. "seeWiki"
  title: string         // e.g. "Wiki"
  description: string
}

export default function PlaceholderPage({ sectionName, title, description }: PlaceholderPageProps) {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-[60vh] p-8 overflow-hidden">
      {/* Background decorative circles */}
      <CircleDecor size={400} color="stroke-plasma" opacity={0.04} className="absolute -top-20 -right-20" />
      <CircleDecor size={300} color="stroke-quantum" opacity={0.06} className="absolute -bottom-10 -left-10" />

      {/* Section name — large background label */}
      <div
        className="font-display font-bold text-8xl md:text-9xl select-none mb-8 text-center"
        style={{ color: 'rgba(237,105,58,0.07)' }}
        aria-hidden="true"
      >
        {sectionName}
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-lg">
        <h1 className="heading-display text-3xl mb-3">{title}</h1>
        <p className="font-body text-seeper-muted leading-relaxed">{description}</p>
        <div className="mt-6 flex justify-center">
          <span
            className="pill-tag text-sm"
            style={{ background: 'rgba(237,105,58,0.1)', color: '#ED693A' }}
          >
            Coming in Phase 2
          </span>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create all placeholder pages**

For each route below, the pattern is identical — create the file with AppShell + PlaceholderPage.

`app/news/page.tsx`:
```typescript
import AppShell from '@/components/layout/AppShell'
import PlaceholderPage from '@/components/ui/PlaceholderPage'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Profile } from '@/types'

export default async function NewsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  return (
    <AppShell profile={profile as Profile | null}>
      <PlaceholderPage
        sectionName="seeNews"
        title="seeNews"
        description="AI-curated news feed pulling the latest in immersive experiences, XR, AI, and creative technology — relevant to seeper's work."
      />
    </AppShell>
  )
}
```

`app/news/loading.tsx`:
```typescript
import LoadingSpinner from '@/components/ui/LoadingSpinner'
export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoadingSpinner size={32} />
    </div>
  )
}
```

Repeat the same pattern for these routes (adjust `sectionName`, `title`, `description`):

| File | sectionName | title | description |
|---|---|---|---|
| `app/wiki/page.tsx` | `seeWiki` | `seeWiki` | Internal knowledge base for the seeper team. Document processes, guides, project learnings, and studio knowledge. |
| `app/wiki/[slug]/page.tsx` | `seeWiki` | `Wiki Page` | Individual wiki article view with rich text content, tags, and version history. |
| `app/wiki/new/page.tsx` | `seeWiki` | `New Page` | Create a new wiki page with the TipTap rich text editor. |
| `app/wiki/edit/[slug]/page.tsx` | `seeWiki` | `Edit Page` | Edit an existing wiki page. |
| `app/prompts/page.tsx` | `seePrompts` | `seePrompts` | Community prompt library for AI tools. Browse, copy, and contribute prompts for Claude, Midjourney, Runway, and more. |
| `app/newsletter/page.tsx` | `seeNewsletter` | `seeNewsletter` | The seeper team newsletter. Browse back issues and compose new ones. |
| `app/newsletter/[id]/page.tsx` | `seeNewsletter` | `Newsletter Issue` | Read a full newsletter issue. |
| `app/newsletter/new/page.tsx` | `seeNewsletter` | `New Issue` | Compose a new newsletter issue with the TipTap editor. |
| `app/tools/page.tsx` | `seeTools` | `seeTools` | Directory of tools, software, and services used across the studio. |
| `app/resources/page.tsx` | `seeResources` | `seeResources` | Files, links, bookmarks, and shared documents for the seeper team. |
| `app/team/page.tsx` | `seeUs` | `seeUs` | Team directory — profiles, departments, and contact details for everyone at seeper. |
| `app/admin/page.tsx` | `Admin` | `Admin` | Admin panel for managing users, content, and system settings. |
| `app/labs/page.tsx` | `seeLabs` | `seeLabs` | R&D and experimental content from seeper's research lab. |

For dynamic routes (`[slug]`, `[id]`), add a params prop:
```typescript
export default async function Page({ params }: { params: { slug: string } }) {
  // ... auth check same as above
}
```

- [ ] **Step 4: Commit**

```bash
git add components/wiki/ components/news/ components/prompts/ components/ui/PlaceholderPage.tsx app/news/ app/wiki/ app/prompts/ app/newsletter/ app/tools/ app/resources/ app/team/ app/admin/ app/labs/
git commit -m "feat: scaffold all placeholder pages and component shells"
```

---

## Task 15: Database migration

**Files:**
- Create: `supabase/migrations/001_initial.sql`

- [ ] **Step 1: Create migration directory and file**

```bash
mkdir -p "/Users/caitmc/Documents/Experiments/Vibe coding/seeperwiki v1/supabase/migrations"
```

- [ ] **Step 2: Create `supabase/migrations/001_initial.sql`**

```sql
-- seeper wiki — initial database schema
-- Run this via the Supabase dashboard SQL editor or Supabase CLI

-- ============================================================
-- HELPER FUNCTION: is_admin()
-- Used in RLS policies to avoid infinite recursion.
-- Reads profiles.role for the current authenticated user.
-- ============================================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- ============================================================
-- TABLE: profiles
-- Extends auth.users with seeper-specific fields.
-- ============================================================
CREATE TABLE profiles (
  id           UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name    TEXT,
  display_name TEXT,
  role         TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  department   TEXT CHECK (department IN ('creative', 'production', 'tech', 'business', 'operations')),
  avatar_url   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create a profile when a new user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- ============================================================
-- TABLE: wiki_pages
-- ============================================================
CREATE TABLE wiki_pages (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug           TEXT UNIQUE NOT NULL,
  title          TEXT NOT NULL,
  content        TEXT,
  excerpt        TEXT,
  category       TEXT CHECK (category IN ('creative', 'production', 'tech', 'business', 'ai', 'general')),
  tags           TEXT[],
  author_id      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  last_edited_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  views          INTEGER NOT NULL DEFAULT 0,
  published      BOOLEAN NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX wiki_pages_category_idx ON wiki_pages(category);
CREATE INDEX wiki_pages_published_idx ON wiki_pages(published);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER wiki_pages_updated_at
  BEFORE UPDATE ON wiki_pages
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

-- ============================================================
-- TABLE: prompts
-- ============================================================
CREATE TABLE prompts (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title      TEXT NOT NULL,
  content    TEXT NOT NULL,
  category   TEXT CHECK (category IN ('image-gen', 'copy', 'code', 'research', 'video', '3d', 'general')),
  ai_tool    TEXT CHECK (ai_tool IN ('claude', 'midjourney', 'runway', 'sora', 'dalle', 'other')),
  tags       TEXT[],
  upvotes    INTEGER NOT NULL DEFAULT 0,
  author_id  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: newsletter_issues
-- ============================================================
CREATE TABLE newsletter_issues (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title        TEXT NOT NULL,
  content      TEXT,
  issue_number INTEGER,
  published    BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  author_id    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: news_cache
-- Populated by service role only via API routes (Phase 2).
-- ============================================================
CREATE TABLE news_cache (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title        TEXT NOT NULL,
  url          TEXT UNIQUE NOT NULL,
  source       TEXT,
  summary      TEXT,
  category     TEXT,
  published_at TIMESTAMPTZ,
  fetched_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: daily_digest
-- One row per day. Populated by service role from digest API.
-- ============================================================
CREATE TABLE daily_digest (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content      TEXT NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  date         DATE UNIQUE NOT NULL DEFAULT CURRENT_DATE
);

-- ============================================================
-- TABLE: activity_log
-- Phase 1: schema only. Phase 2: event writes added.
-- ============================================================
CREATE TABLE activity_log (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id        UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action         TEXT NOT NULL CHECK (action IN ('created_wiki', 'edited_wiki', 'added_prompt', 'published_newsletter')),
  resource_type  TEXT,
  resource_id    UUID,
  resource_title TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE wiki_pages        ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts           ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_cache        ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_digest      ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log      ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "profiles: authenticated read all"
  ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles: user update own"
  ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- wiki_pages
CREATE POLICY "wiki_pages: authenticated read"
  ON wiki_pages FOR SELECT TO authenticated USING (true);
CREATE POLICY "wiki_pages: authenticated insert"
  ON wiki_pages FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "wiki_pages: owner or admin update"
  ON wiki_pages FOR UPDATE TO authenticated
  USING (auth.uid() = author_id OR is_admin());
CREATE POLICY "wiki_pages: owner or admin delete"
  ON wiki_pages FOR DELETE TO authenticated
  USING (auth.uid() = author_id OR is_admin());

-- prompts
CREATE POLICY "prompts: authenticated read"
  ON prompts FOR SELECT TO authenticated USING (true);
CREATE POLICY "prompts: authenticated insert"
  ON prompts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "prompts: owner or admin update"
  ON prompts FOR UPDATE TO authenticated
  USING (auth.uid() = author_id OR is_admin());
CREATE POLICY "prompts: owner or admin delete"
  ON prompts FOR DELETE TO authenticated
  USING (auth.uid() = author_id OR is_admin());

-- newsletter_issues
CREATE POLICY "newsletter_issues: authenticated read"
  ON newsletter_issues FOR SELECT TO authenticated USING (true);
CREATE POLICY "newsletter_issues: authenticated insert"
  ON newsletter_issues FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "newsletter_issues: owner or admin update"
  ON newsletter_issues FOR UPDATE TO authenticated
  USING (auth.uid() = author_id OR is_admin());
CREATE POLICY "newsletter_issues: owner or admin delete"
  ON newsletter_issues FOR DELETE TO authenticated
  USING (auth.uid() = author_id OR is_admin());

-- news_cache: read-only for authenticated; writes via service role only
CREATE POLICY "news_cache: authenticated read"
  ON news_cache FOR SELECT TO authenticated USING (true);

-- daily_digest: read-only for authenticated; writes via service role only
CREATE POLICY "daily_digest: authenticated read"
  ON daily_digest FOR SELECT TO authenticated USING (true);

-- activity_log
CREATE POLICY "activity_log: authenticated read"
  ON activity_log FOR SELECT TO authenticated USING (true);
CREATE POLICY "activity_log: authenticated insert own"
  ON activity_log FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
```

- [ ] **Step 3: Commit**

```bash
git add supabase/
git commit -m "feat: add initial database migration with all 7 tables and RLS policies"
```

---

## Task 16: Config files

**Files:**
- Create/modify: `.env.local.example`
- Create: `netlify.toml`
- Modify: `next.config.ts`

- [ ] **Step 1: Create `.env.local.example`**

```bash
# Supabase — find these in your Supabase project dashboard under Settings > API
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Anthropic Claude API — https://console.anthropic.com/
# IMPORTANT: never expose this in the browser. Server-side only.
ANTHROPIC_API_KEY=your_anthropic_api_key

# App URL — used as the base for Supabase magic link redirects
# Local: http://localhost:3000
# Production: https://your-netlify-url.netlify.app
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

- [ ] **Step 2: Create `netlify.toml`**

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[build.environment]
  NODE_VERSION = "20"
```

- [ ] **Step 3: Install Netlify Next.js plugin**

```bash
npm install --save-dev @netlify/plugin-nextjs
```

- [ ] **Step 4: Update `next.config.ts`**

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Allow image optimisation from Supabase storage (add your project URL)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

export default nextConfig
```

- [ ] **Step 5: Final build check**

```bash
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 6: Run all tests**

```bash
npm run test:run
```

Expected: All tests pass.

- [ ] **Step 7: Final commit**

```bash
git add .env.local.example netlify.toml next.config.ts package.json package-lock.json
git commit -m "feat: add env template, Netlify config, and Next.js image config"
```

---

## Done — Phase 1 summary

### Fully built
- Auth page with magic link flow + success state
- Auth callback route (Supabase code exchange)
- Root middleware (auth guard — all routes protected)
- AppShell: collapsible Sidebar + Header
- Dashboard: DailyDigest hero, QuickLinks grid, WikiUpdates, NewsletterPreview, ActivityFeed, NewsTicker
- All reusable UI components: Button, Card, Badge, Avatar, Input, Textarea, Modal, CircleDecor, LoadingSpinner
- PlaceholderPage component (shared across all scaffold routes)
- API routes: `/api/digest`, `/api/summarise`, `/api/tag`
- Claude API helpers with fallbacks
- Supabase SSR client/server/middleware setup
- All lib utilities: `cn`, `getGreeting`, `formatDate`, `getInitials`

### Scaffolded (Phase 2)
- seeNews, seeWiki (+ slug/new/edit), seePrompts, seeNewsletter (+ id/new), seeTools, seeResources, seeUs, seeLabs, Admin
- Component shells: WikiCard, WikiEditor, WikiSearch, NewsCard, NewsFilter, PromptCard, PromptForm
- RSS feed (`lib/rss.ts` stub)

### Infrastructure
- Supabase migration with 7 tables + RLS
- `netlify.toml` for Netlify deployment
- `.env.local.example` with all vars documented

---

## To start the dev server

1. Copy env file and fill in your values:
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your Supabase URL, keys, and Anthropic API key
   ```

2. Set the Supabase magic link redirect URL in your Supabase dashboard:
   - Authentication > URL Configuration
   - Add: `http://localhost:3000/auth/callback`

3. Run the migration in your Supabase dashboard SQL editor (paste contents of `supabase/migrations/001_initial.sql`)

4. Start the dev server:
   ```bash
   npm run dev
   ```

## Phase 2 priorities
1. seeWiki — full CRUD with TipTap editor, search, versioning
2. seePrompts — prompt library with upvoting
3. seeNewsletter — issue composer + reader
4. seeNews — RSS ingestion + Claude summaries
5. seeUs — team directory from profiles table
6. Activity logging — real events in activity_log
7. Admin panel — user management
