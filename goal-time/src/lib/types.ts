/**
 * GOAL TIME data model.
 *
 * Everything here lives on-device. Nothing but the child's first name and
 * age level ever leaves the device, and only on Coach Chat / content
 * generation calls the parent explicitly enabled.
 */

/** Skill fields a quest station can draw from. */
export type SkillField =
  | 'flags'
  | 'counting'
  | 'letters'
  | 'story'
  | 'art'
  | 'fairplay'
  | 'english'

export const SKILL_FIELDS: SkillField[] = [
  'flags',
  'counting',
  'letters',
  'story',
  'art',
  'fairplay',
  'english',
]

export const FIELD_LABEL: Record<SkillField, string> = {
  flags: 'Flags Match',
  counting: 'Count the Goals',
  letters: 'Letters Field',
  story: 'Story Bench',
  art: 'Art Corner',
  fairplay: 'Fair Play',
  english: 'English Academy',
}

export const FIELD_ICON: Record<SkillField, string> = {
  flags: '🚩',
  counting: '⚽',
  letters: '🔤',
  story: '📖',
  art: '🎨',
  fairplay: '🤝',
  english: '🗣️',
}

/** A theme is a skin. Structure never depends on which one is active. */
export type ThemeId = 'soccer' | 'space' | 'dino'

export interface Profile {
  id: string
  name: string
  age: number
  /** Free tags from onboarding: soccer, trucks, dinosaurs… */
  interests: string[]
  theme: ThemeId
  /** Emoji avatar shown on the profile picker. */
  avatar: string
  createdAt: string
}

export interface EconomyConfig {
  /** Stars needed for one exchange block. */
  starsPerBlock: number
  /** Minutes granted per exchange block. */
  minutesPerBlock: number
  /** Screen minutes granted every day regardless of stars. */
  baseDailyMinutes: number
  /** Value of one Golden Ball, in stars. */
  goldenBallStars: number
  /** Cap on *redeemed bonus* minutes per week (30–60). */
  weeklyBonusCapMinutes: number
  /** Parent escape hatch for exceptional days. */
  weeklyCapOverride: boolean
  /** Winning today's match unlocks Watch Time. */
  questGate: boolean
  /** Viewing window, minutes from midnight. */
  windowStart: number
  windowEnd: number
  /** Global mute for sound effects. */
  muted: boolean
  /** Stations in a daily quest (3 or 4). */
  stationsPerDay: number
}

export const DEFAULT_ECONOMY: EconomyConfig = {
  starsPerBlock: 3,
  minutesPerBlock: 15,
  baseDailyMinutes: 20,
  goldenBallStars: 5,
  weeklyBonusCapMinutes: 45,
  weeklyCapOverride: false,
  questGate: true,
  windowStart: 17 * 60,
  windowEnd: 19 * 60,
  muted: false,
  stationsPerDay: 4,
}

/** A parent-managed chore or behavior worth stars. */
export interface Task {
  id: string
  label: string
  emoji: string
  stars: number
  retired: boolean
}

export interface WishlistItem {
  id: string
  name: string
  /** Data URL — the photo never leaves the device. */
  photo?: string
  priceStars: number
  savedStars: number
  status: 'active' | 'delivered'
  createdAt: string
  deliveredAt?: string
}

export type StarSource =
  | 'station'
  | 'penalty'
  | 'chore'
  | 'honor'
  | 'golden'
  | 'voice-bonus'
  | 'parent'

export interface StarEvent {
  id: string
  profileId: string
  /** ISO date, local: YYYY-MM-DD. */
  day: string
  at: string
  source: StarSource
  /** Whole or fractional stars. Voice bonuses are fractional. */
  amount: number
  golden?: boolean
  /** Honor claims land pending until the parent confirms. */
  pending?: boolean
  declined?: boolean
  note?: string
}

/** How a star payout was spent. Saved stars are irreversible. */
export interface SpendEvent {
  id: string
  profileId: string
  day: string
  at: string
  kind: 'save' | 'trade'
  stars: number
  /** Minutes granted, for kind === 'trade'. */
  minutes?: number
  wishlistItemId?: string
}

export interface StationState {
  field: SkillField
  /** Content ids already served today, so a station never repeats itself. */
  servedIds: string[]
  done: boolean
  starsEarned: number
}

export interface QuestDay {
  profileId: string
  day: string
  stations: StationState[]
  /** Set once every station is done. */
  won: boolean
  /** Penalty shootout is the finisher; 3 kicks. */
  shootoutGoals: number | null
}

