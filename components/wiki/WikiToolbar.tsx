'use client'

import { Editor } from '@tiptap/react'

interface WikiToolbarProps {
  editor: Editor | null
}

interface ToolbarButton {
  label: string
  action: (editor: Editor) => void
  isActive?: (editor: Editor) => boolean
  dividerAfter?: boolean
}

const BUTTONS: ToolbarButton[] = [
  {
    label: 'B',
    action: e => e.chain().focus().toggleBold().run(),
    isActive: e => e.isActive('bold'),
  },
  {
    label: 'I',
    action: e => e.chain().focus().toggleItalic().run(),
    isActive: e => e.isActive('italic'),
  },
  {
    label: 'U',
    action: e => e.chain().focus().toggleUnderline().run(),
    isActive: e => e.isActive('underline'),
    dividerAfter: true,
  },
  {
    label: 'H1',
    action: e => e.chain().focus().toggleHeading({ level: 1 }).run(),
    isActive: e => e.isActive('heading', { level: 1 }),
  },
  {
    label: 'H2',
    action: e => e.chain().focus().toggleHeading({ level: 2 }).run(),
    isActive: e => e.isActive('heading', { level: 2 }),
  },
  {
    label: 'H3',
    action: e => e.chain().focus().toggleHeading({ level: 3 }).run(),
    isActive: e => e.isActive('heading', { level: 3 }),
    dividerAfter: true,
  },
  {
    label: '•',
    action: e => e.chain().focus().toggleBulletList().run(),
    isActive: e => e.isActive('bulletList'),
  },
  {
    label: '1.',
    action: e => e.chain().focus().toggleOrderedList().run(),
    isActive: e => e.isActive('orderedList'),
  },
  {
    label: '"',
    action: e => e.chain().focus().toggleBlockquote().run(),
    isActive: e => e.isActive('blockquote'),
  },
  {
    label: '</>',
    action: e => e.chain().focus().toggleCodeBlock().run(),
    isActive: e => e.isActive('codeBlock'),
  },
  {
    label: '—',
    action: e => e.chain().focus().setHorizontalRule().run(),
    dividerAfter: true,
  },
  {
    label: 'url',
    action: e => {
      const url = window.prompt('Enter URL:')
      if (url) e.chain().focus().setLink({ href: url }).run()
    },
    isActive: e => e.isActive('link'),
  },
]

export function WikiToolbar({ editor }: WikiToolbarProps) {
  if (!editor) return null

  return (
    <div
      className="flex items-center gap-0.5 flex-wrap mb-3"
      style={{
        background: 'var(--seeper-raised)',
        border: '1px solid var(--seeper-border)',
        borderRadius: 10,
        padding: '6px 8px',
      }}
    >
      {BUTTONS.map((btn, i) => (
        <span key={btn.label + i} className="contents">
          <button
            type="button"
            onMouseDown={e => {
              e.preventDefault()
              btn.action(editor)
            }}
            title={btn.label}
            className="transition-all duration-150"
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              border: 'none',
              background: btn.isActive?.(editor)
                ? 'rgba(176,169,207,0.2)'
                : 'none',
              color: btn.isActive?.(editor)
                ? '#B0A9CF'
                : 'var(--color-subtext)',
              fontSize: 11,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={e => {
              if (!btn.isActive?.(editor)) {
                e.currentTarget.style.background = 'var(--seeper-surface)'
                e.currentTarget.style.color = 'var(--color-text)'
              }
            }}
            onMouseLeave={e => {
              if (!btn.isActive?.(editor)) {
                e.currentTarget.style.background = 'none'
                e.currentTarget.style.color = 'var(--color-subtext)'
              }
            }}
          >
            {btn.label}
          </button>
          {btn.dividerAfter && (
            <span
              style={{
                width: 1,
                height: 16,
                background: 'var(--seeper-border)',
                margin: '0 4px',
                display: 'block',
              }}
            />
          )}
        </span>
      ))}
      <span className="flex-1" />
      <span style={{ fontSize: 10, color: 'var(--seeper-muted)' }}>
        type / for commands
      </span>
    </div>
  )
}
