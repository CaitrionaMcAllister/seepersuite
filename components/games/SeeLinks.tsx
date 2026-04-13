'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { gameStorageKey } from '@/lib/gameOfDay'
import { submitGameScore } from '@/lib/gameScores'

interface Category { label: string; words: string[]; color: string; bg: string }
interface Puzzle { categories: Category[] }

const PUZZLES: Puzzle[] = [
  {
    categories: [
      { label: 'Render engines', color: '#B0A9CF', bg: 'rgba(176,169,207,0.15)', words: ['OCTANE', 'ARNOLD', 'CYCLES', 'EEVEE'] },
      { label: 'Editing transitions', color: '#EDDE5C', bg: 'rgba(237,222,92,0.15)', words: ['FADE', 'WIPE', 'CUT', 'DISSOLVE'] },
      { label: 'Colour models', color: '#8ACB8F', bg: 'rgba(138,203,143,0.15)', words: ['CMYK', 'RGBA', 'HSL', 'HEX'] },
      { label: 'XR hardware terms', color: '#ED693A', bg: 'rgba(237,105,58,0.15)', words: ['HAPTIC', 'LIDAR', 'LATENCY', 'SPATIAL'] },
    ],
  },
  {
    categories: [
      { label: 'seeper brand palette', color: '#B0A9CF', bg: 'rgba(176,169,207,0.15)', words: ['PLASMA', 'VOLT', 'FERN', 'QUANTUM'] },
      { label: 'Camera movements', color: '#EDDE5C', bg: 'rgba(237,222,92,0.15)', words: ['PAN', 'TILT', 'DOLLY', 'CRANE'] },
      { label: 'Audio effects', color: '#8ACB8F', bg: 'rgba(138,203,143,0.15)', words: ['REVERB', 'DELAY', 'CHORUS', 'FLANGER'] },
      { label: 'Light types (3D)', color: '#ED693A', bg: 'rgba(237,105,58,0.15)', words: ['POINT', 'SPOT', 'AREA', 'AMBIENT'] },
    ],
  },
  {
    categories: [
      { label: 'Typography terms', color: '#B0A9CF', bg: 'rgba(176,169,207,0.15)', words: ['KERN', 'SERIF', 'GLYPH', 'LEADING'] },
      { label: 'File formats', color: '#EDDE5C', bg: 'rgba(237,222,92,0.15)', words: ['SVG', 'PNG', 'WEBP', 'AVIF'] },
      { label: 'Early-stage outputs', color: '#8ACB8F', bg: 'rgba(138,203,143,0.15)', words: ['SKETCH', 'DRAFT', 'PROOF', 'MOCK'] },
      { label: 'Display types', color: '#ED693A', bg: 'rgba(237,105,58,0.15)', words: ['OLED', 'QLED', 'LCD', 'MICROLED'] },
    ],
  },
  {
    categories: [
      { label: '3D modelling operations', color: '#B0A9CF', bg: 'rgba(176,169,207,0.15)', words: ['EXTRUDE', 'BEVEL', 'BOOLEAN', 'SUBDIVIDE'] },
      { label: 'Music genres in immersive', color: '#EDDE5C', bg: 'rgba(237,222,92,0.15)', words: ['AMBIENT', 'DRONE', 'NOISE', 'MINIMAL'] },
      { label: 'VR headsets', color: '#8ACB8F', bg: 'rgba(138,203,143,0.15)', words: ['QUEST', 'PSVR', 'VIVE', 'INDEX'] },
      { label: 'Sound design elements', color: '#ED693A', bg: 'rgba(237,105,58,0.15)', words: ['FOLEY', 'ADR', 'SFX', 'SCORE'] },
    ],
  },
  {
    categories: [
      { label: 'Creative brief stages', color: '#B0A9CF', bg: 'rgba(176,169,207,0.15)', words: ['BRIEF', 'PITCH', 'SPRINT', 'RETRO'] },
      { label: 'Projection technologies', color: '#EDDE5C', bg: 'rgba(237,222,92,0.15)', words: ['LASER', 'LED', 'DLP', 'LCOS'] },
      { label: 'Famous immersive artists', color: '#8ACB8F', bg: 'rgba(138,203,143,0.15)', words: ['KUSAMA', 'TURRELL', 'VIOLA', 'ELIASSON'] },
      { label: 'Colour qualities', color: '#ED693A', bg: 'rgba(237,105,58,0.15)', words: ['WARM', 'COOL', 'VIVID', 'MUTED'] },
    ],
  },
  {
    categories: [
      { label: 'Things that can be spatial', color: '#B0A9CF', bg: 'rgba(176,169,207,0.15)', words: ['AUDIO', 'COMPUTING', 'DESIGN', 'MAPPING'] },
      { label: 'Blender workspaces', color: '#EDDE5C', bg: 'rgba(237,222,92,0.15)', words: ['LAYOUT', 'SHADING', 'RIGGING', 'COMPOSITING'] },
      { label: 'Game loop states', color: '#8ACB8F', bg: 'rgba(138,203,143,0.15)', words: ['SPAWN', 'IDLE', 'TRIGGER', 'RESPAWN'] },
      { label: 'Contract milestones', color: '#ED693A', bg: 'rgba(237,105,58,0.15)', words: ['KICKOFF', 'REVIEW', 'SIGN-OFF', 'DELIVERY'] },
    ],
  },
  {
    categories: [
      { label: 'Things that "break" in immersive', color: '#B0A9CF', bg: 'rgba(176,169,207,0.15)', words: ['IMMERSION', 'LATENCY', 'TRACKING', 'SYNC'] },
      { label: 'Parts of a film crew', color: '#EDDE5C', bg: 'rgba(237,222,92,0.15)', words: ['GAFFER', 'GRIP', 'SPARK', 'FOCUS'] },
      { label: 'Ways light behaves', color: '#8ACB8F', bg: 'rgba(138,203,143,0.15)', words: ['REFRACT', 'REFLECT', 'ABSORB', 'DIFFUSE'] },
      { label: 'AI model types', color: '#ED693A', bg: 'rgba(237,105,58,0.15)', words: ['DIFFUSION', 'TRANSFORMER', 'GAN', 'VAE'] },
    ],
  },
  {
    categories: [
      { label: 'Parts of a music track', color: '#B0A9CF', bg: 'rgba(176,169,207,0.15)', words: ['INTRO', 'VERSE', 'CHORUS', 'BRIDGE'] },
      { label: 'Things you do to a timeline', color: '#EDDE5C', bg: 'rgba(237,222,92,0.15)', words: ['TRIM', 'SPLIT', 'RIPPLE', 'SLIP'] },
      { label: 'Types of texture (tactile)', color: '#8ACB8F', bg: 'rgba(138,203,143,0.15)', words: ['ROUGH', 'SMOOTH', 'MATTE', 'GLOSSY'] },
      { label: 'Sensor types', color: '#ED693A', bg: 'rgba(237,105,58,0.15)', words: ['GYRO', 'ACCEL', 'DEPTH', 'THERMAL'] },
    ],
  },
  {
    categories: [
      { label: 'Game engine companies', color: '#B0A9CF', bg: 'rgba(176,169,207,0.15)', words: ['UNITY', 'EPIC', 'VALVE', 'ID'] },
      { label: 'Shader graph node types', color: '#EDDE5C', bg: 'rgba(237,222,92,0.15)', words: ['MULTIPLY', 'LERP', 'CLAMP', 'SAMPLE'] },
      { label: 'Types of map (3D)', color: '#8ACB8F', bg: 'rgba(138,203,143,0.15)', words: ['NORMAL', 'HEIGHT', 'OCCLUSION', 'EMISSIVE'] },
      { label: 'Studio roles', color: '#ED693A', bg: 'rgba(237,105,58,0.15)', words: ['DIRECTOR', 'PRODUCER', 'TECH', 'CREATIVE'] },
    ],
  },
  {
    categories: [
      { label: 'Immersive theatre companies', color: '#B0A9CF', bg: 'rgba(176,169,207,0.15)', words: ['PUNCHDRUNK', 'SHUNT', 'DREAMTHINKSPEAK', 'COMPLICITE'] },
      { label: 'Ways to present work', color: '#EDDE5C', bg: 'rgba(237,222,92,0.15)', words: ['DECK', 'DEMO', 'PROTOTYPE', 'SHOWCASE'] },
      { label: 'Wavelength regions', color: '#8ACB8F', bg: 'rgba(138,203,143,0.15)', words: ['INFRARED', 'VISIBLE', 'ULTRAVIOLET', 'MICROWAVE'] },
      { label: 'Particle system properties', color: '#ED693A', bg: 'rgba(237,105,58,0.15)', words: ['EMISSION', 'GRAVITY', 'LIFETIME', 'VELOCITY'] },
    ],
  },
]

