'use client'

import { useState, KeyboardEvent } from 'react'
import Avatar from '@/components/ui/Avatar'
import type { WikiCategory } from '@/types'

const CATEGORIES: { value: WikiCategory; label: string }[] = [
  { value: 'creative',   label: 'Creative' },
  { value: 'tech',       label: 'Tech' },
  { value: 'production', label: 'Production' },
  { value: 'business',   label: 'Business' },
  { value: 'ai',         label: 'AI' },
  { value: 'general',    label: 'General' },
]

type Visibility = 'published' | 'draft' | 'review'

const VISIBILITY_OPTIONS: { value: Visibility; label: string; description: string }[] = [
  { value: 'published', label: 'Published',   description: 'Visible to all team' },
  { value: 'draft',     label: 'Draft',       description: 'Only visible to you' },
  { value: 'review',    label: 'Team review', description: 'Needs admin approval' },
]

interface MetadataSidebarProps {
  category: WikiCategory | null
  onCategoryChange: (c: WikiCategory) => void
  tags: string[]
  onTagsChange: (tags: string[]) => void
  visibility: Visibility
  onVisibilityChange: (v: Visibility) => void
  authorName: string | null
  authorRole: string
  wordCount: number
  charCount: number
}

export type { Visibility }

export function MetadataSidebar({
  category, onCategoryChange,
  tags, onTagsChange,
  visibility, onVisibilityChange,
  authorName, authorRole,
  wordCount, charCount,
}: MetadataSidebarProps) {
  const [tagInput, setTagInput] = useState('')

  const addTag = () => {
    const val = tagInput.trim().replace(/^#/, '')
    if (val && !tags.includes(val)) {
      onTagsChange([...tags, val])
    }
    setTagInput('')
  }

  const removeTag = (tag: string) => onTagsChange(tags.filter(t => t !== tag))

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); addTag() }
    if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      onTagsChange(tags.slice(0, -1))
    }
  }

  const sectionLabel = (text: string) => (
    <p
      className="uppercase tracking-wider font-bold mb-2.5"
      style={{ fontSize: 9, letterSpacing: '1.5px', color: 'var(--seeper-muted)' }}
    >
      {text}
    </p>
  )

  const dividerStyle: React.CSSProperties = { borderBottom: '1px solid var(--seeper-border)', padding: 16 }

  return (
    <div
      className="overflow-y-auto flex-shrink-0"
      style={{
        width: 240,
        minWidth: 240,
        borderLeft: '1px solid var(--seeper-border)',
        background: 'var(--seeper-surface)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Category */}
      <div style={dividerStyle}>
        {sectionLabel('Category')}
        <div className="grid grid-cols-2 gap-1.5">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              type="button"
              onClick={() => onCategoryChange(cat.value)}
              className="transition-all duration-150"
              style={{
                border: category === cat.value ? '1px solid #B0A9CF' : '1px solid var(--seeper-border)',
                borderRadius: 7,
                padding: '6px 4px',
                textAlign: 'center',
                fontSize: 9,
                fontWeight: 700,
                color: category === cat.value ? '#B0A9CF' : 'var(--color-subtext)',
                background: category === cat.value ? 'rgba(176,169,207,0.1)' : 'none',
                cursor: 'pointer',
              }}
              onMouseEnter={e => {
                if (category !== cat.value) e.currentTarget.style.borderColor = '#B0A9CF'
              }}
              onMouseLeave={e => {
                if (category !== cat.value) e.currentTarget.style.borderColor = 'var(--seeper-border)'
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div style={dividerStyle}>
        {sectionLabel('Tags')}
        <input
          type="text"
          value={tagInput}
          onChange={e => setTagInput(e.target.value)}
          onKeyDown={handleTagKeyDown}
          placeholder="Add a tag, press Enter..."
          className="w-full transition-all"
          style={{
            background: 'var(--seeper-raised)',
            border: '1px solid var(--seeper-border)',
            borderRadius: 7,
            padding: '7px 9px',
            fontSize: 11,
            color: 'var(--color-text)',
            outline: 'none',
          }}
          onFocus={e => (e.currentTarget.style.borderColor = '#B0A9CF')}
          onBlur={e => (e.currentTarget.style.borderColor = 'var(--seeper-border)')}
        />
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {tags.map(tag => (
              <span
                key={tag}
                className="flex items-center gap-1"
                style={{
                  fontSize: 9,
                  padding: '2px 7px',
                  borderRadius: 20,
                  background: 'rgba(176,169,207,0.12)',
                  color: '#B0A9CF',
                  fontWeight: 600,
                  animation: 'popIn 0.15s ease',
                }}
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#B0A9CF', padding: 0, lineHeight: 1 }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Visibility */}
      <div style={dividerStyle}>
        {sectionLabel('Visibility')}
        <div className="flex flex-col gap-1.5">
          {VISIBILITY_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onVisibilityChange(opt.value)}
              className="flex items-center gap-2 text-left transition-all duration-150"
              style={{
                padding: '6px 8px',
                borderRadius: 7,
                border: visibility === opt.value ? '1px solid #B0A9CF' : '1px solid var(--seeper-border)',
                background: visibility === opt.value ? 'rgba(176,169,207,0.08)' : 'none',
                cursor: 'pointer',
              }}
            >
              <span
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  border: visibility === opt.value ? '2px solid #B0A9CF' : '2px solid var(--seeper-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {visibility === opt.value && (
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: '#B0A9CF',
                    }}
                  />
                )}
              </span>
              <span>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text)', display: 'block' }}>
                  {opt.label}
                </span>
                <span style={{ fontSize: 9, color: 'var(--seeper-muted)' }}>
                  {opt.description}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Author */}
      <div style={dividerStyle}>
        {sectionLabel('Author')}
        <div className="flex items-center gap-2">
          <Avatar name={authorName} size={24} />
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text)' }}>{authorName || 'You'}</p>
            <p style={{ fontSize: 9, color: 'var(--seeper-muted)' }}>{authorRole}</p>
          </div>
        </div>
      </div>

      {/* Word count */}
      <div style={{ padding: '10px 16px', marginTop: 'auto' }}>
        <p style={{ fontSize: 9, color: 'var(--seeper-muted)' }}>
          {wordCount} words · {charCount} characters
        </p>
      </div>
    </div>
  )
}
