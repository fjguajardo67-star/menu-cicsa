import type { Profile, SkillProgress } from '../../lib/types'

export interface StationResult {
  /** Whole stars the station earned (0 when every item served was retired). */
  stars: number
  /** Answers given by voice — each one adds a bonus fraction. */
  voiceAnswers: number
}

export interface StationProps {
  profile: Profile
  progress: SkillProgress
  /** Content ids already served today in this field. */
  served: string[]
  /** Record content as served so a station never repeats itself in a day. */
  onServed: (ids: string[]) => void
  /** Feed the mastery engine. */
  onAnswer: (contentId: string, correct: boolean) => void
  onDone: (result: StationResult) => void
}

/** Rounds per station. Short enough to hold a five-year-old. */
export const ROUNDS = 3
