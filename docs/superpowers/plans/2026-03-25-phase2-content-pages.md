# seeper wiki Phase 2 — Plan B: Content Pages

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Prerequisite:** Plan A (Foundation) must be complete before starting this plan.

**Goal:** Build all six content section pages fully — seeNews, seeWiki (list + page view + editor), seePrompts, seeTools, seeResources, and seeInside — each with mock data, filtering, and interactive features.

**Architecture:** Each section page is a Server Component that passes mock data to a Client Component for interactivity (filtering, upvoting, etc.). Shell components from Phase 1 (`WikiCard`, `WikiEditor`, `NewsCard`, `NewsFilter`, `PromptCard`) are fully implemented here. TipTap is wired up for wiki editing.

**Tech Stack:** Next.js 14 App Router, TypeScript strict, TipTap 3.x, Lucide React, Supabase, Vitest

---

## File Map

**Modify (replace placeholder content):**
- `app/news/page.tsx`
- `app/wiki/page.tsx`
- `app/wiki/[slug]/page.tsx`
- `app/wiki/new/page.tsx`
- `app/wiki/edit/[slug]/page.tsx`
- `app/prompts/page.tsx`
- `app/tools/page.tsx`
- `app/resources/page.tsx`

**Create (new route):**
- `app/inside/page.tsx`

**Implement (replace shells):**
- `components/news/NewsCard.tsx`
- `components/news/NewsFilter.tsx`
- `components/wiki/WikiCard.tsx`
- `components/wiki/WikiEditor.tsx`
- `components/wiki/WikiSearch.tsx`
- `components/prompts/PromptCard.tsx`

**Add mock data to:**
- `lib/constants.ts` (MOCK_NEWS, MOCK_WIKI_PAGES, MOCK_PROMPTS, MOCK_TOOLS, MOCK_RESOURCES, MOCK_SEARCH_ITEMS)

---

## Task 1: Mock data constants

**Files:**
- Modify: `lib/constants.ts`

- [ ] **Step 1: Add all Phase 2 mock data arrays to lib/constants.ts**

Add the following exports (copy verbatim from spec):

```typescript
// MOCK_NEWS — 8 news items (from spec Part 7.5)
export const MOCK_NEWS: NewsItem[] = [
  {
    id: '1',
    title: 'Runway Gen-4 launches with real-time scene consistency for long-form video',
    summary: "The new model handles complex multi-shot sequences without the temporal flickering that plagued Gen-3 — directly relevant to seeper's content pipeline for projection and attraction content. Early tests show 3x improvement in temporal consistency.",
    category: 'AI & ML',
    source: 'The Verge',
    sourceUrl: 'https://theverge.com',
    imageUrl: null,
    publishedAt: '2026-03-25T08:00:00Z',
    tags: ['#ai', '#video', '#tools'],
    upvotes: 14,
    featured: true,
  },
  {
    id: '2',
    title: 'GCC announces $2B immersive experience investment across five entertainment districts',
    summary: "Saudi Arabia's Public Investment Fund has earmarked major capital for experiential design projects — opening significant brief opportunities for studios with proven large-scale attraction experience.",
    category: 'Industry',
    source: 'Dezeen',
    sourceUrl: 'https://dezeen.com',
    imageUrl: null,
    publishedAt: '2026-03-25T06:30:00Z',
    tags: ['#business', '#immersive', '#gcc'],
    upvotes: 31,
    featured: false,
  },
  {
    id: '3',
    title: 'Unreal Engine 5.5 ships with procedural audio tools and improved show control',
    summary: 'New procedural audio nodes simplify the show control pipeline considerably — worth testing against the current Crestron setup on the next attraction build.',
    category: 'Tools',
    source: 'Epic Games Blog',
    sourceUrl: 'https://unrealengine.com',
    imageUrl: null,
    publishedAt: '2026-03-24T14:00:00Z',
    tags: ['#ue5', '#audio', '#production'],
    upvotes: 22,
    featured: false,
  },
  {
    id: '4',
    title: 'Google DeepMind releases open-source spatial audio model with real-time processing',
    summary: 'Supports ambisonics and binaural rendering at latencies compatible with interactive installation requirements. Immediately useful for seeper\'s atmospheric design work.',
    category: 'Spatial Audio',
    source: 'Hugging Face',
    sourceUrl: 'https://huggingface.co',
    imageUrl: null,
    publishedAt: '2026-03-24T10:00:00Z',
    tags: ['#audio', '#ai', '#spatial'],
    upvotes: 9,
    featured: false,
  },
  {
    id: '5',
    title: "SXSW 2026 names immersive experience design the top emerging creative sector",
    summary: "Three of the Tribeca Immersive shortlist's top five finalists use projection mapping techniques. Industry momentum is at an all-time high heading into the second half of 2026.",
    category: 'Industry',
    source: 'Creative Applications',
    sourceUrl: 'https://creativeapplications.net',
    imageUrl: null,
    publishedAt: '2026-03-23T16:00:00Z',
    tags: ['#industry', '#immersive', '#events'],
    upvotes: 18,
    featured: false,
  },
  {
    id: '6',
    title: "Meta Orion AR glasses enter public beta with surprisingly capable pass-through display",
    summary: "Relevant to seeper's interactive character work. The display achieves 70° FOV with colour pass-through at a wearable form factor — a genuine step change from previous AR hardware.",
    category: 'Spatial Computing',
    source: 'The Verge',
    sourceUrl: 'https://theverge.com',
    imageUrl: null,
    publishedAt: '2026-03-23T09:00:00Z',
    tags: ['#ar', '#xr', '#hardware'],
    upvotes: 27,
    featured: false,
  },
  {
    id: '7',
    title: 'TouchDesigner 2026 update adds native Notch integration and improved GPU instancing',
    summary: "The update dramatically simplifies the TouchDesigner-Notch pipeline that seeper uses for generative content. GPU instancing improvements mean 40% better performance on particle-heavy scenes.",
    category: 'Tools',
    source: 'Derivative Blog',
    sourceUrl: 'https://derivative.ca',
    imageUrl: null,
    publishedAt: '2026-03-22T12:00:00Z',
    tags: ['#tools', '#touchdesigner', '#production'],
    upvotes: 33,
    featured: false,
  },
  {
    id: '8',
    title: 'Anthropic releases Claude extended thinking mode for complex multi-step reasoning',
    summary: 'Shows promising results for complex production planning tasks — worth testing for concept development phases. Handles multi-constraint brief analysis significantly better than standard mode.',
    category: 'AI & ML',
    source: 'Anthropic Blog',
    sourceUrl: 'https://anthropic.com',
    imageUrl: null,
    publishedAt: '2026-03-22T08:00:00Z',
    tags: ['#ai', '#claude', '#tools'],
    upvotes: 19,
    featured: false,
  },
]
// TODO: Replace with live RSS ingestion from:
// - https://www.theverge.com/rss/index.xml
// - https://creativeapplications.net/feed
// - https://huggingface.co/blog/feed.xml
// - https://www.dezeen.com/feed/
// Summarise each article using Claude API (/api/summarise)
// Auto-tag using Claude API (/api/tag)
// Cache in news_cache table, refresh every 6 hours via cron
```

