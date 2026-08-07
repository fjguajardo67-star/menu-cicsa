import {
  DEFAULT_CHANNELS,
  DEFAULT_ECONOMY,
  type AppState,
  type Channel,
} from './types'

const KEY = 'goaltime.v1'
export const STATE_VERSION = 1

export const todayKey = (d: Date = new Date()): string => {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** Monday-anchored week key, so the bonus cap resets on Mondays. */
export const weekKey = (day: string): string => {
  const d = new Date(day + 'T12:00:00')
  const dow = (d.getDay() + 6) % 7 // Mon = 0
  d.setDate(d.getDate() - dow)
  return todayKey(d)
}

export const daysInWeekOf = (day: string): string[] => {
  const start = new Date(weekKey(day) + 'T12:00:00')
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return todayKey(d)
  })
}

export const uid = (prefix = 'id'): string =>
  `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`

export const initialState = (): AppState => ({
  version: STATE_VERSION,
  pinHash: null,
  profiles: [],
  activeProfileId: null,
  economy: {},
  tasks: {},
  wishlist: {},
  starEvents: [],
  spendEvents: [],
  quests: {},
  progress: {},
  english: {},
  watch: [],
  chats: [],
  drawings: [],
  channels: DEFAULT_CHANNELS.map((c): Channel => ({ ...c, allowed: {} })),
  safety: {
    approvedContentOnly: false,
    searchOff: false,
    nativeTimerSet: false,
    autoplayOff: false,
  },
  apiKey: null,
  coachModel: 'claude-sonnet-4-6',
  onboarded: false,
})

export function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return initialState()
    const parsed = JSON.parse(raw) as Partial<AppState>
    // Merge over a fresh state so a field added in a later build is never
    // undefined on a profile saved by an earlier one.
    return { ...initialState(), ...parsed, version: STATE_VERSION }
  } catch {
    return initialState()
  }
}

let writeTimer: number | undefined
export function save(state: AppState): void {
  window.clearTimeout(writeTimer)
  writeTimer = window.setTimeout(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch (err) {
      // Quota exceeded — almost always the drawings gallery. Drop the
      // oldest drawings and retry once rather than losing the ledger.
      try {
        const trimmed: AppState = {
          ...state,
          drawings: state.drawings.slice(-12),
        }
        localStorage.setItem(KEY, JSON.stringify(trimmed))
      } catch {
        console.warn('GOAL TIME: could not save state', err)
      }
    }
  }, 180)
}

export function exportJSON(state: AppState): string {
  return JSON.stringify(state, null, 2)
}

export function importJSON(text: string): AppState {
  const parsed = JSON.parse(text) as Partial<AppState>
  if (!Array.isArray(parsed.profiles)) throw new Error('Not a GOAL TIME backup file.')
  return { ...initialState(), ...parsed, version: STATE_VERSION }
}

/**
 * PIN hashing. This keeps a curious 5-year-old out of Parent Mode, which is
 * the actual threat model — it is not protection against an adult with the
 * device. Documented honestly in Parent Mode.
 */
export async function hashPin(pin: string): Promise<string> {
  const data = new TextEncoder().encode(`goaltime:${pin}`)
  if (crypto?.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', data)
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  }
  let h = 0
  for (const b of data) h = (h * 31 + b) | 0
  return `plain${h}`
}

export const economyFor = (state: AppState, profileId: string) =>
  state.economy[profileId] ?? DEFAULT_ECONOMY
