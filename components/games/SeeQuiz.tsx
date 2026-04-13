'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { gameStorageKey } from '@/lib/gameOfDay'
import { submitGameScore } from '@/lib/gameScores'

interface Question {
  q: string
  options: string[]
  answer: number // index
  category: string
}

const ALL_QUESTIONS: Question[] = [
  // Immersive Tech
  { category: 'XR Tech',         q: 'What does XR stand for?',                                                    options: ['Extreme Reality', 'Extended Reality', 'Experiential Reality', 'External Reality'], answer: 1 },
  { category: 'Rendering',       q: 'What is a "shader" in 3D graphics?',                                         options: ['A colour-matching tool', 'A program that determines how surfaces are rendered', 'A type of soft box light', 'A compression codec'], answer: 1 },
  { category: 'XR Tech',         q: 'What does "FOV" stand for in VR headsets?',                                   options: ['Full Output Volume', 'Field of View', 'Frame Over Value', 'Focal Offset Variance'], answer: 1 },
  { category: 'XR Tech',         q: 'What technology does LIDAR use to map spaces?',                              options: ['Sound waves', 'Infrared heat', 'Laser pulses', 'Radio frequency'], answer: 2 },
  { category: 'Rendering',       q: 'What is "photogrammetry"?',                                                   options: ['A light-based painting technique', '3D scanning using photographs', 'A method of colour grading', 'Measuring light intensity'], answer: 1 },
  { category: 'Industry',        q: 'Which company created the Unreal Engine?',                                    options: ['Unity Technologies', 'Epic Games', 'Valve Corporation', 'id Software'], answer: 1 },
  { category: 'Industry',        q: 'What year was the Oculus Rift first released commercially?',                  options: ['2014', '2016', '2018', '2020'], answer: 1 },
  { category: 'XR Tech',         q: 'What is "haptic feedback"?',                                                  options: ['Audio positional data', 'Simulating the sense of touch through vibration or force', 'Eye-tracking data', 'Heart rate biometrics'], answer: 1 },
  { category: 'Rendering',       q: 'What does "ray tracing" simulate?',                                           options: ['The path of audio waves', 'The physical behaviour of light', 'Network packet routing', 'Human eye movement'], answer: 1 },
  { category: 'XR Tech',         q: 'What is "latency" in the context of VR?',                                    options: ['Frame brightness', 'The delay between movement and visual response', 'The range of head tracking', 'Battery life'], answer: 1 },
  // Creative
  { category: 'Creative',        q: 'What is "negative space" in design?',                                         options: ['Dark colour palettes', 'Empty space around and between subjects', 'Unused budget', 'Low-contrast typography'], answer: 1 },
  { category: 'Typography',      q: 'What does "kerning" mean?',                                                   options: ['Line height between paragraphs', 'Adjusting spacing between individual letter pairs', 'The weight of a typeface', 'Type set in capitals'], answer: 1 },
  { category: 'Creative',        q: 'What colour model do screens use to display colour?',                         options: ['CMYK', 'RGB', 'HSL', 'Pantone'], answer: 1 },
  { category: 'Creative',        q: 'The "golden ratio" is approximately equal to what value?',                    options: ['1.414', '1.618', '1.732', '3.142'], answer: 1 },
  { category: 'Creative',        q: 'What is a "mood board" used for in a creative process?',                      options: ['Tracking team sentiment', 'Establishing visual style through reference images', 'Scheduling milestones', 'Logging client feedback'], answer: 1 },
  // Immersive Culture
  { category: 'Immersive Art',   q: 'What UK collective created "Rain Room"?',                                    options: ['teamLab', 'United Visual Artists', 'rAndom International', 'Punchdrunk'], answer: 2 },
  { category: 'Immersive Art',   q: 'What Shakespeare play loosely inspired Punchdrunk\'s "Sleep No More"?',      options: ['Hamlet', 'Macbeth', 'The Tempest', 'King Lear'], answer: 1 },
  { category: 'Immersive Art',   q: 'Japanese digital art collective teamLab was founded in which city?',         options: ['Osaka', 'Kyoto', 'Tokyo', 'Sapporo'], answer: 2 },
  { category: 'Immersive Art',   q: 'Which artist is famous for Infinity Mirror Rooms and polka dot obsession?',  options: ['Jenny Holzer', 'Yayoi Kusama', 'Olafur Eliasson', 'James Turrell'], answer: 1 },
  { category: 'Immersive Art',   q: 'What is "site-specific" art?',                                               options: ['Art made for online platforms', 'Art created in response to a specific physical location', 'Art using geolocation technology', 'Pop-up gallery exhibitions'], answer: 1 },
  // Sound & Music
  { category: 'Sound',           q: 'What does "Dolby Atmos" describe?',                                          options: ['A noise-cancellation system', 'An immersive spatial audio format', 'A codec for streaming', 'A recording microphone type'], answer: 1 },
  { category: 'Sound',           q: 'What is "foley" in sound design?',                                           options: ['Ambient background noise', 'Everyday sound effects recorded in a studio', 'A reverb algorithm', 'Low-frequency bass design'], answer: 1 },
  { category: 'Sound',           q: 'What is the difference between "reverb" and "delay"?',                       options: ['Reverb is louder; delay is quieter', 'Reverb simulates a space; delay repeats the signal after a time gap', 'They are the same effect', 'Delay is a hardware unit; reverb is software only'], answer: 1 },
  { category: 'Sound',           q: 'What does "binaural audio" require to work correctly?',                      options: ['A subwoofer', 'Headphones', 'A surround-sound speaker array', 'An HDMI connection'], answer: 1 },
  { category: 'Sound',           q: 'What is a "frequency" in audio, measured in?',                               options: ['Decibels', 'Hertz', 'Watts', 'Ohms'], answer: 1 },
  // Digital / General
  { category: 'Digital',        q: 'What does "GPU" stand for?',                                                   options: ['General Processing Unit', 'Graphics Processing Unit', 'Global Render Pipeline', 'Graphical Protocol Utility'], answer: 1 },
  { category: 'Digital',        q: 'What does "API" stand for?',                                                   options: ['Automated Process Interface', 'Application Programming Interface', 'Advanced Protocol Integration', 'Animated Pipeline Index'], answer: 1 },
  { category: 'Digital',        q: 'What is "procedural generation" in game design?',                             options: ['Hand-crafting each level individually', 'Creating content algorithmically using rules and randomness', 'Generating voiceovers using AI', 'A method for compressing textures'], answer: 1 },
  { category: 'Digital',        q: 'What does "real-time rendering" mean?',                                       options: ['Rendering during the performance, not beforehand', 'Rendering that takes less than an hour', 'Rendering with ray tracing enabled', 'Rendering at 60fps exactly'], answer: 0 },
  { category: 'Digital',        q: 'What is the "uncanny valley"?',                                               options: ['A dip in resolution at screen edges', 'When a human-like figure becomes unsettling rather than relatable', 'A VR terrain artefact', 'A drop in frame rate during complex scenes'], answer: 1 },
  // Bonus
  { category: 'Studio Life',    q: 'What does "MVP" stand for in a product context?',                             options: ['Most Valuable Player', 'Minimum Viable Product', 'Maximum Value Proposition', 'Marketing Validation Plan'], answer: 1 },
  { category: 'Studio Life',    q: 'What is an "agile sprint"?',                                                  options: ['A physical warmup exercise before shoots', 'A fixed, short period of focused work toward a goal', 'A rapid prototype technique', 'A client presentation format'], answer: 1 },
  { category: 'Colour',         q: 'Which colour has the longest wavelength visible to the human eye?',           options: ['Violet', 'Green', 'Blue', 'Red'], answer: 3 },
  { category: 'Colour',         q: 'Subtractive colour mixing (as in print) starts with which three primaries?',  options: ['Red, Green, Blue', 'Cyan, Magenta, Yellow', 'Orange, Purple, Green', 'Black, White, Grey'], answer: 1 },
  { category: 'Creative',       q: 'What is a "brief" in a creative agency context?',                             options: ['A short meeting', 'A document outlining the scope, goals, and constraints of a project', 'A legal contract summary', 'An internal sprint goal'], answer: 1 },
  { category: 'Immersive Art',  q: 'What genre is Punchdrunk most associated with?',                              options: ['Digital installation', 'Immersive theatre', 'Generative art', 'Performance art'], answer: 1 },
  { category: 'XR Tech',        q: 'What does "6DOF" mean in VR?',                                               options: ['Six Degrees of Freedom — movement in all directions plus rotation', 'Six Display Output Frequencies', 'The sixth generation of display technology', 'Six Data Output Formats'], answer: 0 },
  { category: 'Rendering',      q: 'What is a "texture map" in 3D?',                                             options: ['A visual guide to a 3D scene\'s layout', 'An image applied to a 3D surface to add detail', 'A node in a shader graph', 'A list of all textures used in a project'], answer: 1 },
  { category: 'Digital',        q: 'What does "WebGL" allow web browsers to do?',                                options: ['Play audio without plugins', 'Render 2D and 3D graphics using the GPU', 'Access device camera', 'Send push notifications'], answer: 1 },
  { category: 'Sound',          q: 'What is "ADR" in film production?',                                          options: ['Automatic Digital Rendering', 'Automated Dialogue Replacement — re-recording dialogue in a studio', 'Advanced Dynamic Range audio', 'A method of syncing sound to picture'], answer: 1 },
  { category: 'Industry',       q: 'Which company owns the Meta Quest headset line?',                             options: ['Google', 'Sony', 'Meta (Facebook)', 'Apple'], answer: 2 },
  { category: 'Creative',       q: 'What is a "style guide" in a design context?',                               options: ['A document of client preferences', 'A set of rules defining visual language: fonts, colours, and components', 'A list of visual references', 'An animation timing specification'], answer: 1 },
  { category: 'Digital',        q: 'What does "FPS" stand for in gaming and film?',                              options: ['Frames Per Second', 'Forward Processing System', 'File Path Shortcut', 'Focal Plane Sensor'], answer: 0 },
  { category: 'Typography',     q: 'What is a "serif" in typography?',                                           options: ['The height of a capital letter', 'A small decorative stroke at the end of letter forms', 'The space between lines of text', 'A category of display typeface'], answer: 1 },
  { category: 'Industry',       q: 'What does "SaaS" stand for?',                                               options: ['Software as a Service', 'System as a Subscription', 'Scalable Asset Storage', 'Studio as a Solution'], answer: 0 },
  { category: 'Immersive Art',  q: 'Olafur Eliasson is best known for what type of work?',                       options: ['Motion capture performance', 'Large-scale light and natural phenomena installations', 'Generative code art', 'Immersive theatre direction'], answer: 1 },
  { category: 'Rendering',      q: 'What is a "UV map" in 3D modelling?',                                        options: ['Ultraviolet light simulation data', 'A 2D representation of a 3D surface used to apply textures', 'A colour calibration profile', 'A topology map for rigging'], answer: 1 },
  { category: 'Creative',       q: 'What does "white space" (or negative space) achieve in layout design?',      options: ['It indicates incomplete designs', 'It improves readability and gives content room to breathe', 'It should always be filled with content', 'It signals a minimalist aesthetic only'], answer: 1 },
  { category: 'Sound',          q: 'What is "spatial audio"?',                                                   options: ['Audio designed for large venues only', 'Sound that gives the listener a sense of 3D position and depth', 'High-fidelity studio-quality recording', 'A method of audio compression'], answer: 1 },
  { category: 'Digital',        q: 'What is "open source" software?',                                            options: ['Free software with no licence required', 'Software whose source code is publicly available for modification', 'Beta software still in development', 'Cloud-hosted software'], answer: 1 },
  { category: 'Industry',       q: 'What type of company is "Figma"?',                                           options: ['A 3D rendering studio', 'A collaborative UI/UX design platform', 'A project management tool', 'A generative AI service'], answer: 1 },
]

