'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { gameStorageKey } from '@/lib/gameOfDay'
import { submitGameScore } from '@/lib/gameScores'

interface ScopePuzzle {
  answer: string
  options: string[]
  clues: string[]
}

const PUZZLES: ScopePuzzle[] = [
  {
    answer: 'Rain Room',
    options: ['Rain Room', 'Cloud Forest', 'Water Wall', 'The Flood'],
    clues: [
      'A large-scale room you walk through without getting wet.',
      'Precipitation falls constantly throughout the entire space.',
      'Sensors detect your position and stop the rain around your body.',
      'Created by a UK collective known for data-driven and mechanical installations.',
      'First exhibited at the Barbican in London in 2012.',
      'The collective\'s name references both randomness and global ambition.',
    ],
  },
  {
    answer: 'Sleep No More',
    options: ['Sleep No More', 'The Drowned Man', 'Then She Fell', 'You Me Bum Bum Train'],
    clues: [
      'Every audience member must wear a mask before entering.',
      'You can roam freely while performers act scenes around and among you.',
      'The narrative loosely adapts one of Shakespeare\'s darkest tragedies.',
      'Spread across multiple floors of a converted industrial building.',
      'Produced by the UK company credited with defining modern immersive theatre.',
      'Set in a 1930s New York hotel called the McKittrick, it is based on Macbeth.',
    ],
  },
  {
    answer: 'teamLab Borderless',
    options: ['teamLab Borderless', 'Meow Wolf', 'Superblue', 'ARTECHOUSE'],
    clues: [
      'A digital art museum where artworks move freely between rooms.',
      'There are no defined galleries — you discover the space by wandering.',
      'Works respond to your presence: flowers bloom, creatures swim away.',
      'Created by a Japanese collective of artists, engineers, and architects.',
      'The original venue opened in Odaiba, Tokyo in 2018 and attracted over two million visitors.',
      'The name describes artworks that exist without borders between them.',
    ],
  },
  {
    answer: 'Infinity Mirror Rooms',
    options: ['Infinity Mirror Rooms', 'Mirror Labyrinth', 'Endless Rooms', 'The Void'],
    clues: [
      'You step inside and become part of the artwork itself.',
      'Small lights or pumpkins surround you, seemingly stretching to infinity.',
      'Each visitor is typically admitted for only 20 to 45 seconds.',
      'Created by a Japanese artist whose practice began in the 1960s.',
      'The same artist is famous for polka dots and the concept of "infinity nets".',
      'Yayoi Kusama has said the mirrors reflect her own mind and emotional states.',
    ],
  },
  {
    answer: 'The Crystal Maze',
    options: ['The Crystal Maze', 'Escape Hunt', 'The Void', 'Total Wipeout'],
    clues: [
      'Contestants navigate themed zones to collect physical objects.',
      'Fail a challenge and a team member gets locked in until rescued.',
      'Four zones represent different eras or world cultures.',
      'Originally a UK television game show that first aired in 1990.',
      'Was transformed into a wildly popular live experience in London.',
      'The show was originally hosted by Richard O\'Brien, creator of The Rocky Horror Show.',
    ],
  },
  {
    answer: 'Arcadia',
    options: ['Arcadia', 'Glastonbury Block 9', 'Boomtown Fair', 'Junction 2'],
    clues: [
      'A spectacular mechanical art structure that comes to life after dark.',
      'Built from reclaimed military and industrial hardware.',
      'Features fire, laser effects, and live DJ performances beneath its body.',
      'Regularly appears at festivals including Glastonbury.',
      'The structure itself resembles a giant spider or arachnid form.',
      'Created by Welsh collective Arcadia, it is named after the concept of an Arcadian ideal.',
    ],
  },
  {
    answer: 'Björk Digital',
    options: ['Björk Digital', 'Björk Vulnicura', 'Fever Room', 'Ryoji Ikeda'],
    clues: [
      'A VR exhibition exploring music and visuals in an immersive environment.',
      'Visitors wear headsets to enter worlds created around individual music videos.',
      'The works include oceanic landscapes, digital forests, and abstract geometry.',
      'Created in collaboration with the artist\'s album of the same era.',
      'Toured internationally from 2016, reaching venues in Tokyo, New York, and Sydney.',
      'The Icelandic artist said she wanted audiences to "swim inside the music".',
    ],
  },
  {
    answer: 'Meow Wolf House of Eternal Return',
    options: ['Meow Wolf House of Eternal Return', 'teamLab Forest', 'Omega Mart', 'The Beach'],
    clues: [
      'Visitors enter through a Victorian house and discover something unexpected inside.',
      'The narrative involves a missing family and an unexplained interdimensional event.',
      'Created by an artist collective from Santa Fe, New Mexico.',
      'The building it occupies was funded by a famous sci-fi author.',
      'George R.R. Martin provided the initial funding and space for this first venue.',
      'It opened in 2016 and is considered the first major "narrative immersive" art venue.',
    ],
  },
  {
    answer: 'The Weather Project',
    options: ['The Weather Project', 'Sun & Sea', 'Arctic', 'Solar Return'],
    clues: [
      'A giant glowing orb fills one end of a vast turbine hall.',
      'The ceiling is covered in mirrors, doubling the scale of the space.',
      'Visitors lie on the floor and look up at the reflected light.',
      'Created for a famous London contemporary art museum in 2003.',
      'The artist behind it often explores perception, light, and natural phenomena.',
      'Olafur Eliasson created it for the Turbine Hall at Tate Modern.',
    ],
  },
  {
    answer: 'Halo (UVA)',
    options: ['Halo (UVA)', 'Spectra', 'Light Horizon', 'Liminal'],
    clues: [
      'Visitors enter a circular structure of pure light.',
      'The work uses LED to create a tunnel-like ring of shifting illumination.',
      'Walking through changes the experience entirely depending on angle and speed.',
      'Created by a UK collective known for large-scale light installations.',
      'The same collective have created works for Glastonbury and the Olympic opening ceremony.',
      'United Visual Artists created it — UVA was founded in 2003 by Matt Clark.',
    ],
  },
  {
    answer: 'You Me Bum Bum Train',
    options: ['You Me Bum Bum Train', 'Punchdrunk', 'Coney', 'WildWorks'],
    clues: [
      'One audience member at a time experiences the entire show.',
      'You are cast as the protagonist — staff treat you as an expert in each scene.',
      'The scenarios change entirely between performances.',
      'The name is deliberately nonsensical and has no literal meaning.',
      'Despite widespread acclaim, the creators deliberately limit media coverage.',
      'Created by Kate Bond and Morgan Lloyd in the UK since 2004.',
    ],
  },
  {
    answer: 'Desert X',
    options: ['Desert X', 'Burning Man', 'Coachella Art', 'Land Art Movement'],
    clues: [
      'Site-specific artworks installed across a vast outdoor landscape.',
      'Works respond to and contrast with the natural environment around them.',
      'Each edition commissions new work from international artists.',
      'The original location is in the Coachella Valley in California.',
      'Works include large-scale sculpture, video, and architectural interventions.',
      'A biennial art event in the Southern California desert, launched in 2017.',
    ],
  },
  {
    answer: 'Superblue Miami',
    options: ['Superblue Miami', 'Pace Gallery', 'LACMA Art', 'MoMA Experience'],
    clues: [
      'A dedicated space for large-scale experiential and immersive art.',
      'Visitors walk through and around works rather than observing them at distance.',
      'Located in a converted warehouse in the Wynwood arts district.',
      'The venue has hosted works by James Turrell and teamLab.',
      'Founded in partnership with major commercial galleries.',
      'Superblue opened in Miami in 2021, representing a new model for immersive art venues.',
    ],
  },
  {
    answer: 'Spectra (UVA)',
    options: ['Spectra (UVA)', 'Halo', 'Light Pillar', 'BEAM'],
    clues: [
      'A single vertical beam of white light shoots miles into the night sky.',
      'Visible from kilometres away, it becomes a landmark rather than a venue.',
      'Visitors approach and look upward into the column of light.',
      'Created as part of a festival commemorating a major historical event.',
      'Made by the same collective responsible for Halo and the 2012 Olympics work.',
      'United Visual Artists created Spectra for the Hiroshima Peace Memorial in 2015.',
    ],
  },
  {
    answer: 'Fever Room',
    options: ['Fever Room', 'Black Hole', 'The Darkroom', 'Dreamachine'],
    clues: [
      'Audience members lie down for the entire performance.',
      'They are given white paper overalls to wear before entering.',
      'Light, sound, and water create a near-hallucinatory experience in complete darkness.',
      'Created by a company known for pushing the physical and psychological limits of theatre.',
      'Audience members have described it as one of the most intense experiences in theatre.',
      'Created by Ontroerend Goed, a Belgian theatre company, premiering at Edinburgh 2015.',
    ],
  },
]

