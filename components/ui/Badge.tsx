import { type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import { CATEGORIES } from '@/lib/constants'
import type { WikiCategory } from '@/types'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  category?: WikiCategory | string
  custom?: string // custom colour class override
}

export default function Badge({ category, custom, className, children, ...props }: BadgeProps) {
  const categoryDef = CATEGORIES.find(c => c.value === category)
  const colorClass = custom ?? categoryDef?.color ?? 'bg-seeper-raised text-seeper-steel'

  return (
    <span
      className={cn('pill-tag', colorClass, className)}
      {...props}
    >
      {children ?? categoryDef?.label ?? category}
    </span>
  )
}
