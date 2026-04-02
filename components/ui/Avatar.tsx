import { cn, getInitials } from '@/lib/utils'

interface AvatarProps {
  src?: string | null
  name?: string | null
  size?: number // px
  color?: string | null // hex — falls back to deterministic color from name
  className?: string
}

// Seeper accent palette used for avatar backgrounds
const AVATAR_PALETTE = [
  '#ED693A', // plasma
  '#B0A9CF', // quantum
  '#8ACB8F', // fern
  '#D4537E', // pink
  '#1D9E75', // teal
  '#7F77DD', // labs purple
]

// Light backgrounds need dark text
const LIGHT_COLORS = new Set(['#DCFEAD', '#EDDE5C', '#8ACB8F'])

/** Deterministic color from a name string */
function colorFromName(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length]
}

export default function Avatar({ src, name, size = 40, color, className }: AvatarProps) {
  const initials = getInitials(name ?? '')
  const style = { width: size, height: size, minWidth: size, fontSize: size * 0.38 }

  if (src) {
    return (
      <div style={style} className={cn('rounded-full overflow-hidden flex-shrink-0', className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={name ?? 'avatar'} className="w-full h-full object-cover" />
      </div>
    )
  }

  const bg = color ?? colorFromName(name ?? '?')
  const textColor = LIGHT_COLORS.has(bg) ? '#111111' : '#ffffff'

  return (
    <div
      style={{ ...style, backgroundColor: bg, color: textColor }}
      className={cn(
        'rounded-full flex items-center justify-center font-display font-semibold select-none flex-shrink-0',
        className
      )}
    >
      {initials}
    </div>
  )
}