function pickQuestions(dayIndex: number): Question[] {
  const start = (dayIndex * 5) % ALL_QUESTIONS.length
  const result: Question[] = []
  for (let i = 0; i < 5; i++) result.push(ALL_QUESTIONS[(start + i) % ALL_QUESTIONS.length])
  return result
}

export default function SeeQuiz({ dayIndex }: { dayIndex: number }) {
  const questions = pickQuestions(dayIndex)
  const storageKey = gameStorageKey('seeQuiz')

  const [answers, setAnswers] = useState<(number | null)[]>(Array(5).fill(null))
  const [submitted, setSubmitted] = useState<boolean[]>(Array(5).fill(false))
  const [currentQ, setCurrentQ] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const s = JSON.parse(saved)
        setAnswers(s.answers ?? Array(5).fill(null))
        setSubmitted(s.submitted ?? Array(5).fill(false))
        setCurrentQ(s.currentQ ?? 0)
        setDone(s.done ?? false)
      }
    } catch {}
  }, [storageKey])

  function saveState(a: (number | null)[], sub: boolean[], cq: number, d: boolean) {
    localStorage.setItem(storageKey, JSON.stringify({ answers: a, submitted: sub, currentQ: cq, done: d }))
  }

  function select(optIdx: number) {
    if (submitted[currentQ]) return
    const newAnswers = [...answers]
    newAnswers[currentQ] = optIdx
    setAnswers(newAnswers)
    saveState(newAnswers, submitted, currentQ, done)
  }

  function confirmAnswer() {
    if (answers[currentQ] === null) return
    const newSub = [...submitted]
    newSub[currentQ] = true
    setSubmitted(newSub)

    const isLast = currentQ === 4
    const isDone = isLast
    if (!isLast) setTimeout(() => setCurrentQ(q => q + 1), 700)
    else {
      setDone(true)
      const finalScore = [...answers].filter((a, i) => newSub[i] && a === questions[i].answer).length
      submitGameScore('seeQuiz', dayIndex, finalScore)
    }
    saveState(answers, newSub, currentQ, isDone)
  }

  const score = answers.filter((a, i) => submitted[i] && a === questions[i].answer).length

  const q = questions[currentQ]
  const chosen = answers[currentQ]
  const isSubmitted = submitted[currentQ]

  if (done) {
    return (
      <div className="text-center space-y-5 py-4">
        <p className="text-3xl font-black font-display" style={{ color: 'var(--color-quantum)' }}>{score} / 5</p>
        <p className="text-seeper-steel text-sm">
          {score === 5 ? 'Perfect score! 🧠' : score >= 3 ? 'Nice work.' : 'Better luck tomorrow.'}
        </p>
        <div className="flex flex-col gap-2 text-left max-w-sm mx-auto mt-4">
          {questions.map((question, i) => (
            <div key={i} className={cn('flex items-start gap-3 p-3 rounded-lg text-xs', answers[i] === question.answer ? 'bg-fern/10 border border-fern/20' : 'bg-[var(--color-raised)] border border-seeper-border/40')}>
              <span className={cn('font-bold flex-shrink-0', answers[i] === question.answer ? 'text-fern' : 'text-plasma')}>
                {answers[i] === question.answer ? '✓' : '✗'}
              </span>
              <div>
                <p className="text-seeper-steel font-medium leading-snug">{question.q}</p>
                <p className="text-seeper-muted mt-0.5">{question.options[question.answer]}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto space-y-5">
      {/* Progress */}
      <div className="flex items-center gap-2">
        {questions.map((_, i) => (
          <div key={i} className={cn('h-1 flex-1 rounded-full transition-all', i < currentQ ? 'bg-quantum' : i === currentQ ? 'bg-seeper-steel' : 'bg-seeper-border/40')} />
        ))}
        <span className="text-xs text-seeper-muted font-display ml-1">{currentQ + 1}/5</span>
      </div>

      {/* Category badge */}
      <div>
        <span className="pill-tag text-[10px]" style={{ background: 'color-mix(in srgb, var(--color-quantum) 15%, transparent)', color: 'var(--color-quantum)', border: '1px solid color-mix(in srgb, var(--color-quantum) 30%, transparent)' }}>
          {q.category}
        </span>
      </div>

      {/* Question */}
      <p className="text-seeper-white font-display font-semibold text-base leading-snug">{q.q}</p>

      {/* Options */}
      <div className="flex flex-col gap-2">
        {q.options.map((opt, i) => {
          const isChosen = chosen === i
          const isCorrect = i === q.answer
          let style = 'border-seeper-border/40 text-seeper-steel hover:border-quantum/50'
          if (isSubmitted) {
            if (isCorrect) style = 'border-fern bg-fern/10 text-fern'
            else if (isChosen && !isCorrect) style = 'border-plasma/60 bg-plasma/5 text-plasma'
            else style = 'border-seeper-border/20 text-seeper-muted/50'
          } else if (isChosen) {
            style = 'border-quantum text-seeper-white bg-quantum/10'
          }
          return (
            <button
              key={i}
              onClick={() => select(i)}
              disabled={isSubmitted}
              className={cn('text-left px-4 py-3 rounded-xl border text-sm font-display transition-all', style)}
            >
              <span className="text-seeper-muted mr-2">{String.fromCharCode(65 + i)}.</span>
              {opt}
            </button>
          )
        })}
      </div>

      {/* Confirm */}
      {!isSubmitted && (
        <button
          onClick={confirmAnswer}
          disabled={chosen === null}
          className="w-full py-2.5 rounded-full bg-quantum text-seeper-black text-sm font-bold font-display transition-all hover:opacity-90 disabled:opacity-30"
        >
          {currentQ === 4 ? 'Submit' : 'Confirm'}
        </button>
      )}
    </div>
  )
}
