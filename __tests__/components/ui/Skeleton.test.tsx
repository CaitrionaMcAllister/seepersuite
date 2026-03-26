import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Skeleton, SkeletonCard, SkeletonRow } from '@/components/ui/Skeleton'

describe('Skeleton', () => {
  it('renders with aria-hidden', () => {
    const { container } = render(<Skeleton />)
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true')
  })
  it('applies custom className', () => {
    const { container } = render(<Skeleton className="h-4 w-full" />)
    expect(container.firstChild).toHaveClass('h-4', 'w-full')
  })
  it('SkeletonCard renders', () => {
    const { container } = render(<SkeletonCard />)
    expect(container.firstChild).toBeTruthy()
  })
  it('SkeletonRow renders', () => {
    const { container } = render(<SkeletonRow />)
    expect(container.firstChild).toBeTruthy()
  })
})
