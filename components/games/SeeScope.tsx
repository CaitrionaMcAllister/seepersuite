'use client'

import { useState, useEffect, useRef } from 'react'
import { gameStorageKey } from '@/lib/gameOfDay'
import { submitGameScore } from '@/lib/gameScores'

// ─── Puzzle data ───────────────────────────────────────────────────────────────
// Replace imageUrl values with actual installation photos.
// Images should be landscape, ~3:2 ratio (600×400 works well).
interface Puzzle {
  imageUrl: string
  answer: string
  options: string[]
}

const PUZZLES: Puzzle[] = [
  {
    imageUrl: 'https://picsum.photos/seed/rain-room-1/600/400',
    answer: 'Rain Room',
    options: ['Rain Room', 'Cloud Forest', 'Water Wall', 'The Flood'],
  },
  {
    imageUrl: 'https://picsum.photos/seed/sleep-no-more-2/600/400',
    answer: 'Sleep No More',
    options: ['Sleep No More', 'The Drowned Man', 'Then She Fell', 'You Me Bum Bum Train'],
  },
  {
    imageUrl: 'https://picsum.photos/seed/teamlab-3/600/400',
    answer: 'teamLab Borderless',
    options: ['teamLab Borderless', 'Meow Wolf', 'Superblue', 'ARTECHOUSE'],
  },
  {
    imageUrl: 'https://picsum.photos/seed/kusama-4/600/400',
    answer: 'Infinity Mirror Rooms',
    options: ['Infinity Mirror Rooms', 'Mirror Labyrinth', 'Endless Rooms', 'The Void'],
  },
  {
    imageUrl: 'https://picsum.photos/seed/crystal-maze-5/600/400',
    answer: 'The Crystal Maze',
    options: ['The Crystal Maze', 'Escape Hunt', 'Total Wipeout', 'The Cube'],
  },
  {
    imageUrl: 'https://picsum.photos/seed/arcadia-6/600/400',
    answer: 'Arcadia',
    options: ['Arcadia', 'Glastonbury Block 9', 'Boomtown Fair', 'Junction 2'],
  },
  {
    imageUrl: 'https://picsum.photos/seed/bjork-7/600/400',
    answer: 'Björk Digital',
    options: ['Björk Digital', 'Fever Room', 'Ryoji Ikeda', 'Black Mirror Live'],
  },
  {
    imageUrl: 'https://picsum.photos/seed/meowwolf-8/600/400',
    answer: 'Meow Wolf',
    options: ['Meow Wolf', 'teamLab Forest', 'Omega Mart', 'The Beach'],
  },
  {
    imageUrl: 'https://picsum.photos/seed/weather-9/600/400',
    answer: 'The Weather Project',
    options: ['The Weather Project', 'Sun & Sea', 'Arctic', 'Solar Return'],
  },
  {
    imageUrl: 'https://picsum.photos/seed/uva-halo-10/600/400',
    answer: 'Halo (UVA)',
    options: ['Halo (UVA)', 'Spectra', 'Light Horizon', 'Liminal'],
  },
  {
    imageUrl: 'https://picsum.photos/seed/ymbbt-11/600/400',
    answer: 'You Me Bum Bum Train',
    options: ['You Me Bum Bum Train', 'Punchdrunk', 'Coney', 'WildWorks'],
  },
  {
    imageUrl: 'https://picsum.photos/seed/desertx-12/600/400',
    answer: 'Desert X',
    options: ['Desert X', 'Burning Man', 'Coachella Art', 'Land Art Movement'],
  },
]

// ─── Constants ─────────────────────────────────────────────────────────────────
const COLS = 6
const ROWS = 4
const TOTAL = COLS * ROWS            // 24 tiles
const TIMER = 60                     // seconds
const REVEAL_INTERVAL = (TIMER * 1000) / TOTAL  // ms per tile reveal

function calcScore(coveredCount: number): number {
  return Math.max(1, Math.ceil(6 * (coveredCount / TOTAL)))
}

