import 'server-only'
// Claude API helpers — all functions are server-side only.
// The server-only import above enforces this at build time.
//
// Called from:
//   - generateDailyDigest: app/dashboard/page.tsx (direct server call) + app/api/digest/route.ts
//   - summariseArticle:    app/api/summarise/route.ts
//   - tagContent:          app/api/tag/route.ts
//   - generateNewsletterIntro: app/newsletter/new/page.tsx (Phase 2)

import Anthropic from '@anthropic-ai/sdk'
import { MOCK_DIGEST_STORIES } from '@/lib/constants'
import type { DigestStory, SearchableItem } from '@/types'
import type { NewsArticle } from '@/lib/news'

// Visual styles for each digest category — applied after Claude returns JSON
const CATEGORY_VISUALS: Record<string, { icon: string; color: string; imageLabel: string }> = {
  'AI & Machine Learning': { icon: '◈', color: '#7F77DD', imageLabel: 'AI & ML' },
  'Creative Technology':   { icon: '✦', color: '#ED693A', imageLabel: 'Creative Tech' },
  'XR & Immersive':        { icon: '◉', color: '#B0A9CF', imageLabel: 'XR / Immersive' },
  'Design & Visual':       { icon: '◆', color: '#D4537E', imageLabel: 'Design' },
  'Business & Industry':   { icon: '◎', color: '#EDDE5C', imageLabel: 'Business' },
  'Tools & Tech':          { icon: '⬡', color: '#DCFEAD', imageLabel: 'Tools & Tech' },
}

const SOURCE_COLORS = ['#ED693A', '#B0A9CF', '#7F77DD', '#8ACB8F', '#EDDE5C', '#D4537E']

function applyVisuals(raw: { title: string; summary: string; category: string; sources: { label: string; url: string }[] }): DigestStory {
  const vis = CATEGORY_VISUALS[raw.category] ?? CATEGORY_VISUALS['Creative Technology']
  const rgba = (hex: string, a: number) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r},${g},${b},${a})`
  }
  return {
    icon: vis.icon,
    iconBg: rgba(vis.color, 0.12),
    iconColor: vis.color,
    catBg: rgba(vis.color, 0.15),
    catColor: vis.color,
    category: raw.category,
    imageLabel: vis.imageLabel,
    title: raw.title,
    summary: raw.summary,
    sources: raw.sources.slice(0, 3).map((s, i) => ({
      label: s.label,
      abbreviation: s.label.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
      color: SOURCE_COLORS[i % SOURCE_COLORS.length],
      url: s.url,
    })),
  }
}

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

export async function generateDailyDigest(articles: NewsArticle[] | string[]): Promise<DigestStory[]> {
  if (articles.length === 0) return MOCK_DIGEST_STORIES

  // Support legacy string[] calls (from dashboard/page.tsx direct call)
  const isStrings = typeof articles[0] === 'string'
  const articleText = isStrings
    ? (articles as string[]).map((h, i) => `${i + 1}. ${h}`).join('\n')
    : (articles as NewsArticle[]).map((a, i) =>
        `${i + 1}. ${a.title}\n   Source: ${a.source} — ${a.url}\n   ${a.description ?? ''}`
      ).join('\n\n')

  try {
    const client = getClient()
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1200,
      messages: [{
        role: 'user',
        content: `You are the editorial AI for seeper, an immersive experience design studio based in London. Pick the 4 most relevant articles from the list below and write a brief digest story for each one, tailored to the seeper team. seeper designs immersive experiences, installations, projection mapping, AR/VR, real-time visuals, and creative technology.

Each story should be 2-3 sentences — direct, knowledgeable, no fluff. Explain why it matters to seeper specifically.

Articles:
${articleText}

Return ONLY valid JSON, no other text, in this exact format:
[
  {
    "title": "concise title (max 10 words)",
    "summary": "2-3 sentence summary relevant to seeper's work",
    "category": "one of: AI & Machine Learning | Creative Technology | XR & Immersive | Design & Visual | Business & Industry | Tools & Tech",
    "sources": [
      { "label": "Source Name", "url": "https://exact-article-url" }
    ]
  }
]`,
      }],
    })
    const text = extractText(response)
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed: unknown = JSON.parse(clean)
    if (Array.isArray(parsed)) return (parsed as { title: string; summary: string; category: string; sources: { label: string; url: string }[] }[]).map(applyVisuals)
    return MOCK_DIGEST_STORIES
  } catch {
    return MOCK_DIGEST_STORIES
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

export async function semanticSearch(
  query: string,
  content: SearchableItem[]
): Promise<SearchableItem[]> {
  // TODO: Replace with Claude embeddings in Phase 3
  const q = query.toLowerCase()
  return content.filter(item =>
    item.title.toLowerCase().includes(q) ||
    item.description?.toLowerCase().includes(q) ||
    item.tags?.some(t => t.includes(q))
  )
}