```typescript
// MOCK_WIKI_PAGES — 6 pages (from spec Part 8.4)
export const MOCK_WIKI_PAGES = [
  {
    slug: 'ue5-pipeline-guide',
    title: 'Unreal Engine 5 — seeper Pipeline Guide',
    category: 'tech',
    author: 'Chris Brown',
    authorInitials: 'CB',
    excerpt: "The definitive guide to seeper's UE5 workflow for attractions and brand experiences. Covers project setup, Lumen lighting, Nanite meshes, and show control integration.",
    views: 142,
    updatedAt: '2026-03-25T10:00:00Z',
    tags: ['#ue5', '#production', '#tech'],
  },
  {
    slug: 'midjourney-concept-tips',
    title: 'AI Image Generation — Midjourney Tips for Concept Work',
    category: 'ai',
    author: 'Caitriona McAllister',
    authorInitials: 'CM',
    excerpt: 'How seeper uses Midjourney for rapid concept visualisation. Includes our best prompting frameworks for immersive environments, lighting moods, and client-ready imagery.',
    views: 98,
    updatedAt: '2026-03-25T07:00:00Z',
    tags: ['#ai', '#creative', '#midjourney'],
  },
  {
    slug: 'client-brief-template-attractions',
    title: 'Client Brief Template — Attractions Sector',
    category: 'business',
    author: 'Lauren Rose',
    authorInitials: 'LR',
    excerpt: 'Standard brief intake template for visitor attraction projects. Covers scope, technical requirements, visitor demographics, KPIs, and delivery milestones.',
    views: 87,
    updatedAt: '2026-03-24T15:00:00Z',
    tags: ['#business', '#client', '#workflow'],
  },
  {
    slug: 'show-control-comparison',
    title: 'Show Control Systems — Crestron vs Medialon vs Alcorn McBride',
    category: 'production',
    author: 'Tom K',
    authorInitials: 'TK',
    excerpt: 'Comprehensive comparison of the three show control systems seeper uses most. Decision matrix for which to recommend based on project type, budget, and client requirements.',
    views: 203,
    updatedAt: '2026-03-23T09:00:00Z',
    tags: ['#production', '#show-control', '#tech'],
  },
  {
    slug: 'creative-direction-moodboards',
    title: 'Creative Direction — Mood Board Process and Toolkit',
    category: 'creative',
    author: 'James W',
    authorInitials: 'JW',
    excerpt: 'How the creative team builds mood boards at seeper. Includes tool recommendations, reference sourcing, presentation format, and how to align mood boards with technical constraints.',
    views: 76,
    updatedAt: '2026-03-22T14:00:00Z',
    tags: ['#creative', '#process', '#workflow'],
  },
  {
    slug: 'projection-mapping-surfaces',
    title: 'Projection Mapping — Surface Types and Technical Constraints',
    category: 'tech',
    author: 'Chris Brown',
    authorInitials: 'CB',
    excerpt: 'Technical guide to projection surfaces: curved, flat, irregular, and 3D object mapping. Covers throw ratios, lumen requirements, blending, and common pitfalls.',
    views: 119,
    updatedAt: '2026-03-21T11:00:00Z',
    tags: ['#projection', '#tech', '#production'],
  },
]
```

```typescript
// MOCK_PROMPTS — 5 prompts (from spec Part 9.3)
export const MOCK_PROMPTS = [
  {
    id: '1',
    title: 'Immersive Concept Visualiser v3',
    content: 'You are a creative director at a world-class immersive experience studio. Generate a detailed visual concept for [PROJECT BRIEF] that combines [TECHNOLOGY] with [NARRATIVE THEME]. Include: mood and atmosphere description, colour palette rationale, key interaction moments, visitor journey arc, and the single most surprising "wow" moment. Format as a structured creative brief.',
    category: 'concept',
    aiTool: 'Claude',
    tags: ['#concept', '#ideation', '#creative'],
    upvotes: 47,
    copies: 23,
    authorName: 'Caitriona McAllister',
    authorInitials: 'CM',
    createdAt: '2026-03-25T04:00:00Z',
  },
  {
    id: '2',
    title: 'Projection Mapping Brief Analyser',
    content: 'Analyse this client brief for a projection mapping installation: [PASTE BRIEF HERE]. Return a structured analysis covering: 1) Technical requirements and complexity rating (1-10), 2) Creative risks and mitigation strategies, 3) Recommended mapping software (Resolume/MadMapper/Notch) with justification, 4) Three concept directions at different budget tiers (£50k / £150k / £500k), 5) Key questions to ask the client before proceeding.',
    category: 'production',
    aiTool: 'Claude',
    tags: ['#production', '#technical', '#projection'],
    upvotes: 31,
    copies: 18,
    authorName: 'Tom K',
    authorInitials: 'TK',
    createdAt: '2026-03-23T09:00:00Z',
  },
  {
    id: '3',
    title: 'Atmospheric Sound Design Brief Generator',
    content: 'Create a detailed sound design brief for an immersive installation with these characteristics: Space: [DESCRIPTION], Visitor flow: [JOURNEY], Emotional target: [FEELING]. Return: zone-by-zone audio strategy, key sonic moments and triggers, recommended tools (Ableton/Max MSP/Wwise), technical spec for speaker placement, and three reference tracks or artists that capture the intended atmosphere.',
    category: 'audio',
    aiTool: 'Claude',
    tags: ['#audio', '#atmosphere', '#production'],
    upvotes: 18,
    copies: 9,
    authorName: 'James W',
    authorInitials: 'JW',
    createdAt: '2026-03-22T14:00:00Z',
  },
  {
    id: '4',
    title: 'Midjourney Immersive Environment Prompt Framework',
    content: '/imagine prompt: [ENVIRONMENT TYPE] immersive experience installation, [LIGHTING MOOD] lighting, [COLOUR PALETTE], visitors experiencing [EMOTIONAL STATE], [TECHNICAL ELEMENT e.g. projection mapping / LED / holographic], award-winning experiential design, cinematic, 8k, shot on [CAMERA], [ASPECT RATIO] --v 6.1 --style raw --stylize 750',
    category: 'concept',
    aiTool: 'Midjourney',
    tags: ['#concept', '#midjourney', '#creative', '#imaging'],
    upvotes: 62,
    copies: 41,
    authorName: 'Caitriona McAllister',
    authorInitials: 'CM',
    createdAt: '2026-03-20T10:00:00Z',
  },
  {
    id: '5',
    title: 'Client Proposal Executive Summary Writer',
    content: 'Write a compelling executive summary for a client proposal for [CLIENT NAME] for a [PROJECT TYPE] at [VENUE/LOCATION]. The project budget is [BUDGET]. Key experience goals: [GOALS]. Our proposed approach: [APPROACH]. Write in a confident, creative but professional tone. Max 250 words. Include one powerful opening statement, three key differentiators, and a single memorable closing line.',
    category: 'copy',
    aiTool: 'Claude',
    tags: ['#copy', '#business', '#client', '#proposals'],
    upvotes: 24,
    copies: 15,
    authorName: 'Lauren Rose',
    authorInitials: 'LR',
    createdAt: '2026-03-19T16:00:00Z',
  },
]
```

