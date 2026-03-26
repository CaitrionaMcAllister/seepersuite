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
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed: unknown = JSON.parse(clean)
    if (Array.isArray(parsed)) return parsed as DigestStory[]
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
