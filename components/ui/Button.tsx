'use client'
import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-display font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-plasma/50 disabled:opacity-50 disabled:cursor-not-allowed',
          // Variants
          variant === 'primary' && 'bg-plasma text-seeper-white rounded-full hover:bg-plasma/90 active:scale-95',
          variant === 'secondary' && 'bg-seeper-raised text-seeper-white border border-seeper-border rounded-xl hover:border-plasma/50',
          variant === 'ghost' && 'bg-transparent text-plasma border border-plasma rounded-full hover:bg-plasma/10',
          // Sizes
          size === 'sm' && 'px-4 py-1.5 text-sm',
          size === 'md' && 'px-6 py-2.5 text-sm',
          size === 'lg' && 'px-8 py-3 text-base',
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
export default Button
