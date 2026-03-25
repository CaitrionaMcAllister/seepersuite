// Generic reusable ticker — wraps any child items in the CSS scroll animation.
// Used by NewsTicker. Kept as a primitive for future reuse.
import { type ReactNode } from 'react'

interface TickerProps {
  children: ReactNode
  className?: string
}

export default function Ticker({ children, className = '' }: TickerProps) {
  return (
    <div className={`overflow-hidden flex items-center ${className}`}>
      <div className="ticker-track">
        {children}
      </div>
    </div>
  )
}
