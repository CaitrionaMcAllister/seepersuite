'use client'

import { useEffect, useState } from 'react'
import { MOCK_TICKER_HEADLINES } from '@/lib/constants'

interface FeaturedItem {
  id: string
  title: string
  url: string
  source: string
}

export function NewsTicker() {
  const [items, setItems] = useState<{ label: string; url: string }[]>([])

  useEffect(() => {
    fetch('/api/news/featured')
      .then(r => r.json())
      .then((data: FeaturedItem[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setItems(data.map(d => ({ label: `${d.source.toUpperCase()} — ${d.title}`, url: d.url })))
        } else {
          setItems(MOCK_TICKER_HEADLINES.map(h => ({ label: h, url: '' })))
        }
      })
      .catch(() => {
        setItems(MOCK_TICKER_HEADLINES.map(h => ({ label: h, url: '' })))
      })
  }, [])

  if (items.length === 0) return (
    <div className="h-[34px] border-t border-seeper-border/40 bg-seeper-surface" aria-hidden="true" />
  )

  const doubled = [...items, ...items]

  return (
    <div
      className="h-[34px] flex items-center overflow-hidden border-t border-seeper-border/40 bg-seeper-surface"
      aria-hidden="true"
    >
      <div className="flex items-center gap-0 whitespace-nowrap animate-[ticker_90s_linear_infinite] hover:[animation-play-state:paused]">
        {doubled.map((item, i) => (
          <span key={i} className="flex items-center gap-4">
            {item.url ? (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-seeper-steel px-4 hover:text-plasma transition-colors"
              >
                {item.label}
              </a>
            ) : (
              <span className="text-xs text-seeper-steel px-4">{item.label}</span>
            )}
            <span className="text-plasma text-[8px]">●</span>
          </span>
        ))}
      </div>
    </div>
  )
}
