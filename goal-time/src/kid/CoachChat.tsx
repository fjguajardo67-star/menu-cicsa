import { useCallback, useEffect, useRef, useState } from 'react'
import { askCoach, offlineOpening, resetOffline } from '../lib/coach'
import { todayKey, uid } from '../lib/db'
import { sfx } from '../lib/sfx'
import { capabilities, listen, speak, stopListening } from '../lib/speech'
import { useStore } from '../lib/store'
import type { ChatTurn, Profile } from '../lib/types'

const EXCHANGES = 4

interface CoachChatProps {
  profile: Profile
  onDone: (voiceAnswers: number) => void
}

/**
 * Coach Chat.
 *
 * Every transcript is stored and shown to the parent in Progress. When the
 * API is unavailable the scripted tree takes over silently — the child sees
 * Coach either way, never an error.
 */
export function CoachChat({ profile, onDone }: CoachChatProps) {
  const { state, dispatch } = useStore()
  const [chatId] = useState(() => uid('chat'))
  const [turns, setTurns] = useState<ChatTurn[]>([])
  const [options, setOptions] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const [listening, setListening] = useState(false)
  const exchanges = useRef(0)
  const voiceAnswers = useRef(0)
  const started = useRef(false)

  const push = useCallback(
    (turn: ChatTurn) => {
      setTurns((t) => [...t, turn])
      dispatch({ type: 'appendTurn', chatId, turn })
    },
    [chatId, dispatch],
  )

  // Open the session with Coach greeting the child by name.
  useEffect(() => {
    if (started.current) return
    started.current = true

    const opening = offlineOpening(
      { childName: profile.name, age: profile.age, history: [] },
      chatId,
    )
    dispatch({
      type: 'addChat',
      chat: {
        id: chatId,
        profileId: profile.id,
        day: todayKey(),
        startedAt: new Date().toISOString(),
        turns: [],
        engine: state.apiKey ? 'api' : 'offline',
      },
    })
    push({ role: 'coach', text: opening.text, at: new Date().toISOString() })
    setOptions(opening.options)
    void speak(opening.text)

    return () => {
      stopListening()
      resetOffline(chatId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const reply = async (text: string, spoken: boolean) => {
    if (busy || !text.trim()) return
    setBusy(true)
    setOptions([])
    const childTurn: ChatTurn = {
      role: 'child',
      text,
      at: new Date().toISOString(),
      spoken,
    }
    push(childTurn)
    if (spoken) voiceAnswers.current += 1
    dispatch({ type: 'englishAdd', profileId: profile.id, phrase: text })

    const history = [...turns, childTurn].map((t) => ({ role: t.role, text: t.text }))
    const coach = await askCoach(
      { childName: profile.name, age: profile.age, history },
      chatId,
      state.apiKey,
      state.coachModel,
    )

    push({ role: 'coach', text: coach.text, at: new Date().toISOString() })
    setOptions(coach.options)
    await speak(coach.text)
    exchanges.current += 1
    setBusy(false)

    if (exchanges.current >= EXCHANGES) {
      window.setTimeout(() => onDone(voiceAnswers.current), 700)
    }
  }

  const onMic = async () => {
    if (busy || listening) return
    sfx.tap()
    setListening(true)
    const result = await listen(7000)
    setListening(false)
    if (result.text) void reply(result.text, true)
    else if (result.status === 'denied' || result.status === 'unavailable') {
      void speak('Let’s tap instead!')
    }
  }

  const micUsable = capabilities.stt && capabilities.micAllowed
  const last = turns.filter((t) => t.role === 'coach').at(-1)

  return (
    <>
      <div className="pips">
        {Array.from({ length: EXCHANGES }, (_, i) => (
          <span
            key={i}
            className="pip"
            data-state={
              i < exchanges.current ? 'done' : i === exchanges.current ? 'current' : 'todo'
            }
          />
        ))}
      </div>

      <div className="coach">
        <div className="coach-avatar float" data-speaking={busy} aria-hidden="true">
          🧑‍🏫
        </div>
        <div className="coach-bubble">
          <span aria-live="polite">{last?.text ?? '…'}</span>
          <button
            className="replay press"
            onClick={() => last && void speak(last.text)}
            aria-label="Hear it again"
            type="button"
          >
            🔊
          </button>
        </div>
      </div>

      {/* What the child already said, so the exchange feels like a conversation. */}
      <div
        style={{
          display: 'grid',
          gap: 8,
          justifyItems: 'end',
          width: 'min(92vw, 560px)',
          margin: '0 auto',
        }}
      >
        {turns
          .filter((t) => t.role === 'child')
          .slice(-2)
          .map((t, i) => (
            <span
              key={i}
              className="fade-in"
              style={{
                background: 'rgba(255,255,255,0.16)',
                borderRadius: 'var(--r-lg)',
                borderBottomRightRadius: 6,
                padding: '8px 14px',
                fontWeight: 800,
                fontSize: 15,
                maxWidth: '80%',
              }}
            >
              {t.text}
            </span>
          ))}
      </div>

      <div style={{ display: 'grid', gap: 16 }}>
        {micUsable && (
          <div className="mic-row">
            <button
              className="mic"
              data-listening={listening}
              onClick={onMic}
              disabled={busy}
              aria-label="Tap and talk to Coach"
              type="button"
            >
              {listening ? '👂' : '🎤'}
              {listening && <span className="ring ring-out" aria-hidden="true" />}
            </button>
            <p className="mic-hint">{listening ? 'I’m listening…' : 'Tap and TALK!'}</p>
          </div>
        )}

        <div className="choices stagger">
          {options.map((o) => (
            <button
              key={o}
              className="choice"
              style={{ minHeight: 72 }}
              onClick={() => {
                sfx.tap()
                void reply(o, false)
              }}
              disabled={busy}
              type="button"
            >
              <span className="label">{o}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
