import { describe, it, expect, vi } from 'vitest'

// Mock the Anthropic SDK before importing the module
vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: {
      create: vi.fn().mockResolvedValue({
        content: [{ type: 'text', text: 'Mocked Claude response.' }],
      }),
    },
  })),
}))

import { generateDailyDigest, summariseArticle, tagContent, generateNewsletterIntro } from '@/lib/claude'

describe('generateDailyDigest', () => {
  it('returns a string', async () => {
    const result = await generateDailyDigest(['headline 1', 'headline 2'])
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('returns fallback string when given empty headlines', async () => {
    const result = await generateDailyDigest([])
    expect(typeof result).toBe('string')
  })
})

describe('summariseArticle', () => {
  it('returns a string summary', async () => {
    const result = await summariseArticle('Test Title', 'Some article content.')
    expect(typeof result).toBe('string')
  })
})

describe('tagContent', () => {
  it('returns an array of strings', async () => {
    const result = await tagContent('AI News', 'Some excerpt about machine learning.')
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBeGreaterThan(0)
  })
})

describe('generateNewsletterIntro', () => {
  it('returns a string', async () => {
    const result = await generateNewsletterIntro(['item 1', 'item 2'])
    expect(typeof result).toBe('string')
  })
})
