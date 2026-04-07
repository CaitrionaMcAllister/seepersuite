'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

const CATEGORIES = ['creative', 'production', 'tech', 'business', 'ai', 'general']
const STATUSES = ['pending', 'approved', 'rejected']

interface ContributionEditorClientProps {
  contribution: {
    id: string
    title: string
    category: string
    description: string
    tags: string[]
    url: string | null
    submitter_name: string
    submitted_at: string
    status: string
  }
}

export function ContributionEditorClient({ contribution }: ContributionEditorClientProps) {
  const router = useRouter()

  // Parse submitted_at into separate date and time for inputs
  const initialDate = new Date(contribution.submitted_at)
  const toDateValue = (d: Date) => d.toISOString().slice(0, 10)
  const toTimeValue = (d: Date) => d.toISOString().slice(11, 16)

  const [title, setTitle] = useState(contribution.title)
  const [category, setCategory] = useState(contribution.category)
  const [description, setDescription] = useState(contribution.description)
  const [tagsInput, setTagsInput] = useState((contribution.tags ?? []).join(', '))
  const [url, setUrl] = useState(contribution.url ?? '')
  const [submitterName, setSubmitterName] = useState(contribution.submitter_name)
  const [dateValue, setDateValue] = useState(toDateValue(initialDate))
  const [timeValue, setTimeValue] = useState(toTimeValue(initialDate))
  const [status, setStatus] = useState(contribution.status)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    if (!title.trim()) { setError('Title is required'); return }
    if (!submitterName.trim()) { setError('Submitted by is required'); return }
    setSaving(true)
    setError(null)

    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean)
    const submitted_at = new Date(`${dateValue}T${timeValue}:00Z`).toISOString()

    const res = await fetch('/api/admin/contributions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: contribution.id, title, category, description, tags, url: url || null, submitter_name: submitterName, submitted_at, status }),
    })

    setSaving(false)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? 'Failed to save')
    } else {
      router.push(`/wiki/contribution-${contribution.id}`)
    }
  }

  return (
    <div className="max-w-4xl mx-auto page-enter">
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-xl font-black" style={{ color: 'var(--color-wiki)' }}>Edit contribution</h1>
      </div>

      <div className="flex gap-6">
        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-4">
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full bg-transparent border-b-2 border-seeper-border/60 focus:border-quantum/60 pb-2 text-2xl font-bold font-display outline-none transition-colors"
          />
          <div>
            <label className="block text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider mb-2">Description / Content</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Description or content…"
              rows={10}
              className="w-full bg-[var(--color-raised)] border border-seeper-border/40 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-quantum/60 resize-y leading-relaxed"
            />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>

        {/* Sidebar */}
        <div className="w-56 flex-shrink-0 space-y-5">
          {/* Status */}
          <div>
            <label className="block text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider mb-2">Status</label>
            <div className="flex flex-col gap-1">
              {STATUSES.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={cn(
                    'text-left px-3 py-1.5 rounded-lg text-xs capitalize transition-all',
                    status === s
                      ? 'bg-quantum/10 text-quantum border border-quantum/40'
                      : 'text-[var(--color-subtext)] hover:bg-[var(--color-raised)]'
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider mb-2">Category</label>
            <div className="flex flex-col gap-1">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={cn(
                    'text-left px-3 py-1.5 rounded-lg text-xs capitalize transition-all',
                    category === cat
                      ? 'bg-quantum/10 text-quantum border border-quantum/40'
                      : 'text-[var(--color-subtext)] hover:bg-[var(--color-raised)]'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider mb-2">Tags</label>
            <input
              type="text"
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              placeholder="#tech, #ue5..."
              className="w-full bg-[var(--color-raised)] border border-seeper-border/40 rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-quantum/60"
            />
            <p className="text-[10px] text-[var(--color-muted)] mt-1">Comma-separated</p>
          </div>

          {/* URL */}
          <div>
            <label className="block text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider mb-2">URL</label>
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://..."
              className="w-full bg-[var(--color-raised)] border border-seeper-border/40 rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-quantum/60"
            />
          </div>

          {/* Submitted by */}
          <div>
            <label className="block text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider mb-2">Submitted by</label>
            <input
              type="text"
              value={submitterName}
              onChange={e => setSubmitterName(e.target.value)}
              placeholder="Name"
              className="w-full bg-[var(--color-raised)] border border-seeper-border/40 rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-quantum/60"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider mb-2">Date</label>
            <input
              type="date"
              value={dateValue}
              onChange={e => setDateValue(e.target.value)}
              className="w-full bg-[var(--color-raised)] border border-seeper-border/40 rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-quantum/60"
            />
          </div>

          {/* Time */}
          <div>
            <label className="block text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider mb-2">Time (UTC)</label>
            <input
              type="time"
              value={timeValue}
              onChange={e => setTimeValue(e.target.value)}
              className="w-full bg-[var(--color-raised)] border border-seeper-border/40 rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-quantum/60"
            />
          </div>

          {/* Save */}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full py-2 rounded-full bg-quantum text-seeper-black text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>

          <button
            type="button"
            onClick={() => router.push(`/wiki/contribution-${contribution.id}`)}
            className="w-full py-2 rounded-full border border-seeper-border/40 text-xs text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
