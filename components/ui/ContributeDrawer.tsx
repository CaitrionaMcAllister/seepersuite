'use client'

import { useState, useRef, useEffect } from 'react'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/lib/utils'

const SECTIONS: Record<string, { label: string; color: string; categories: { id: string; label: string; color: string }[] }> = {
  seeWiki: {
    label: 'seeWiki', color: '#B0A9CF',
    categories: [
      { id: 'creative',   label: 'Creative',   color: '#ED693A' },
      { id: 'production', label: 'Production', color: '#B0A9CF' },
      { id: 'tech',       label: 'Tech',       color: '#DCFEAD' },
      { id: 'business',   label: 'Business',   color: '#EDDE5C' },
      { id: 'ai',         label: 'AI',         color: '#8ACB8F' },
      { id: 'general',    label: 'General',    color: '#C3C3C3' },
    ],
  },
  seeNews: {
    label: 'seeNews', color: '#ED693A',
    categories: [
      { id: 'AI & ML',       label: 'AI',           color: '#7F77DD' },
      { id: 'Immersive',     label: 'Immersive',    color: '#ED693A' },
      { id: 'Tools',         label: 'Tools',        color: '#DCFEAD' },
      { id: 'Spatial',       label: 'Spatial',      color: '#B0A9CF' },
      { id: 'Creative Tech', label: 'Creative Tech', color: '#EDDE5C' },
      { id: 'Industry',      label: 'Industry',     color: '#D4537E' },
      { id: 'Events',        label: 'Events',       color: '#ED693A' },
      { id: 'Audio',         label: 'Audio',        color: '#8ACB8F' },
    ],
  },
  seeTools: {
    label: 'seeTools', color: '#DCFEAD',
    categories: [
      { id: 'creative',      label: 'Creative',      color: '#ED693A' },
      { id: 'production',    label: 'Production',    color: '#B0A9CF' },
      { id: 'tech',          label: 'Tech',          color: '#DCFEAD' },
      { id: 'management',    label: 'Management',    color: '#EDDE5C' },
      { id: 'communication', label: 'Communication', color: '#8ACB8F' },
    ],
  },
  seeResources: {
    label: 'seeResources', color: '#8ACB8F',
    categories: [
      { id: 'documents',    label: 'Documents',    color: '#8ACB8F' },
      { id: 'links',        label: 'Links',        color: '#B0A9CF' },
      { id: 'templates',    label: 'Templates',    color: '#DCFEAD' },
      { id: 'brand_assets', label: 'Brand Assets', color: '#ED693A' },
      { id: 'research',     label: 'Research',     color: '#EDDE5C' },
      { id: 'other',        label: 'Other',        color: '#C3C3C3' },
    ],
  },
  seePrompts: {
    label: 'seePrompts', color: '#EDDE5C',
    categories: [
      { id: 'concept',    label: 'Concept',    color: '#ED693A' },
      { id: 'production', label: 'Production', color: '#B0A9CF' },
      { id: 'audio',      label: 'Audio',      color: '#8ACB8F' },
      { id: 'copy',       label: 'Copy',       color: '#EDDE5C' },
      { id: 'research',   label: 'Research',   color: '#7F77DD' },
      { id: '3d',         label: '3D',         color: '#DCFEAD' },
      { id: 'code',       label: 'Code',       color: '#D4537E' },
    ],
  },
  seeInside: {
    label: 'seeInside', color: '#D4537E',
    categories: [
      { id: 'creative',   label: 'Creative',   color: '#ED693A' },
      { id: 'business',   label: 'Business',   color: '#EDDE5C' },
      { id: 'production', label: 'Production', color: '#B0A9CF' },
      { id: 'general',    label: 'General',    color: '#C3C3C3' },
    ],
  },
}

const SECTION_ORDER = ['seeWiki', 'seeNews', 'seeTools', 'seeResources', 'seePrompts', 'seeInside']

const PRESET_TAGS = [
  '#ai','#creative','#production','#tech','#business',
  '#tools','#ue5','#projection','#audio','#xr','#3d',
  '#research','#workflow','#client','#concept',
]

interface ContributeDrawerProps {
  open: boolean
  onClose: () => void
  authorName?: string
  defaultSection?: string | null
}

