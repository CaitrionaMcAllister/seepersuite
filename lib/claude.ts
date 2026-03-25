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
