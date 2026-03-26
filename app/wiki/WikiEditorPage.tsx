'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { WikiEditor } from '@/components/wiki/WikiEditor'
import { cn } from '@/lib/utils'

const CATEGORIES = ['creative', 'production', 'tech', 'business', 'ai', 'general']

interface WikiEditorPageProps {
  userId: string
  initialTitle?: string
  initialCategory?: string
  initialExcerpt?: string
  initialTags?: string[]
  editSlug?: string
}

export function WikiEditorPage({
  userId,
  initialTitle = '',
  initialCategory = 'general',
  initialExcerpt = '',
  initialTags = [],
  editSlug,
}: WikiEditorPageProps) {
  const router = useRouter()
  const [title, setTitle] = useState(initialTitle)
  const [content, setContent] = useState('')
  const [category, setCategory] = useState(initialCategory)
  const [excerpt, setExcerpt] = useState(initialExcerpt)
  const [tagsInput, setTagsInput] = useState(initialTags.join(', '))
  const [published, setPublished] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    if (!title.trim()) { setError('Title is required'); return }
    setSaving(true)
    setError(null)

    const slug = editSlug ?? title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .slice(0, 64)

    const selectedTags = tagsInput.split(',').map(t => t.trim()).filter(Boolean)

    const supabase = createClient()
    const { error: dbError } = await supabase.from('wiki_pages').upsert({
      slug,
      title,
      content,
      excerpt: excerpt || content.replace(/<[^>]+>/g, '').slice(0, 200),
      category,
      tags: selectedTags,
      published,
      author_id: userId,
      last_edited_by: userId,
    })

    setSaving(false)
    if (dbError) {
      setError(dbError.message)
    } else {
      router.push(`/wiki/${slug}`)
    }
  }

  return (
    <div className="max-w-4xl mx-auto page-enter">
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-xl font-black" style={{ color: 'var(--color-wiki)' }}>
          {editSlug ? 'Edit page' : 'New page'}
        </h1>
      </div>

      <div className="flex gap-6">
        {/* Main editor */}
        <div className="flex-1 min-w-0 space-y-4">
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Page title"
            className="w-full bg-transparent border-b-2 border-seeper-border/60 focus:border-quantum/60 pb-2 text-2xl font-bold font-display outline-none transition-colors"
          />
          <WikiEditor content={content} onChange={setContent} placeholder="Start writing your page…" />
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>

        {/* Sidebar */}
        <div className="w-56 flex-shrink-0 space-y-5">
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

          {/* Excerpt */}
          <div>
            <label className="block text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider mb-2">Excerpt</label>
            <textarea
              value={excerpt}
              onChange={e => setExcerpt(e.target.value)}
              placeholder="Brief summary..."
              rows={3}
              className="w-full bg-[var(--color-raised)] border border-seeper-border/40 rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-quantum/60 resize-none"
            />
          </div>

          {/* Publish toggle */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider">Published</span>
            <button
              type="button"
              onClick={() => setPublished(p => !p)}
              className={cn(
                'w-10 h-5 rounded-full transition-all duration-200 relative',
                published ? 'bg-quantum' : 'bg-seeper-border'
              )}
            >
              <span className={cn(
                'absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-200',
                published ? 'left-5' : 'left-0.5'
              )} />
            </button>
          </div>

          {/* Save */}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full py-2 rounded-full bg-quantum text-seeper-black text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save page'}
          </button>
        </div>
      </div>
    </div>
  )
}
