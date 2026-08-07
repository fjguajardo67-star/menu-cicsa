import { useMemo, useState } from 'react'
import { Celebration } from '../components/Celebration'
import { todayKey } from '../lib/db'
import { activeWish } from '../lib/economy'
import { progressFor } from '../lib/mastery'
import { sfx } from '../lib/sfx'
import { useStore } from '../lib/store'
import { FIELD_ICON, FIELD_LABEL, SKILL_FIELDS, type Profile, type SkillField } from '../lib/types'
import { PenaltyShootout } from './PenaltyShootout'
import { StarPayout } from './StarPayout'
import { ArtCorner } from './stations/ArtCorner'
import { CountGoals } from './stations/CountGoals'
import { EnglishAcademy } from './stations/EnglishAcademy'
import { FairPlay } from './stations/FairPlay'
import { FlagsMatch } from './stations/FlagsMatch'
import { LettersField } from './stations/LettersField'
import { StoryBench } from './stations/StoryBench'
import type { StationProps } from './stations/types'

const STATION_COMPONENT: Record<SkillField, (p: StationProps) => JSX.Element | null> = {
  flags: FlagsMatch,
  counting: CountGoals,
  letters: LettersField,
  story: StoryBench,
  art: ArtCorner,
  fairplay: FairPlay,
  english: EnglishAcademy,
}

/** Rotate the non-English fields by day so the week feels varied. */
export function pickFieldsForDay(day: string, count: number): SkillField[] {
  const others = SKILL_FIELDS.filter((f) => f !== 'english')
  const seed = [...day].reduce((n, c) => n + c.charCodeAt(0), 0)
  const rotated = others.map((_, i) => others[(i + seed) % others.length])
  return ['english', ...rotated.slice(0, Math.max(2, count - 1))]
}

type Next = 'map' | 'shootout' | 'won'

type View =
  | { kind: 'map' }
  | { kind: 'station'; field: SkillField }
  | { kind: 'payout'; stars: number; then: Next }
  | { kind: 'stationWin'; field: SkillField; then: Next }
  | { kind: 'shootout' }
  | { kind: 'won' }
  | { kind: 'prize'; then: Next }

interface MatchDayProps {
  profile: Profile
  onExit: () => void
}

