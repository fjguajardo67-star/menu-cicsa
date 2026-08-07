import { useEffect, useMemo, useRef, useState } from 'react'
import { AnswerPad, type PadChoice } from '../../components/AnswerPad'
import { Coach } from '../../components/Coach'
import { STORIES, fillName, type Story } from '../../content/stories'
import { pickN, sampleContent } from '../../lib/mastery'
import { speak } from '../../lib/speech'
import type { StationProps } from './types'

type Stage = 'reading' | 'questions'

/** Story Bench — Coach reads aloud, then asks. Answers are pictures. */
export function StoryBench({
  profile,
  progress,
  served,
  onServed,
  onAnswer,
  onDone,
}: StationProps) {
  const story = useMemo(() => {
    const [picked] = sampleContent<Story>(STORIES, progress, 1, served)
    onServed([picked.item.id])
    return picked
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [stage, setStage] = useState<Stage>('reading')
  const [line, setLine] = useState(0)
  const [qIndex, setQIndex] = useState(0)
  const tally = useRef({ stars: 0, voiceAnswers: 0 })

  const lines = story.item.lines.map((l) => fillName(l, profile.name))

  // Read the story one sentence at a time, at Coach's slow pace.
  useEffect(() => {
    if (stage !== 'reading') return
    let cancelled = false
    const run = async () => {
      await speak(lines[line], { rate: 0.8 })
      if (cancelled) return
      if (line + 1 < lines.length) setLine((n) => n + 1)
      else window.setTimeout(() => !cancelled && setStage('questions'), 500)
    }
    void run()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, line])

  const questions = story.item.questions
  const question = questions[qIndex]

  const handle = (correct: boolean, viaVoice: boolean) => {
    onAnswer(story.item.id, correct)
    if (correct && story.paysStars) tally.current.stars = 1
    if (correct && viaVoice) tally.current.voiceAnswers += 1
    if (qIndex + 1 >= questions.length) onDone(tally.current)
    else setQIndex(qIndex + 1)
  }

  if (stage === 'reading') {
    return (
      <>
        <div
          className="pop-in"
          style={{ fontSize: 'clamp(60px, 17vw, 96px)', textAlign: 'center', lineHeight: 1 }}
          aria-hidden="true"
        >
          {story.item.emoji}
        </div>
        <h2
          style={{
            fontFamily: 'var(--display)',
            fontSize: 'clamp(21px, 5.4vw, 28px)',
            textAlign: 'center',
            margin: 0,
          }}
        >
          {story.item.title}
        </h2>

        <div className="stagger" style={{ display: 'grid', gap: 10, marginTop: 8 }}>
          {lines.slice(0, line + 1).map((l, i) => (
            <p
              key={i}
              style={{
                margin: 0,
                fontSize: 'clamp(17px, 4.4vw, 22px)',
                fontWeight: 800,
                lineHeight: 1.4,
                textAlign: 'center',
                opacity: i === line ? 1 : 0.55,
                transition: 'opacity var(--t-panel) var(--ease-out)',
              }}
            >
              {l}
            </p>
          ))}
        </div>

        <div style={{ marginTop: 'auto', display: 'grid', justifyItems: 'center' }}>
          <button className="cta ghost press" onClick={() => setStage('questions')} type="button">
            Skip to questions →
          </button>
        </div>
      </>
    )
  }

  const choices: PadChoice[] = pickN(
    question.options.map((o, i) => ({
      label: o.label,
      emoji: o.emoji,
      correct: i === question.answerIndex,
      accepts: i === question.answerIndex ? [o.label] : undefined,
    })),
    question.options.length,
  )

  return (
    <>
      <div className="pips">
        {questions.map((_, i) => (
          <span
            key={i}
            className="pip"
            data-state={i < qIndex ? 'done' : i === qIndex ? 'current' : 'todo'}
          />
        ))}
      </div>

      <Coach
        line={fillName(question.q, profile.name)}
        cue={`${story.item.id}-${qIndex}`}
      />

      <AnswerPad
        key={`${story.item.id}-${qIndex}`}
        choices={choices}
        modelPhrase={question.options[question.answerIndex].label}
        onAnswer={handle}
      />
    </>
  )
}
