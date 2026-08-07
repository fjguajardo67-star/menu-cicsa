import { useMemo, useRef, useState } from 'react'
import { AnswerPad, type PadChoice } from '../../components/AnswerPad'
import { Coach } from '../../components/Coach'
import { COUNT_ITEMS, type CountItem } from '../../content/counting'
import { pickN, sampleContent } from '../../lib/mastery'
import { ROUNDS, type StationProps } from './types'

const NUMBER_WORDS = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
  'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen',
]

const numberChoice = (n: number, correct: boolean): PadChoice => ({
  label: String(n),
  emoji: undefined,
  correct,
  accepts: correct ? [String(n), NUMBER_WORDS[n] ?? String(n)] : undefined,
})

/** Count the Goals — counting aloud is the rewarded path. */
export function CountGoals({ progress, served, onServed, onAnswer, onDone }: StationProps) {
  const rounds = useMemo(() => {
    const picked = sampleContent<CountItem>(COUNT_ITEMS, progress, ROUNDS, served)
    onServed(picked.map((p) => p.item.id))
    return picked.map((p) => {
      const wrong = new Set<number>()
      while (wrong.size < 2) {
        const delta = Math.floor(Math.random() * 5) - 2
        const candidate = p.item.answer + (delta === 0 ? 3 : delta)
        if (candidate > 0 && candidate !== p.item.answer) wrong.add(candidate)
      }
      const choices = pickN(
        [
          numberChoice(p.item.answer, true),
          ...[...wrong].map((n) => numberChoice(n, false)),
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

      <Coach line={round.item.prompt} cue={round.item.id} />

      <div style={{ display: 'grid', gap: 10, justifyItems: 'center' }}>
        {round.item.rows.map((row, r) => (
          <div key={r} style={{ display: 'grid', gap: 8, justifyItems: 'center' }}>
            {r > 0 && (
              <span
                style={{ fontFamily: 'var(--display)', fontSize: 26, color: 'var(--gold)' }}
                aria-hidden="true"
              >
                +
              </span>
            )}
            <div
              className="stagger"
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 6,
                justifyContent: 'center',
                maxWidth: 'min(92vw, 460px)',
                fontSize: 'clamp(26px, 7vw, 38px)',
              }}
              aria-label={`${row.length} items`}
            >
              {row.map((e, i) => (
                <span key={i} aria-hidden="true">
                  {e}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <AnswerPad
        key={round.item.id}
        choices={round.choices}
        modelPhrase={NUMBER_WORDS[round.item.answer] ?? String(round.item.answer)}
        onAnswer={handle}
      />
    </>
  )
}
