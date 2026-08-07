import { useEffect, useRef, useState } from 'react'
import { Ball, CrossMark, Keeper, Target } from '../components/art'
import { Coach } from '../components/Coach'
import { sfx } from '../lib/sfx'
import { speak } from '../lib/speech'

const KICKS = 3
type Zone = 0 | 1 | 2

interface PenaltyShootoutProps {
  childName: string
  /** Called with the number of goals scored out of three. */
  onDone: (goals: number) => void
}

/**
 * Penalty Shootout — the finisher of every Match Day.
 *
 * Tap to aim, the keeper dives. Each goal is a bonus star. The keeper's
 * dive is weighted so a five-year-old scores most of the time but not
 * always: a shootout you cannot lose stops being exciting by day three.
 */
export function PenaltyShootout({ childName, onDone }: PenaltyShootoutProps) {
  const [kick, setKick] = useState(0)
  const [results, setResults] = useState<boolean[]>([])
  const [keeper, setKeeper] = useState<Zone>(1)
  const [ball, setBall] = useState<{ zone: Zone; scored: boolean } | null>(null)
  const [busy, setBusy] = useState(false)
  const finished = useRef(false)

  useEffect(() => {
    sfx.whistle()
  }, [])

  const shoot = async (zone: Zone) => {
    if (busy || kick >= KICKS) return
    setBusy(true)
    sfx.kick()

    // The keeper guesses. A 1-in-3 chance of picking the same zone would be
    // too harsh, so two thirds of the time it dives somewhere else.
    const guess: Zone =
      Math.random() < 0.34 ? zone : (([0, 1, 2] as Zone[]).filter((z) => z !== zone)[
        Math.floor(Math.random() * 2)
      ] as Zone)

    setKeeper(guess)
    const scored = guess !== zone
    setBall({ zone, scored })

    window.setTimeout(async () => {
      const next = [...results, scored]
      setResults(next)
      if (scored) sfx.star()
      else sfx.retry()

      await speak(
        scored
          ? ['Goal!', 'What a strike!', 'Beautiful goal!'][next.length - 1] ?? 'Goal!'
          : 'Good try! Next one.',
      )

      window.setTimeout(() => {
        setBall(null)
        setKeeper(1)
        setBusy(false)
        if (kick + 1 >= KICKS) {
          if (finished.current) return
          finished.current = true
          onDone(next.filter(Boolean).length)
        } else {
          setKick(kick + 1)
        }
      }, 400)
    }, 460)
  }

  const keeperX = keeper === 0 ? '-32%' : keeper === 2 ? '32%' : '0%'

  return (
    <div className="shootout">
      <Coach
        line={
          kick === 0
            ? `Penalty time, ${childName}! Pick a corner.`
            : `Kick number ${kick + 1}. Where will it go?`
        }
        cue={kick}
      />

      <div className="goal-frame">
        <div className="aim-zones">
          {([0, 1, 2] as Zone[]).map((z) => (
            <button
              key={z}
              className="aim-zone press"
              onClick={() => shoot(z)}
              disabled={busy}
              aria-label={['Aim left', 'Aim middle', 'Aim right'][z]}
              type="button"
            >
              {!busy && <Target size="1em" style={{ opacity: 0.75 }} />}
            </button>
          ))}
        </div>

        <span
          className="keeper"
          style={{ transform: `translateX(calc(-50% + ${keeperX}))` }}
          aria-hidden="true"
        >
          <Keeper size="1em" />
        </span>

        {ball && (
          <span
            className="shot-ball"
            style={{
              transform: `translate(calc(-50% + ${
                ball.zone === 0 ? '-34%' : ball.zone === 2 ? '34%' : '0%'
              }), ${ball.scored ? '-190%' : '-120%'}) scale(${ball.scored ? 0.8 : 1})`,
              opacity: ball.scored ? 1 : 0.55,
            }}
            aria-hidden="true"
          >
            <Ball size="1em" />
          </span>
        )}
      </div>

      <div className="kick-marks" aria-label={`${results.filter(Boolean).length} goals`}>
        {Array.from({ length: KICKS }, (_, i) => (
          <span
            key={i}
            className={results[i] !== undefined ? 'pop-in' : undefined}
            style={{ display: 'inline-flex' }}
          >
            {results[i] === undefined ? (
              <Ball tone="gray" size="1em" style={{ opacity: 0.4 }} />
            ) : results[i] ? (
              <Ball size="1em" />
            ) : (
              <CrossMark size="1em" />
            )}
          </span>
        ))}
      </div>

      <p className="mic-hint">Tap a corner to shoot!</p>
    </div>
  )
}
