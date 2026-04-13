/** Submit a score for a scored game. Deduplicates per day using localStorage. */
export async function submitGameScore(game: string, dayIndex: number, score: number): Promise<void> {
  if (typeof window === 'undefined') return
  const key = `seeperwiki-score-submitted-${game}-${dayIndex}`
  if (localStorage.getItem(key)) return
  try {
    await fetch('/api/game-scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ game, day_index: dayIndex, score }),
    })
    localStorage.setItem(key, '1')
  } catch {}
}