export default function SeeLinks({ dayIndex }: { dayIndex: number }) {
  const puzzle = PUZZLES[dayIndex % PUZZLES.length]
  const storageKey = gameStorageKey('seeLinks')

  // Flatten all 16 words and shuffle deterministically per day
  const allWords = puzzle.categories.flatMap(c => c.words)
  function deterministicShuffle(arr: string[], seed: number): string[] {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
      const j = (seed * (i + 1) * 2654435761) % (i + 1)
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }
  const shuffled = deterministicShuffle(allWords, dayIndex)

  const [selected, setSelected] = useState<string[]>([])
  const [solved, setSolved] = useState<number[]>([]) // category indices
  const [attempts, setAttempts] = useState(4)
  const [done, setDone] = useState(false)
  const [shake, setShake] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const s = JSON.parse(saved)
        setSelected(s.selected ?? [])
        setSolved(s.solved ?? [])
        setAttempts(s.attempts ?? 4)
        setDone(s.done ?? false)
      }
    } catch {}
  }, [storageKey])

  function saveState(sel: string[], sol: number[], att: number, d: boolean) {
    localStorage.setItem(storageKey, JSON.stringify({ selected: sel, solved: sol, attempts: att, done: d }))
  }

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 2000)
  }

  function toggle(word: string) {
    if (done) return
    const solvedWords = solved.flatMap(i => puzzle.categories[i].words)
    if (solvedWords.includes(word)) return
    setSelected(prev => prev.includes(word) ? prev.filter(w => w !== word) : prev.length < 4 ? [...prev, word] : prev)
  }

  function submit() {
    if (selected.length !== 4) return
    const matchIdx = puzzle.categories.findIndex(cat => selected.every(w => cat.words.includes(w)) && cat.words.every(w => selected.includes(w)))
    if (matchIdx !== -1 && !solved.includes(matchIdx)) {
      const newSolved = [...solved, matchIdx]
      const isDone = newSolved.length === 4 || attempts === 1
      setSolved(newSolved)
      setSelected([])
      setDone(isDone)
      if (isDone) submitGameScore('seeLinks', dayIndex, newSolved.length)
      if (newSolved.length === 4) showToast('All found! 🎉')
      else showToast('Correct! Keep going.')
      saveState([], newSolved, attempts, isDone)
    } else {
      // Check if one away
      const oneAway = puzzle.categories.some(cat => {
        const overlap = selected.filter(w => cat.words.includes(w)).length
        return overlap === 3 && !solved.includes(puzzle.categories.indexOf(cat))
      })
      const newAtt = attempts - 1
      setAttempts(newAtt)
      setShake(true)
      setTimeout(() => setShake(false), 400)
      if (oneAway) showToast('One away…')
      else showToast('Not quite.')
      if (newAtt === 0) { setDone(true); submitGameScore('seeLinks', dayIndex, solved.length); saveState(selected, solved, 0, true) }
      else saveState(selected, solved, newAtt, false)
    }
  }

  const solvedWords = solved.flatMap(i => puzzle.categories[i].words)
  const remaining = shuffled.filter(w => !solvedWords.includes(w))

  return (
    <div className="max-w-md mx-auto space-y-4">
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-seeper-surface border border-seeper-border rounded-full px-5 py-2 text-sm font-display font-semibold text-seeper-white shadow-xl pointer-events-none">
          {toast}
        </div>
      )}

      {/* Solved categories */}
      {solved.map(idx => {
        const cat = puzzle.categories[idx]
        return (
          <div key={idx} className="rounded-xl p-3 text-center" style={{ background: cat.bg, border: `1px solid ${cat.color}40` }}>
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: cat.color }}>{cat.label}</p>
            <p className="text-seeper-steel text-xs mt-1">{cat.words.join(' · ')}</p>
          </div>
        )
      })}

      {/* Word grid */}
      {!done && (
        <div className={cn('grid grid-cols-4 gap-2', shake && 'animate-[shake_0.3s_ease]')}>
          {remaining.map(word => {
            const isSel = selected.includes(word)
            return (
              <button
                key={word}
                onClick={() => toggle(word)}
                className={cn(
                  'py-3 px-1 rounded-xl text-xs font-black font-display text-center transition-all active:scale-95 leading-tight',
                  isSel
                    ? 'bg-seeper-steel text-seeper-black scale-105'
                    : 'bg-seeper-raised hover:bg-seeper-border/40 text-seeper-white border border-seeper-border/40'
                )}
              >
                {word}
              </button>
            )
          })}
        </div>
      )}

      {/* Submit row */}
      {!done && (
        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-1">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className={cn('w-3 h-3 rounded-full', i < attempts ? 'bg-volt' : 'bg-seeper-border/30')} />
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setSelected([])} className="px-4 py-2 rounded-full border border-seeper-border/40 text-xs text-seeper-muted hover:text-seeper-white transition-colors">Deselect</button>
            <button
              onClick={submit}
              disabled={selected.length !== 4}
              className="px-5 py-2 rounded-full bg-quantum text-seeper-black text-xs font-bold transition-all hover:opacity-90 disabled:opacity-30"
            >
              Submit
            </button>
          </div>
        </div>
      )}

      {/* Final reveal if out of attempts */}
      {done && solved.length < 4 && (
        <div className="space-y-2">
          {puzzle.categories.filter((_, i) => !solved.includes(i)).map((cat, i) => (
            <div key={i} className="rounded-xl p-3 text-center opacity-70" style={{ background: cat.bg, border: `1px solid ${cat.color}40` }}>
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: cat.color }}>{cat.label}</p>
              <p className="text-seeper-steel text-xs mt-1">{cat.words.join(' · ')}</p>
            </div>
          ))}
        </div>
      )}

      {done && (
        <p className="text-center text-sm font-display font-semibold" style={{ color: solved.length === 4 ? 'var(--color-fern)' : 'var(--color-muted)' }}>
          {solved.length === 4 ? `Solved with ${4 - attempts} mistake${attempts !== 3 ? 's' : ''}` : 'Better luck tomorrow'}
        </p>
      )}
    </div>
  )
}
