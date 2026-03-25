import { cn } from '@/lib/utils'
import { getInitials } from '@/lib/utils'

interface AvatarProps {
  src?: string | null
  name?: string | null
  size?: number // px
  className?: string
}

export default function Avatar({ src, name, size = 40, className }: AvatarProps) {
  const initials = getInitials(name ?? '')
  const style = { width: size, height: size, minWidth: size, fontSize: size * 0.38 }

  if (src) {
    return (
      <img
        src={src}
        alt={name ?? 'avatar'}
        style={style}
        className={cn('rounded-full object-cover', className)}
      />
    )
  }

  return (
    <div
      style={style}
      className={cn(
        'rounded-full bg-plasma flex items-center justify-center font-display font-semibold text-seeper-white select-none',
        className
      )}
    >
      {initials}
    </div>
  )
}
