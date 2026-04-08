import { getWordOfDay } from '@/lib/wordOfDay'

export default function WordOfDay() {
  const word = getWordOfDay()

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  })

  return (
    <div
      className="seeper-card relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--color-quantum) 8%, transparent), transparent 60%)' }}
    >
      {/* Decorative background glyph */}
      <span
        aria-hidden
        className="pointer-events-none select-none absolute right-6 top-1/2 -translate-y-1/2 text-[120px] leading-none font-black opacity-[0.035]"
        style={{ color: 'var(--color-quantum)', fontFamily: 'serif' }}
      >
        W
      </span>

      <div className="relative flex flex-col sm:flex-row sm:items-center gap-5 p-6">
        {/* Left: label + word + phonetic */}
        <div className="flex-shrink-0 sm:w-56">
          <p className="section-label mb-2">word of the day</p>
          <h2
            className="text-3xl font-black font-display leading-none mb-1 tracking-tight"
            style={{ color: 'var(--color-quantum)' }}
          >
            {word.word}
          </h2>
          <p className="text-xs text-[var(--color-muted)] font-mono mt-1">{word.phonetic}</p>
        </div>

        {/* Divider */}
        <div
          className="hidden sm:block w-px self-stretch flex-shrink-0"
          style={{ background: 'color-mix(in srgb, var(--color-quantum) 20%, transparent)' }}
        />

        {/* Right: part of speech + definition + example */}
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="pill-tag text-[10px]"
              style={{
                background: 'color-mix(in srgb, var(--color-quantum) 15%, transparent)',
                color: 'var(--color-quantum)',
                border: '1px solid color-mix(in srgb, var(--color-quantum) 30%, transparent)',
              }}
            >
              {word.partOfSpeech}
            </span>
            <span className="text-[10px] text-[var(--color-muted)]">{today}</span>
          </div>
          <p className="text-sm text-seeper-white leading-relaxed font-display">
            {word.definition}
          </p>
          <p className="text-xs text-[var(--color-muted)] leading-relaxed italic">
            &ldquo;{word.example}&rdquo;
          </p>
        </div>
      </div>
    </div>
  )
}
