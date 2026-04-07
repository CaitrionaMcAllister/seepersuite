import type { NavSection, QuickLink, MockActivityItem, MockWikiUpdate, SearchableItem, NewsItem, DigestStory } from '@/types'

// seeper division naming — see[X] convention
export const SECTION_NAMES = {
  news:      'seeNews',
  wiki:      'seeWiki',
  prompts:   'seePrompts',
  tools:     'seeTools',
  resources: 'seeResources',
  team:      'seeUs',
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
  { value: 'finance',    label: 'Finance' },
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
      { label: SECTION_NAMES.team,   href: '/team',   icon: 'Users', color: '#1D9E75' },
      { label: SECTION_NAMES.inside, href: '/inside', icon: 'Star',  color: '#D4537E' },
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

// Quick links for dashboard tiles — hex accent matches sidebar NAV_SECTIONS colors
export const QUICK_LINKS: readonly QuickLink[] = [
  { label: SECTION_NAMES.news,      href: '/news',      icon: 'Radio',      accent: '#ED693A' },
  { label: SECTION_NAMES.wiki,      href: '/wiki',      icon: 'BookOpen',   accent: '#B0A9CF' },
  { label: SECTION_NAMES.tools,     href: '/tools',     icon: 'Settings2',  accent: '#DCFEAD' },
  { label: SECTION_NAMES.resources, href: '/resources', icon: 'LayoutGrid', accent: '#8ACB8F' },
  { label: SECTION_NAMES.prompts,   href: '/prompts',   icon: 'Sparkles',   accent: '#EDDE5C' },
  { label: SECTION_NAMES.team,      href: '/team',      icon: 'Users',      accent: '#1D9E75' },
  { label: SECTION_NAMES.inside,    href: '/inside',    icon: 'Star',       accent: '#D4537E' },
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
    summary: "Supports ambisonics and binaural rendering at latencies compatible with interactive installation requirements. Immediately useful for seeper's atmospheric design work.",
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

// MOCK_DIGEST_STORIES — structured digest stories for DigestStory[]
export const MOCK_DIGEST_STORIES: DigestStory[] = [
  {
    icon: '◉', iconBg: 'rgba(237,105,58,0.2)', iconColor: '#ED693A',
    catBg: 'rgba(237,105,58,0.15)', catColor: '#ED693A',
    category: 'AI & Machine Learning', imageLabel: 'AI & Video',
    title: 'Runway Gen-4 launches with real-time scene consistency for long-form video production',
    summary: "The new model handles complex multi-shot sequences without the temporal flickering that plagued Gen-3 — directly relevant to seeper's content pipeline for visitor attractions. Early tests show 3x improvement in temporal consistency on camera-move-heavy sequences.",
    sources: [
      { label: 'The Verge', abbreviation: 'TV', color: '#ED693A', url: 'https://theverge.com' },
      { label: 'Runway Blog', abbreviation: 'RW', color: '#B0A9CF', url: 'https://runwayml.com/blog' },
    ],
  },
  {
    icon: '⊙', iconBg: 'rgba(29,158,117,0.2)', iconColor: '#1D9E75',
    catBg: 'rgba(29,158,117,0.15)', catColor: '#1D9E75',
    category: 'Industry News', imageLabel: 'GCC & Business',
    title: 'GCC announces $2B immersive experience investment fund across five entertainment districts',
    summary: "Saudi Arabia's Public Investment Fund has earmarked major capital for experiential design — opening significant brief opportunities for studios with proven large-scale attraction experience. The fund covers five new entertainment districts planned through 2030.",
    sources: [
      { label: 'Dezeen', abbreviation: 'Dz', color: '#1D9E75', url: 'https://dezeen.com' },
      { label: 'Experience UK', abbreviation: 'EU', color: '#8ACB8F', url: 'https://www.experienceuk.org' },
    ],
  },
  {
    icon: '◎', iconBg: 'rgba(176,169,207,0.2)', iconColor: '#B0A9CF',
    catBg: 'rgba(176,169,207,0.15)', catColor: '#B0A9CF',
    category: 'Spatial Audio', imageLabel: 'Audio & Spatial',
    title: 'Google DeepMind releases open-source spatial audio model with real-time binaural processing',
    summary: 'Supports ambisonics and binaural rendering at latencies fully compatible with interactive installation requirements. Immediately useful for seeper\'s atmospheric design work — handles complex multi-zone audio with minimal CPU overhead.',
    sources: [
      { label: 'Hugging Face', abbreviation: 'HF', color: '#EDDE5C', url: 'https://huggingface.co' },
      { label: 'DeepMind Blog', abbreviation: 'DM', color: '#B0A9CF', url: 'https://deepmind.google/blog' },
    ],
  },
  {
    icon: '⚙', iconBg: 'rgba(220,254,173,0.2)', iconColor: '#4a7a00',
    catBg: 'rgba(220,254,173,0.15)', catColor: '#4a7a00',
    category: 'Tools & Software', imageLabel: 'UE5 Update',
    title: 'Unreal Engine 5.5 ships with procedural audio tools and improved show control integration',
    summary: 'New procedural audio nodes simplify the show control pipeline considerably — worth testing against the current Crestron setup on the next attraction build. GPU instancing improvements deliver around 40% better performance on particle-heavy scenes.',
    sources: [
      { label: 'Epic Games Blog', abbreviation: 'EG', color: '#DCFEAD', url: 'https://unrealengine.com/blog' },
      { label: 'Creative Applications', abbreviation: 'CA', color: '#8ACB8F', url: 'https://creativeapplications.net' },
    ],
  },
]

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
