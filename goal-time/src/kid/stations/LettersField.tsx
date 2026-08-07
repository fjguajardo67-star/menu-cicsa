import { useMemo, useRef, useState } from 'react'
import { AnswerPad, type PadChoice } from '../../components/AnswerPad'
import { Coach } from '../../components/Coach'
import { LETTER_ITEMS, type LetterItem } from '../../content/letters'
import { pickN, sampleContent } from '../../lib/mastery'
import { ROUNDS, type StationProps } from './types'

/** Letters Field — letter recognition first, then whole first words. */
export function LettersField({ progress, served, onServed, onAnswer, onDone }: StationProps) {
  const rounds = useMemo(() => {
    const picked = sampleContent<LetterItem>(LETTER_ITEMS, progress, ROUNDS, served)
    onServed(picked.map((p) => p.item.id))
    return picked.map((p) => {
      const choices: PadChoice[] = pickN(
        [
          { label: p.item.answer, correct: true, accepts: [p.item.answer] },
          ...pickN(p.item.distractors, 2).map((d) => ({ label: d, correct: false })),
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

      <Coach line={round.item.prompt} cue={round.item.id} emoji="🔤" />

      <div
        className="pop-in"
        style={{ fontSize: 'clamp(64px, 19vw, 108px)', textAlign: 'center', lineHeight: 1 }}
        aria-hidden="true"
      >
        {round.item.emoji}
      </div>

      <AnswerPad
        key={round.item.id}
        choices={round.choices}
        modelPhrase={round.item.answer}
        onAnswer={handle}
      />
    </>
  )
}
