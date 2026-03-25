import { type TextareaHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, className, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={id} className="text-sm font-display font-medium text-seeper-steel">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          className={cn(
            'w-full bg-seeper-raised border border-seeper-border rounded-xl px-4 py-3',
            'font-body text-seeper-white placeholder:text-seeper-muted',
            'focus:outline-none focus:ring-2 focus:ring-plasma/50 focus:border-plasma/50',
            'transition-colors duration-200 resize-y min-h-[120px]',
            className
          )}
          {...props}
        />
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
export default Textarea
