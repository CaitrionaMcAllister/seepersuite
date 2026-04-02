import 'server-only'
import Parser from 'rss-parser'
import { createServiceClient } from '@/lib/supabase/server'

// ── Feeds ─────────────────────────────────────────────────────────────────────

const FALLBACK_FEEDS = [
  { url: 'https://www.theverge.com/rss/index.xml',        source: 'The Verge',             sourceUrl: 'https://www.theverge.com' },
  { url: 'https://www.technologyreview.com/feed/',         source: 'MIT Technology Review',  sourceUrl: 'https://www.technologyreview.com' },
  { url: 'https://www.wired.com/feed/rss',                 source: 'Wired',                 sourceUrl: 'https://www.wired.com' },
  { url: 'https://huggingface.co/blog/feed.xml',           source: 'Hugging Face',          sourceUrl: 'https://huggingface.co/blog' },
  { url: 'https://www.dezeen.com/feed/',                   source: 'Dezeen',                sourceUrl: 'https://www.dezeen.com' },
  { url: 'https://80.lv/feed/',                            source: '80.lv',                 sourceUrl: 'https://80.lv' },
]

async function getFeeds(): Promise<{ url: string; source: string; sourceUrl: string }[]> {
  try {
    const supabase = createServiceClient()
    const { data } = await supabase
      .from('news_sources')
      .select('feed_url, name, site_url')
      .eq('active', true)
    if (data && data.length > 0) {
      return data.map(s => ({ url: s.feed_url, source: s.name, sourceUrl: s.site_url }))
    }
  } catch { /* fall through */ }
  return FALLBACK_FEEDS
}

// ── Category assignment ───────────────────────────────────────────────────────

function assignCategory(title: string, description: string | null): string {
  const t = `${title} ${description ?? ''}`.toLowerCase()
  if (/\bai\b|artificial intelligence|machine learning|llm|gpt|claude|midjourney|stable diffusion|generative ai|neural|diffusion model|openai|anthropic/.test(t)) return 'AI & ML'
  if (/\bxr\b|\bar\b|\bvr\b|augmented reality|virtual reality|mixed reality|spatial computing|apple vision|meta quest|headset/.test(t)) return 'Spatial'
  if (/immersive|projection mapping|installation|experience design|theme park|attraction|exhibition|live event/.test(t)) return 'Immersive'
  if (/touchdesigner|unreal engine|\bue5\b|notch|blender|houdini|resolve|after effects|realtime|real-time|3d render|plugin|software release/.test(t)) return 'Tools'
  if (/\baudio\b|sound design|spatial audio|ambisonics|binaural|music tech/.test(t)) return 'Audio'
  if (/design|creative technolog|visual art|generative art|brand|typography/.test(t)) return 'Creative Tech'
  if (/conference|festival|\bsxsw\b|tribeca|award|ifa |ces |nab |siggraph/.test(t)) return 'Events'
  if (/funding|investment|acquisition|revenue|market|startup|studio|agency/.test(t)) return 'Industry'
  return 'Industry'
}

// ── Tag generation ────────────────────────────────────────────────────────────

const TAG_RULES: { re: RegExp; tag: string }[] = [
  { re: /\bai\b|artificial intelligence|machine learning|llm|openai|anthropic|gpt/i, tag: '#ai' },
  { re: /generative|stable diffusion|midjourney|dall-e|imagen|flux/i,                tag: '#generative' },
  { re: /\bxr\b|extended reality|mixed reality/i,                                    tag: '#xr' },
  { re: /\bar\b|augmented reality/i,                                                 tag: '#ar' },
  { re: /\bvr\b|virtual reality/i,                                                   tag: '#vr' },
  { re: /spatial|apple vision|meta quest/i,                                          tag: '#spatial' },
  { re: /immersive|installation|experience design/i,                                 tag: '#immersive' },
  { re: /projection/i,                                                               tag: '#projection' },
  { re: /unreal|\bue5\b/i,                                                           tag: '#ue5' },
  { re: /touchdesigner/i,                                                            tag: '#touchdesigner' },
  { re: /\b3d\b|three[- ]?d|blender|houdini/i,                                      tag: '#3d' },
  { re: /\baudio\b|sound|music tech|spatial audio/i,                                tag: '#audio' },
  { re: /video|film|cinema|runway|gen[- ]?\d/i,                                     tag: '#video' },
  { re: /design/i,                                                                   tag: '#design' },
  { re: /business|investment|funding|market|revenue/i,                              tag: '#business' },
  { re: /event|festival|conference|award/i,                                         tag: '#events' },
  { re: /tool|software|platform|release|update|plugin/i,                            tag: '#tools' },
  { re: /creative/i,                                                                 tag: '#creative' },
  { re: /production|pipeline/i,                                                     tag: '#production' },
  { re: /research|paper|study/i,                                                    tag: '#research' },
]

function extractTags(title: string, description: string | null): string[] {
  const text = `${title} ${description ?? ''}`
  const found = new Set<string>()
  for (const { re, tag } of TAG_RULES) {
    if (re.test(text)) found.add(tag)
  }
  return Array.from(found).slice(0, 6)
}