export default function SeeScope({ dayIndex }: { dayIndex: number }) {
  const puzzle = PUZZLES[dayIndex % PUZZLES.length]
  const storageKey = gameStorageKey('seeScope')

  const [revealed, setRevealed] = useState(1)
  const [chosen, setChosen] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [won, setWon] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const s = JSON.parse(saved)
        setRevealed(s.revealed ?? 1)
        setChosen(s.chosen ?? null)
        setSubmitted(s.submitted ?? false)
        setWon(s.won ?? false)
        setDone(s.done ?? false)
      }
    } catch {}
  }, [storageKey])

  function saveState(r: number, c: string | null, sub: boolean, w: boolean, d: boolean) {
    localStorage.setItem(storageKey, JSON.stringify({ revealed: r, chosen: c, submitted: sub, won: w, done: d }))
  }

  function guess() {
    if (!chosen) return
    const correct = chosen === puzzle.answer
    const newRevealed = Math.min(revealed + 1, puzzle.clues.length)
    const isDone = correct || revealed >= puzzle.clues.length
    setSubmitted(true)
    setWon(correct)
    setDone(isDone)
    if (!correct && !isDone) {
      setTimeout(() => { setChosen(null); setSubmitted(false); setRevealed(newRevealed); saveState(newRevealed, null, false, false, false) }, 1200)
    } else {
      if (isDone) submitGameScore('seeScope', dayIndex, correct ? 7 - revealed : 0)
      saveState(newRevealed, chosen, true, correct, isDone)
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-5">
      {/* Clues */}
      <div className="space-y-2">
        {puzzle.clues.slice(0, revealed).map((clue, i) => (
          <div
            key={i}
            className="flex gap-3 p-3 rounded-xl text-sm"
            style={{ background: 'color-mix(in srgb, var(--color-circuit) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--color-circuit) 20%, transparent)' }}
          >
            <span className="text-xs font-bold flex-shrink-0 mt-0.5" style={{ color: 'var(--color-circuit)' }}>#{i + 1}</span>
            <p className="text-seeper-steel leading-snug">{clue}</p>
          </div>
        ))}
      </div>

      {/* Remaining clues hint */}
      {!done && revealed < puzzle.clues.length && (
        <p className="text-xs text-seeper-muted text-center">{puzzle.clues.length - revealed} clue{puzzle.clues.length - revealed !== 1 ? 's' : ''} remaining</p>
      )}

      {/* Options */}
      {!done && (
        <div className="grid grid-cols-2 gap-2">
          {puzzle.options.map(opt => {
            const isChosen = chosen === opt
            const isWrong = submitted && isChosen && !won
            const isRight = submitted && isChosen && won
            return (
              <button
                key={opt}
                onClick={() => !submitted && setChosen(opt)}
                disabled={submitted}
                className={cn(
                  'py-3 px-3 rounded-xl text-xs font-display font-semibold text-left transition-all',
                  isRight ? 'bg-fern/20 border-fern text-fern border' :
                  isWrong ? 'bg-plasma/10 border-plasma/60 text-plasma border' :
                  isChosen ? 'bg-circuit/20 border-circuit text-seeper-black border' :
                  'bg-seeper-raised border border-seeper-border/40 text-seeper-white hover:border-circuit/50'
                )}
              >
                {opt}
              </button>
            )
          })}
        </div>
      )}

      {!done && (
        <button
          onClick={guess}
          disabled={!chosen || submitted}
          className="w-full py-2.5 rounded-full text-sm font-bold font-display transition-all hover:opacity-90 disabled:opacity-30"
          style={{ background: 'var(--color-circuit)', color: '#111111' }}
        >
          {submitted ? (won ? 'Correct!' : 'Not quite — next clue coming…') : 'Submit guess'}
        </button>
      )}

      {done && (
        <div className={cn('text-center rounded-xl p-4 space-y-1', won ? 'bg-fern/10 border border-fern/25' : 'bg-seeper-raised border border-seeper-border/40')}>
          <p className={cn('font-black font-display text-base', won ? 'text-fern' : 'text-seeper-muted')}>
            {won ? `Got it in ${revealed} clue${revealed !== 1 ? 's' : ''}!` : 'Out of clues'}
          </p>
          <p className="text-seeper-steel text-sm">Answer: <span className="text-seeper-white font-semibold">{puzzle.answer}</span></p>
        </div>
      )}
    </div>
  )
}
