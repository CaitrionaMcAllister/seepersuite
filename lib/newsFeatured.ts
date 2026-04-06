// Ensures a minimum number of featured articles by auto-selecting the most relevant
// ones when admins haven't manually featured enough. Auto-selected articles are marked
// is_featured=true in-memory only — the database is never modified.

const CATEGORY_SCORE: Record<string, number> = {
  'AI & ML':      10,
  'Immersive':    10,
  'Spatial':       9,
  'Tools':         9,
  'Creative Tech': 8,
  'Audio':         7,
  'Events':        6,
  'Industry':      5,
}

function recencyScore(publishedAt: string | null | undefined): number {
  if (!publishedAt) return 0
  const ageMs = Date.now() - new Date(publishedAt).getTime()
  const ageHours = ageMs / 3_600_000
  if (ageHours < 24)  return 5
  if (ageHours < 48)  return 3
  if (ageHours < 168) return 1
  return 0
}

export function fillFeatured<
  T extends { is_featured: boolean; category?: string | null; published_at?: string | null }
>(articles: T[], min = 3): T[] {
  const manualCount = articles.filter(a => a.is_featured).length
  if (manualCount >= min) return articles

  const needed = min - manualCount
  const candidates = articles
    .filter(a => !a.is_featured)
    .map(a => ({
      article: a,
      score: (CATEGORY_SCORE[a.category ?? ''] ?? 4) + recencyScore(a.published_at),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, needed)
    .map(c => c.article)

  const autoSet = new Set(candidates)

  return articles.map(a => autoSet.has(a) ? { ...a, is_featured: true } : a)
}
