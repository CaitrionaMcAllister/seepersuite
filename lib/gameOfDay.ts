export const GAMES = ['seeWord', 'seeQuiz', 'seeLinks', 'seeSpark', 'seeScope'] as const
export type GameType = typeof GAMES[number]

export const GAME_META: Record<GameType, { label: string; tagline: string; color: string }> = {
  seeWord:  { label: 'Spellbound',  tagline: 'Guess the 5-letter word — studio edition', color: 'var(--color-fern)' },
  seeQuiz:  { label: 'Think Fast',  tagline: '5 questions on immersive tech & creative culture', color: 'var(--color-quantum)' },
  seeLinks: { label: 'Gridlock',    tagline: 'Group 16 words into 4 hidden categories', color: 'var(--color-volt)' },
  seeSpark: { label: 'ImPROMPTu',   tagline: 'One creative prompt. No wrong answers.', color: 'var(--color-plasma)' },
  seeScope: { label: 'Puzzled',     tagline: 'Watch the image reveal — guess before time runs out', color: 'var(--color-circuit)' },
}

/**
 * Returns today's game type and the day index (for picking today's puzzle within each game).
 * Rotates deterministically — same game for all users on the same day, updates at midnight.
 */
/** Days since 2024-01-01, keyed to UK date but computed in pure UTC to avoid DST skew */
function getUKDayIndex(): number {
  const ukDateStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/London' }) // YYYY-MM-DD
  const [y, m, d] = ukDateStr.split('-').map(Number)
  // Use Date.UTC so both timestamps are at 00:00 UTC — DST never affects the difference
  return Math.floor((Date.UTC(y, m - 1, d) - Date.UTC(2024, 0, 1)) / 86_400_000)
}

export function getGameOfDay(): { game: GameType; dayIndex: number } {
  const dayIndex = getUKDayIndex()
  return { game: GAMES[dayIndex % GAMES.length], dayIndex }
}

/** localStorage key for today's game state — keyed to UK date so it rolls at UK midnight */
export function gameStorageKey(game: GameType): string {
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/London' }) // YYYY-MM-DD
  return `seeperwiki-game-${game}-${today}`
}
