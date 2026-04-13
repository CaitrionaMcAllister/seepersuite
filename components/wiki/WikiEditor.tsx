'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import CharacterCount from '@tiptap/extension-character-count'
import type { Profile, WikiCategory } from '@/types'
import { WikiToolbar } from './WikiToolbar'
import { TemplatePicker, TEMPLATES, type TemplateName } from './TemplatePicker'
import { MetadataSidebar, type Visibility } from './MetadataSidebar'
import { PublishPanel } from './PublishPanel'

interface WikiEditorProps {
  profile: Profile | null
  initialTitle?: string
  initialContent?: string
  initialContentJson?: object | null
  initialCategory?: WikiCategory | null
  initialTags?: string[]
  slug?: string
  mode: 'create' | 'edit'
}

export function WikiEditor({
  profile,
  initialTitle = '',
  initialContent = '',
  initialCategory = null,
  initialTags = [],
  slug,
}: WikiEditorProps) {
  const router = useRouter()
  const [title, setTitle] = useState(initialTitle)
  const [category, setCategory] = useState<WikiCategory | null>(initialCategory)
  const [tags, setTags] = useState<string[]>(initialTags)
  const [visibility, setVisibility] = useState<Visibility>('published')
  const [activeTemplate, setActiveTemplate] = useState<TemplateName>('blank')
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [publishMode, setPublishMode] = useState<null | 'confirm' | 'success'>(null)
  const [publishError, setPublishError] = useState<string | null>(null)
  const [publishedSlug, setPublishedSlug] = useState<string | undefined>(slug)
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const titleRef = useRef<HTMLTextAreaElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start writing, or type / for block commands...',
      }),
      Underline,
      Link.configure({ openOnClick: false }),
      CharacterCount,
    ],
    content: initialContent || '',
    editorProps: {
      attributes: {
        class: 'wiki-editor-body',
        spellcheck: 'true',
      },
    },
    autofocus: 'end',
  })

  // Word / char counts
  const wordCount = (editor?.storage as { characterCount?: { words: () => number; characters: () => number } })?.characterCount?.words() ?? 0
  const charCount = (editor?.storage as { characterCount?: { words: () => number; characters: () => number } })?.characterCount?.characters() ?? 0

  const doAutoSave = useCallback(async (currentTitle: string, currentCategory: WikiCategory | null, currentTags: string[]) => {
    const html = editor?.getHTML() ?? ''
    const text = editor?.getText() ?? ''
    if (!currentTitle.trim() && !text.trim()) return
    setSaveState('saving')
    try {
      const res = await fetch('/api/wiki', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: publishedSlug,
          title: currentTitle.trim() || 'Untitled',
          content: html,
          content_json: editor?.getJSON() ?? null,
          category: currentCategory,
          tags: currentTags,
          published: false,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        if (!publishedSlug) setPublishedSlug(data.slug)
        setSaveState('saved')
        setTimeout(() => setSaveState('idle'), 2000)
      } else {
        setSaveState('error')
      }
    } catch {
      setSaveState('error')
    }
  }, [editor, publishedSlug])

  const triggerAutoSave = useCallback(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(() => {
      doAutoSave(title, category, tags)
    }, 1500)
  }, [doAutoSave, title, category, tags])

  useEffect(() => {
    if (!editor) return
    const handler = () => triggerAutoSave()
    editor.on('update', handler)
    return () => { editor.off('update', handler) }
  }, [editor, triggerAutoSave])

  useEffect(() => {
    triggerAutoSave()
  }, [title, category, tags]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-resize title textarea
  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.style.height = 'auto'
      titleRef.current.style.height = titleRef.current.scrollHeight + 'px'
    }
  }, [title])

  const handleTemplateSelect = (template: typeof TEMPLATES[0], confirmed: boolean) => {
    if (!confirmed) return
    setActiveTemplate(template.name)
    if (editor) {
      editor.commands.setContent(template.html || '')
    }
  }

  const handlePublish = async () => {
    setPublishError(null)
    const method = publishedSlug ? 'PATCH' : 'POST'
    const url = publishedSlug ? `/api/wiki/${publishedSlug}` : '/api/wiki'
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: publishedSlug,
          title: title.trim(),
          content: editor?.getHTML() ?? '',
          content_json: editor?.getJSON() ?? null,
          category,
          tags,
          published: visibility !== 'draft',
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setPublishError(data.error ?? `Publish failed (${res.status})`)
        return
      }
      setPublishedSlug(data.slug)
      setPublishMode('success')
    } catch {
      setPublishError('Network error — could not reach the server')
    }
  }

  const breadcrumbTitle = title.trim() || 'New page'

  return (
    <div className="flex flex-col" style={{ height: '100%' }}>
      {/* Header bar */}
      <div
        className="flex items-center justify-between flex-shrink-0 px-5"
        style={{ height: 48, borderBottom: '1px solid var(--seeper-border)' }}
      >
        {/* Left */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.push('/wiki')}
            style={{
              border: '1px solid var(--seeper-border)',
              background: 'none',
              color: 'var(--color-subtext)',
              fontSize: 11,
              padding: '5px 12px',
              borderRadius: 20,
              cursor: 'pointer',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-text)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-subtext)' }}
          >
            ← seeWiki
          </button>
          <span style={{ fontSize: 11, color: 'var(--seeper-muted)' }}>/</span>
          <span style={{ fontSize: 11, color: '#B0A9CF', fontWeight: 600 }}>{breadcrumbTitle}</span>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {saveState === 'saved' && (
            <span
              className="flex items-center gap-1.5"
              style={{ fontSize: 10, color: '#8ACB8F', animation: 'fadeInOverlay 0.2s ease' }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#8ACB8F', display: 'inline-block' }} />
              Saved
            </span>
          )}
          {saveState === 'error' && (
            <span style={{ fontSize: 10, color: '#ED693A' }}>Save failed</span>
          )}
          <button
            type="button"
            onClick={() => triggerAutoSave()}
            style={{
              border: '1px solid var(--seeper-border)',
              background: 'none',
              color: 'var(--color-subtext)',
              fontSize: 11,
              padding: '5px 12px',
              borderRadius: 20,
              cursor: 'pointer',
            }}
          >
            Save draft
          </button>
          <button
            type="button"
            onClick={() => setPublishMode('confirm')}
            style={{
              background: '#B0A9CF',
              border: 'none',
              color: '#fff',
              fontSize: 11,
              fontWeight: 700,
              padding: '5px 14px',
              borderRadius: 20,
              cursor: 'pointer',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.85' }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
          >
            Publish →
          </button>
        </div>
      </div>

      {/* Body: editor + metadata sidebar */}
      <div className="flex flex-1 min-h-0">
        {/* Editor area */}
        <div className="flex-1 min-w-0 overflow-y-auto p-8">
          <TemplatePicker
            selected={activeTemplate}
            onSelect={handleTemplateSelect}
            hasContent={!!(editor?.getText().trim())}
          />

          {/* Title */}
          <textarea
            ref={titleRef}
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Give this page a title..."
            rows={1}
            className="w-full resize-none"
            style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: 28,
              fontWeight: 800,
              background: 'none',
              border: 'none',
              outline: 'none',
              color: 'var(--color-text)',
              lineHeight: 1.2,
              marginBottom: 6,
              overflowY: 'hidden',
              display: 'block',
            }}
          />

          {/* Author meta row */}
          <div className="flex items-center gap-2 mb-4">
            <span style={{ fontSize: 11, color: 'var(--color-subtext)' }}>
              {profile?.display_name ?? profile?.full_name ?? 'You'}
            </span>
            <span style={{ color: 'var(--seeper-muted)', fontSize: 11 }}>·</span>
            <span style={{ fontSize: 11, color: 'var(--seeper-muted)' }}>
              {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
            <span style={{ color: 'var(--seeper-muted)', fontSize: 11 }}>·</span>
            <span
              style={{
                fontSize: 11,
                color: 'var(--seeper-muted)',
                padding: '1px 7px',
                borderRadius: 20,
                border: '1px solid var(--seeper-border)',
              }}
            >
              {visibility === 'draft' ? 'Draft' : visibility === 'review' ? 'In review' : 'Publishing'}
            </span>
          </div>

          <WikiToolbar editor={editor} />
          <EditorContent editor={editor} />
        </div>

        <MetadataSidebar
          category={category}
          onCategoryChange={setCategory}
          tags={tags}
          onTagsChange={setTags}
          visibility={visibility}
          onVisibilityChange={setVisibility}
          authorName={profile?.display_name ?? profile?.full_name ?? null}
          authorRole={profile?.role ?? 'member'}
          wordCount={wordCount}
          charCount={charCount}
        />
      </div>

      {publishMode && (
        <PublishPanel
          title={title}
          category={category}
          tags={tags}
          authorName={profile?.display_name ?? profile?.full_name ?? null}
          visibility={visibility}
          onCancel={() => { setPublishMode(null); setPublishError(null) }}
          onConfirm={handlePublish}
          mode={publishMode}
          publishedSlug={publishedSlug}
          error={publishError}
        />
      )}
    </div>
  )
}