export function ContributeDrawer({ open, onClose, authorName = '', defaultSection }: ContributeDrawerProps) {
  const { toast } = useToast()
  const [name, setName] = useState(authorName)
  const [title, setTitle] = useState('')
  const [section, setSection] = useState(defaultSection ?? 'seeWiki')
  const [category, setCategory] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [customTag, setCustomTag] = useState('')
  const [description, setDescription] = useState('')
  const [url, setUrl] = useState('')
  const [fileName, setFileName] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const fileRef = useRef<HTMLInputElement>(null)

  // Sync section when page changes (drawer closed → re-opened on a different page)
  useEffect(() => {
    if (defaultSection && !open) setSection(defaultSection)
  }, [defaultSection, open])

  const activeSection = SECTIONS[section] ?? SECTIONS.seeWiki
  const sectionColor = activeSection.color
  const categories = activeSection.categories

  const handleSectionChange = (s: string) => {
    setSection(s)
    setCategory('') // reset category when section changes
  }

  if (!open) return null

  const validate = () => {
    const e: Record<string, string> = {}
    if (!name.trim())              e.name = 'Name is required'
    if (title.trim().length < 5)   e.title = 'Title must be at least 5 characters'
    if (!category)                 e.category = 'Please select a category'
    if (description.trim().length < 10) e.description = 'Description must be at least 10 characters'
    if (url && !/^https:\/\//.test(url)) e.url = 'URL must start with https://'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const handleCustomTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && customTag.trim()) {
      e.preventDefault()
      const tag = customTag.trim().startsWith('#')
        ? customTag.trim()
        : `#${customTag.trim()}`
      if (!selectedTags.includes(tag)) {
        setSelectedTags(prev => [...prev, tag])
      }
      setCustomTag('')
    }
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      // TODO Task 10: replace with multipart/form-data to send actual file
      const res = await fetch('/api/contribute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submitter_name: name,
          title,
          section,
          category,
          tags: selectedTags,
          description,
          url: url || null,
          file_name: fileName || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed')
      toast('Contribution submitted! The team will see it shortly.', 'success')
      onClose()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      console.error('[contribute submit]', msg)
      toast(`Submit failed: ${msg}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  const isValid = name.trim() && title.trim().length >= 5 && category && description.trim().length >= 10

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[998] bg-black/50"
        onClick={onClose}
      />
      {/* Drawer */}
      <div className="fixed bottom-0 right-0 z-[999] w-[400px] max-h-[85vh] flex flex-col rounded-tl-2xl bg-[var(--color-surface)] border border-seeper-border/40 shadow-2xl animate-[slideInFromBottom_0.3s_ease]">
        {/* Header */}
        <div className="border-b border-seeper-border/40">
          <div className="flex items-center justify-between px-5 py-4 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-tight">contribute to</span>
              <span className="text-sm font-bold" style={{ color: sectionColor }}>{activeSection.label}</span>
            </div>
            <button type="button" onClick={onClose} className="text-seeper-steel hover:text-[var(--color-text)] transition-colors">✕</button>
          </div>
          {/* Section picker */}
          <div className="flex gap-1.5 px-5 pb-3 overflow-x-auto scrollbar-hide">
            {SECTION_ORDER.map(s => {
              const sec = SECTIONS[s]
              const active = s === section
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleSectionChange(s)}
                  style={active ? { borderColor: sec.color, color: sec.color, backgroundColor: `${sec.color}18` } : {}}
                  className={cn(
                    'flex-shrink-0 px-3 py-1 rounded-full text-[11px] font-medium border transition-all duration-150',
                    active
                      ? 'border-2'
                      : 'border-seeper-border/40 text-[var(--color-muted)] hover:border-seeper-border'
                  )}
                >
                  {sec.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Name */}
          <div>
            <label className="text-xs text-[var(--color-subtext)] mb-1 flex items-center gap-2">
              Your name <span aria-hidden="true" className="px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px]">required</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onBlur={() => !name.trim() && setErrors(p => ({ ...p, name: 'Name is required' }))}
              placeholder="e.g. Caitriona McAllister"
              className={cn(
                'w-full bg-[var(--color-raised)] border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-plasma/60',
                errors.name ? 'border-red-500' : 'border-seeper-border/40'
              )}
            />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Title */}
          <div>
            <label className="text-xs text-[var(--color-subtext)] mb-1 flex items-center gap-2">
              Title <span aria-hidden="true" className="px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px]">required</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Give your contribution a clear, descriptive title"
              className={cn(
                'w-full bg-[var(--color-raised)] border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-plasma/60',
                errors.title ? 'border-red-500' : 'border-seeper-border/40'
              )}
            />
            {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Category grid */}
          <div>
            <label className="text-xs text-[var(--color-subtext)] mb-2 flex items-center gap-2">
              Category <span aria-hidden="true" className="px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px]">required</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map(cat => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  style={category === cat.id ? {
                    borderColor: cat.color,
                    backgroundColor: `${cat.color}14`,
                    color: cat.color,
                  } : {}}
                  className={cn(
                    'py-2 px-2 rounded-lg border text-xs font-medium transition-all duration-150',
                    category === cat.id
                      ? 'border-2'
                      : 'border-seeper-border/40 text-[var(--color-subtext)] hover:border-seeper-border'
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            {errors.category && <p className="text-red-400 text-xs mt-1">{errors.category}</p>}
          </div>

          {/* Tags */}
          <div>
            <label className="text-xs text-[var(--color-subtext)] mb-2 flex items-center gap-2">
              Tags <span aria-hidden="true" className="px-1.5 py-0.5 rounded-full bg-[var(--color-raised)] text-[var(--color-muted)] text-[10px]">optional</span>
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {PRESET_TAGS.map(tag => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={cn(
                    'px-2 py-0.5 rounded-full text-xs border transition-all duration-150',
                    selectedTags.includes(tag)
                      ? 'border-plasma bg-plasma/10 text-plasma'
                      : 'border-seeper-border/40 text-[var(--color-muted)] hover:border-seeper-border'
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={customTag}
              onChange={e => setCustomTag(e.target.value)}
              onKeyDown={handleCustomTag}
              placeholder="Add custom tag..."
              className="w-full bg-[var(--color-raised)] border border-seeper-border/40 rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-plasma/60"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs text-[var(--color-subtext)] mb-1 flex items-center gap-2">
              Description <span aria-hidden="true" className="px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px]">required</span>
            </label>
            <div className="relative">
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value.slice(0, 500))}
                placeholder="Describe what you're contributing and why it's useful to the team..."
                rows={4}
                className={cn(
                  'w-full bg-[var(--color-raised)] border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-plasma/60 resize-none',
                  errors.description ? 'border-red-500' : 'border-seeper-border/40'
                )}
              />
              <span className="absolute bottom-2 right-2 text-[10px] text-[var(--color-muted)]">
                {description.length} / 500
              </span>
            </div>
            {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description}</p>}
          </div>

          {/* URL */}
          <div>
            <label className="text-xs text-[var(--color-subtext)] mb-1 flex items-center gap-2">
              Link / URL <span aria-hidden="true" className="px-1.5 py-0.5 rounded-full bg-[var(--color-raised)] text-[var(--color-muted)] text-[10px]">optional</span>
            </label>
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://..."
              className={cn(
                'w-full bg-[var(--color-raised)] border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-plasma/60',
                errors.url ? 'border-red-500' : 'border-seeper-border/40'
              )}
            />
            {errors.url && <p className="text-red-400 text-xs mt-1">{errors.url}</p>}
          </div>

          {/* File upload */}
          <div>
            <label className="text-xs text-[var(--color-subtext)] mb-1 flex items-center gap-2">
              Attach file <span aria-hidden="true" className="px-1.5 py-0.5 rounded-full bg-[var(--color-raised)] text-[var(--color-muted)] text-[10px]">optional</span>
            </label>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.doc,.docx,.png,.jpg,.mp4"
              className="hidden"
              onChange={e => setFileName(e.target.files?.[0]?.name ?? '')}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full bg-[var(--color-raised)] border border-seeper-border/40 rounded-lg px-3 py-2 text-sm text-[var(--color-subtext)] text-left hover:border-seeper-border transition-colors"
            >
              {fileName || 'Choose file (PDF, DOC, PNG, JPG, MP4 — max 10MB)'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 pt-3 border-t border-seeper-border/40">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isValid || loading}
            className={cn(
              'w-full py-3 rounded-full text-sm font-bold text-white transition-all duration-150',
              isValid && !loading
                ? 'bg-plasma hover:bg-plasma/90 active:scale-[0.97]'
                : 'bg-plasma/40 cursor-not-allowed opacity-50'
            )}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting...
              </span>
            ) : (
              'Submit contribution →'
            )}
          </button>
        </div>
      </div>
    </>
  )
}
