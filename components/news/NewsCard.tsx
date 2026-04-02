'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { UpvoteButton } from '@/components/ui/UpvoteButton'

const CATEGORY_COLORS: Record<string, string> = {
  'AI & ML':       '#7F77DD',
  'Spatial':       '#B0A9CF',
  'Immersive':     '#ED693A',
  'Tools':         '#DCFEAD',
  'Creative Tech': '#EDDE5C',
  'Audio':         '#8ACB8F',
  'Industry':      '#D4537E',
  'Events':        '#ED693A',
}

interface Article {
  id: string
  title: string
  url: string
  source: string
  source_url: string | null
  author: string | null
  summary: string | null
  category: string | null
  tags: string[]
  image_url: string | null
  upvotes: number
  views: number
  is_featured: boolean
  published_at: string | null
}

interface NewsCardProps {
  item: Article
  featured?: boolean  // shows "Featured" badge
  hero?: boolean      // col-span-2 hero layout (implies featured badge too)
}

function timeAgo(iso: string | null): string {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function formatDate(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}

const VOTE_KEY = 'seeper-news-votes'

export function NewsCard({ item, featured = false, hero = false }: NewsCardProps) {
  const showFeaturedBadge = featured || hero
  const [upvotes, setUpvotes] = useState(item.upvotes)
  const [views, setViews] = useState(item.views ?? 0)
  const [voted, setVoted] = useState(false)
  const [popping, setPopping] = useState(false)

  useEffect(() => {
    const stored: string[] = JSON.parse(localStorage.getItem(VOTE_KEY) ?? '[]')
    setVoted(stored.includes(item.id))
  }, [item.id])

  const handleUpvote = async () => {
    const stored: string[] = JSON.parse(localStorage.getItem(VOTE_KEY) ?? '[]')
    const action = voted ? 'down' : 'up'
    const newVoted = !voted
    const delta = newVoted ? 1 : -1

    // Optimistic update
    setUpvotes(p => Math.max(0, p + delta))
    setVoted(newVoted)
    if (newVoted) { setPopping(true); setTimeout(() => setPopping(false), 300) }
    localStorage.setItem(VOTE_KEY, JSON.stringify(
      newVoted ? [...stored, item.id] : stored.filter(id => id !== item.id)
    ))

    // Persist to DB
    try {
      await fetch('/api/news/upvote', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, action }),
      })
    } catch { /* silent fail — optimistic state already set */ }
  }

  const color = CATEGORY_COLORS[item.category ?? ''] ?? '#ED693A'
  const time = timeAgo(item.published_at)
  const fullDate = formatDate(item.published_at)

  return (
    <div className={cn(
      'seeper-card flex flex-col gap-0 overflow-hidden transition-transform duration-150 hover:-translate-y-0.5',
      hero && 'col-span-2'
    )}>
      {/* Image */}
      <div className={cn(
        'w-full bg-[var(--color-raised)] flex items-center justify-center overflow-hidden flex-shrink-0',
        hero ? 'h-[220px]' : 'h-[140px]'
      )}>
        {item.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.image_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="text-3xl opacity-20" style={{ color }}>◈</span>
        )}
      </div>

      <div className="p-4 flex flex-col gap-2 flex-1">
        {/* Category + featured badge */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color }}>
            {item.category ?? 'News'}
          </span>
          {showFeaturedBadge && (
            <span className="px-1.5 py-0.5 rounded-full text-white text-[9px] font-bold" style={{ background: '#ED693A' }}>
              Featured
            </span>
          )}
        </div>

        {/* Title — links to original article, tracks view */}
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            setViews(v => v + 1)
            fetch('/api/news/view', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: item.id }),
            }).catch(() => {})
          }}
          className={cn(
            'font-bold leading-snug hover:text-plasma transition-colors line-clamp-2',
            hero ? 'text-base' : 'text-sm'
          )}
        >
          {item.title}
        </a>

        {/* Summary */}
        <p className={cn(
          'text-[11px] text-[var(--color-subtext)] leading-relaxed flex-1',
          hero ? 'line-clamp-4' : 'line-clamp-3'
        )}>
          {item.summary}
        </p>

        {/* Tags */}
        {item.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {item.tags.slice(0, hero ? 6 : 3).map(tag => (
              <span key={tag} className="px-1.5 py-0.5 rounded-full text-[9px] border border-seeper-border/30 text-[var(--color-muted)]">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-seeper-border/20">
          <div className="flex flex-col gap-0.5 min-w-0">
            <div className="flex items-center gap-1.5 text-[10px] text-[var(--color-muted)]">
              <a
                href={item.source_url ?? item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium hover:text-plasma transition-colors truncate"
              >
                {item.source}
              </a>
              {item.author && (
                <>
                  <span>·</span>
                  <span className="truncate">{item.author}</span>
                </>
              )}
            </div>
            <span className="text-[10px] text-[var(--color-muted)]" title={fullDate}>{time}</span>
          </div>
          <div className="flex items-center gap-2">
            {views > 0 && (
              <span className="text-[10px] text-[var(--color-muted)]">{views} views</span>
            )}
            <UpvoteButton count={upvotes} voted={voted} onClick={handleUpvote} popping={popping} />
          </div>
        </div>
      </div>
    </div>
  )
}
