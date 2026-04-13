'use client'

import { useState } from 'react'
import { getGameOfDay, GAME_META } from '@/lib/gameOfDay'
import SeeWord from '@/components/games/SeeWord'
import SeeQuiz from '@/components/games/SeeQuiz'
import SeeLinks from '@/components/games/SeeLinks'
import SeeSpark from '@/components/games/SeeSpark'
import SeeScope from '@/components/games/SeeScope'
import { Leaderboard } from './Leaderboard'

const SCORED_GAMES = new Set(['seeWord', 'seeQuiz', 'seeLinks', 'seeScope'])

export default function GameOfDay() {
  const { game, dayIndex } = getGameOfDay()
  const meta = GAME_META[game]
  const [playing, setPlaying] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short',
  })

  const hasLeaderboard = SCORED_GAMES.has(game)

  return (
    <div
      className="seeper-card relative overflow-hidden"
      style={{ background: `linear-gradient(135deg, color-mix(in srgb, ${meta.color} 6%, transparent), transparent 55%)` }}
    >
      {/* Decorative bg text */}
      <span
        aria-hidden
        className="pointer-events-none select-none absolute right-5 top-1/2 -translate-y-1/2 font-black opacity-[0.03] leading-none"
        style={{ color: meta.color, fontSize: playing ? 80 : 100, fontFamily: 'sans-serif', transition: 'font-size 0.3s ease' }}
      >
        {game === 'seeWord' ? 'W' : game === 'seeQuiz' ? 'Q' : game === 'seeLinks' ? 'L' : game === 'seeSpark' ? 'S' : '○'}
      </span>

      <div className="relative p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <p className="section-label">game of the day</p>
              <span className="text-[10px] text-seeper-muted">{today}</span>
            </div>
            <h2 className="text-xl font-black font-display leading-none" style={{ color: meta.color }}>
              {meta.label}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Leaderboard button — only for scored games */}
            {hasLeaderboard && (
              <button
                onClick={() => { setShowLeaderboard(s => !s); if (!playing) setPlaying(false) }}
                className="flex-shrink-0 transition-all hover:opacity-80 active:scale-95"
                style={{
                  border: `1px solid ${showLeaderboard ? meta.color + '60' : 'rgba(255,255,255,0.1)'}`,
                  background: showLeaderboard ? `color-mix(in srgb, ${meta.color} 12%, transparent)` : 'none',
                  color: showLeaderboard ? meta.color : 'var(--color-subtext)',
                  fontSize: 11,
                  padding: '5px 12px',
                  borderRadius: 20,
                  cursor: 'pointer',
                }}
              >
                ↑ scores
              </button>
            )}

            {!playing ? (
              <button
                onClick={() => { setPlaying(true); setShowLeaderboard(false) }}
                className="px-5 py-2 rounded-full text-sm font-bold font-display transition-all hover:opacity-90 active:scale-95 flex-shrink-0"
                style={{ background: meta.color, color: '#111111' }}
              >
                Play
              </button>
            ) : (
              <button
                onClick={() => setPlaying(false)}
                className="flex-shrink-0 transition-all hover:opacity-80 active:scale-95"
                style={{
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'none',
                  color: 'var(--color-subtext)',
                  fontSize: 11,
                  padding: '5px 12px',
                  borderRadius: 20,
                  cursor: 'pointer',
                }}
              >
                ← back
              </button>
            )}
          </div>
        </div>

        {/* Tagline — only on widget view */}
        {!playing && !showLeaderboard && (
          <p className="text-seeper-steel text-sm font-display">{meta.tagline}</p>
        )}

        {/* Leaderboard panel */}
        {showLeaderboard && !playing && (
          <Leaderboard
            game={game}
            dayIndex={dayIndex}
            color={meta.color}
            onClose={() => setShowLeaderboard(false)}
          />
        )}

        {/* Game content */}
        {playing && (
          <div className="pt-2">
            {game === 'seeWord'  && <SeeWord  dayIndex={dayIndex} />}
            {game === 'seeQuiz'  && <SeeQuiz  dayIndex={dayIndex} />}
            {game === 'seeLinks' && <SeeLinks dayIndex={dayIndex} />}
            {game === 'seeSpark' && <SeeSpark dayIndex={dayIndex} />}
            {game === 'seeScope' && <SeeScope dayIndex={dayIndex} />}
          </div>
        )}
      </div>
    </div>
  )
}