export interface SkillProgress {
  field: SkillField
  /** 1..5 — drives difficulty of sampled content. */
  level: number
  /** contentId -> consecutive correct answers. 2 correct retires it. */
  correct: Record<string, number>
  /** Retired content never pays stars again. */
  retired: string[]
  attempts: number
  hits: number
}

export interface WatchSession {
  id: string
  profileId: string
  day: string
  startedAt: string
  endedAt?: string
  minutesUsed: number
}

export interface ChatTurn {
  role: 'coach' | 'child'
  text: string
  at: string
  /** true when the child spoke rather than tapped. */
  spoken?: boolean
}

export interface ChatTranscript {
  id: string
  profileId: string
  day: string
  startedAt: string
  turns: ChatTurn[]
  /** 'api' when Coach Chat ran on the Anthropic API, 'offline' for the tree. */
  engine: 'api' | 'offline'
}

export interface Drawing {
  id: string
  profileId: string
  day: string
  prompt: string
  /** PNG data URL. */
  image: string
  at: string
}

export interface SafetyChecklist {
  approvedContentOnly: boolean
  searchOff: boolean
  nativeTimerSet: boolean
  autoplayOff: boolean
  reviewedAt?: string
}

export interface Channel {
  id: string
  name: string
  topic: string
  note?: string
  /** profileId -> allowed */
  allowed: Record<string, boolean>
}

export interface EnglishProgress {
  wordsMastered: string[]
  phrasesSaid: string[]
  /** Total mic attempts, and how many passed on the first try. */
  micAttempts: number
  micFirstTry: number
  /** Attempts that fell back to tap because the mic was unavailable. */
  tapFallbacks: number
}

/** One row per day per child, for the Progress history log. */
export interface DayLog {
  profileId: string
  day: string
  minutesWatched: number
  starsEarned: number
  starsSaved: number
  starsTraded: number
  goldenBalls: number
  questWon: boolean
}

export interface AppState {
  version: number
  pinHash: string | null
  profiles: Profile[]
  activeProfileId: string | null
  economy: Record<string, EconomyConfig>
  tasks: Record<string, Task[]>
  wishlist: Record<string, WishlistItem[]>
  starEvents: StarEvent[]
  spendEvents: SpendEvent[]
  quests: Record<string, QuestDay>
  progress: Record<string, SkillProgress[]>
  english: Record<string, EnglishProgress>
  watch: WatchSession[]
  chats: ChatTranscript[]
  drawings: Drawing[]
  channels: Channel[]
  safety: SafetyChecklist
  /** Parent-supplied Anthropic key, stored on-device only. */
  apiKey: string | null
  /** Model for Coach Chat. Editable in Parent Mode. */
  coachModel: string
  onboarded: boolean
}

export const emptyEnglish = (): EnglishProgress => ({
  wordsMastered: [],
  phrasesSaid: [],
  micAttempts: 0,
  micFirstTry: 0,
  tapFallbacks: 0,
})

export const emptyProgress = (): SkillProgress[] =>
  SKILL_FIELDS.map((field) => ({
    field,
    level: 1,
    correct: {},
    retired: [],
    attempts: 0,
    hits: 0,
  }))

export const DEFAULT_TASKS: Omit<Task, 'id'>[] = [
  { label: 'Made my bed', emoji: '🛏️', stars: 1, retired: false },
  { label: 'Put away my toys', emoji: '🧸', stars: 1, retired: false },
  { label: 'Brushed my teeth', emoji: '🪥', stars: 1, retired: false },
  { label: 'Said please and thank you', emoji: '🙏', stars: 1, retired: false },
  { label: 'Helped set the table', emoji: '🍽️', stars: 1, retired: false },
  { label: 'Shared without being asked', emoji: '🤝', stars: 2, retired: false },
]

export const DEFAULT_CHANNELS: Omit<Channel, 'allowed'>[] = [
  { id: 'ch-soccer', name: 'Soccer skills & highlights', topic: 'Soccer' },
  { id: 'ch-science', name: 'Science for little kids', topic: 'Science' },
  { id: 'ch-art', name: 'Draw along', topic: 'Art' },
  { id: 'ch-music', name: 'Songs & music', topic: 'Music' },
  { id: 'ch-spanish', name: 'Spanish-language stories', topic: 'Spanish' },
  { id: 'ch-nature', name: 'Animals & nature', topic: 'Nature' },
]