```typescript
// MOCK_TOOLS — 9 tools (from spec Part 10.3)
export const MOCK_TOOLS = [
  { id:'1', name:'Unreal Engine 5', category:'tech',
    description:"Real-time 3D engine for interactive attractions, projection content, and XR experiences. seeper's primary rendering pipeline.",
    users:['CB','CM','TK'], licence:'Free / Revenue share', version:'5.5',
    url:'https://unrealengine.com', upvotes:28 },
  { id:'2', name:'TouchDesigner', category:'production',
    description:'Node-based visual development for interactive real-time projects. Used for generative content, sensor integration, and show control.',
    users:['TK','JW','CB'], licence:'Commercial', version:'2026.1',
    url:'https://derivative.ca', upvotes:34 },
  { id:'3', name:'Resolume Avenue', category:'production',
    description:'VJ software and projection mapping tool. Primary platform for mapping setup, blending, and media server management.',
    users:['TK','CB'], licence:'Commercial', version:'7.18',
    url:'https://resolume.com', upvotes:21 },
  { id:'4', name:'Midjourney', category:'creative',
    description:'AI image generation for rapid concept visualisation. Best for mood boards, environmental concepts, and client-facing previsualisations.',
    users:['CM','LR','JW','SM'], licence:'Subscription', version:'v6.1',
    url:'https://midjourney.com', upvotes:45 },
  { id:'5', name:'Adobe After Effects', category:'creative',
    description:'Motion graphics, VFX, and compositing. Used for attraction content, brand animations, and pre-vis.',
    users:['JW','CM','LR'], licence:'Creative Cloud', version:'2026',
    url:'https://adobe.com', upvotes:19 },
  { id:'6', name:'Notch', category:'production',
    description:'Real-time visual effects and motion graphics for live events and installations. Integrates with TouchDesigner and Resolume.',
    users:['TK','CB'], licence:'Commercial', version:'0.9.24',
    url:'https://notch.one', upvotes:17 },
  { id:'7', name:'Claude (Anthropic)', category:'tech',
    description:"AI assistant for brief analysis, concept development, copy writing, code assistance, and research. seeper's primary AI tool.",
    users:['SM','CM','LR','CB','TK'], licence:'API / Team plan', version:'Sonnet 4',
    url:'https://claude.ai', upvotes:38 },
  { id:'8', name:'Crestron', category:'production',
    description:'Show control and building automation system. Used for complex multi-room attraction control, lighting integration, and visitor triggers.',
    users:['TK'], licence:'Hardware + Software', version:'4-Series',
    url:'https://crestron.com', upvotes:12 },
  { id:'9', name:'Asana', category:'management',
    description:'Project management and task tracking. All seeper projects tracked here from brief to delivery.',
    users:['SM','LR','CM','JW','CB','TK'], licence:'Business plan', version:'Current',
    url:'https://asana.com', upvotes:16 },
]
```

```typescript
// MOCK_RESOURCES — 6 resources (from spec Part 11.3)
export const MOCK_RESOURCES = [
  { id:'1', title:'seeper Brand Guidelines 2024', type:'PDF',
    category:'Brand Assets',
    description:'Full brand guidelines including colour palette, typography, logo usage, and design language.',
    addedBy:'Stuart McKenna', initials:'SM', date:'2024-09-01', upvotes:22, url:'#' },
  { id:'2', title:'Attractions Sector Brief Template', type:'DOC',
    category:'Templates',
    description:'Standard client intake template for visitor attraction projects. Covers all key project parameters.',
    addedBy:'Lauren Rose', initials:'LR', date:'2026-02-14', upvotes:18, url:'#' },
  { id:'3', title:"seeper Showreel 2025", type:'Video',
    category:'Brand Assets',
    description:"Latest showreel covering Shrek's Adventure, Dewar's Distillery, and the Netflix fan experience.",
    addedBy:'Stuart McKenna', initials:'SM', date:'2025-12-01', upvotes:41, url:'#' },
  { id:'4', title:'GCC Market Research — Immersive Entertainment 2026', type:'PDF',
    category:'Research',
    description:'Comprehensive overview of the GCC immersive experience market, key players, and brief opportunities for 2026.',
    addedBy:'Caitriona McAllister', initials:'CM', date:'2026-03-10', upvotes:29, url:'#' },
  { id:'5', title:'Projection Mapping Surface Calculator', type:'Link',
    category:'Tools',
    description:'Online tool for calculating throw distances, lumen requirements, and blending zones for projection installations.',
    addedBy:'Tom K', initials:'TK', date:'2026-01-20', upvotes:33, url:'#' },
  { id:'6', title:'seeper Rate Card 2026', type:'DOC',
    category:'Documents',
    description:'Current day rates and project pricing framework. Internal use only.',
    addedBy:'Stuart McKenna', initials:'SM', date:'2026-01-01', upvotes:7, url:'#' },
]
```

