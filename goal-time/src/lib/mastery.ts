import type { SkillField, SkillProgress } from './types'

/** Consecutive correct answers before a piece of content retires. */
export const RETIRE_AT = 2
/** Retired items per level step. */
export const RETIRE_PER_LEVEL = 4
export const MAX_LEVEL = 5

export interface Difficulty {
  id: string
  /** 1..5, matched against the child's level in this field. */
  difficulty: number
}

export const progressFor = (list: SkillProgress[], field: SkillField): SkillProgress =>
  list.find((p) => p.field === field) ?? {
    field,
    level: 1,
    correct: {},
    retired: [],
    attempts: 0,
    hits: 0,
  }

export const levelFromRetired = (retiredCount: number): number =>
  Math.min(MAX_LEVEL, 1 + Math.floor(retiredCount / RETIRE_PER_LEVEL))

/** Percentage bar shown in Parent → Progress. */
export function masteryPercent(p: SkillProgress, poolSize: number): number {
  if (poolSize <= 0) return 0
  return Math.min(100, Math.round((p.retired.length / poolSize) * 100))
}

/**
 * Apply one answer. Returns a new SkillProgress — the caller stores it.
 * A correct answer moves content toward retirement; a wrong one resets its
 * streak, so a lucky guess never retires anything.
 */
export function recordAnswer(
  p: SkillProgress,
  contentId: string,
  correct: boolean,
): SkillProgress {
  const streaks = { ...p.correct }
  const retired = [...p.retired]

  if (correct) {
    const next = (streaks[contentId] ?? 0) + 1
    streaks[contentId] = next
    if (next >= RETIRE_AT && !retired.includes(contentId)) retired.push(contentId)
  } else {
    streaks[contentId] = 0
  }

  return {
    ...p,
    correct: streaks,
    retired,
    attempts: p.attempts + 1,
    hits: p.hits + (correct ? 1 : 0),
    level: levelFromRetired(retired.length),
  }
}

export interface Sampled<T> {
  item: T
  /** false once content is retired — practice is welcome, stars are not. */
  paysStars: boolean
}

/**
 * Sample content at the child's edge.
 *
 * Fresh (non-retired) content at or just below the child's level comes
 * first. When a field runs dry the child still gets to play, but with
 * paysStars false — this is the rule that makes farming one easy task
 * impossible, and it is enforced here rather than at each station.
 */
export function sampleContent<T extends Difficulty>(
  pool: T[],
  p: SkillProgress,
  count: number,
  exclude: string[] = [],
): Sampled<T>[] {
  const skip = new Set([...exclude])
  const retired = new Set(p.retired)

  const fresh = pool.filter((c) => !retired.has(c.id) && !skip.has(c.id))
  const atEdge = fresh.filter((c) => c.difficulty <= p.level)
  const ahead = fresh.filter((c) => c.difficulty > p.level)

  // Closest-to-level first inside each band, so difficulty visibly rises.
  const byEdge = [...atEdge].sort((a, b) => b.difficulty - a.difficulty)
  const byAhead = [...ahead].sort((a, b) => a.difficulty - b.difficulty)

  const picked: Sampled<T>[] = []
  for (const item of [...shuffleWithin(byEdge), ...byAhead]) {
    if (picked.length >= count) break
    picked.push({ item, paysStars: true })
    skip.add(item.id)
  }

  if (picked.length < count) {
    // Everything fresh is used up. Serve retired content for practice, but
    // it pays nothing.
    const practice = pool.filter((c) => !skip.has(c.id))
    for (const item of shuffleWithin(practice)) {
      if (picked.length >= count) break
      picked.push({ item, paysStars: false })
      skip.add(item.id)
    }
  }

  return picked
}

/** Shuffle items that share a difficulty, keeping the band order intact. */
function shuffleWithin<T extends Difficulty>(items: T[]): T[] {
  const groups = new Map<number, T[]>()
  const order: number[] = []
  for (const item of items) {
    if (!groups.has(item.difficulty)) {
      groups.set(item.difficulty, [])
      order.push(item.difficulty)
    }
    groups.get(item.difficulty)!.push(item)
  }
  const out: T[] = []
  for (const d of order) {
    const group = groups.get(d)!
    for (let i = group.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[group[i], group[j]] = [group[j], group[i]]
    }
    out.push(...group)
  }
  return out
}

export function pickN<T>(items: T[], n: number): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy.slice(0, n)
}
