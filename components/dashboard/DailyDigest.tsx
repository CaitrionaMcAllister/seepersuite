'use client'
import { useState } from 'react'
import { Sparkles, RotateCcw } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { DIGEST_SOURCES } from '@/lib/constants'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface DailyDigestProps {
  content: string
}

export default function DailyDigest({ content: initialContent }: DailyDigestProps) {
  const [content, setContent] = useState(initialContent)
  const [loading, setLoading] = useState(false)

  async function handleRegenerate() {
    setLoading(true)
    try {
      const res = await fetch('/api/digest', { method: 'POST' })
      if (res.ok) {
        const data = await res.json() as { content: string }
        setContent(data.content)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="rounded-3xl p-8 border border-seeper-border shadow-card relative overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at center, #1a1a1a 0%, #0d0d0d 100%)',
        borderLeft: '3px solid #ED693A',
      }}
    >
      {/* Top row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-plasma" />
          <span className="section-label">today&#39;s digest</span>
          <span className="text-seeper-muted text-xs font-body ml-2">{formatDate()}</span>
        </div>
        <button
          onClick={handleRegenerate}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs font-display font-medium text-plasma border border-plasma/30 rounded-full px-3 py-1 hover:bg-plasma/10 transition-colors disabled:opacity-50"
        >
          {loading ? <LoadingSpinner size={12} /> : <RotateCcw size={12} />}
          Regenerate
        </button>
      </div>

      {/* Digest content */}
      <p className="font-body text-seeper-steel leading-relaxed text-sm mb-6">
        {content}
      </p>

      {/* Bottom row */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {DIGEST_SOURCES.map(source => (
            <span
              key={source}
              className="pill-tag"
              style={{ background: 'rgba(176,169,207,0.15)', color: '#B0A9CF' }}
            >
              {source}
            </span>
          ))}
        </div>
        <span
          className="pill-tag text-xs"
          style={{ background: 'rgba(237,105,58,0.1)', color: '#ED693A' }}
        >
          Powered by Claude
        </span>
      </div>
    </div>
  )
}
