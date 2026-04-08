'use client'

import { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { gameStorageKey } from '@/lib/gameOfDay'

const WORDS = [
  'PIXEL', 'FRAME', 'AUDIO', 'SYNTH', 'DEPTH',
  'LAYER', 'PULSE', 'PRISM', 'GLYPH', 'TEMPO',
  'PHASE', 'SCENE', 'LASER', 'CRAFT', 'LIGHT',
  'SHIFT', 'BLEND', 'TRACE', 'STAGE', 'SCOPE',
  'GRAIN', 'SHARP', 'PATCH', 'DELTA', 'VOXEL',
  'OPTIC', 'BRUSH', 'CHORD', 'DRAFT', 'ANGLE',
]

const KEYBOARD_ROWS = [
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L'],
  ['ENTER','Z','X','C','V','B','N','M','⌫'],
]

type TileState = 'correct' | 'present' | 'absent' | 'empty' | 'filled'

function evaluateGuess(guess: string, answer: string): TileState[] {
  const result: TileState[] = Array(5).fill('absent')
  const ans = answer.split('')
  const g = guess.split('')
  g.forEach((l, i) => { if (l === ans[i]) { result[i] = 'correct'; ans[i] = '#' } })
  g.forEach((l, i) => {
    if (result[i] === 'correct') return
    const ai = ans.indexOf(l)
    if (ai !== -1) { result[i] = 'present'; ans[ai] = '#' }
  })
  return result
}

const TILE_STYLE: Record<TileState, string> = {
  correct: 'bg-fern border-fern text-seeper-black',
  present: 'bg-volt border-volt text-seeper-black',
  absent:  'bg-seeper-raised border-seeper-border/60 text-seeper-muted',
  empty:   'bg-transparent border-seeper-border/40 text-seeper-white',
  filled:  'bg-transparent border-seeper-steel/60 text-seeper-white scale-105',
}

export default function SeeWord({ dayIndex }: { dayIndex: number }) {
  const answer = WORDS[dayIndex % WORDS.length]
  const storageKey = gameStorageKey('seeWord')

  const [guesses, setGuesses] = useState<string[]>([])
  const [current, setCurrent] = useState('')
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)
  const [invalid, setInvalid] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const s = JSON.parse(saved)
        setGuesses(s.guesses ?? [])
        setGameOver(s.gameOver ?? false)
        setWon(s.won ?? false)
      }
    } catch {}
  }, [storageKey])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 2000)
  }

  const submit = useCallback(() => {
    if (current.length !== 5) {
      setInvalid(true)
      setTimeout(() => setInvalid(false), 400)
      showToast('5 letters needed')
      return
    }
    const newGuesses = [...guesses, current]
    const didWin = current === answer
    const over = didWin || newGuesses.length >= 6
    setGuesses(newGuesses)
    setCurrent('')
    setGameOver(over)
    setWon(didWin)
    localStorage.setItem(storageKey, JSON.stringify({ guesses: newGuesses, gameOver: over, won: didWin }))
    if (didWin) showToast('Brilliant! 🎉')
    else if (newGuesses.length >= 6) showToast(`The word was ${answer}`)
  }, [current, guesses, answer, storageKey])

  const handleKey = useCallback((key: string) => {
    if (gameOver) return
    if (key === 'ENTER') { submit(); return }
    if (key === '⌫' || key === 'BACKSPACE') { setCurrent(c => c.slice(0, -1)); return }
    if (/^[A-Z]$/.test(key) && current.length < 5) setCurrent(c => c + key)
  }, [gameOver, current, submit])

  useEffect(() => {
    const h = (e: KeyboardEvent) => handleKey(e.key.toUpperCase())
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [handleKey])

  // Per-letter keyboard states
  const letterStates: Record<string, TileState> = {}
  guesses.forEach(g => {
    evaluateGuess(g, answer).forEach((s, i) => {
      const l = g[i]
      const prev = letterStates[l]
      if (!prev || s === 'correct' || (s === 'present' && prev === 'absent')) letterStates[l] = s
    })
  })

  const rows = Array.from({ length: 6 }, (_, i) => {
    if (i < guesses.length) return { letters: guesses[i].split(''), states: evaluateGuess(guesses[i], answer) }
    if (i === guesses.length && !gameOver) {
      const letters = current.split('')
      return {
        letters: Array.from({ length: 5 }, (_, j) => letters[j] ?? ''),
        states: Array.from({ length: 5 }, (_, j) => letters[j] ? 'filled' : 'empty') as TileState[],
      }
    }
    return { letters: Array(5).fill(''), states: Array(5).fill('empty') as TileState[] }
  })

  return (
    <div className="flex flex-col items-center gap-5">
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-seeper-surface border border-seeper-border rounded-full px-5 py-2 text-sm font-display font-semibold text-seeper-white shadow-xl pointer-events-none">
          {toast}
        </div>
      )}

      {/* Grid */}
      <div className={cn('flex flex-col gap-1.5 transition-transform', invalid && 'animate-[shake_0.3s_ease]')}>
        {rows.map((row, ri) => (
          <div key={ri} className="flex gap-1.5">
            {row.letters.map((l, ci) => (
              <div key={ci} className={cn('w-12 h-12 flex items-center justify-center text-lg font-black font-display border-2 rounded-lg transition-all duration-150', TILE_STYLE[row.states[ci]])}>
                {l}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Keyboard */}
      {!gameOver && (
        <div className="flex flex-col gap-1.5">
          {KEYBOARD_ROWS.map((row, ri) => (
            <div key={ri} className="flex gap-1 justify-center">
              {row.map(key => {
                const s = letterStates[key]
                return (
                  <button
                    key={key}
                    onClick={() => handleKey(key)}
                    className={cn(
                      'h-11 rounded-lg text-xs font-bold font-display transition-all active:scale-95',
                      key.length > 1 ? 'px-3 min-w-[52px] text-[10px]' : 'w-9',
                      s === 'correct' ? 'bg-fern text-seeper-black' :
                      s === 'present' ? 'bg-volt text-seeper-black' :
                      s === 'absent'  ? 'bg-seeper-border/30 text-seeper-muted' :
                      'bg-seeper-raised text-seeper-white hover:bg-seeper-border/50'
                    )}
                  >
                    {key}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      )}

      {/* Result */}
      {gameOver && (
        <div className="text-center space-y-1 pt-1">
          <p className={cn('text-base font-black font-display', won ? 'text-fern' : 'text-seeper-muted')}>
            {won ? `Solved in ${guesses.length} / 6` : `The word was ${answer}`}
          </p>
          {won && (
            <div className="flex justify-center gap-0.5 mt-2">
              {guesses.map((g, i) => (
                <div key={i} className="flex flex-col gap-0.5">
                  {evaluateGuess(g, answer).map((s, j) => (
                    <div key={j} className={cn('w-3 h-3 rounded-sm', s === 'correct' ? 'bg-fern' : s === 'present' ? 'bg-volt' : 'bg-seeper-border/50')} />
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
