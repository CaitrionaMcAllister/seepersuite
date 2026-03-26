'use client'

import { MOCK_TICKER_HEADLINES } from '@/lib/constants'

interface NewsTickerProps {
  items?: readonly string[]
}

export function NewsTicker({ items = MOCK_TICKER_HEADLINES }: NewsTickerProps) {
  const doubled = [...items, ...items]

  return (
    <div
      className="h-[34px] flex items-center overflow-hidden border-t border-seeper-border/40 bg-seeper-black"
      aria-hidden="true"
    >
      <div className="flex items-center gap-0 whitespace-nowrap animate-[ticker_40s_linear_infinite] hover:[animation-play-state:paused]">
        {doubled.map((item, i) => (
          <span key={i} className="flex items-center gap-4">
            <span className="text-xs text-seeper-steel px-4">{item}</span>
            <span className="text-plasma text-[8px]">●</span>
          </span>
        ))}
      </div>
    </div>
  )
}