// ─── Component ─────────────────────────────────────────────────────────────────
export default function SeeScope({ dayIndex }: { dayIndex: number }) {
  const puzzle = PUZZLES[dayIndex % PUZZLES.length]
  const storageKey = gameStorageKey('seeScope')

  const [covered, setCovered] = useState<boolean[]>(Array(TOTAL).fill(true))
  const [chosen, setChosen] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [won, setWon] = useState(false)
  const [timeLeft, setTimeLeft] = useState(TIMER)

  const doneRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const revealRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const coveredRef = useRef<boolean[]>(Array(TOTAL).fill(true))

  function stopTimers() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    if (revealRef.current) { clearInterval(revealRef.current); revealRef.current = null }
  }

  function endGame(correct: boolean, finalCovered: boolean[]) {
    if (doneRef.current) return
    doneRef.current = true
    stopTimers()
    setDone(true)
    setWon(correct)
    const score = correct ? calcScore(finalCovered.filter(Boolean).length) : 0
    submitGameScore('seeScope', dayIndex, score)
    localStorage.setItem(storageKey, JSON.stringify({
      covered: finalCovered,
      chosen,
      done: true,
      won: correct,
    }))
  }

  // Load saved state or start timers
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const s = JSON.parse(saved)
        if (s.done) {
          doneRef.current = true
          setDone(true)
          setWon(s.won ?? false)
          setChosen(s.chosen ?? null)
          setCovered(s.covered ?? Array(TOTAL).fill(false))
          coveredRef.current = s.covered ?? Array(TOTAL).fill(false)
          return
        }
      }
    } catch {}

    // Start countdown
    timerRef.current = setInterval(() => {
      if (doneRef.current) return
      setTimeLeft(t => {
        if (t <= 1) {
          endGame(false, coveredRef.current)
          return 0
        }
        return t - 1
      })
    }, 1000)

    // Reveal tiles progressively
    revealRef.current = setInterval(() => {
      if (doneRef.current) return
      setCovered(prev => {
        const indices = prev.reduce<number[]>((acc, c, i) => { if (c) acc.push(i); return acc }, [])
        if (!indices.length) return prev
        const next = [...prev]
        next[indices[Math.floor(Math.random() * indices.length)]] = false
        coveredRef.current = next
        return next
      })
    }, REVEAL_INTERVAL)

    return () => stopTimers()
  }, [storageKey]) // eslint-disable-line react-hooks/exhaustive-deps

  function guess(option: string) {
    if (done || doneRef.current) return
    setChosen(option)
    const correct = option === puzzle.answer
    // Need a tick for chosen state to apply visually before ending
    setTimeout(() => endGame(correct, coveredRef.current), 400)
  }

  // Timer bar width
  const timerPct = (timeLeft / TIMER) * 100
  const timerColor = timeLeft > 20
    ? 'var(--color-circuit)'
    : timeLeft > 10 ? '#EDDE5C' : '#ED693A'

  const coveredCount = covered.filter(Boolean).length

  return (
    <div className="max-w-lg mx-auto space-y-4">
      {/* Image + tile overlay */}
      <div className="relative rounded-xl overflow-hidden" style={{ aspectRatio: '3/2' }}>
        {/* Base image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={puzzle.imageUrl}
          alt="Identify the installation"
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />

        {/* Tile overlay */}
        <div
          className="absolute inset-0"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${COLS}, 1fr)`,
            gridTemplateRows: `repeat(${ROWS}, 1fr)`,
            gap: 3,
            padding: 3,
          }}
        >
          {covered.map((isCovered, i) => (
            <div
              key={i}
              style={{
                borderRadius: 6,
                background: 'linear-gradient(135deg, #1a1a30 0%, #252540 100%)',
                border: '1px solid rgba(255,255,255,0.06)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
                opacity: isCovered ? 1 : 0,
                transform: isCovered ? 'scale(1)' : 'scale(0.85)',
                transition: 'opacity 0.5s ease, transform 0.5s ease',
                pointerEvents: 'none',
              }}
            />
          ))}
        </div>

        {/* Timer bar overlay at bottom of image */}
        {!done && (
          <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: 'rgba(0,0,0,0.4)' }}>
            <div
              style={{
                height: '100%',
                width: `${timerPct}%`,
                background: timerColor,
                transition: 'width 1s linear, background 0.5s ease',
              }}
            />
          </div>
        )}

        {/* Timer number */}
        {!done && (
          <div
            className="absolute top-2 right-2 font-mono font-black text-xs px-2 py-0.5 rounded-full"
            style={{
              background: 'rgba(0,0,0,0.55)',
              color: timerColor,
              backdropFilter: 'blur(4px)',
              transition: 'color 0.5s ease',
            }}
          >
            {timeLeft}s
          </div>
        )}

        {/* Tiles remaining */}
        {!done && (
          <div
            className="absolute top-2 left-2 font-display text-xs px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(0,0,0,0.55)', color: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(4px)' }}
          >
            {coveredCount} pieces left
          </div>
        )}
      </div>

      {/* Options */}
      {!done ? (
        <div className="grid grid-cols-2 gap-2">
          {puzzle.options.map(opt => (
            <button
              key={opt}
              onClick={() => guess(opt)}
              className="py-3 px-3 rounded-xl text-xs font-display font-semibold text-left transition-all bg-seeper-raised border border-seeper-border/40 text-seeper-white hover:border-circuit/60 hover:bg-circuit/10 active:scale-95"
            >
              {opt}
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {/* Result */}
          <div
            className="rounded-xl p-4 text-center"
            style={{
              background: won ? 'color-mix(in srgb, var(--color-fern) 10%, transparent)' : 'color-mix(in srgb, var(--color-plasma) 10%, transparent)',
              border: `1px solid ${won ? 'color-mix(in srgb, var(--color-fern) 30%, transparent)' : 'color-mix(in srgb, var(--color-plasma) 30%, transparent)'}`,
            }}
          >
            <p className="font-black font-display text-lg" style={{ color: won ? 'var(--color-fern)' : 'var(--color-plasma)' }}>
              {won ? `${puzzle.answer} ✓` : `It was ${puzzle.answer}`}
            </p>
            {won && (
              <p className="text-xs text-seeper-muted mt-1">
                {coveredCount > 0 ? `${coveredCount} pieces still hidden — nice work` : 'Fully revealed — got there in the end'}
              </p>
            )}
            {chosen && !won && (
              <p className="text-xs text-seeper-muted mt-1">You guessed: {chosen}</p>
            )}
            {!chosen && !won && (
              <p className="text-xs text-seeper-muted mt-1">Time&apos;s up</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
