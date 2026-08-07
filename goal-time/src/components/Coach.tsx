import { useEffect, useRef, useState } from 'react'
import { capabilities, speak, stopSpeaking } from '../lib/speech'

/**
 * Speak a line aloud when it appears. Every screen in Kid Mode uses this —
 * the text on screen is a caption, not the primary channel.
 */
export function useSpeak(text: string, deps: unknown[] = []): { speaking: boolean; replay: () => void } {
  const [speaking, setSpeaking] = useState(false)
  const latest = useRef(text)
  latest.current = text

  const say = useRef(async (line: string) => {
    if (!line.trim()) return
    setSpeaking(true)
    await speak(line)
    setSpeaking(false)
  })

  useEffect(() => {
    void say.current(text)
    return () => stopSpeaking()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { speaking, replay: () => void say.current(latest.current) }
}

interface CoachProps {
  /** Line Coach says out loud. Also shown as a caption. */
  line: string
  /** Re-speak whenever this changes. */
  cue?: unknown
  emoji?: string
}

export function Coach({ line, cue, emoji = '🧑‍🏫' }: CoachProps) {
  const { speaking, replay } = useSpeak(line, [line, cue])

  return (
    <div className="coach">
      <div className="coach-avatar" data-speaking={speaking} aria-hidden="true">
        {emoji}
      </div>
      <div className="coach-bubble">
        <span aria-live="polite">{line}</span>
        {capabilities.tts && (
          <button
            className="replay press"
            onClick={replay}
            aria-label="Hear it again"
            type="button"
          >
            🔊
          </button>
        )}
      </div>
    </div>
  )
}
