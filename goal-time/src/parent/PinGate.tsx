import { useState } from 'react'
import { hashPin } from '../lib/db'
import { sfx } from '../lib/sfx'

interface PinGateProps {
  expectedHash: string | null
  onPass: () => void
  onCancel: () => void
}

/** Four digits between Kid Mode and the Manager's Office. */
export function PinGate({ expectedHash, onPass, onCancel }: PinGateProps) {
  const [entry, setEntry] = useState('')
  const [shake, setShake] = useState(false)

  const press = async (digit: string) => {
    sfx.tap()
    const next = entry + digit
    setEntry(next)
    if (next.length < 4) return

    const ok = expectedHash === null || (await hashPin(next)) === expectedHash
    if (ok) {
      onPass()
      return
    }
    setShake(true)
    window.setTimeout(() => {
      setShake(false)
      setEntry('')
    }, 420)
  }

  return (
    <div className="parent-root">
      <div className="pin-screen">
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40 }} aria-hidden="true">
            🔑
          </div>
          <h1 style={{ fontFamily: 'var(--display)', fontSize: 22, margin: '8px 0 4px' }}>
            Manager’s Office
          </h1>
          <p style={{ color: 'var(--ink-faint)', fontSize: 13, margin: 0 }}>
            Enter your 4-digit PIN
          </p>
        </div>

        <div className={`pin-dots${shake ? ' wiggle' : ''}`}>
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="pin-dot" data-filled={i < entry.length} />
          ))}
        </div>

        <div className="pin-pad">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
            <button key={d} className="pin-key" onClick={() => void press(d)} type="button">
              {d}
            </button>
          ))}
          <button className="pin-key" onClick={onCancel} aria-label="Cancel" type="button">
            ✕
          </button>
          <button className="pin-key" onClick={() => void press('0')} type="button">
            0
          </button>
          <button
            className="pin-key"
            onClick={() => setEntry((e) => e.slice(0, -1))}
            aria-label="Delete"
            type="button"
          >
            ⌫
          </button>
        </div>
      </div>
    </div>
  )
}
