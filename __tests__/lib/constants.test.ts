import { describe, it, expect } from 'vitest'
import { NAV_SECTIONS, CATEGORIES, DEPARTMENTS } from '@/lib/constants'

describe('NAV_SECTIONS', () => {
  it('contains three top-level sections', () => {
    expect(NAV_SECTIONS).toHaveLength(3)
  })

  it('all nav items have required fields', () => {
    NAV_SECTIONS.forEach(section => {
      section.items.forEach(item => {
        expect(item).toHaveProperty('label')
        expect(item).toHaveProperty('href')
        expect(item).toHaveProperty('icon')
      })
    })
  })
})

describe('CATEGORIES', () => {
  it('includes expected categories', () => {
    const values = CATEGORIES.map(c => c.value)
    expect(values).toContain('creative')
    expect(values).toContain('tech')
    expect(values).toContain('ai')
  })
})

describe('DEPARTMENTS', () => {
  it('includes all seeper departments', () => {
    const values = DEPARTMENTS.map(d => d.value)
    expect(values).toContain('creative')
    expect(values).toContain('production')
    expect(values).toContain('tech')
  })
})
