import { type HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  raised?: boolean
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ raised = false, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          raised ? 'seeper-card-raised' : 'seeper-card',
          'shadow-card',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'
export default Card
