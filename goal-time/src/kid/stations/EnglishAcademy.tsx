import { useMemo, useRef, useState } from 'react'
import { AnswerPad, type PadChoice } from '../../components/AnswerPad'
import { Coach } from '../../components/Coach'
import {
  LISTEN_ITEMS,
  REPEAT_ITEMS,
  type ListenItem,
  type RepeatItem,
} from '../../content/english'
import { pickN, sampleContent } from '../../lib/mastery'
import { useStore } from '../../lib/store'
import { CoachChat } from '../CoachChat'
import type { StationProps } from './types'

type Phase = 'listen' | 'repeat' | 'chat'

/**
 * English Academy — the field that appears in every daily quest.
 * Listen & choose, then Repeat with me, then a short Coach Chat.
 */
export function EnglishAcademy({
  profile,
  progress,
  served,
  onServed,
  onAnswer,
  onDone,
}: StationProps) {
  const { dispatch } = useStore()
  const [phase, setPhase] = useState<Phase>('listen')
  const tally = useRef({ stars: 0, voiceAnswers: 0 })

  const listenItem = useMemo(() => {
    const [picked] = sampleContent<ListenItem>(LISTEN_ITEMS, progress, 1, served)
    onServed([picked.item.id])
    return picked
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const repeatItem = useMemo(() => {
    const [picked] = sampleContent<RepeatItem>(REPEAT_ITEMS, progress, 1, served)
    onServed([picked.item.id])
    return picked
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onListen = (correct: boolean, viaVoice: boolean) => {
    onAnswer(listenItem.item.id, correct)
    if (correct && listenItem.paysStars) tally.current.stars = 1
    if (correct && viaVoice) tally.current.voiceAnswers += 1
    if (correct) {
      dispatch({ type: 'englishAdd', profileId: profile.id, word: listenItem.item.word })
    }
    setPhase('repeat')
  }

  const onRepeat = (correct: boolean, viaVoice: boolean) => {
    onAnswer(repeatItem.item.id, correct)
    if (correct && repeatItem.paysStars) tally.current.stars = 1
    if (correct && viaVoice) tally.current.voiceAnswers += 1
    if (correct) {
      dispatch({ type: 'englishAdd', profileId: profile.id, phrase: repeatItem.item.phrase })
    }
    setPhase('chat')
  }

  if (phase === 'listen') {
    const choices: PadChoice[] = pickN(
      [
        {
          label: listenItem.item.word,
          emoji: listenItem.item.emoji,
          correct: true,
          accepts: [listenItem.item.word],
        },
        ...listenItem.item.distractors.map((d) => ({
          label: d.label,
          emoji: d.emoji,
          correct: false,
        })),
      ],
      3,
    )

    return (
      <>
        <Coach
          line={`Listen. ${listenItem.item.word}. Which one is ${listenItem.item.word}?`}
          cue={listenItem.item.id}
        />
        <AnswerPad
          key={listenItem.item.id}
          choices={choices}
          modelPhrase={listenItem.item.word}
          onAnswer={onListen}
        />
      </>
    )
  }

  if (phase === 'repeat') {
    const choices: PadChoice[] = pickN(
      repeatItem.item.tapOptions.map((o) => ({
        label: o,
        correct: o === repeatItem.item.phrase,
        accepts: o === repeatItem.item.phrase ? repeatItem.item.accepts : undefined,
      })),
      repeatItem.item.tapOptions.length,
    )

    return (
      <>
        <div
          className="pop-in"
          style={{ fontSize: 'clamp(56px, 16vw, 88px)', textAlign: 'center', lineHeight: 1 }}
          aria-hidden="true"
        >
          {repeatItem.item.emoji}
        </div>
        <Coach
          line={`Repeat with me. ${repeatItem.item.phrase}.`}
          cue={repeatItem.item.id}
        />
        <AnswerPad
          key={repeatItem.item.id}
          choices={choices}
          modelPhrase={repeatItem.item.phrase}
          onAnswer={onRepeat}
        />
      </>
    )
  }

  return (
    <CoachChat
      profile={profile}
      onDone={(voiceAnswers) => {
        tally.current.voiceAnswers += voiceAnswers
        onDone(tally.current)
      }}
    />
  )
}
