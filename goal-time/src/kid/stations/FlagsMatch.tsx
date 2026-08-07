import { useMemo, useRef, useState } from 'react'
import { AnswerPad, type PadChoice } from '../../components/AnswerPad'
import { Coach } from '../../components/Coach'
import { TEAMS, type Team } from '../../content/flags'
import { pickN, sampleContent } from '../../lib/mastery'
import { ROUNDS, type StationProps } from './types'

/** Flags Match — Coach names a country, the child says it back or taps its flag. */
export function FlagsMatch({ progress, served, onServed, onAnswer, onDone }: StationProps) {
  const rounds = useMemo(() => {
    const picked = sampleContent<Team>(TEAMS, progress, ROUNDS, served)
    onServed(picked.map((p) => p.item.id))
    return picked.map((p) => {
      const others = pickN(
        TEAMS.filter((t) => t.id !== p.item.id),
        2,
      )
      const choices: PadChoice[] = [
        {
          label: p.item.country,
          emoji: p.item.flag,
          correct: true,
          accepts: [p.item.country, `it is ${p.item.country}`, `the ${p.item.country} flag`],
        },
        ...others.map((t) => ({ label: t.country, emoji: t.flag, correct: false })),
      ]
      return { ...p, choices: pickN(choices, choices.length) }
    })
    // Rounds are drawn once when the station opens.
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
      <div className="pips" aria-label={`Question ${index + 1} of ${rounds.length}`}>
        {rounds.map((_, i) => (
          <span
            key={i}
            className="pip"
            data-state={i < index ? 'done' : i === index ? 'current' : 'todo'}
          />
        ))}
      </div>

      <Coach
        line={`Which flag is ${round.item.country}?`}
        cue={round.item.id}
        emoji="🚩"
      />

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 10,
          fontSize: 40,
        }}
        aria-hidden="true"
      >
        <span
          className="float"
          style={{
            width: 62,
            height: 62,
            borderRadius: 14,
            display: 'grid',
            placeContent: 'center',
            background: `linear-gradient(150deg, ${round.item.kit[0]}, ${round.item.kit[1]})`,
            boxShadow: 'var(--shadow-card)',
          }}
        >
          👕
        </span>
      </div>

      <AnswerPad
        key={round.item.id}
        choices={round.choices}
        modelPhrase={round.item.country}
        onAnswer={handle}
      />
    </>
  )
}
