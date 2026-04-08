'use client'

import { useState, useEffect } from 'react'
import { gameStorageKey } from '@/lib/gameOfDay'

const PROMPTS = [
  { prompt: 'Describe an immersive experience using only three words.', hint: 'Go for feeling, not description.' },
  { prompt: 'Name a technology and an unexpected emotion it makes you feel.', hint: 'Think beyond the obvious.' },
  { prompt: 'What would a smell-based immersive installation smell like?', hint: 'Be as specific as you can.' },
  { prompt: 'Invent a name for a colour that doesn\'t exist yet.', hint: 'Define it without using other colour names.' },
  { prompt: 'If you had to soundtrack a Monday morning commute in space, what\'s the first instrument?', hint: 'Trust the first thing that comes to mind.' },
  { prompt: 'What would the loading screen of your brain look like?', hint: 'Describe it visually.' },
  { prompt: 'Name an emotion that has no English word for it.', hint: 'Try to describe it in a sentence.' },
  { prompt: 'What everyday object would make the best art installation if scaled to the size of a building?', hint: 'Think about context and texture.' },
  { prompt: 'Describe darkness using only sounds.', hint: 'Silence is too easy.' },
  { prompt: 'If seeper were a weather system, what would it be?', hint: 'Think atmosphere, energy, impact.' },
  { prompt: 'What\'s a creative constraint that would make a project better rather than worse?', hint: 'Be specific — no more than one sentence.' },
  { prompt: 'Design a chair for someone who has never experienced gravity.', hint: 'What assumptions are you dropping?' },
  { prompt: 'What would a museum of the future smell like?', hint: 'Not a metaphor — be literal.' },
  { prompt: 'Write a one-line brief for an experience that makes people cry.', hint: 'Without being sad.' },
  { prompt: 'What song would play as the credits of 2024 rolled?', hint: 'Genre, tempo, feeling — not just a title.' },
  { prompt: 'Name a texture that is also an emotion.', hint: 'Think about how things feel physically and emotionally.' },
  { prompt: 'If you could only use one colour for an entire installation, which one and why?', hint: 'Make a case for it.' },
  { prompt: 'What sound does trust make?', hint: 'Think beyond metaphor — try to be literal.' },
  { prompt: 'Design a game where losing feels better than winning.', hint: 'What\'s the mechanic?' },
  { prompt: 'What would an experience designed to do nothing feel like?', hint: 'How would you know it was working?' },
  { prompt: 'Write one sentence that makes someone feel like they\'re underwater.', hint: 'Without mentioning water.' },
  { prompt: 'What\'s the most boring thing that could become the most interesting installation?', hint: 'Think scale, context, and time.' },
  { prompt: 'Describe a new sense. What does it detect?', hint: 'Keep it physical, not metaphysical.' },
  { prompt: 'What would the waiting room for a dream look like?', hint: 'Furniture, light, sounds — be specific.' },
  { prompt: 'Name an immersive experience that already exists in everyday life but we never notice.', hint: 'Observe rather than invent.' },
  { prompt: 'What would a map of today feel like to touch?', hint: 'Think texture, terrain, temperature.' },
  { prompt: 'If a building could have a personality, what would a cinema\'s be?', hint: 'Describe it like a character, not a space.' },
  { prompt: 'What\'s a creative decision you\'d make purely for yourself, even if the audience never notices?', hint: 'Details, textures, easter eggs.' },
  { prompt: 'Write a haiku about a deadline.', hint: '5-7-5 syllables. Any tone.' },
  { prompt: 'What technology, if it existed, would make art impossible?', hint: 'Think about what tension art requires to exist.' },
]

export default function SeeSpark({ dayIndex }: { dayIndex: number }) {
  const { prompt, hint } = PROMPTS[dayIndex % PROMPTS.length]
  const storageKey = gameStorageKey('seeSpark')

  const [response, setResponse] = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const s = JSON.parse(saved)
        setResponse(s.response ?? '')
        setSubmitted(s.submitted ?? false)
      }
    } catch {}
  }, [storageKey])

  function submit() {
    if (!response.trim()) return
    setSubmitted(true)
    localStorage.setItem(storageKey, JSON.stringify({ response, submitted: true }))
  }

  return (
    <div className="max-w-lg mx-auto space-y-5">
      {/* Prompt */}
      <div
        className="rounded-2xl p-5 space-y-2"
        style={{ background: 'color-mix(in srgb, var(--color-plasma) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--color-plasma) 25%, transparent)' }}
      >
        <p className="text-seeper-white font-display font-semibold text-base leading-snug">{prompt}</p>
        <p className="text-xs italic" style={{ color: 'color-mix(in srgb, var(--color-plasma) 70%, var(--color-muted))' }}>{hint}</p>
      </div>

      {submitted ? (
        <div className="space-y-3">
          <div className="rounded-xl p-4 bg-seeper-raised border border-seeper-border/40">
            <p className="text-xs text-seeper-muted mb-1">Your response</p>
            <p className="text-seeper-white text-sm font-display leading-relaxed whitespace-pre-wrap">{response}</p>
          </div>
          <p className="text-center text-xs text-seeper-muted">Submitted ✓ — come back tomorrow for a new spark.</p>
        </div>
      ) : (
        <>
          <textarea
            value={response}
            onChange={e => setResponse(e.target.value)}
            placeholder="Write your response here…"
            rows={5}
            className="w-full bg-seeper-raised border border-seeper-border/40 rounded-xl px-4 py-3 text-sm font-display text-seeper-white outline-none focus:ring-1 resize-none leading-relaxed placeholder:text-seeper-muted/50"
            style={{ '--tw-ring-color': 'var(--color-plasma)' } as React.CSSProperties}
          />
          <button
            onClick={submit}
            disabled={!response.trim()}
            className="w-full py-2.5 rounded-full text-sm font-bold font-display transition-all hover:opacity-90 disabled:opacity-30"
            style={{ background: 'var(--color-plasma)', color: '#ffffff' }}
          >
            Submit response
          </button>
        </>
      )}
    </div>
  )
}
