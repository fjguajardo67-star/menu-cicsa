import { useMemo, useRef, useState } from 'react'
import { AnswerPad, type PadChoice } from '../../components/AnswerPad'
import { Coach } from '../../components/Coach'
import { MANNERS_ITEMS, type MannersItem } from '../../content/manners'
import { pickN, sampleContent } from '../../lib/mastery'
import type { StationProps } from './types'

const ROUNDS = 2

/**
 * Fair Play.
 *
 * The point of this field is what the child *says*, so the correct picture
 * carries a spoken phrase and the mic is the rewarded way to answer.
 */
export function FairPlay({ progress, served, onServed, onAnswer, onDone }: StationProps) {
  const rounds = useMemo(() => {
    const picked = sampleContent<MannersItem>(MANNERS_ITEMS, progress, ROUNDS, served)
    onServed(picked.map((p) => p.item.id))
    return picked.map((p) => {
      const choices: PadChoice[] = pickN(
        [
          {
            label: p.item.answer.label,
            emoji: p.item.answer.emoji,
            correct: true,
            accepts: [p.item.answer.label, p.item.answer.say],
          },
          ...p.item.distractors.map((d) => ({
            label: d.label,
            emoji: d.emoji,
            correct: false,
          })),
        ],
        3,
      )
      return { ...p, choices }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [index, setIndex] = useState(0)
  const tally = useRef({ stars: 0, voiceAnswers: 0 })
  const round = rounds[index]

  if (!round) return null

  const handle = (correct: boolean, viaVoice: boolean) => {
    onAnswer(round.item.id, correct)
    if (correct && round.paysStars) tally.current.stars = 1
    if (correct && viaVoice) tally.current.voiceAnswers += 1
    if (index + 1 >= rounds.length) onDone(tally.current)
    else setIndex(index + 1)
  }

  return (
    <>
      <div className="pips">
        {rounds.map((_, i) => (
          <span
            key={i}
            className="pip"
            data-state={i < index ? 'done' : i === index ? 'current' : 'todo'}
          />
        ))}
      </div>

      <div
        className="pop-in"
        style={{ fontSize: 'clamp(56px, 16vw, 90px)', textAlign: 'center', lineHeight: 1 }}
        aria-hidden="true"
      >
        {round.item.emoji}
      </div>

      <Coach line={round.item.scene} cue={round.item.id} />

      <AnswerPad
        key={round.item.id}
        choices={round.choices}
        modelPhrase={round.item.answer.say}
        onAnswer={handle}
      />
    </>
  )
}