```typescript
// MOCK_SEARCH_ITEMS — combines wiki, news, prompts for global search
// (Build from above arrays — section + href mapping)
// IMPORTANT: This array must be placed AFTER MOCK_WIKI_PAGES, MOCK_NEWS, and MOCK_PROMPTS
// in constants.ts. It references those arrays via spread, so they must be declared first
// or you will get a ReferenceError at runtime.
export const MOCK_SEARCH_ITEMS: SearchableItem[] = [
  ...MOCK_WIKI_PAGES.map(p => ({
    id: p.slug,
    title: p.title,
    description: p.excerpt,
    tags: p.tags,
    section: 'seeWiki',
    sectionColor: '#B0A9CF',
    href: `/wiki/${p.slug}`,
    category: p.category,
    author: p.author,
    excerpt: p.excerpt,
  })),
  ...MOCK_NEWS.map(n => ({
    id: n.id,
    title: n.title,
    description: n.summary,
    tags: n.tags,
    section: 'seeNews',
    sectionColor: '#ED693A',
    href: '/news',
    category: n.category,
    author: n.source,
    excerpt: n.summary,
  })),
  ...MOCK_PROMPTS.map(p => ({
    id: p.id,
    title: p.title,
    description: p.content.slice(0, 120),
    tags: p.tags,
    section: 'seePrompts',
    sectionColor: '#EDDE5C',
    href: '/prompts',
    category: p.category,
    author: p.authorName,
    excerpt: p.content.slice(0, 120),
  })),
]
```

- [ ] **Step 2: Run build to verify types**

```bash
npm run build
```

Expected: Clean.

- [ ] **Step 3: Commit**

```bash
git add lib/constants.ts
git commit -m "feat: add Phase 2 mock data to constants"
```

---

## Task 2: seeNews page

**Files:**
- Modify: `app/news/page.tsx`
- Implement: `components/news/NewsCard.tsx`
- Implement: `components/news/NewsFilter.tsx`

- [ ] **Step 1: Implement NewsFilter component**

```typescript
// components/news/NewsFilter.tsx
'use client'

import { cn } from '@/lib/utils'

const FILTERS = ['All','AI & ML','Immersive','Tools','Spatial','Industry','Creative Tech','Events','Latest (24h)']

interface NewsFilterProps {
  active: string[]
  onToggle: (f: string) => void
  count: number
  search: string
  onSearch: (v: string) => void
}

export function NewsFilter({ active, onToggle, count, search, onSearch }: NewsFilterProps) {
  return (
    <div className="sticky top-0 z-10 bg-[var(--color-bg)] border-b border-seeper-border/40 pb-3 pt-3">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex gap-1.5 overflow-x-auto flex-1">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => onToggle(f)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs whitespace-nowrap border transition-all duration-150',
                active.includes(f)
                  ? 'border-plasma bg-plasma/10 text-plasma'
                  : 'border-seeper-border/40 text-[var(--color-subtext)] hover:border-seeper-border'
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={search}
          onChange={e => onSearch(e.target.value)}
          placeholder="Search news..."
          className="w-[180px] bg-[var(--color-raised)] border border-seeper-border/40 rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-plasma/60"
        />
      </div>
      <p className="text-xs text-[var(--color-muted)]">{count} stories</p>
    </div>
  )
}
```

- [ ] **Step 2: Implement NewsCard component**

```typescript
// components/news/NewsCard.tsx
'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { NewsItem } from '@/types'

// Category colour mapping
const CATEGORY_COLORS: Record<string, string> = {
  'AI & ML': '#B0A9CF',
  'Industry': '#ED693A',
  'Tools': '#DCFEAD',
  'Spatial Audio': '#8ACB8F',
  'Spatial Computing': '#7F77DD',
  'Creative Tech': '#EDDE5C',
}

interface NewsCardProps {
  item: NewsItem
  featured?: boolean
}

export function NewsCard({ item, featured = false }: NewsCardProps) {
  // localStorage-backed vote state
  const storageKey = `seeper-news-votes`
  const getVoted = () => {
    if (typeof window === 'undefined') return false
    const stored = JSON.parse(localStorage.getItem(storageKey) ?? '[]') as string[]
    return stored.includes(item.id)
  }

  const [upvotes, setUpvotes] = useState(item.upvotes)
  const [voted, setVoted] = useState(() => getVoted())
  const [popping, setPopping] = useState(false)

  const handleUpvote = () => {
    const stored = JSON.parse(localStorage.getItem(storageKey) ?? '[]') as string[]
    if (voted) {
      setUpvotes(p => p - 1)
      setVoted(false)
      localStorage.setItem(storageKey, JSON.stringify(stored.filter((id: string) => id !== item.id)))
    } else {
      setUpvotes(p => p + 1)
      setVoted(true)
      setPopping(true)
      setTimeout(() => setPopping(false), 300)
      localStorage.setItem(storageKey, JSON.stringify([...stored, item.id]))
    }
  }

  const categoryColor = CATEGORY_COLORS[item.category] ?? '#ED693A'

  return (
    <div className={cn(
      'seeper-card p-4 flex flex-col gap-3 transition-transform duration-150 hover:-translate-y-0.5',
      featured && 'col-span-2'
    )}>
      {/* Category */}
      <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: categoryColor }}>
        {item.category}
        {featured && (
          <span className="ml-2 px-1.5 py-0.5 rounded-full text-white text-[9px]" style={{ background: '#ED693A' }}>
            Featured
          </span>
        )}
      </span>

      {/* Title */}
      <h3 className={cn(
        'font-bold leading-snug line-clamp-2',
        featured ? 'text-base' : 'text-sm'
      )}>
        {item.title}
      </h3>

      {/* Image placeholder */}
      <div className={cn(
        'rounded-xl bg-[var(--color-raised)] flex items-center justify-center overflow-hidden',
        featured ? 'h-[200px]' : 'h-[120px]'
      )}>
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="text-xs text-[var(--color-muted)]">{item.category}</span>
        )}
      </div>

      {/* Summary */}
      <p className={cn(
        'text-[11px] text-[var(--color-subtext)] leading-relaxed',
        featured ? 'line-clamp-5' : 'line-clamp-3'
      )}>
        {item.summary}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-1">
        <div className="flex items-center gap-2 text-[10px] text-[var(--color-muted)]">
          <span className="px-2 py-0.5 rounded-full bg-[var(--color-raised)]">{item.source}</span>
          <span>·</span>
          <span>{new Date(item.publishedAt).toLocaleDateString('en-GB', { day:'numeric', month:'short' })}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[var(--color-muted)] px-1.5 py-0.5 rounded-full border border-seeper-border/40">anon ok</span>
          <button
            onClick={handleUpvote}
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-full text-xs border transition-all duration-150 active:scale-[0.95]',
              voted
                ? 'border-plasma text-plasma bg-plasma/10'
                : 'border-seeper-border/40 text-[var(--color-muted)] hover:border-plasma/60 hover:text-plasma'
            )}
          >
            ▲ <span className={cn(popping && 'upvote-pop')}>{upvotes}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Build seeNews page**

```typescript
// app/news/page.tsx
import AppShell from '@/components/layout/AppShell'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Profile } from '@/types'
import { NewsPageClient } from './NewsPageClient'

