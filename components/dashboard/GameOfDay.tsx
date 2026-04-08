'use client'

import { useState } from 'react'
import { getGameOfDay, GAME_META } from '@/lib/gameOfDay'
import SeeWord from '@/components/games/SeeWord'
import SeeQuiz from '@/components/games/SeeQuiz'
import SeeLinks from '@/components/games/SeeLinks'
import SeeSpark from '@/components/games/SeeSpark'
import SeeScope from '@/components/games/SeeScope'

export default function GameOfDay() {
  const { game, dayIndex } = getGameOfDay()
  const meta = GAME_META[game]
  const [playing, setPlaying] = useState(false)

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short',
  })

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
          <div className="flex items-center gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <p className="section-label">game of the day</p>
                <span className="text-[10px] text-seeper-muted">{today}</span>
              </div>
              <h2 className="text-xl font-black font-display leading-none" style={{ color: meta.color }}>
                {meta.label}
              </h2>
            </div>
          </div>
          {!playing && (
            <button
              onClick={() => setPlaying(true)}
              className="px-5 py-2 rounded-full text-sm font-bold font-display transition-all hover:opacity-90 active:scale-95 flex-shrink-0"
              style={{ background: meta.color, color: '#111111' }}
            >
              Play
            </button>
          )}
        </div>

        {/* Tagline */}
        {!playing && (
          <p className="text-seeper-steel text-sm font-display">{meta.tagline}</p>
        )}

        {/* Game description cards */}
        {!playing && (
          <div className="grid grid-cols-5 gap-2">
            {(['seeWord', 'seeQuiz', 'seeLinks', 'seeSpark', 'seeScope'] as const).map((g, i) => {
              const m = GAME_META[g]
              const isToday = g === game
              return (
                <div
                  key={g}
                  className="rounded-xl p-2.5 text-center transition-all"
                  style={{
                    background: isToday ? `color-mix(in srgb, ${m.color} 15%, transparent)` : 'transparent',
                    border: `1px solid ${isToday ? m.color + '50' : 'rgba(255,255,255,0.06)'}`,
                    opacity: isToday ? 1 : 0.45,
                  }}
                >
                  <p className="text-[10px] font-black font-display" style={{ color: m.color }}>{m.label}</p>
                  <p className="text-[9px] text-seeper-muted mt-0.5 leading-tight">Day {((i - (['seeWord','seeQuiz','seeLinks','seeSpark','seeScope'].indexOf(game) + 5 - i) % 5 + 5) % 5) + 1} of 5</p>
                </div>
              )
            })}
          </div>
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