export function MatchDay({ profile, onExit }: MatchDayProps) {
  const { state, dispatch, economy } = useStore()
  const day = todayKey()
  const questId = `${profile.id}:${day}`

  // Draw today's stations once, then keep them stable for the whole day.
  useMemo(() => {
    if (!state.quests[questId]) {
      dispatch({
        type: 'ensureQuest',
        profileId: profile.id,
        fields: pickFieldsForDay(day, economy.stationsPerDay),
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questId])

  const quest = state.quests[questId]
  const [view, setView] = useState<View>({ kind: 'map' })

  if (!quest) return null

  const allDone = quest.stations.every((s) => s.done)
  const nextField = quest.stations.find((s) => !s.done)?.field

  const award = (amount: number, source: 'station' | 'penalty' | 'voice-bonus') => {
    if (amount > 0) dispatch({ type: 'award', profileId: profile.id, amount, source })
  }

  const finishStation = (field: SkillField, stars: number, voiceAnswers: number) => {
    // Speaking is always the rewarded path: a quarter star per spoken
    // answer, capped so it tops up rather than replaces the base star.
    const bonus = Math.min(0.75, voiceAnswers * 0.25)
    dispatch({ type: 'completeStation', profileId: profile.id, field, stars })
    award(stars, 'station')
    if (bonus > 0) award(bonus, 'voice-bonus')

    const total = Math.round((stars + bonus) * 100) / 100
    // `quest` is the pre-dispatch snapshot, so this station is not marked
    // done in it yet — treat it as done when deciding what comes next.
    const everyStationDone = quest.stations.every((s) => s.done || s.field === field)
    const then: Next = everyStationDone ? 'shootout' : 'map'

    if (total > 0) setView({ kind: 'payout', stars: total, then })
    else setView({ kind: 'stationWin', field, then })
  }

  const go = (then: Next) => {
    // A completed prize outranks everything else — it is the rarest moment
    // in the app, so it is shown before the child goes anywhere.
    const wish = activeWish(state, profile.id)
    if (wish && wish.savedStars >= wish.priceStars) {
      setView({ kind: 'prize', then })
      return
    }
    setView(
      then === 'shootout' ? { kind: 'shootout' } : then === 'won' ? { kind: 'won' } : { kind: 'map' },
    )
  }

  /* ---------------- Station map ---------------- */
  if (view.kind === 'map') {
    return (
      <div className="station">
        <div className="station-head">
          <button className="icon-button press" onClick={onExit} aria-label="Back to the pitch" type="button">
            ←
          </button>
          <h1 className="station-title">Today’s Match</h1>
          <span style={{ fontFamily: 'var(--display)', color: 'var(--gold)' }}>
            {quest.stations.filter((s) => s.done).length}/{quest.stations.length}
          </span>
        </div>

        <div className="station-map stagger">
          {quest.stations.map((s) => (
            <button
              key={s.field}
              className="station-card press"
              data-done={s.done}
              data-next={!s.done && s.field === nextField}
              disabled={s.done || s.field !== nextField}
              onClick={() => {
                sfx.whistle()
                setView({ kind: 'station', field: s.field })
              }}
              type="button"
            >
              <span className="glyph" aria-hidden="true">
                {FIELD_ICON[s.field]}
              </span>
              <span className="name">{FIELD_LABEL[s.field]}</span>
              <span style={{ fontSize: 22 }} aria-hidden="true">
                {s.done ? '✅' : s.field === nextField ? '▶️' : '🔒'}
              </span>
            </button>
          ))}

          <button
            className="station-card press"
            data-done={quest.shootoutGoals !== null}
            data-next={allDone && quest.shootoutGoals === null}
            disabled={!allDone || quest.shootoutGoals !== null}
            onClick={() => setView({ kind: 'shootout' })}
            type="button"
          >
            <span className="glyph" aria-hidden="true">
              🥅
            </span>
            <span className="name">Penalty Shootout</span>
            <span style={{ fontSize: 22 }} aria-hidden="true">
              {quest.shootoutGoals !== null ? '✅' : allDone ? '▶️' : '🔒'}
            </span>
          </button>
        </div>

        {quest.won && (
          <div style={{ marginTop: 'auto', display: 'grid', justifyItems: 'center', gap: 10 }}>
            <p className="mic-hint">Match won! Watch Time is unlocked. 🔓</p>
            <button className="cta press" onClick={onExit} type="button">
              Back to the pitch
            </button>
          </div>
        )}
      </div>
    )
  }

  /* ---------------- A station ---------------- */
  if (view.kind === 'station') {
    const Station = STATION_COMPONENT[view.field]
    const station = quest.stations.find((s) => s.field === view.field)
    const progress = progressFor(state.progress[profile.id] ?? [], view.field)

    return (
      <div className="station">
        <div className="station-head">
          <button
            className="icon-button press"
            onClick={() => setView({ kind: 'map' })}
            aria-label="Back to the match"
            type="button"
          >
            ←
          </button>
          <h1 className="station-title">{FIELD_LABEL[view.field]}</h1>
          <span style={{ fontSize: 24 }} aria-hidden="true">
            {FIELD_ICON[view.field]}
          </span>
        </div>

        <div className="station-body">
          <Station
            profile={profile}
            progress={progress}
            served={station?.servedIds ?? []}
            onServed={(ids) =>
              dispatch({ type: 'markServed', profileId: profile.id, field: view.field, ids })
            }
            onAnswer={(contentId, correct) =>
              dispatch({
                type: 'answer',
                profileId: profile.id,
                field: view.field,
                contentId,
                correct,
              })
            }
            onDone={({ stars, voiceAnswers }) => finishStation(view.field, stars, voiceAnswers)}
          />
        </div>
      </div>
    )
  }

  /* ---------------- Payout ---------------- */
  if (view.kind === 'payout') {
    return (
      <StarPayout
        profileId={profile.id}
        childName={profile.name}
        stars={view.stars}
        onDone={() => go(view.then)}
      />
    )
  }

  /* ---------------- Station finished with no stars ---------------- */
  if (view.kind === 'stationWin') {
    return (
      <Celebration
        kind="station"
        glyph="💪"
        headline="Great practice!"
        sub="You already know these. Coach will bring harder ones."
        say={`Great practice, ${profile.name}!`}
        onDone={() => go(view.then)}
      />
    )
  }

  /* ---------------- Penalty shootout ---------------- */
  if (view.kind === 'shootout') {
    return (
      <div className="station">
        <div className="station-head">
          <h1 className="station-title">Penalty Shootout</h1>
        </div>
        <PenaltyShootout
          childName={profile.name}
          onDone={(goals) => {
            dispatch({ type: 'setShootout', profileId: profile.id, goals })
            award(goals, 'penalty')
            // The shootout is the finisher, so the match-won celebration
            // always follows it — after the payout when there is one.
            if (goals > 0) setView({ kind: 'payout', stars: goals, then: 'won' })
            else setView({ kind: 'won' })
          }}
        />
      </div>
    )
  }

  /* ---------------- Prize reached ---------------- */
  if (view.kind === 'prize') {
    const wish = activeWish(state, profile.id)
    return (
      <Celebration
        kind="prize"
        glyph="🎁"
        headline="YOUR PRIZE!"
        sub={`You saved every star for ${wish?.name ?? 'your prize'}. Go and tell your grown-up!`}
        say={`${profile.name}, you did it! Your prize is ready!`}
        onDone={() =>
          setView(
            view.then === 'shootout'
              ? { kind: 'shootout' }
              : view.then === 'won'
                ? { kind: 'won' }
                : { kind: 'map' },
          )
        }
      />
    )
  }

  /* ---------------- Match won ---------------- */
  return (
    <Celebration
      kind="match"
      glyph="🏆"
      headline="MATCH WON!"
      sub="Watch Time is unlocked. Great work today!"
      say={`Match won, ${profile.name}! You unlocked your watch time.`}
      onDone={onExit}
    />
  )
}
