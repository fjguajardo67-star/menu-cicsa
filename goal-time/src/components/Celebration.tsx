import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { sfx } from '../lib/sfx'
import { speak } from '../lib/speech'
import { GoldenBall, Star5 } from './art'

const CONFETTI_COLOURS = ['#FFC531', '#E63946', '#2D9CDB', '#35C88A', '#FFFFFF', '#FF8FB1']

export function Confetti({ pieces = 60 }: { pieces?: number }) {
  const bits = useMemo(
    () =>
      Array.from({ length: pieces }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 700,
        duration: 2200 + Math.random() * 1600,
        colour: CONFETTI_COLOURS[i % CONFETTI_COLOURS.length],
        scale: 0.7 + Math.random() * 0.9,
      })),
    [pieces],
  )

  return (
    <div className="confetti-layer" aria-hidden="true">
      {bits.map((b) => (
        <span
          key={b.id}
          className="confetti-piece"
          style={{
            left: `${b.left}%`,
            background: b.colour,
            animationDelay: `${b.delay}ms`,
            animationDuration: `${b.duration}ms`,
            transform: `scale(${b.scale})`,
          }}
        />
      ))}
    </div>
  )
}

export type CelebrationKind = 'station' | 'match' | 'golden' | 'prize'

interface CelebrationProps {
  kind: CelebrationKind
  headline: string
  sub?: string
  glyph: ReactNode
  /** Spoken aloud in English, like everything else Coach says. */
  say?: string
  onDone: () => void
  children?: ReactNode
}

const DWELL: Record<CelebrationKind, number> = {
  station: 1500,
  match: 3400,
  golden: 3800,
  prize: 4000,
}

/**
 * The delight budget lives here. These are rare-tier moments — a station
 * finishing, a match won, a Golden Ball, a prize reached — so they get the
 * biggest motion in the app, scaled by how rare each one is.
 */
export function Celebration({
  kind,
  headline,
  sub,
  glyph,
  say,
  onDone,
  children,
}: CelebrationProps) {
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    if (kind === 'golden') sfx.golden()
    else if (kind === 'match') sfx.cheer()
    else if (kind === 'prize') sfx.prize()
    else sfx.star()

    if (say) void speak(say, { rate: 0.85 })

    const timer = window.setTimeout(() => setClosing(true), DWELL[kind])
    const finish = window.setTimeout(onDone, DWELL[kind] + 240)
    return () => {
      window.clearTimeout(timer)
      window.clearTimeout(finish)
    }
  }, [kind, say, onDone])

  const animation =
    kind === 'golden' ? 'golden-burst' : kind === 'station' ? 'pop-in' : 'trophy-slam'

  return (
    <>
      {kind !== 'station' && <Confetti pieces={kind === 'golden' ? 90 : 60} />}
      <div
        className="celebrate"
        style={{
          opacity: closing ? 0 : 1,
          transition: 'opacity 240ms var(--ease-out)',
        }}
        role="status"
        onClick={onDone}
      >
        <div className={`glyph ${animation}`} aria-hidden="true">
          {glyph}
        </div>
        <h2 className="headline">{headline}</h2>
        {sub && <p className="sub">{sub}</p>}
        {children}
      </div>
    </>
  )
}

/** A star flying up out of the tapped element. Cheap, frequent, small. */
export function StarBurst({ x, y, golden }: { x: number; y: number; golden?: boolean }) {
  return (
    <span
      className="star-fly"
      aria-hidden="true"
      style={{
        position: 'fixed',
        left: x,
        top: y,
        pointerEvents: 'none',
        zIndex: 95,
        display: 'inline-flex',
      }}
    >
      {golden ? <GoldenBall size={56} /> : <Star5 size={40} />}
    </span>
  )
}