// ── Image extraction ──────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractImage(item: any): string | null {
  // media:content (most common in Verge, Dezeen)
  const mc = item['media:content']
  if (mc) {
    if (Array.isArray(mc)) {
      const img = mc.find((m: { $?: { url?: string; medium?: string } }) => m.$?.medium === 'image' || m.$?.url?.match(/\.(jpg|jpeg|png|webp)/i))
      if (img?.$?.url) return img.$.url
    } else if (mc?.$?.url) return mc.$.url
  }
  // media:thumbnail
  const mt = item['media:thumbnail']
  if (mt?.$?.url) return mt.$.url
  // enclosure
  if (item.enclosure?.url && /\.(jpg|jpeg|png|webp)/i.test(item.enclosure.url)) return item.enclosure.url
  // og:image in content (rough extraction)
  const content: string = item.content ?? item['content:encoded'] ?? ''
  const imgMatch = content.match(/<img[^>]+src=["']([^"']+\.(jpg|jpeg|png|webp))[^"']*["']/i)
  if (imgMatch?.[1]) return imgMatch[1]
  return null
}

function stripHtml(html: string | null | undefined): string | null {
  if (!html) return null
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim()
}

// ── Relevance filter ─────────────────────────────────────────────────────────
// Only applied to the hardcoded fallback feeds (broad sources like The Verge, Wired).
// User-added sources in news_sources are assumed to be fully relevant — no filter applied,
// except for source-specific blocklists below.

const DEFAULT_SOURCE_NAMES = new Set([
  'The Verge', 'MIT Technology Review', 'Wired', 'Hugging Face', 'Dezeen', '80.lv',
])

const RELEVANCE_RE = /ai|artificial intelligence|machine learning|generative|immersive|xr|\bar\b|\bvr\b|mixed reality|spatial|projection|installation|experience|interactive|unreal|touchdesigner|real.?time|creative|visual|3d|runway|midjourney|claude|openai|design|render|animation|blender|houdini|unity|haptic|led|dmx|show control/i

// Patterns that indicate a page/section rather than an article, keyed by source name.
// Titles matching these are dropped regardless of relevance.
const SOURCE_BLOCKLIST: Record<string, RegExp> = {
  'ExperienceUK': /^(association partners|sponsors|members|about us|join us|contact|events calendar|home|news$|resources$|benefits of membership)|^experience\s*uk$|experience\s*uk$/i,
}

function isRelevant(title: string, description: string | null, source: string): boolean {
  // Source-specific blocklist — drop non-article pages from known feeds
  const blocklist = SOURCE_BLOCKLIST[source]
  if (blocklist && blocklist.test(title.trim())) return false

  // Custom user-added sources: always include (after blocklist check)
  if (!DEFAULT_SOURCE_NAMES.has(source)) return true
  // Default broad feeds: apply keyword filter to reduce noise
  return RELEVANCE_RE.test(`${title} ${description ?? ''}`)
}

// ── Main ingest ───────────────────────────────────────────────────────────────

export async function ingestNews(): Promise<{ inserted: number; skipped: number }> {
  const parser = new Parser({
    timeout: 8000,
    customFields: {
      item: [
        ['media:content',   'media:content'],
        ['media:thumbnail', 'media:thumbnail'],
      ],
    },
  })

  const feeds = await getFeeds()
  console.log(`[news-ingest] Using ${feeds.length} sources:`, feeds.map(f => f.source).join(', '))
  const supabase = createServiceClient()
  let inserted = 0
  let skipped = 0
  let firstOfBatch = true

  const results = await Promise.allSettled(
    feeds.map(async ({ url, source, sourceUrl }) => {
      try {
        const feed = await parser.parseURL(url)
        return (feed.items ?? []).slice(0, 20).map(item => ({ item, source, sourceUrl }))
      } catch (err) {
        console.warn(`[news-ingest] ${source} failed:`, err instanceof Error ? err.message : err)
        return []
      }
    })
  )

  const allItems = results.flatMap(r => r.status === 'fulfilled' ? r.value : [])

  // Sort by publish date descending
  allItems.sort((a, b) => {
    const da = new Date(a.item.isoDate ?? a.item.pubDate ?? 0).getTime()
    const db = new Date(b.item.isoDate ?? b.item.pubDate ?? 0).getTime()
    return db - da
  })

  for (const { item, source, sourceUrl } of allItems) {
    const title = stripHtml(item.title) ?? ''
    const url = item.link ?? ''
    if (!title || !url) { skipped++; continue }

    const description = stripHtml(item.contentSnippet ?? item.content ?? item.summary ?? null)
    if (!isRelevant(title, description, source)) { skipped++; continue }

    const category  = assignCategory(title, description)
    const tags      = extractTags(title, description)
    const imageUrl  = extractImage(item)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const author    = stripHtml((item as any).creator ?? (item as any).author ?? null)
    const publishedAt = item.isoDate ?? item.pubDate ?? new Date().toISOString()
    const summary   = description ? description.slice(0, 400) : title
    const featured  = firstOfBatch
    firstOfBatch = false

    const { error } = await supabase.from('news_cache').upsert({
      title,
      url,
      source,
      source_url: sourceUrl,
      author,
      summary,
      category,
      tags,
      image_url: imageUrl,
      published_at: publishedAt,
      fetched_at: new Date().toISOString(),
      is_featured: featured,
    }, { onConflict: 'url', ignoreDuplicates: false })

    if (error) {
      console.error('[news-ingest] upsert error:', error.message)
      skipped++
    } else {
      inserted++
    }
  }

  return { inserted, skipped }
}

// ── Staleness check ───────────────────────────────────────────────────────────

export async function ingestIfStale(): Promise<void> {
  try {
    const supabase = createServiceClient()
    const { data } = await supabase
      .from('news_cache')
      .select('fetched_at')
      .order('fetched_at', { ascending: false })
      .limit(1)
      .single()

    const lastFetch = data?.fetched_at ? new Date(data.fetched_at).getTime() : 0
    const sixHoursAgo = Date.now() - 6 * 3600_000

    if (lastFetch < sixHoursAgo) {
      console.log('[news-ingest] Cache stale — ingesting fresh news')
      await ingestNews()
    }
  } catch {
    // Non-fatal — page still loads from whatever is in the cache
  }
}
