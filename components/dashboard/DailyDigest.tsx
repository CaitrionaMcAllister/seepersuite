'use client'

import { useState, useEffect } from 'react'
import { Newspaper } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DigestStory } from '@/types'

interface DailyDigestProps {
  initialStories?: DigestStory[]
}

export function DailyDigest({ initialStories = [] }: DailyDigestProps) {
  const [stories, setStories] = useState<DigestStory[]>(initialStories)
  const [current, setCurrent] = useState(0)
  const [visible, setVisible] = useState(true)
  const [loading, setLoading] = useState(initialStories.length === 0)

  useEffect(() => {
    if (initialStories.length > 0) return
    fetch('/api/digest')
      .then(r => r.json())
      .then(d => {
        if (d.stories) setStories(d.stories)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [initialStories.length])

  const navigate = (next: number) => {
    if (next === current) return
    setVisible(false)
    setTimeout(() => {
      setCurrent(next)
      setVisible(true)
    }, 150)
  }

  const story = stories[current]

  return (
    <div className="seeper-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Newspaper size={14} className="text-plasma" />
          <span className="text-xs font-bold uppercase tracking-widest text-plasma">today&apos;s digest</span>
        </div>
        {stories.length > 1 && (
          <span className="text-[10px] text-[var(--color-muted)]">
            {current + 1} / {stories.length}
          </span>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          <div className="skeleton-shimmer h-4 w-3/4 rounded" />
          <div className="skeleton-shimmer h-3 w-full rounded" />
          <div className="skeleton-shimmer h-3 w-2/3 rounded" />
        </div>
      ) : story ? (
        <div className={cn('transition-opacity duration-[200ms]', visible ? 'opacity-100' : 'opacity-0')}>
          <p className="text-xs font-bold text-[var(--color-subtext)] uppercase tracking-widest mb-1">
            {story.category}
          </p>
          <h3 className="font-bold text-sm mb-2 leading-snug">{story.title}</h3>
          <p className="text-[11px] text-[var(--color-subtext)] leading-relaxed mb-3">
            {story.summary}
          </p>
          {story.sources.length > 0 && (
            <div className="flex gap-1.5">
              {story.sources.map(s => (
                <span key={s} className="px-2 py-0.5 rounded-full bg-[var(--color-raised)] text-[9px] text-[var(--color-muted)]">
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {stories.length > 1 && (
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => navigate((current - 1 + stories.length) % stories.length)}
            className="w-7 h-7 flex items-center justify-center rounded-full border border-seeper-border/40 text-sm hover:border-plasma/60 transition-colors"
          >
            ‹
          </button>
          <div className="flex gap-1.5">
            {stories.map((_, i) => (
              <button
                key={i}
                onClick={() => navigate(i)}
                className={cn(
                  'w-1.5 h-1.5 rounded-full transition-all duration-150',
                  i === current ? 'bg-plasma w-3' : 'bg-seeper-border hover:bg-seeper-steel'
                )}
              />
            ))}
          </div>
          <button
            onClick={() => navigate((current + 1) % stories.length)}
            className="w-7 h-7 flex items-center justify-center rounded-full border border-seeper-border/40 text-sm hover:border-plasma/60 transition-colors"
          >
            ›
          </button>
        </div>
      )}
    </div>
  )
}
