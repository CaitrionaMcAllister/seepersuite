import type { NavSection, QuickLink, MockActivityItem, MockWikiUpdate } from '@/types'

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
    label: 'DISCOVER',
    items: [
      { label: 'Dashboard',          href: '/dashboard', icon: 'Home',       color: '#ED693A' },
      { label: SECTION_NAMES.news,   href: '/news',      icon: 'Radio',      color: '#ED693A' },
      { label: SECTION_NAMES.wiki,   href: '/wiki',      icon: 'BookOpen',   color: '#B0A9CF' },
    ],
  },
  {
    label: 'STUDIO',
    items: [
      { label: SECTION_NAMES.tools,      href: '/tools',     icon: 'Settings2',  color: '#DCFEAD' },
      { label: SECTION_NAMES.resources,  href: '/resources', icon: 'LayoutGrid', color: '#8ACB8F' },
      { label: SECTION_NAMES.prompts,    href: '/prompts',   icon: 'Sparkles',   color: '#EDDE5C' },
    ],
  },
  {
    label: 'TEAM',
    items: [
      { label: 'seeInside',        href: '/inside', icon: 'Star',         color: '#D4537E' },
      { label: SECTION_NAMES.team, href: '/team',   icon: 'Users',        color: '#1D9E75' },
      { label: SECTION_NAMES.labs, href: '/labs',   icon: 'FlaskConical', color: '#7F77DD' },
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

// Quick links for dashboard tiles — each with a jewel tone accent
export const QUICK_LINKS: readonly QuickLink[] = [
  { label: SECTION_NAMES.news,      href: '/news',      icon: 'Radio',      accent: 'bg-plasma' },
  { label: SECTION_NAMES.wiki,      href: '/wiki',      icon: 'BookOpen',   accent: 'bg-quantum' },
  { label: SECTION_NAMES.prompts,   href: '/prompts',   icon: 'Sparkles',   accent: 'bg-volt' },
  { label: SECTION_NAMES.tools,     href: '/tools',     icon: 'Settings2',  accent: 'bg-circuit' },
  { label: SECTION_NAMES.resources, href: '/resources', icon: 'LayoutGrid', accent: 'bg-mossy' },
]

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
export const MOCK_ACTIVITY: readonly MockActivityItem[] = [
  { initials: 'AJ', name: 'Alex J', action: 'created wiki page', title: 'Unreal Engine Lighting Guide', time: '2 min ago', dept: 'tech' },
  { initials: 'SC', name: 'Sarah C', action: 'published newsletter', title: 'Issue 12 — March Edition', time: '1 hr ago', dept: 'creative' },
  { initials: 'MK', name: 'Marcus K', action: 'added prompt', title: 'Midjourney Architectural Render', time: '3 hr ago', dept: 'creative' },
  { initials: 'LT', name: 'Laura T', action: 'edited wiki page', title: 'Production Pipeline Overview', time: '5 hr ago', dept: 'production' },
  { initials: 'RB', name: 'Ryan B', action: 'created wiki page', title: 'AWS Cost Optimisation Notes', time: 'Yesterday', dept: 'tech' },
  { initials: 'NP', name: 'Nadia P', action: 'added prompt', title: 'ChatGPT Proposal Template', time: 'Yesterday', dept: 'business' },
  { initials: 'JW', name: 'Jamie W', action: 'edited wiki page', title: 'Health & Safety Checklist', time: '2 days ago', dept: 'operations' },
  { initials: 'EC', name: 'Emma C', action: 'created wiki page', title: 'Brand Guidelines 2026', time: '2 days ago', dept: 'creative' },
]

// Mock wiki updates for Phase 1
export const MOCK_WIKI_UPDATES: readonly MockWikiUpdate[] = [
  { initials: 'AJ', title: 'Unreal Engine Lighting Guide', category: 'tech', author: 'Alex J', time: '2 min ago' },
  { initials: 'LT', title: 'Production Pipeline Overview', category: 'production', author: 'Laura T', time: '5 hr ago' },
  { initials: 'EC', title: 'Brand Guidelines 2026', category: 'creative', author: 'Emma C', time: '2 days ago' },
  { initials: 'RB', title: 'AWS Cost Optimisation Notes', category: 'tech', author: 'Ryan B', time: 'Yesterday' },
  { initials: 'SC', title: 'Client Presentation Framework', category: 'business', author: 'Sarah C', time: '3 days ago' },
]

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
