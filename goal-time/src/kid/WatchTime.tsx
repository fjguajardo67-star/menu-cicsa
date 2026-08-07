import { useEffect, useRef, useState } from 'react'
import { Medal, PauseIcon, PlayBadge } from '../components/art'
import { Coach } from '../components/Coach'
import { todayKey } from '../lib/db'
import { watchStatus } from '../lib/economy'
import { sfx } from '../lib/sfx'
import { speak } from '../lib/speech'
import { useStore } from '../lib/store'
import type { Profile } from '../lib/types'

interface WatchTimeProps {
  profile: Profile
  onExit: () => void
}

/**
 * Watch Time.
 *
 * This is a timer and a ledger, not a remote control: the app is honest
 * that it cannot stop YouTube Kids. Minutes are written back as they are
 * used, so closing the app mid-session does not hand back free time.
 */
export function WatchTime({ profile, onExit }: WatchTimeProps) {
  const { state, dispatch } = useStore()
  const status = watchStatus(state, profile.id, todayKey())
  const [running, setRunning] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(status.left * 60)
  const banked = useRef(0)
  const warned = useRef(false)

  // Tick once a second, banking a whole minute at a time so a refresh never
  // loses more than 59 seconds of the child's allowance.
  useEffect(() => {
    if (!running) return
    const id = window.setInterval(() => {
      setSecondsLeft((s) => {
        const next = Math.max(0, s - 1)
        banked.current += 1
        if (banked.current >= 60) {
          banked.current = 0
          dispatch({ type: 'addWatchMinutes', profileId: profile.id, minutes: 1 })
        }
        if (next === 120 && !warned.current) {
          warned.current = true
          void speak('Two minutes left. Get ready to stop.')
        }
        if (next === 0) {
          sfx.whistle()
          void speak(`Time is up, ${profile.name}. You can stop like a champion!`)
        }
        return next
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [running, dispatch, profile.id, profile.name])

  // Bank any partial minute when leaving.
  useEffect(
    () => () => {
      if (banked.current >= 30) {
        dispatch({ type: 'addWatchMinutes', profileId: profile.id, minutes: 1 })
      }
    },
    [dispatch, profile.id],
  )

  const mins = Math.floor(secondsLeft / 60)
  const secs = secondsLeft % 60
  const fillPct = status.allowance > 0 ? (secondsLeft / (status.allowance * 60)) * 100 : 0
  const done = secondsLeft === 0

  return (
    <div className="station">
      <div className="station-head">
        <button className="icon-button press" onClick={onExit} aria-label="Back to the pitch" type="button">
          ←
        </button>
        <h1 className="station-title">Watch Time</h1>
      </div>

      <Coach
        line={
          done
            ? 'Time is up! Can you stop like a champion?'
            : running
              ? 'Enjoy your show. I will tell you when to stop.'
              : `You earned this, ${profile.name}. Ready?`
        }
        cue={`${running}-${done}`}
      />

      <div style={{ display: 'grid', justifyItems: 'center', gap: 18, marginTop: 10 }}>
        <div className="sun-wrap" role="img" aria-label={`${mins} minutes left`}>
          {!done && running && <span className="sun-rays rays-spin" aria-hidden="true" />}
          <div
            className={`sun-meter${done ? ' empty' : ''}`}
            style={{ ['--fill' as string]: `${fillPct}%`, width: 190 }}
          >
            <span className="level" />
          </div>
        </div>

        <div
          style={{
            fontFamily: 'var(--display)',
            fontSize: 'clamp(40px, 12vw, 64px)',
            fontVariantNumeric: 'tabular-nums',
            color: done ? 'var(--chalk-dim)' : 'var(--gold)',
            lineHeight: 1,
          }}
          aria-hidden="true"
        >
          {mins}:{String(secs).padStart(2, '0')}
        </div>

        {!running && !done && (
          <button
            className="cta press"
            onClick={() => {
              sfx.unlock()
              setRunning(true)
            }}
            type="button"
          >
            <PlayBadge size="1.1em" style={{ verticalAlign: '-0.24em', marginRight: 8 }} />
            Start my show
          </button>
        )}

        {running && !done && (
          <button
            className="cta ghost press"
            onClick={() => {
              setRunning(false)
              sfx.tap()
            }}
            type="button"
          >
            <PauseIcon size="0.9em" style={{ verticalAlign: '-0.12em', marginRight: 6 }} />
            Pause
          </button>
        )}

        {done && (
          <button className="cta press" onClick={onExit} type="button">
            I stopped!
            <Medal size="1.1em" style={{ verticalAlign: '-0.24em', marginLeft: 8 }} />
          </button>
        )}
      </div>

      <div style={{ marginTop: 'auto' }}>
        <p className="mic-hint" style={{ fontSize: 13, lineHeight: 1.5, opacity: 0.75 }}>
          This timer counts your minutes. Ask your grown-up to start the show.
        </p>
      </div>
    </div>
  )
}
