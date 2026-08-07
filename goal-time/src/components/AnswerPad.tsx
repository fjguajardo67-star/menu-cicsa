import { useEffect, useRef, useState } from 'react'
import { passes } from '../lib/fuzzy'
import { sfx } from '../lib/sfx'
import { capabilities, listen, speak, stopListening } from '../lib/speech'
import { useStore } from '../lib/store'
import { emptyEnglish } from '../lib/types'

export interface PadChoice {
  label: string
  emoji?: string
  correct: boolean
  /** Extra phrases that also pass if the child says this choice aloud. */
  accepts?: string[]
}

interface AnswerPadProps {
  choices: PadChoice[]
  /** Coach models this slowly after two misses. */
  modelPhrase?: string
  /** Called once per question. `viaVoice` drives the streak bonus. */
  onAnswer: (correct: boolean, viaVoice: boolean) => void
  /** Prompt re-spoken when the child asks to hear it again. */
  prompt?: string
  /** Hide the mic where speaking makes no sense (e.g. drawing). */
  voice?: boolean
  disabled?: boolean
}

type Phase = 'idle' | 'listening' | 'thinking' | 'answered'

/**
 * Mic-first, tap-always.
 *
 * The microphone is the primary input and speaking is the rewarded path,
 * but the tap choices are on screen the whole time. There is no state in
 * which a child can get stuck: two misses make Coach model the phrase
 * slowly, and the third attempt passes with encouragement.
 */
export function AnswerPad({
  choices,
  modelPhrase,
  onAnswer,
  prompt,
  voice = true,
  disabled = false,
}: AnswerPadProps) {
  const { state, dispatch, profile } = useStore()
  const [phase, setPhase] = useState<Phase>('idle')
  const [misses, setMisses] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [hint, setHint] = useState('')
  const settled = useRef(false)

  const micUsable = voice && capabilities.stt && capabilities.micAllowed
  const right = choices.find((c) => c.correct)

  /** Feed the English report in Parent → Progress. */
  const recordEnglish = (patch: Partial<ReturnType<typeof emptyEnglish>>) => {
    if (!profile) return
    const cur = state.english[profile.id] ?? emptyEnglish()
    dispatch({
      type: 'english',
      profileId: profile.id,
      patch: {
        micAttempts: cur.micAttempts + (patch.micAttempts ?? 0),
        micFirstTry: cur.micFirstTry + (patch.micFirstTry ?? 0),
        tapFallbacks: cur.tapFallbacks + (patch.tapFallbacks ?? 0),
      },
    })
  }

  useEffect(() => {
    settled.current = false
    setPhase('idle')
    setMisses(0)
    setPicked(null)
    setHint('')
    return () => stopListening()
  }, [choices])

  const finish = (correct: boolean, viaVoice: boolean, index: number | null) => {
    if (settled.current) return
    settled.current = true
    setPicked(index)
    setPhase('answered')
    if (correct) sfx.correct()
    else sfx.retry()
    // Let the feedback colour land before the station moves on.
    window.setTimeout(() => onAnswer(correct, viaVoice), correct ? 620 : 900)
  }

  const tap = (index: number) => {
    if (disabled || phase === 'answered') return
    stopListening()
    sfx.tap()
    // A tap where speaking was never on offer is a fallback, and the parent
    // should be able to see how often that happened.
    if (voice && !micUsable) recordEnglish({ tapFallbacks: 1 })
    finish(choices[index].correct, false, index)
  }

  const onMic = async () => {
    if (disabled || phase !== 'idle' || !right) return
    sfx.tap()
    setPhase('listening')
    setHint('')

    const result = await listen(7000)
    setPhase('thinking')

    if (result.status === 'denied' || result.status === 'unavailable') {
      // Mic is gone for the session. Every station is still completable.
      recordEnglish({ tapFallbacks: 1 })
      setHint('Let’s tap the picture instead!')
      setPhase('idle')
      return
    }

    const accepts = [right.label, ...(right.accepts ?? [])]
    if (result.text && passes(result.text, accepts)) {
      recordEnglish({ micAttempts: 1, micFirstTry: misses === 0 ? 1 : 0 })
      finish(true, true, choices.indexOf(right))
      return
    }

    recordEnglish({ micAttempts: 1 })

    const next = misses + 1
    setMisses(next)

    if (next >= 3) {
      // Never a dead end: the third attempt always passes.
      setHint('You did it! Great trying.')
      await speak('You did it. Great trying!')
      finish(true, true, choices.indexOf(right))
      return
    }

    const model = modelPhrase ?? right.label
    setHint(next === 1 ? 'Almost! Listen to Coach.' : 'One more try — say it with me.')
    // Coach models the phrase slowly. This is the whole point of the miss.
    await speak(next === 1 ? `Almost. Listen. ${model}` : `Say it with me. ${model}`, {
      rate: 0.68,
    })
    setPhase('idle')
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {micUsable && (
        <div className="mic-row">
          <button
            className="mic"
            data-listening={phase === 'listening'}
            onClick={onMic}
            disabled={disabled || phase === 'answered' || phase === 'thinking'}
            aria-label={phase === 'listening' ? 'Listening' : 'Tap and say your answer'}
            type="button"
          >
            {phase === 'listening' ? '👂' : '🎤'}
            {phase === 'listening' && <span className="ring ring-out" aria-hidden="true" />}
          </button>
          <p className="mic-hint" aria-live="polite">
            {hint ||
              (phase === 'listening'
                ? 'I’m listening…'
                : phase === 'thinking'
                  ? 'Hmm…'
                  : 'Tap and SAY it!')}
          </p>
        </div>
      )}

      {!micUsable && prompt && (
        <p className="mic-hint">Tap the right picture!</p>
      )}

      <div className="choices stagger">
        {choices.map((c, i) => (
          <button
            key={`${c.label}-${i}`}
            className="choice"
            onClick={() => tap(i)}
            disabled={disabled || phase === 'answered'}
            data-state={
              phase !== 'answered'
                ? undefined
                : c.correct
                  ? 'right'
                  : picked === i
                    ? 'wrong'
                    : undefined
            }
            type="button"
          >
            {c.emoji && (
              <span className="glyph" aria-hidden="true">
                {c.emoji}
              </span>
            )}
            <span className="label">{c.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
