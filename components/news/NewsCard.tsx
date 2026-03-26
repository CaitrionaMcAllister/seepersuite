'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import type { NewsItem } from '@/types'

// Category colour mapping
const CATEGORY_COLORS: Record<string, string> = {
  'AI & ML': '#B0A9CF',
  'Industry': '#ED693A',
  'Tools': '#DCFEAD',
  'Spatial Audio': '#8ACB8F',
  'Spatial Computing': '#7F77DD',
  'Creative Tech': '#EDDE5C',
}

interface NewsCardProps {
  item: NewsItem
  featured?: boolean
}

export function NewsCard({ item, featured = false }: NewsCardProps) {
  // localStorage-backed vote state
  const storageKey = `seeper-news-votes`
  const getVoted = () => {
    if (typeof window === 'undefined') return false
    const stored = JSON.parse(localStorage.getItem(storageKey) ?? '[]') as string[]
    return stored.includes(item.id)
  }

  const [upvotes, setUpvotes] = useState(item.upvotes)
  const [voted, setVoted] = useState(false)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setVoted(getVoted()) }, [])
  const [popping, setPopping] = useState(false)

  const handleUpvote = () => {
    const stored = JSON.parse(localStorage.getItem(storageKey) ?? '[]') as string[]
    if (voted) {
      setUpvotes(p => p - 1)
      setVoted(false)
      localStorage.setItem(storageKey, JSON.stringify(stored.filter((id: string) => id !== item.id)))
    } else {
      setUpvotes(p => p + 1)
      setVoted(true)
      setPopping(true)
      setTimeout(() => setPopping(false), 300)
      localStorage.setItem(storageKey, JSON.stringify([...stored, item.id]))
    }
  }

  const categoryColor = CATEGORY_COLORS[item.category] ?? '#ED693A'

  return (
    <div className={cn(
      'seeper-card p-4 flex flex-col gap-3 transition-transform duration-150 hover:-translate-y-0.5',
      featured && 'col-span-2'
    )}>
      {/* Category */}
      <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: categoryColor }}>
        {item.category}
        {featured && (
          <span className="ml-2 px-1.5 py-0.5 rounded-full text-white text-[9px]" style={{ background: '#ED693A' }}>
            Featured
          </span>
        )}
      </span>

      {/* Title */}
      <h3 className={cn(
        'font-bold leading-snug line-clamp-2',
        featured ? 'text-base' : 'text-sm'
      )}>
        {item.title}
      </h3>

      {/* Image placeholder */}
      <div className={cn(
        'rounded-xl bg-[var(--color-raised)] flex items-center justify-center overflow-hidden',
        featured ? 'h-[200px]' : 'h-[120px]'
      )}>
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="text-xs text-[var(--color-muted)]">{item.category}</span>
        )}
      </div>

      {/* Summary */}
      <p className={cn(
        'text-[11px] text-[var(--color-subtext)] leading-relaxed',
        featured ? 'line-clamp-5' : 'line-clamp-3'
      )}>
        {item.summary}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-1">
        <div className="flex items-center gap-2 text-[10px] text-[var(--color-muted)]">
          <span className="px-2 py-0.5 rounded-full bg-[var(--color-raised)]">{item.source}</span>
          <span>·</span>
          <span>{new Date(item.publishedAt).toLocaleDateString('en-GB', { day:'numeric', month:'short' })}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[var(--color-muted)] px-1.5 py-0.5 rounded-full border border-seeper-border/40">anon ok</span>
          <button
            onClick={handleUpvote}
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-full text-xs border transition-all duration-150 active:scale-[0.95]',
              voted
                ? 'border-plasma text-plasma bg-plasma/10'
                : 'border-seeper-border/40 text-[var(--color-muted)] hover:border-plasma/60 hover:text-plasma'
            )}
          >
            ▲ <span className={cn(popping && 'upvote-pop')}>{upvotes}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