export default async function NewsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')
  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  return (
    <AppShell profile={profile as Profile | null}>
      <NewsPageClient />
    </AppShell>
  )
}
```

Create `app/news/NewsPageClient.tsx` as a `'use client'` component:
- Renders page header "seeNews" with `color: var(--color-news)`
- Imports `MOCK_NEWS` from constants
- Uses `NewsFilter` for filtering
- Uses `NewsCard` for each item
- Featured item (first item with `featured: true`) spans full width
- Rest are 2-column masonry grid

```typescript
// app/news/NewsPageClient.tsx
'use client'

import { useState, useMemo } from 'react'
import { MOCK_NEWS } from '@/lib/constants'
import { NewsCard } from '@/components/news/NewsCard'
import { NewsFilter } from '@/components/news/NewsFilter'

export function NewsPageClient() {
  const [activeFilters, setActiveFilters] = useState(['All'])
  const [search, setSearch] = useState('')

  const toggleFilter = (f: string) => {
    if (f === 'All') { setActiveFilters(['All']); return }
    setActiveFilters(prev => {
      const next = prev.includes(f)
        ? prev.filter(x => x !== f)
        : [...prev.filter(x => x !== 'All'), f]
      return next.length === 0 ? ['All'] : next
    })
  }

  const filtered = useMemo(() => {
    return MOCK_NEWS.filter(item => {
      const matchesFilter =
        activeFilters.includes('All') ||
        activeFilters.some(f => {
          if (f === 'Latest (24h)') {
            const age = Date.now() - new Date(item.publishedAt).getTime()
            return age < 86400000
          }
          return item.category.toLowerCase() === f.toLowerCase() ||
                 item.tags.some(t => t.toLowerCase().includes(f.toLowerCase()))
        })
      const matchesSearch =
        !search.trim() ||
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.summary.toLowerCase().includes(search.toLowerCase()) ||
        item.source.toLowerCase().includes(search.toLowerCase())
      return matchesFilter && matchesSearch
    })
  }, [activeFilters, search])

  const featured = filtered.find(i => i.featured)
  const rest = filtered.filter(i => !i.featured)

  return (
    <div className="page-enter">
      <div className="mb-6">
        <h1 className="text-xl font-black" style={{ color: 'var(--color-news)' }}>seeNews</h1>
        <p className="text-xs text-[var(--color-muted)] mt-1">AI-curated, updated daily</p>
      </div>

      <NewsFilter
        active={activeFilters}
        onToggle={toggleFilter}
        count={filtered.length}
        search={search}
        onSearch={setSearch}
      />

      <div className="mt-4 grid grid-cols-2 gap-4">
        {featured && <NewsCard key={featured.id} item={featured} featured />}
        {rest.map(item => <NewsCard key={item.id} item={item} />)}
        {filtered.length === 0 && (
          <div className="col-span-2 py-16 text-center">
            <div className="w-16 h-16 rounded-full border-2 border-seeper-border/40 mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl text-[var(--color-muted)]">◉</span>
            </div>
            <p className="text-[var(--color-muted)] text-sm">Nothing here yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Build**

```bash
npm run build
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: build seeNews page with filtering, cards, and anonymous upvoting"
```

---

## Task 3: seeWiki pages

**Files:**
- Modify: `app/wiki/page.tsx`
- Modify: `app/wiki/[slug]/page.tsx`
- Modify: `app/wiki/new/page.tsx`
- Modify: `app/wiki/edit/[slug]/page.tsx`
- Implement: `components/wiki/WikiCard.tsx`
- Implement: `components/wiki/WikiEditor.tsx`
- Implement: `components/wiki/WikiSearch.tsx`

- [ ] **Step 1: Implement WikiCard**

```typescript
// components/wiki/WikiCard.tsx
import Link from 'next/link'
import { Avatar } from '@/components/ui/Avatar'
import { cn } from '@/lib/utils'

const CATEGORY_COLORS: Record<string, string> = {
  tech: '#B0A9CF',
  ai: '#7F77DD',
  business: '#EDDE5C',
  production: '#DCFEAD',
  creative: '#D4537E',
  general: '#ED693A',
}

interface WikiCardProps {
  slug: string
  title: string
  category: string
  author: string
  authorInitials: string
  excerpt: string
  views: number
  updatedAt: string
  tags: string[]
}

export function WikiCard({ slug, title, category, author, authorInitials, excerpt, views, updatedAt, tags }: WikiCardProps) {
  const color = CATEGORY_COLORS[category] ?? '#ED693A'
  return (
    <Link
      href={`/wiki/${slug}`}
      className="flex items-start gap-4 py-4 px-3 rounded-xl hover:bg-[var(--color-raised)] transition-colors group border-l-2"
      style={{ borderLeftColor: `${color}60` }}
    >
      <Avatar name={author} size={32} style={{ backgroundColor: color }} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-bold text-sm group-hover:text-plasma transition-colors truncate">{title}</h3>
          <span
            className="px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider flex-shrink-0"
            style={{ color, background: `${color}1a` }}
          >
            {category}
          </span>
        </div>
        <p className="text-[11px] text-[var(--color-subtext)] line-clamp-2 mb-1.5">{excerpt}</p>
        <div className="flex items-center gap-2 text-[10px] text-[var(--color-muted)]">
          <span>{author}</span>
          <span>·</span>
          <span>{new Date(updatedAt).toLocaleDateString('en-GB', { day:'numeric', month:'short' })}</span>
          <span>·</span>
          <span>{views} views</span>
        </div>
      </div>
    </Link>
  )
}
```

- [ ] **Step 2: Build seeWiki home page**

```typescript
// app/wiki/page.tsx
import AppShell from '@/components/layout/AppShell'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Profile } from '@/types'
import { WikiPageClient } from './WikiPageClient'

export default async function WikiPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')
  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()
  return (
    <AppShell profile={profile as Profile | null}>
      <WikiPageClient />
    </AppShell>
  )
}
```

Create `app/wiki/WikiPageClient.tsx`:
- Header "seeWiki" in `--color-wiki`
- Full-width search bar
- Category tabs: All | Creative | Production | Tech | Business | AI | Onboarding
- Two-column layout: 65% wiki list, 35% sidebar (most viewed + recently updated)
- Uses `WikiCard` for each page
- Filter by category with tab buttons

- [ ] **Step 3: Build wiki page view**

`app/wiki/[slug]/page.tsx` — server component that looks up the slug in `MOCK_WIKI_PAGES`, renders full content:

```typescript
import AppShell from '@/components/layout/AppShell'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { MOCK_WIKI_PAGES } from '@/lib/constants'
import type { Profile } from '@/types'
import Link from 'next/link'
import { Avatar } from '@/components/ui/Avatar'

export default async function WikiSlugPage({ params }: { params: { slug: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')
  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  const page = MOCK_WIKI_PAGES.find(p => p.slug === params.slug)
  if (!page) notFound()

  const related = MOCK_WIKI_PAGES
    .filter(p => p.category === page.category && p.slug !== page.slug)
    .slice(0, 3)

  return (
    <AppShell profile={profile as Profile | null}>
      <div className="max-w-4xl mx-auto page-enter">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[var(--color-muted)] mb-6">
          <Link href="/wiki" className="hover:text-[var(--color-text)]">seeWiki</Link>
          <span>›</span>
          <span className="capitalize">{page.category}</span>
          <span>›</span>
          <span className="text-[var(--color-text)]">{page.title}</span>
        </nav>

        <div className="flex gap-8">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-black mb-4" style={{ color: 'var(--color-wiki)' }}>
              {page.title}
            </h1>
            {/* Meta row */}
            <div className="flex items-center gap-3 mb-6 text-xs text-[var(--color-muted)]">
              <Avatar name={page.author} size={24} />
              <span>{page.author}</span>
              <span>·</span>
              <span>Updated {new Date(page.updatedAt).toLocaleDateString('en-GB')}</span>
              <span>·</span>
              <span>{page.views} views</span>
            </div>
            {/* Content */}
            <div className="prose prose-sm prose-invert max-w-none">
              <p className="text-[var(--color-subtext)] leading-relaxed">{page.excerpt}</p>
              <p className="text-[var(--color-muted)] text-xs mt-8 italic">
                Full page content will be loaded from the database in a future update.
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-56 flex-shrink-0 space-y-6">
            <div>
              <h4 className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider mb-3">
                Related pages
              </h4>
              {related.map(r => (
                <Link
                  key={r.slug}
                  href={`/wiki/${r.slug}`}
                  className="block text-xs py-2 border-b border-seeper-border/40 hover:text-plasma transition-colors"
                >
                  {r.title}
                </Link>
              ))}
            </div>
            <div className="flex flex-col gap-2">
              <Link
                href={`/wiki/edit/${page.slug}`}
                className="text-center py-2 px-4 rounded-lg border border-seeper-border/40 text-xs hover:border-quantum/60 transition-colors"
              >
                Edit page
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
```

- [ ] **Step 4: Implement WikiEditor with TipTap**

```typescript
// components/wiki/WikiEditor.tsx
'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { cn } from '@/lib/utils'

interface WikiEditorProps {
  content?: string
  onChange?: (html: string) => void
  placeholder?: string
}

const TOOLBAR_BUTTONS = [
  { label: 'B',   action: (e: ReturnType<typeof useEditor>) => e?.chain().focus().toggleBold().run(),        active: (e: ReturnType<typeof useEditor>) => e?.isActive('bold') ?? false },
  { label: 'I',   action: (e: ReturnType<typeof useEditor>) => e?.chain().focus().toggleItalic().run(),      active: (e: ReturnType<typeof useEditor>) => e?.isActive('italic') ?? false },
  { label: 'H1',  action: (e: ReturnType<typeof useEditor>) => e?.chain().focus().toggleHeading({ level: 1 }).run(), active: (e: ReturnType<typeof useEditor>) => e?.isActive('heading', { level: 1 }) ?? false },
  { label: 'H2',  action: (e: ReturnType<typeof useEditor>) => e?.chain().focus().toggleHeading({ level: 2 }).run(), active: (e: ReturnType<typeof useEditor>) => e?.isActive('heading', { level: 2 }) ?? false },
  { label: '• ',  action: (e: ReturnType<typeof useEditor>) => e?.chain().focus().toggleBulletList().run(),   active: (e: ReturnType<typeof useEditor>) => e?.isActive('bulletList') ?? false },
  { label: '1.',  action: (e: ReturnType<typeof useEditor>) => e?.chain().focus().toggleOrderedList().run(),  active: (e: ReturnType<typeof useEditor>) => e?.isActive('orderedList') ?? false },
  { label: '"',   action: (e: ReturnType<typeof useEditor>) => e?.chain().focus().toggleBlockquote().run(),   active: (e: ReturnType<typeof useEditor>) => e?.isActive('blockquote') ?? false },
  { label: '</>',  action: (e: ReturnType<typeof useEditor>) => e?.chain().focus().toggleCodeBlock().run(),   active: (e: ReturnType<typeof useEditor>) => e?.isActive('codeBlock') ?? false },
]

export function WikiEditor({ content = '', onChange, placeholder = 'Start writing…' }: WikiEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder }),
    ],
    content,
    onUpdate: ({ editor: e }) => onChange?.(e.getHTML()),
  })

  return (
    <div className="border border-seeper-border/40 rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-seeper-border/40 bg-[var(--color-raised)] flex-wrap">
        {TOOLBAR_BUTTONS.map(btn => (
          <button
            key={btn.label}
            type="button"
            onClick={() => btn.action(editor)}
            className={cn(
              'px-2 py-1 rounded text-xs font-mono transition-all duration-150',
              btn.active(editor)
                ? 'bg-plasma text-white'
                : 'text-[var(--color-subtext)] hover:bg-[var(--color-surface)]'
            )}
          >
            {btn.label}
          </button>
        ))}
      </div>
      {/* Editor */}
      <EditorContent
        editor={editor}
        className="prose prose-sm prose-invert max-w-none p-4 min-h-[300px] focus:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[280px]"
      />
    </div>
  )
}
```

- [ ] **Step 5: Build wiki new/edit pages**

`app/wiki/new/page.tsx` — full editor page with:
- Title input (large, DM Sans)
- WikiEditor component
- Right sidebar: category selector, tags input, excerpt, publish toggle, save button
- On save: upsert to `wiki_pages` table via Supabase (slug auto-generated from title)

`app/wiki/edit/[slug]/page.tsx` — same layout, pre-populated from slug lookup.

Key save logic for both:
```typescript
// Generate slug from title
const slug = title.toLowerCase()
  .replace(/[^a-z0-9\s-]/g, '')
  .trim()
  .replace(/\s+/g, '-')
  .slice(0, 64)

const { error } = await supabase.from('wiki_pages').upsert({
  slug,
  title,
  content,
  excerpt: excerpt || content.replace(/<[^>]+>/g, '').slice(0, 200),
  category,
  tags: selectedTags,
  published,
  author_id: user.id,
  last_edited_by: user.id,
})
```

- [ ] **Step 6: Build**

```bash
npm run build
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: build seeWiki page, wiki view, and TipTap editor"
```

---

## Task 4: seePrompts page

**Files:**
- Modify: `app/prompts/page.tsx`
- Implement: `components/prompts/PromptCard.tsx`

- [ ] **Step 1: Implement PromptCard**

```typescript
// components/prompts/PromptCard.tsx
'use client'

import { useState } from 'react'
import { Avatar } from '@/components/ui/Avatar'
import { cn } from '@/lib/utils'

interface PromptCardProps {
  id: string
  title: string
  content: string
  category: string
  aiTool: string
  tags: string[]
  upvotes: number
  copies: number
  authorName: string
  authorInitials: string
  createdAt: string
}

const AI_TOOL_COLORS: Record<string, string> = {
  Claude: '#B0A9CF',
  Midjourney: '#ED693A',
  Runway: '#8ACB8F',
  Sora: '#7F77DD',
  Dalle: '#EDDE5C',
  Other: '#555555',
}

export function PromptCard({
  id, title, content, category, aiTool, tags,
  upvotes: initialUpvotes, copies: initialCopies,
  authorName, authorInitials, createdAt,
}: PromptCardProps) {
  const voteKey = 'seeper-prompt-votes'
  const getVoted = () => {
    if (typeof window === 'undefined') return false
    const stored = JSON.parse(localStorage.getItem(voteKey) ?? '[]') as string[]
    return stored.includes(id)
  }

  const [upvotes, setUpvotes] = useState(initialUpvotes)
  const [voted, setVoted] = useState(() => getVoted())
  const [copies, setCopies] = useState(initialCopies)
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [popping, setPopping] = useState(false)

  const handleUpvote = () => {
    const stored = JSON.parse(localStorage.getItem(voteKey) ?? '[]') as string[]
    if (voted) {
      setUpvotes(p => p - 1)
      setVoted(false)
      localStorage.setItem(voteKey, JSON.stringify(stored.filter((x: string) => x !== id)))
    } else {
      setUpvotes(p => p + 1)
      setVoted(true)
      setPopping(true)
      setTimeout(() => setPopping(false), 300)
      localStorage.setItem(voteKey, JSON.stringify([...stored, id]))
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setCopies(p => p + 1)
    setTimeout(() => setCopied(false), 2000)
  }

  const toolColor = AI_TOOL_COLORS[aiTool] ?? '#555555'
  const isLong = content.length > 280
  const displayContent = expanded ? content : content.slice(0, 280)

  return (
    <div className="seeper-card p-5 space-y-3 transition-transform duration-150 hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-bold text-sm">{title}</h3>
        <span
          className="flex-shrink-0 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
          style={{ color: toolColor, background: `${toolColor}1a` }}
        >
          {aiTool}
        </span>
      </div>

      {/* Prompt content */}
      <div className="bg-[var(--color-raised)] rounded-lg p-3">
        <p className="text-[11px] font-mono leading-relaxed text-[var(--color-subtext)] whitespace-pre-wrap">
          {displayContent}{isLong && !expanded && '...'}
        </p>
        {isLong && (
          <button
            onClick={() => setExpanded(p => !p)}
            className="text-[10px] text-plasma mt-1 hover:underline"
          >
            {expanded ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        <span
          className="px-1.5 py-0.5 rounded-full text-[9px] border"
          style={{ borderColor: `${toolColor}40`, color: toolColor }}
        >
          {category}
        </span>
        {tags.map(tag => (
          <span key={tag} className="px-1.5 py-0.5 rounded-full text-[9px] bg-[var(--color-raised)] text-[var(--color-muted)]">
            {tag}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <button
            onClick={handleUpvote}
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-full text-xs border transition-all duration-150',
              voted
                ? 'border-plasma text-plasma bg-plasma/10'
                : 'border-seeper-border/40 text-[var(--color-muted)] hover:border-plasma/60'
            )}
          >
            ▲ <span className={cn(popping && 'upvote-pop')}>{upvotes}</span>
          </button>
          <span className="text-[10px] text-[var(--color-muted)] px-1.5 py-0.5 rounded-full border border-seeper-border/40">anon ok</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Avatar name={authorName} size={20} />
            <span className="text-[10px] text-[var(--color-muted)]">{authorName}</span>
          </div>
          <button
            onClick={handleCopy}
            className={cn(
              'flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border transition-all duration-150',
              copied
                ? 'border-green-500 text-green-500 bg-green-500/10'
                : 'border-seeper-border/40 text-[var(--color-muted)] hover:border-plasma/60 hover:text-plasma'
            )}
          >
            {copied ? 'Copied ✓' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Build seePrompts page**

`app/prompts/page.tsx` + `app/prompts/PromptsPageClient.tsx`:
- Header "seePrompts" in `--color-prompts` (volt yellow, use dark text since it's light)
- Filter bar: All | Claude | Midjourney | Runway | Sora | ChatGPT | Other
- Category filter: All | Concept | Production | Audio | Copy | Research | 3D | Code
- Sort: Most upvoted | Newest | Most used
- Single-column grid of `PromptCard` components
- "Add prompt +" button that opens ContributeDrawer with category pre-set

- [ ] **Step 3: Build**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: build seePrompts page with PromptCard, copy, and upvoting"
```

---

## Task 5: seeTools page

**Files:**
- Modify: `app/tools/page.tsx`

- [ ] **Step 1: Build seeTools page**

`app/tools/page.tsx` + `app/tools/ToolsPageClient.tsx`:

Tool card component (inline or in `components/tools/ToolCard.tsx`):
```typescript
// Each tool card shows:
// - Tool name (DM Sans Bold)
// - Category pill (coloured)
// - Description (2 lines)
// - Users row: initials avatars (max 4) — use Avatar component with 24px size
// - Version + licence (muted)
// - Footer: upvote button | endorsements count | link button
```

Page structure:
- Header "seeTools" in `--color-tools` (#DCFEAD — use dark text since it's light)
- Category tabs: All | Creative | Production | Tech | Management | Communication
- 3-column grid on desktop, 2 on tablet, 1 on mobile

Upvoting: same localStorage pattern as news cards (storage key `seeper-tool-votes`).

Link button: opens `item.url` in new tab.

- [ ] **Step 2: Build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: build seeTools page with endorsement and filtering"
```

---

## Task 6: seeResources page

**Files:**
- Modify: `app/resources/page.tsx`

- [ ] **Step 1: Build seeResources page**

`app/resources/page.tsx` + `app/resources/ResourcesPageClient.tsx`:

File type icon mapping:
```typescript
const FILE_ICONS: Record<string, string> = {
  PDF: '📄', DOC: '📝', Link: '🔗', Video: '🎬', Image: '🖼'
}
```

Each resource row:
```typescript
// [File type icon]  [Title — bold]  [Category pill]
// [Description — 1 line, muted]
// [Avatar + name]  [·]  [Date]  |  [▲ N upvotes]  [Download/Open button]
```

Page structure:
- Header "seeResources" in `--color-resources`
- Category tabs: All | Documents | Links | Templates | Brand Assets | Projects | Research
- List view (not grid)
- Sort: Date (newest) | Category | Most upvoted

- [ ] **Step 2: Build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: build seeResources page with list view and filtering"
```

---

## Task 7: seeInside page

**Files:**
- Create: `app/inside/page.tsx`

- [ ] **Step 1: Create seeInside page**

`app/inside/page.tsx` + `app/inside/InsidePageClient.tsx`:

Onboarding checklist (state in localStorage key `seeper-inside-checklist`):
```typescript
const CHECKLIST = [
  { id:'1', group:'Getting Started', text:'Read the seeper brand guidelines' },
  { id:'2', group:'Getting Started', text:'Set up your seeper email' },
  { id:'3', group:'Getting Started', text:'Join the team Slack workspace' },
  { id:'4', group:'Getting Started', text:'Complete your seeUs profile' },
  { id:'5', group:'Getting Started', text:'Get access to Asana and join your first project' },
  { id:'6', group:'Getting Started', text:'Meet your buddy (ask your manager)' },
  { id:'7', group:'Tools & Access',  text:'Install Unreal Engine 5' },
  { id:'8', group:'Tools & Access',  text:'Get Adobe Creative Cloud licence' },
  { id:'9', group:'Tools & Access',  text:'Set up TouchDesigner trial' },
  { id:'10', group:'Tools & Access', text:'Access the shared Google Drive' },
  { id:'11', group:'Culture & Process', text:'Read "How seeper Works" (wiki)' },
  { id:'12', group:'Culture & Process', text:'Attend your first Monday all-hands' },
  { id:'13', group:'Culture & Process', text:'Add yourself to seeUs directory' },
]
```

Checked item saves to localStorage. Progress bar shows X/13. Checked items show strikethrough + green checkmark.

Key documents section: 6 cards linking to /resources, /wiki pages, /tools.

Page structure:
- Header "seeInside" in `--color-inside`
- Welcome banner with warm copy
- Two-column layout: checklist (left) + key documents (right)

- [ ] **Step 2: Build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: build seeInside onboarding hub with localStorage checklist"
```

---

## Task 8: Final Plan B verification

- [ ] **Step 1: Full test run**

```bash
npm run test:run
```

Expected: All existing tests pass.

- [ ] **Step 2: Build**

```bash
npm run build
```

Expected: Clean build, all routes present.

- [ ] **Step 3: Verify routes in build output**

Check that these appear in the build output:
- `/news`
- `/wiki`
- `/wiki/[slug]`
- `/wiki/new`
- `/wiki/edit/[slug]`
- `/prompts`
- `/tools`
- `/resources`
- `/inside`

- [ ] **Step 4: Push to GitHub**

```bash
git push origin main
```

---

## Plan B Complete

After completing all tasks:
- All six content section pages fully built with mock data
- Interactive filtering, upvoting, search
- TipTap wiki editor wired up
- All pages use section colours and `page-enter` animation

**Next:** Execute `docs/superpowers/plans/2026-03-25-phase2-features-polish.md`
