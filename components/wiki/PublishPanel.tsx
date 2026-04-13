'use client'

import { useRouter } from 'next/navigation'

interface PublishPanelProps {
  title: string
  category: string | null
  tags: string[]
  authorName: string | null
  visibility: string
  onCancel: () => void
  onConfirm: () => Promise<void>
  mode: 'confirm' | 'success'
  publishedSlug?: string
  error?: string | null
}

export function PublishPanel({
  title, category, tags, authorName, visibility,
  onCancel, onConfirm, mode, error,
}: PublishPanelProps) {
  const router = useRouter()

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.6)',
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'fadeInOverlay 0.2s ease',
  }

  const modalStyle: React.CSSProperties = {
    background: 'var(--seeper-surface)',
    border: '1px solid var(--seeper-border)',
    borderRadius: 16,
    width: 400,
    padding: 24,
    animation: 'popIn 0.22s cubic-bezier(0.4,0,0.2,1)',
  }

  if (mode === 'success') {
    return (
      <div style={overlayStyle} onClick={onCancel}>
        <div style={modalStyle} onClick={e => e.stopPropagation()}>
          <div className="flex flex-col items-center text-center gap-3">
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'rgba(138,203,143,0.15)',
                border: '2px solid #8ACB8F',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
                animation: 'springIn 0.4s ease',
              }}
            >
              ✓
            </div>
            <h2 style={{ fontSize: 17, fontWeight: 800, fontFamily: 'DM Sans, sans-serif', color: 'var(--color-text)' }}>
              Page published!
            </h2>
            <p style={{ fontSize: 12, color: 'var(--color-subtext)', lineHeight: 1.6 }}>
              Your page is now live in seeWiki and visible to the whole team. The team activity feed has been updated.
            </p>
            <button
              type="button"
              onClick={() => router.push('/wiki')}
              style={{
                background: '#B0A9CF',
                color: '#fff',
                border: 'none',
                borderRadius: 20,
                padding: '8px 20px',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                marginTop: 8,
              }}
            >
              Back to seeWiki
            </button>
          </div>
        </div>
      </div>
    )
  }

  const hasTitle = title?.trim().length > 0

  const summaryRows = [
    { label: 'Title',      value: title || null,              highlight: false },
    { label: 'Category',   value: category || '—',            highlight: true },
    { label: 'Tags',       value: tags.length ? tags.join(', ') : '—', highlight: true },
    { label: 'Author',     value: authorName || 'You',        highlight: false },
    { label: 'Visibility', value: visibility,                 highlight: false },
  ]

  return (
    <div style={overlayStyle} onClick={onCancel}>
      <div style={modalStyle} onClick={e => e.stopPropagation()}>
        <div className="flex flex-col items-center text-center gap-3 mb-5">
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: 'rgba(176,169,207,0.12)',
              border: '2px solid #B0A9CF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              color: '#B0A9CF',
            }}
          >
            ◎
          </div>
          <h2 style={{ fontSize: 16, fontWeight: 800, fontFamily: 'DM Sans, sans-serif', color: 'var(--color-text)' }}>
            Ready to publish?
          </h2>
          <p style={{ fontSize: 12, color: 'var(--color-subtext)', lineHeight: 1.6 }}>
            This page will be visible to the entire seeper team immediately. You can edit it anytime after publishing.
          </p>
        </div>

        {/* Summary card */}
        <div
          style={{
            background: 'var(--seeper-raised)',
            borderRadius: 10,
            padding: '8px 12px',
            marginBottom: 16,
          }}
        >
          {summaryRows.map(row => (
            <div
              key={row.label}
              className="flex justify-between items-center"
              style={{
                fontSize: 11,
                padding: '4px 0',
                borderBottom: '1px solid var(--seeper-border)',
              }}
            >
              <span style={{ color: 'var(--seeper-muted)' }}>{row.label}</span>
              {row.label === 'Title' && !hasTitle ? (
                <span style={{ color: 'red', fontSize: 10 }}>Title required</span>
              ) : (
                <span style={{ color: row.highlight ? '#B0A9CF' : 'var(--color-text)', fontWeight: 600 }}>
                  {row.value}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Error message */}
        {error && (
          <div
            style={{
              background: 'rgba(237,105,58,0.12)',
              border: '1px solid rgba(237,105,58,0.3)',
              borderRadius: 8,
              padding: '8px 12px',
              marginBottom: 12,
              fontSize: 12,
              color: '#ED693A',
            }}
          >
            {error}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            style={{
              flex: 1,
              background: 'none',
              border: '1px solid var(--seeper-border)',
              borderRadius: 10,
              padding: '8px',
              fontSize: 12,
              color: 'var(--color-subtext)',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!hasTitle}
            style={{
              flex: 2,
              background: hasTitle ? '#B0A9CF' : 'var(--seeper-raised)',
              border: 'none',
              borderRadius: 10,
              padding: '8px',
              fontSize: 12,
              fontWeight: 700,
              fontFamily: 'DM Sans, sans-serif',
              color: hasTitle ? '#fff' : 'var(--seeper-muted)',
              cursor: hasTitle ? 'pointer' : 'not-allowed',
            }}
          >
            Publish to seeWiki →
          </button>
        </div>
      </div>
    </div>
  )
}
