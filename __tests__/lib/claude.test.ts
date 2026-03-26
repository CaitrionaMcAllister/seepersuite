import { describe, it, expect, vi, beforeAll } from 'vitest'

// Hoist mockCreate so it's available inside the vi.mock factory (which is hoisted)
const { mockCreate } = vi.hoisted(() => {
  const mockCreate = vi.fn().mockResolvedValue({
    content: [{ type: 'text', text: 'Mocked Claude response.' }],
  })
  return { mockCreate }
})

vi.mock('@anthropic-ai/sdk', () => {
  return {
    default: class MockAnthropic {
      messages = { create: mockCreate }
    },
  }
})

import { generateDailyDigest, summariseArticle, tagContent, generateNewsletterIntro } from '@/lib/claude'

beforeAll(() => {
  // Ensure API key is set so getClient() doesn't throw in tests
  process.env.ANTHROPIC_API_KEY = 'test-key'
})

describe('generateDailyDigest', () => {
  it('returns MOCK_DIGEST_STORIES array for empty headlines (no API call)', async () => {
    const result = await generateDailyDigest([])
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBeGreaterThan(0)
    expect(result[0]).toHaveProperty('title')
    expect(result[0]).toHaveProperty('summary')
  })

  it('calls Claude and returns parsed DigestStory[] on success', async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: 'text', text: '[{"title":"T","summary":"S","sources":["X"],"category":"AI"}]' }]
    })
    const result = await generateDailyDigest(['headline 1'])
    expect(Array.isArray(result)).toBe(true)
    expect(result[0]).toHaveProperty('title', 'T')
    expect(result[0]).toHaveProperty('summary', 'S')
  })

  it('returns MOCK_DIGEST_STORIES when Claude API fails', async () => {
    mockCreate.mockRejectedValueOnce(new Error('API error'))
    const result = await generateDailyDigest(['headline 1'])
    expect(Array.isArray(result)).toBe(true)
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
