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
