import { daysInWeekOf, economyFor, todayKey } from './db'
import type { AppState, DayLog, EconomyConfig } from './types'

/** Stars the child can actually spend right now. Pending honor claims excluded. */
export function starBalance(state: AppState, profileId: string): number {
  let total = 0
  for (const e of state.starEvents) {
    if (e.profileId !== profileId) continue
    if (e.pending || e.declined) continue
    // A Golden Ball is one event carrying its configured star value, so it
    // adds to the spendable balance like any other award.
    total += e.amount
  }
  for (const s of state.spendEvents) {
    if (s.profileId !== profileId) continue
    total -= s.stars
  }
  return Math.round(total * 100) / 100
}

export function pendingStars(state: AppState, profileId: string): number {
  return state.starEvents
    .filter((e) => e.profileId === profileId && e.pending && !e.declined)
    .reduce((n, e) => n + e.amount, 0)
}

export function goldenBallCount(state: AppState, profileId: string): number {
  return state.starEvents.filter(
    (e) => e.profileId === profileId && e.golden && !e.pending && !e.declined,
  ).length
}

/** Bonus minutes already redeemed this week — the figure the cap bounds. */
export function weeklyBonusUsed(state: AppState, profileId: string, day: string): number {
  const week = new Set(daysInWeekOf(day))
  return state.spendEvents
    .filter((s) => s.profileId === profileId && s.kind === 'trade' && week.has(s.day))
    .reduce((n, s) => n + (s.minutes ?? 0), 0)
}

export function weeklyBonusRemaining(
  state: AppState,
  profileId: string,
  day: string,
): number {
  const eco = economyFor(state, profileId)
  if (eco.weeklyCapOverride) return Infinity
  return Math.max(0, eco.weeklyBonusCapMinutes - weeklyBonusUsed(state, profileId, day))
}

/** Minutes a given number of stars is worth, at the configured rate. */
export function minutesForStars(eco: EconomyConfig, stars: number): number {
  if (eco.starsPerBlock <= 0) return 0
  return Math.round((stars / eco.starsPerBlock) * eco.minutesPerBlock)
}

/**
 * The cap is enforced here and nowhere else: a trade that would push the
 * week past the cap is simply not offered, so stars are never destroyed by
 * a partially-granted trade. Override lifts it for exceptional days.
 */
export function canTrade(
  state: AppState,
  profileId: string,
  stars: number,
  day: string,
): boolean {
  const eco = economyFor(state, profileId)
  if (eco.weeklyCapOverride) return true
  const wanted = minutesForStars(eco, stars)
  if (wanted <= 0) return false
  return weeklyBonusUsed(state, profileId, day) + wanted <= eco.weeklyBonusCapMinutes
}

export function minutesTradedOn(state: AppState, profileId: string, day: string): number {
  return state.spendEvents
    .filter((s) => s.profileId === profileId && s.kind === 'trade' && s.day === day)
    .reduce((n, s) => n + (s.minutes ?? 0), 0)
}

export function minutesWatchedOn(state: AppState, profileId: string, day: string): number {
  return state.watch
    .filter((w) => w.profileId === profileId && w.day === day)
    .reduce((n, w) => n + w.minutesUsed, 0)
}

export interface WatchStatus {
  allowance: number
  used: number
  left: number
  locked: boolean
  lockReason: 'quest' | 'window' | 'empty' | null
  inWindow: boolean
}

export function watchStatus(
  state: AppState,
  profileId: string,
  day: string = todayKey(),
  now: Date = new Date(),
): WatchStatus {
  const eco = economyFor(state, profileId)
  const allowance = eco.baseDailyMinutes + minutesTradedOn(state, profileId, day)
  const used = minutesWatchedOn(state, profileId, day)
  const left = Math.max(0, allowance - used)

  const minutesNow = now.getHours() * 60 + now.getMinutes()
  const inWindow = minutesNow >= eco.windowStart && minutesNow < eco.windowEnd

  const quest = state.quests[`${profileId}:${day}`]
  const questBlocked = eco.questGate && !quest?.won

  let lockReason: WatchStatus['lockReason'] = null
  if (questBlocked) lockReason = 'quest'
  else if (!inWindow) lockReason = 'window'
  else if (left <= 0) lockReason = 'empty'

  return { allowance, used, left, locked: lockReason !== null, lockReason, inWindow }
}

export function activeWish(state: AppState, profileId: string) {
  return (state.wishlist[profileId] ?? []).find((w) => w.status === 'active') ?? null
}

/** Day-by-day history rows for the Progress tab. */
export function dayLogs(state: AppState, profileId: string, limit = 30): DayLog[] {
  const days = new Set<string>()
  for (const e of state.starEvents) if (e.profileId === profileId) days.add(e.day)
  for (const s of state.spendEvents) if (s.profileId === profileId) days.add(s.day)
  for (const w of state.watch) if (w.profileId === profileId) days.add(w.day)
  for (const key of Object.keys(state.quests)) {
    const q = state.quests[key]
    if (q.profileId === profileId) days.add(q.day)
  }

  return [...days]
    .sort((a, b) => (a < b ? 1 : -1))
    .slice(0, limit)
    .map((day): DayLog => {
      const stars = state.starEvents.filter(
        (e) => e.profileId === profileId && e.day === day && !e.pending && !e.declined,
      )
      const spends = state.spendEvents.filter(
        (s) => s.profileId === profileId && s.day === day,
      )
      return {
        profileId,
        day,
        minutesWatched: minutesWatchedOn(state, profileId, day),
        starsEarned: Math.round(stars.reduce((n, e) => n + e.amount, 0) * 100) / 100,
        starsSaved: spends
          .filter((s) => s.kind === 'save')
          .reduce((n, s) => n + s.stars, 0),
        starsTraded: spends
          .filter((s) => s.kind === 'trade')
          .reduce((n, s) => n + s.stars, 0),
        goldenBalls: stars.filter((e) => e.golden).length,
        questWon: state.quests[`${profileId}:${day}`]?.won ?? false,
      }
    })
}
