import { type InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={id} className="text-sm font-display font-medium text-seeper-steel">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          aria-describedby={id && error ? `${id}-error` : undefined}
          aria-invalid={!!error}
          className={cn(
            'w-full bg-seeper-raised border border-seeper-border rounded-xl px-4 py-3',
            'font-body text-seeper-white placeholder:text-seeper-muted',
            'focus:outline-none focus:ring-2 focus:ring-plasma/50 focus:border-plasma/50',
            'transition-colors duration-200',
            error && 'border-red-500 focus:ring-red-500/50',
            className
          )}
          {...props}
        />
        {error && <p id={id ? `${id}-error` : undefined} className="text-xs text-red-400 font-body">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
export default Input
