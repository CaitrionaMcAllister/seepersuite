'use client'

import { useState, useEffect } from 'react'
import { Newspaper } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DigestStory } from '@/types'

function hexToRgb(hex: string) {
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  }
}
function rgba(hex: string, a: number) {
  const { r, g, b } = hexToRgb(hex)
  return `rgba(${r},${g},${b},${a})`
}
// Relative luminance — high value (>0.35) means the colour is too light to read on white
function luminance(hex: string) {
  const { r, g, b } = hexToRgb(hex)
  const ch = [r, g, b].map(c => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2]
}
// Darken a hex by blending toward black
function darken(hex: string, amount = 0.45) {
  const { r, g, b } = hexToRgb(hex)
  const d = 1 - amount
  return `rgb(${Math.round(r * d)},${Math.round(g * d)},${Math.round(b * d)})`
}

interface DailyDigestProps {
  initialStories?: DigestStory[]
}

export function DailyDigest({ initialStories = [] }: DailyDigestProps) {
  const [stories, setStories] = useState<DigestStory[]>(initialStories)
  const [current, setCurrent] = useState(0)
  const [visible, setVisible] = useState(true)
  const [loading, setLoading] = useState(initialStories.length === 0)
  const [tick, setTick] = useState(0) // bumped on manual nav to reset the auto-advance timer
  const [isLight, setIsLight] = useState(false)

  useEffect(() => {
    const check = () => setIsLight(document.documentElement.classList.contains('light'))
    check()
    const obs = new MutationObserver(check)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (initialStories.length > 0) { setLoading(false); return }
    setLoading(false)
  }, [initialStories.length])

  // Auto-advance every 10 seconds; resets if user navigates manually
  useEffect(() => {
    if (stories.length <= 1) return
    const id = setInterval(() => {
      setCurrent(prev => {
        const next = (prev + 1) % stories.length
        setVisible(false)
        setTimeout(() => setVisible(true), 150)
        return next
      })
    }, 10_000)
    return () => clearInterval(id)
  }, [stories.length, tick])

  const navigate = (next: number) => {
    if (next === current) return
    setTick(t => t + 1) // reset auto-advance timer
    setVisible(false)
    setTimeout(() => {
      setCurrent(next)
      setVisible(true)
    }, 150)
  }

  const story = stories[current]

  // Theme-aware colour derivation — recomputed whenever story or theme changes
  const storyColors = story ? (() => {
    const base = story.iconColor // always the original hex
    const light = isLight
    const isWashed = light && luminance(base) > 0.35 // pale colours on white bg
    const onColor = isWashed ? darken(base, 0.55) : base
    return {
      panelBg:  light ? rgba(base, 0.22) : story.iconBg,
      iconCol:  onColor,
      labelCol: onColor,
      catBg:    light ? rgba(base, 0.18) : story.catBg,
      catCol:   light ? (isWashed ? darken(base, 0.5) : base) : story.catColor,
    }
  })() : null

  const contentStyle: React.CSSProperties = {
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(4px)',
    transition: 'opacity 150ms ease, transform 150ms ease',
  }

  return (
    <div className="seeper-card flex flex-row min-h-[200px] overflow-hidden">
      {/* Left panel */}
      <div
        className="w-[200px] min-h-[200px] flex-shrink-0 flex flex-col items-center justify-center rounded-l-2xl gap-2"
        style={{ backgroundColor: loading || !storyColors ? 'var(--color-raised)' : storyColors.panelBg }}
      >
        {loading ? (
          <div className="skeleton-shimmer w-16 h-16 rounded-xl" />
        ) : story ? (
          <>
            <span
              className="text-5xl leading-none"
              style={{ color: storyColors!.iconCol }}
            >
              {story.icon}
            </span>
            <span
              className="text-xs text-center px-2 leading-snug"
              style={{ color: storyColors!.labelCol, opacity: isLight ? 0.85 : 0.7 }}
            >
              {story.imageLabel}
            </span>
          </>
        ) : null}
      </div>

      {/* Right panel */}
      <div className="flex-1 p-5 flex flex-col min-w-0">
        {loading ? (
          <div className="space-y-2 flex-1">
            <div className="skeleton-shimmer h-4 w-3/4 rounded" />
            <div className="skeleton-shimmer h-3 w-full rounded" />
            <div className="skeleton-shimmer h-3 w-2/3 rounded" />
          </div>
        ) : story ? (
          <div className="flex flex-col flex-1 min-w-0" style={contentStyle}>
            {/* Top row: category badge + label + counter */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest"
                style={{ backgroundColor: storyColors!.catBg, color: storyColors!.catCol }}
              >
                {story.category}
              </span>
              <div className="flex items-center gap-1.5 ml-auto flex-shrink-0">
                <Newspaper size={11} className="text-plasma" />
                <span className="text-[10px] text-plasma uppercase tracking-widest">today&apos;s digest</span>
                {stories.length > 1 && (
                  <span className="text-[10px] text-[var(--color-muted)] ml-1">
                    {current + 1}/{stories.length}
                  </span>
                )}
              </div>
            </div>

            {/* Title */}
            <h3 className="font-bold text-base leading-snug mb-2">{story.title}</h3>

            {/* Summary */}
            <p className="text-xs text-[var(--color-subtext)] leading-relaxed line-clamp-4 flex-1 mb-3">
              {story.summary}
            </p>

            {/* Bottom row: source pills + nav */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex gap-1.5 flex-wrap">
                {story.sources.map(s => (
                  <a
                    key={s.label}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2 py-0.5 rounded-full text-[9px] border"
                    style={{
                      color: s.color,
                      backgroundColor: s.color + '22',
                      borderColor: s.color + '44',
                    }}
                  >
                    {s.label}
                  </a>
                ))}
              </div>

              {stories.length > 1 && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => navigate((current - 1 + stories.length) % stories.length)}
                    className="w-7 h-7 flex items-center justify-center rounded-full border border-seeper-border/40 text-sm hover:border-plasma/60 transition-colors"
                  >
                    ‹
                  </button>
                  <div className="flex gap-1.5 items-center">
                    {stories.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => navigate(i)}
                        className={cn(
                          'h-1.5 rounded-full transition-all duration-150',
                          i === current ? 'bg-plasma w-3' : 'bg-seeper-border hover:bg-seeper-steel w-1.5'
                        )}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => navigate((current + 1) % stories.length)}
                    className="w-7 h-7 flex items-center justify-center rounded-full border border-seeper-border/40 text-sm hover:border-plasma/60 transition-colors"
                  >
                    ›
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
