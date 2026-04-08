export const GAMES = ['seeWord', 'seeQuiz', 'seeLinks', 'seeSpark', 'seeScope'] as const
export type GameType = typeof GAMES[number]

export const GAME_META: Record<GameType, { label: string; tagline: string; color: string }> = {
  seeWord:  { label: 'seeWord',  tagline: 'Guess the 5-letter word — studio edition', color: 'var(--color-fern)' },
  seeQuiz:  { label: 'seeQuiz',  tagline: '5 questions on immersive tech & creative culture', color: 'var(--color-quantum)' },
  seeLinks: { label: 'seeLinks', tagline: 'Group 16 words into 4 hidden categories', color: 'var(--color-volt)' },
  seeSpark: { label: 'seeSpark', tagline: 'One creative prompt. No wrong answers.', color: 'var(--color-plasma)' },
  seeScope: { label: 'seeScope', tagline: 'Identify the installation from six clues', color: 'var(--color-circuit)' },
}

/**
 * Returns today's game type and the day index (for picking today's puzzle within each game).
 * Rotates deterministically — same game for all users on the same day, updates at midnight.
 */
export function getGameOfDay(): { game: GameType; dayIndex: number } {
  const epoch = new Date('2024-01-01T00:00:00Z')
  const dayIndex = Math.floor((Date.now() - epoch.getTime()) / (1000 * 60 * 60 * 24))
  return { game: GAMES[dayIndex % GAMES.length], dayIndex }
}

/** localStorage key for today's game state */
export function gameStorageKey(game: GameType): string {
  const today = new Date().toISOString().slice(0, 10)
  return `seeperwiki-game-${game}-${today}`
}
