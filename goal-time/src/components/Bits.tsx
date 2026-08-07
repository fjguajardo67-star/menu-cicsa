import { useEffect, useState, type ReactNode } from 'react'

/** Toast. A transition rather than keyframes, so rapid re-triggers retarget. */
export function Toast({ text, onDone }: { text: string; onDone: () => void }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const raf = requestAnimationFrame(() => setOpen(true))
    const hide = window.setTimeout(() => setOpen(false), 2400)
    const done = window.setTimeout(onDone, 2700)
    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(hide)
      window.clearTimeout(done)
    }
  }, [text, onDone])

  return (
    <div className="toast" data-state={open ? 'open' : 'closed'} role="status">
      {text}
    </div>
  )
}

export function useToast() {
  const [message, setMessage] = useState<string | null>(null)
  const node = message ? <Toast text={message} onDone={() => setMessage(null)} /> : null
  return { toast: setMessage, toastNode: node }
}

export function Switch({
  on,
  onChange,
  label,
  warn,
}: {
  on: boolean
  onChange: (v: boolean) => void
  label: string
  warn?: boolean
}) {
  return (
    <button
      className={`switch${warn ? ' warn' : ''}`}
      data-on={on}
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      type="button"
    />
  )
}

export function SwitchRow({
  on,
  onChange,
  title,
  detail,
  warn,
}: {
  on: boolean
  onChange: (v: boolean) => void
  title: string
  detail?: string
  warn?: boolean
}) {
  return (
    <div className="switch-row">
      <div className="text">
        <strong>{title}</strong>
        {detail && <span>{detail}</span>}
      </div>
      <Switch on={on} onChange={onChange} label={title} warn={warn} />
    </div>
  )
}

export function Card({
  title,
  hint,
  children,
}: {
  title?: string
  hint?: string
  children: ReactNode
}) {
  return (
    <section className="card rise-in">
      {title && (
        <h2>
          {title} {hint && <span className="hint">{hint}</span>}
        </h2>
      )}
      {children}
    </section>
  )
}

export function Stat({
  n,
  k,
  tone,
}: {
  n: ReactNode
  k: string
  tone?: 'good' | 'gold' | 'accent'
}) {
  return (
    <div className={`stat${tone ? ` ${tone}` : ''}`}>
      <div className="n">{n}</div>
      <div className="k">{k}</div>
    </div>
  )
}

/** Minutes as a friendly clock string. */
export const clock = (minutes: number): string => {
  const m = Math.max(0, Math.round(minutes))
  const h = Math.floor(m / 60)
  return h > 0 ? `${h}h ${m % 60}m` : `${m}m`
}

export const timeLabel = (minutesFromMidnight: number): string => {
  const h = Math.floor(minutesFromMidnight / 60)
  const m = minutesFromMidnight % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export const parseTime = (value: string): number => {
  const [h, m] = value.split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}
