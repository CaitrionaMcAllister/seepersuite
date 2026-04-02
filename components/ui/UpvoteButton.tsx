'use client'

import { cn } from '@/lib/utils'

interface UpvoteButtonProps {
  count: number
  voted: boolean
  onClick: () => void
  popping?: boolean
}

export function UpvoteButton({ count, voted, onClick, popping = false }: UpvoteButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1 px-2 py-1 rounded-full text-xs border transition-all duration-150',
        voted
          ? 'border-plasma text-plasma bg-plasma/10'
          : 'border-seeper-border/40 text-[var(--color-muted)] hover:border-plasma/60 hover:text-plasma'
      )}
    >
      ▲ <span className={cn(popping && 'upvote-pop')}>{count}</span>
    </button>
  )
}
