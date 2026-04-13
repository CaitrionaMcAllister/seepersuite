'use client'

import Link from 'next/link'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import LinkExt from '@tiptap/extension-link'
import Avatar from '@/components/ui/Avatar'
import type { WikiPage, Profile } from '@/types'

const CAT_COLORS: Record<string, { bg: string; text: string }> = {
  creative:   { bg: '#ED693A1f', text: '#ED693A' },
  tech:       { bg: '#DCFEAD1f', text: '#4a7a00' },
  production: { bg: '#B0A9CF1f', text: '#B0A9CF' },
  business:   { bg: '#EDDE5C1f', text: '#5a4200' },
  ai:         { bg: '#8ACB8F1f', text: '#0a4a20' },
  general:    { bg: '#8888881f', text: '#888888' },
}

interface WikiPageViewProps {
  page: WikiPage & { author?: Profile }
  currentProfile: Profile | null
  relatedPages: { slug: string; title: string; author: string; updatedAt: string }[]
}

function ReadOnlyContent({ content }: { content: string }) {
  const editor = useEditor({
    extensions: [StarterKit, Underline, LinkExt],
    content,
    editable: false,
    editorProps: { attributes: { class: 'wiki-editor-body' } },
  })
  return <EditorContent editor={editor} />
}

export function WikiPageView({ page, currentProfile, relatedPages }: WikiPageViewProps) {
  const cat = CAT_COLORS[page.category?.toLowerCase() ?? 'general'] ?? CAT_COLORS.general
  const authorName = page.author?.display_name ?? page.author?.full_name ?? 'Unknown'
  const isOwnerOrAdmin = currentProfile?.id === page.author_id || currentProfile?.role === 'admin'

  return (
    <div className="page-enter flex gap-8 max-w-5xl mx-auto">
      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 mb-4" style={{ fontSize: 11, color: 'var(--seeper-muted)' }}>
          <Link href="/wiki" className="hover:text-[var(--color-text)] transition-colors">seeWiki</Link>
          <span>›</span>
          <span className="capitalize">{page.category}</span>
          <span>›</span>
          <span style={{ color: 'var(--color-text)' }}>{page.title}</span>
        </nav>

        {/* Title + edit button row */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <h1
            style={{
              fontFamily: 'DM Sans, sans-serif',
              fontWeight: 800,
              fontSize: 26,
              color: 'var(--color-text)',
              lineHeight: 1.2,
            }}
          >
            {page.title}
          </h1>
          {isOwnerOrAdmin && (
            <Link
              href={`/wiki/edit/${page.slug}`}
              className="flex-shrink-0 transition-all duration-150"
              style={{
                border: '1px solid var(--seeper-border)',
                background: 'none',
                color: 'var(--color-subtext)',
                fontSize: 11,
                padding: '5px 12px',
                borderRadius: 20,
                whiteSpace: 'nowrap',
                textDecoration: 'none',
                display: 'inline-block',
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
                e.currentTarget.style.borderColor = '#B0A9CF'
                e.currentTarget.style.color = '#B0A9CF'
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
                e.currentTarget.style.borderColor = 'var(--seeper-border)'
                e.currentTarget.style.color = 'var(--color-subtext)'
              }}
            >
              Edit this page →
            </Link>
          )}
        </div>

        {/* Meta row */}
        <div
          className="flex items-center gap-3 mb-6 pb-5 flex-wrap"
          style={{ borderBottom: '1px solid var(--seeper-border)', fontSize: 11, color: 'var(--seeper-muted)' }}
        >
          <Avatar name={authorName} size={22} color={page.author?.avatar_color} />
          <span>{authorName}</span>
          <span>·</span>
          <span>{new Date(page.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          <span>·</span>
          <span>{page.views} views</span>
          <span>·</span>
          <span
            style={{
              fontSize: 8,
              fontWeight: 700,
              padding: '2px 7px',
              borderRadius: 20,
              background: cat.bg,
              color: cat.text,
              textTransform: 'uppercase',
            }}
          >
            {page.category}
          </span>
        </div>

        {/* Content */}
        <div style={{ maxWidth: 720 }}>
          {page.content ? (
            <ReadOnlyContent content={page.content} />
          ) : page.excerpt ? (
            <p style={{ color: 'var(--color-subtext)', lineHeight: 1.8, fontSize: 13 }}>{page.excerpt}</p>
          ) : (
            <p style={{ color: 'var(--seeper-muted)', fontStyle: 'italic', fontSize: 12 }}>No content yet.</p>
          )}
        </div>
      </div>

      {/* Right sidebar */}
      <div className="w-56 flex-shrink-0 space-y-3" style={{ position: 'sticky', top: 20, alignSelf: 'flex-start' }}>
        {relatedPages.length > 0 && (
          <div
            style={{
              background: 'var(--seeper-surface)',
              border: '1px solid var(--seeper-border)',
              borderTop: '2px solid #B0A9CF',
              borderRadius: 12,
              padding: 14,
            }}
          >
            <p
              className="uppercase tracking-wider font-bold mb-2.5"
              style={{ fontSize: 9, letterSpacing: '1.5px', color: 'var(--seeper-muted)' }}
            >
              Related pages
            </p>
            {relatedPages.map(r => (
              <Link
                key={r.slug}
                href={`/wiki/${r.slug}`}
                className="block transition-colors duration-150"
                style={{
                  fontSize: 11,
                  color: 'var(--color-subtext)',
                  padding: '4px 0',
                  borderBottom: '1px solid var(--seeper-raised)',
                  textDecoration: 'none',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#B0A9CF')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-subtext)')}
              >
                {r.title}
              </Link>
            ))}
          </div>
        )}

        <div
          style={{
            background: 'var(--seeper-surface)',
            border: '1px solid var(--seeper-border)',
            borderTop: '2px solid #B0A9CF',
            borderRadius: 12,
            padding: 14,
          }}
        >
          <p
            className="uppercase tracking-wider font-bold mb-2.5"
            style={{ fontSize: 9, letterSpacing: '1.5px', color: 'var(--seeper-muted)' }}
          >
            Actions
          </p>
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') {
                navigator.clipboard.writeText(window.location.href)
              }
            }}
            className="w-full text-left transition-colors duration-150"
            style={{
              fontSize: 11,
              color: 'var(--color-subtext)',
              padding: '4px 0',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'block',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#B0A9CF')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-subtext)')}
          >
            Copy link
          </button>
          {isOwnerOrAdmin && (
            <Link
              href={`/wiki/edit/${page.slug}`}
              className="block transition-colors duration-150"
              style={{
                fontSize: 11,
                color: 'var(--color-subtext)',
                padding: '4px 0',
                textDecoration: 'none',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#B0A9CF')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-subtext)')}
            >
              Edit page
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
