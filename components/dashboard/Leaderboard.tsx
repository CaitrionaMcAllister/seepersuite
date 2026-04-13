'use client'

import { useState, useEffect } from 'react'
import type { GameType } from '@/lib/gameOfDay'
import { GAME_META } from '@/lib/gameOfDay'

interface LeaderboardProps {
  game: GameType
  dayIndex: number
  color: string
  onClose: () => void
}

interface Row { name: string; score: number }

const MAX_SCORES: Record<string, number> = {
  seeWord:  6,
  seeQuiz:  5,
  seeLinks: 4,
  seeScope: 6,
}

export function Leaderboard({ game, dayIndex, color, onClose }: LeaderboardProps) {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/game-scores?game=${game}&day_index=${dayIndex}`)
      .then(r => r.json())
      .then(data => { setRows(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [game, dayIndex])

  const max = MAX_SCORES[game] ?? 6
  const meta = GAME_META[game]

  return (
    <div className="space-y-3 pt-1">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider" style={{ color }}>
          Today&apos;s {meta.label} scores
        </p>
        <button
          onClick={onClose}
          style={{ fontSize: 11, color: 'var(--color-subtext)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          ✕
        </button>
      </div>

      {loading ? (
        <p className="text-xs text-seeper-muted animate-pulse">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="text-xs text-seeper-muted">No scores yet today — be the first to play!</p>
      ) : (
        <div className="space-y-1.5">
          {rows.map((row, i) => (
            <div key={i} className="flex items-center gap-3">
              {/* Rank */}
              <span
                className="text-[10px] font-black w-4 text-right flex-shrink-0"
                style={{ color: i === 0 ? color : 'var(--color-subtext)' }}
              >
                {i + 1}
              </span>
              {/* Name */}
              <span className="text-xs text-seeper-white font-display flex-1 truncate">{row.name}</span>
              {/* Bar + score */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(row.score / max) * 100}%`,
                      background: i === 0 ? color : 'rgba(255,255,255,0.2)',
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>
                <span className="text-[10px] font-black w-8 text-right" style={{ color: i === 0 ? color : 'var(--color-subtext)' }}>
                  {row.score}/{max}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
