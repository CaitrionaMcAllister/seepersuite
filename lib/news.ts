import 'server-only'
import Parser from 'rss-parser'

export interface NewsArticle {
  title: string
  url: string
  source: string
  sourceUrl: string
  description: string | null
  publishedAt: string
}

// RSS feeds relevant to seeper's work — immersive tech, AI, creative tools
const FEEDS: { url: string; source: string; sourceUrl: string }[] = [
  { url: 'https://www.theverge.com/rss/index.xml',          source: 'The Verge',                  sourceUrl: 'https://www.theverge.com' },
  { url: 'https://www.technologyreview.com/feed/',           source: 'MIT Technology Review',       sourceUrl: 'https://www.technologyreview.com' },
  { url: 'https://www.wired.com/feed/rss',                   source: 'Wired',                      sourceUrl: 'https://www.wired.com' },
  { url: 'https://huggingface.co/blog/feed.xml',             source: 'Hugging Face',               sourceUrl: 'https://huggingface.co/blog' },
  { url: 'https://www.dezeen.com/feed/',                     source: 'Dezeen',                     sourceUrl: 'https://www.dezeen.com' },
  { url: 'https://80.lv/feed/',                              source: '80.lv',                      sourceUrl: 'https://80.lv' },
]

// Keywords to filter articles relevant to seeper — only include if title/description matches
const RELEVANCE_KEYWORDS = [
  'ai', 'artificial intelligence', 'machine learning', 'generative',
  'immersive', 'xr', 'ar', 'vr', 'mixed reality', 'spatial',
  'projection', 'installation', 'experience design', 'interactive',
  'unreal', 'touchdesigner', 'real-time', 'realtime',
  'creative technology', 'visual effects', 'motion', '3d',
  'runway', 'midjourney', 'claude', 'openai', 'stable diffusion',
  'design', 'studio', 'render', 'animation',
]

function isRelevant(title: string, description: string | null): boolean {
  const text = `${title} ${description ?? ''}`.toLowerCase()
  return RELEVANCE_KEYWORDS.some(kw => text.includes(kw))
}

function stripHtml(html: string | null | undefined): string | null {
  if (!html) return null
  return html.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim()
}

export async function fetchNewsForDigest(): Promise<NewsArticle[]> {
  const parser = new Parser({ timeout: 8000 })
  const results: NewsArticle[] = []

  await Promise.allSettled(
    FEEDS.map(async ({ url, source, sourceUrl }) => {
      try {
        const feed = await parser.parseURL(url)
        const items = (feed.items ?? []).slice(0, 15)
        for (const item of items) {
          const title = stripHtml(item.title) ?? ''
          const description = stripHtml(item.contentSnippet ?? item.content ?? item.summary ?? null)
          if (!title || !item.link) continue
          if (!isRelevant(title, description)) continue
          results.push({
            title,
            url: item.link,
            source,
            sourceUrl,
            description: description ? description.slice(0, 300) : null,
            publishedAt: item.pubDate ?? item.isoDate ?? new Date().toISOString(),
          })
        }
      } catch (err) {
        console.warn(`[news] Failed to fetch ${source}:`, err instanceof Error ? err.message : err)
      }
    })
  )

  // Sort by most recent, deduplicate by URL, return up to 20
  const seen = new Set<string>()
  return results
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .filter(a => {
      if (seen.has(a.url)) return false
      seen.add(a.url)
      return true
    })
    .slice(0, 20)
}
