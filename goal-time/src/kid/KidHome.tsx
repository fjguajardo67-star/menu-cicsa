import { useEffect, useMemo, useRef, useState } from 'react'
import { useToast } from '../components/Bits'
import { useSpeak } from '../components/Coach'
import { todayKey } from '../lib/db'
import {
  activeWish,
  goldenBallCount,
  pendingStars,
  starBalance,
  watchStatus,
} from '../lib/economy'
import { sfx } from '../lib/sfx'
import { useStore } from '../lib/store'
import type { Profile } from '../lib/types'

interface KidHomeProps {
  profile: Profile
  onTrain: () => void
  onWatch: () => void
  onOffice: () => void
}

const greeting = (name: string): string => {
  const h = new Date().getHours()
  const part = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
  return `${part}, ${name}! Ready to train?`
}

/**
 * The pitch.
 *
 * The halfway line splits the screen into the two things the child can do:
 * TRAIN on top, WATCH below. Watching is the locked door that training
 * opens — that inversion is the whole product, so it is also the layout.
 */
export function KidHome({ profile, onTrain, onWatch, onOffice }: KidHomeProps) {
  const { state, dispatch } = useStore()
  const { toast, toastNode } = useToast()
  const day = todayKey()

  const stars = starBalance(state, profile.id)
  const pending = pendingStars(state, profile.id)
  const golden = goldenBallCount(state, profile.id)
  const wish = activeWish(state, profile.id)
  const status = watchStatus(state, profile.id, day)
  const quest = state.quests[`${profile.id}:${day}`]

  const claimedToday = useMemo(
    () =>
      state.starEvents.some(
        (e) => e.profileId === profile.id && e.day === day && e.source === 'honor',
      ),
    [state.starEvents, profile.id, day],
  )

  useSpeak(greeting(profile.name), [profile.id])

  // Sweep the WATCH button once, the first time it becomes available.
  const [justUnlocked, setJustUnlocked] = useState(false)
  const wasLocked = useRef(status.locked)
  useEffect(() => {
    if (wasLocked.current && !status.locked) {
      setJustUnlocked(true)
      sfx.unlock()
      window.setTimeout(() => setJustUnlocked(false), 1200)
    }
    wasLocked.current = status.locked
  }, [status.locked])

  const fillPct = status.allowance > 0 ? (status.left / status.allowance) * 100 : 0
  const questDone = quest?.won ?? false

  const lockLine =
    status.lockReason === 'quest'
      ? 'Win today’s match first!'
      : status.lockReason === 'window'
        ? 'Not watch time yet'
        : status.lockReason === 'empty'
          ? 'All used up for today'
          : ''

  const claimHonor = () => {
    if (claimedToday) return
    sfx.star()
    dispatch({
      type: 'award',
      profileId: profile.id,
      amount: 1,
      source: 'honor',
      pending: true,
      note: 'Stopped on time',
    })
    toast('Sent to your grown-up to check! ⭐')
  }

  return (
    <div className="pitch">
      <span className="halfway" aria-hidden="true" />

      {/* Chalk markings — what makes the pitch read as a pitch. */}
      <span aria-hidden="true">
        <i className="marking penalty-box top" />
        <i className="marking goal-box top" />
        <i className="marking penalty-spot top" />
        <i className="marking penalty-box bottom" />
        <i className="marking goal-box bottom" />
        <i className="marking penalty-spot bottom" />
        <i className="marking corner-arc tl" />
        <i className="marking corner-arc tr" />
        <i className="marking corner-arc bl" />
        <i className="marking corner-arc br" />
      </span>

      <button className="office-key press" onClick={onOffice} aria-label="Manager’s Office" type="button">
        🔑
      </button>

      {/* ---- Top half: TRAIN ---- */}
      <div className="pitch-half stagger">
        <span className="half-label">Train</span>

        <button
          className={`big-button train ${questDone ? 'done' : ''}`}
          onClick={() => {
            sfx.whistle()
            onTrain()
          }}
          type="button"
        >
          {!questDone && <span className="sheen sheen-loop" aria-hidden="true" />}
          <span className={`glyph ${questDone ? 'float' : 'kick-idle'}`} aria-hidden="true">
            {questDone ? '🏆' : '⚽'}
          </span>
          <span className="title">{questDone ? 'MATCH WON!' : "TODAY'S MATCH"}</span>
          <span className="sub">
            {quest
              ? `${quest.stations.filter((s) => s.done).length} of ${quest.stations.length} stations`
              : 'Tap to kick off'}
          </span>
        </button>
      </div>

      {/* ---- Centre circle: the score ---- */}
      <div className="centre-circle" aria-hidden="true">
        <span className="score-chip">
          {/* Keyed so the number pops whenever it changes. */}
          <span key={stars} className="n pop-in">
            {Number.isInteger(stars) ? stars : stars.toFixed(2)}
          </span>
          <span className="icon twinkle">⭐</span>
        </span>
        {(golden > 0 || pending > 0) && (
          <span className="score-minor">
            {golden > 0 && (
              <span className="score-chip golden minor">
                <span className="n">{golden}</span>
                <span className="icon">🥇</span>
              </span>
            )}
            {pending > 0 && (
              <span className="score-chip pending minor">
                <span className="n">+{pending}</span>
                <span className="icon">⏳</span>
              </span>
            )}
          </span>
        )}
      </div>
      <span className="sr" aria-live="polite">
        {stars} stars, {golden} golden balls
        {pending > 0 ? `, ${pending} waiting to be checked` : ''}
      </span>

      {/* ---- Bottom half: WATCH ---- */}
      <div className="pitch-half stagger">
        <span className="half-label">Watch</span>

        <button
          className={`big-button watch ${status.locked ? 'locked' : 'unlocked'} ${
            justUnlocked ? 'just-unlocked' : ''
          }`}
          onClick={() => {
            if (status.locked) {
              sfx.retry()
              toast(lockLine)
              return
            }
            sfx.tap()
            onWatch()
          }}
          type="button"
        >
          <span className="sheen" aria-hidden="true" />
          {status.locked && (
            <span className="padlock" aria-hidden="true">
              🔒
            </span>
          )}
          <div className="row" style={{ gap: 16 }}>
            <span className="sun-wrap" aria-hidden="true">
              {!status.locked && status.left > 0 && <span className="sun-rays rays-spin" />}
              <span
                className={`sun-meter${status.left <= 0 ? ' empty' : ''}`}
                style={{ ['--fill' as string]: `${fillPct}%` }}
              >
                <span className="level" />
              </span>
            </span>
            <span style={{ textAlign: 'left' }}>
              <span className="title" style={{ display: 'block' }}>
                WATCH
              </span>
              <span className="sub">{status.locked ? lockLine : 'Your show is ready'}</span>
            </span>
          </div>
        </button>

        {/* ---- Prize cabinet ---- */}
        {wish && (
          <div className="cabinet rise-in">
            {wish.photo ? (
              <img className="photo" src={wish.photo} alt="" />
            ) : (
              <span className="photo" aria-hidden="true">
                🎁
              </span>
            )}
            <div className="info">
              <div className="name">{wish.name}</div>
              <div
                className="fill-meter"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={wish.priceStars}
                aria-valuenow={wish.savedStars}
              >
                <span
                  className="bar"
                  style={{
                    ['--p' as string]: Math.min(
                      1,
                      wish.savedStars / Math.max(1, wish.priceStars),
                    ),
                  }}
                />
              </div>
              <div className="count">
                {wish.savedStars} / {wish.priceStars} ⭐
              </div>
            </div>
          </div>
        )}

        {/* ---- Honor claim ---- */}
        <button
          className="honor-button press"
          data-claimed={claimedToday}
          onClick={claimHonor}
          disabled={claimedToday}
          type="button"
        >
          <span aria-hidden="true">{claimedToday ? '⏳' : '🏅'}</span>
          {claimedToday ? 'Waiting to be checked' : 'I STOPPED ON TIME!'}
        </button>
      </div>

      {toastNode}
    </div>
  )
}
