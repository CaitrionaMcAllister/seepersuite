import type { NavSection, QuickLink, MockActivityItem, MockWikiUpdate, SearchableItem } from '@/types'

// seeper division naming — see[X] convention
export const SECTION_NAMES = {
  news:      'seeNews',
  wiki:      'seeWiki',
  prompts:   'seePrompts',
  tools:     'seeTools',
  resources: 'seeResources',
  team:      'seeUs',
  labs:      'seeLabs',
  insights:  'seeInsights',
  inside:    'seeInside',
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
      { label: SECTION_NAMES.inside, href: '/inside', icon: 'Star',         color: '#D4537E' },
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

export const MOCK_SEARCH_ITEMS: SearchableItem[] = [
  {
    id: 'wiki-1',
    title: 'UE5 Pipeline Guide',
    description: 'Setting up Unreal Engine 5 for live event production',
    excerpt: 'This guide covers the full pipeline from asset creation to real-time rendering in live environments.',
    section: 'seeWiki',
    sectionColor: '#B0A9CF',
    href: '/wiki/ue5-pipeline-guide',
    category: 'tech',
    tags: ['#ue5', '#production', '#workflow'],
    author: 'Caitriona McAllister',
  },
  {
    id: 'wiki-2',
    title: 'Projection Mapping Basics',
    description: 'Core concepts for projection mapping at scale',
    excerpt: 'Covers surface mapping, blending, and edge correction for large-scale installations.',
    section: 'seeWiki',
    sectionColor: '#B0A9CF',
    href: '/wiki/projection-mapping-basics',
    category: 'creative',
    tags: ['#projection', '#creative', '#3d'],
    author: 'Design Team',
  },
  {
    id: 'news-1',
    title: 'GPT-4o gets real-time video understanding',
    description: 'OpenAI announces video analysis capabilities in ChatGPT',
    excerpt: 'The new multimodal update allows real-time analysis of video streams, opening new workflows for AI-assisted production.',
    section: 'seeNews',
    sectionColor: '#ED693A',
    href: '/news',
    category: 'ai',
    tags: ['#ai', '#research'],
  },
  {
    id: 'news-2',
    title: 'TouchDesigner 2025 release notes',
    description: 'Major updates to the real-time visual programming environment',
    excerpt: 'New GPU instancing, improved CHOP performance, and native Apple Silicon support headline the 2025 release.',
    section: 'seeNews',
    sectionColor: '#ED693A',
    href: '/news',
    category: 'tools',
    tags: ['#tools', '#production', '#workflow'],
  },
  {
    id: 'prompt-1',
    title: 'Midjourney cinematic lighting prompt',
    description: 'Generate dramatic event photography lighting with Midjourney',
    excerpt: 'A prompt template for generating cinematic lighting references for event design.',
    section: 'seePrompts',
    sectionColor: '#EDDE5C',
    href: '/prompts',
    category: 'image-gen',
    tags: ['#ai', '#creative'],
    author: 'Art Direction',
  },
  {
    id: 'tool-1',
    title: 'TouchDesigner',
    description: 'Real-time visual programming environment for live events',
    section: 'seeTools',
    sectionColor: '#DCFEAD',
    href: '/tools',
    category: 'production',
    tags: ['#tools', '#production', '#ue5'],
  },
  {
    id: 'resource-1',
    title: 'Show Control Bible',
    description: 'Internal reference document for seeper show control standards',
    excerpt: 'Covers OSC, MIDI, timecode, and network architecture for complex show control setups.',
    section: 'seeResources',
    sectionColor: '#8ACB8F',
    href: '/resources',
    category: 'production',
    tags: ['#production', '#workflow', '#audio'],
    author: 'Tech Team',
  },
]
