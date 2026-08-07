import { Card, Stat, clock } from '../components/Bits'
import { ART_PROMPTS } from '../content/art'
import { COUNT_ITEMS } from '../content/counting'
import { LISTEN_ITEMS, REPEAT_ITEMS } from '../content/english'
import { TEAMS } from '../content/flags'
import { LETTER_ITEMS } from '../content/letters'
import { MANNERS_ITEMS } from '../content/manners'
import { STORIES } from '../content/stories'
import { dayLogs } from '../lib/economy'
import { masteryPercent, progressFor } from '../lib/mastery'
import { useStore } from '../lib/store'
import {
  FIELD_ICON,
  FIELD_LABEL,
  SKILL_FIELDS,
  emptyEnglish,
  type Profile,
  type SkillField,
} from '../lib/types'

const POOL_SIZE: Record<SkillField, number> = {
  flags: TEAMS.length,
  counting: COUNT_ITEMS.length,
  letters: LETTER_ITEMS.length,
  story: STORIES.length,
  art: ART_PROMPTS.length,
  fairplay: MANNERS_ITEMS.length,
  english: LISTEN_ITEMS.length + REPEAT_ITEMS.length,
}

/** Progress — mastery, the English report, transcripts, history, gallery. */
export function Progress({ profile }: { profile: Profile }) {
  const { state } = useStore()
  const progress = state.progress[profile.id] ?? []
  const english = state.english[profile.id] ?? emptyEnglish()
  const logs = dayLogs(state, profile.id, 30)
  const chats = state.chats.filter((c) => c.profileId === profile.id).slice().reverse()
  const drawings = state.drawings.filter((d) => d.profileId === profile.id).slice().reverse()

  const accuracy = (attempts: number, hits: number) =>
    attempts === 0 ? '—' : `${Math.round((hits / attempts) * 100)}%`

  return (
    <div className="panel">
      <Card title="Skill mastery" hint="a bar fills as content retires for good">
        <div className="mastery">
          {SKILL_FIELDS.map((field) => {
            const p = progressFor(progress, field)
            const pct = masteryPercent(p, POOL_SIZE[field])
            return (
              <div className="mastery-row" key={field}>
                <div className="top">
                  <span>
                    {FIELD_ICON[field]} {FIELD_LABEL[field]}
                  </span>
                  <span className="lvl">
                    Level {p.level} · {pct}% · {accuracy(p.attempts, p.hits)}
                  </span>
                </div>
                <div className="bar">
                  <i style={{ ['--p' as string]: pct / 100 }} />
                </div>
              </div>
            )
          })}
        </div>
        <p className="help" style={{ marginTop: 12 }}>
          Content retires after two correct answers in a row and then stops paying stars, so
          the same easy task can never be farmed. As items retire, the level rises and harder
          content is sampled.
        </p>
      </Card>

      <Card title="English report">
        <div className="stat-row">
          <Stat n={english.wordsMastered.length} k="words mastered" tone="accent" />
          <Stat n={english.phrasesSaid.length} k="phrases said" tone="good" />
          <Stat n={english.micAttempts} k="mic attempts" />
          <Stat
            n={
              english.micAttempts
                ? `${Math.round((english.micFirstTry / english.micAttempts) * 100)}%`
                : '—'
            }
            k="first try"
            tone="gold"
          />
        </div>

        {english.wordsMastered.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <h2>Words</h2>
            <div className="chips">
              {english.wordsMastered.map((w) => (
                <span className="chip" data-on key={w}>
                  {w}
                </span>
              ))}
            </div>
          </div>
        )}

        {english.phrasesSaid.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <h2>Phrases</h2>
            <div className="list">
              {english.phrasesSaid.slice(-14).reverse().map((p) => (
                <div className="list-item" key={p}>
                  <span className="glyph" aria-hidden="true">
                    🗣️
                  </span>
                  <span className="grow">
                    <strong>{p}</strong>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {english.tapFallbacks > 0 && (
          <p className="help" style={{ marginTop: 12 }}>
            {english.tapFallbacks} answer{english.tapFallbacks > 1 ? 's' : ''} fell back to
            tapping because the microphone was unavailable.
          </p>
        )}
      </Card>

      <Card title={`Coach chat transcripts (${chats.length})`} hint="every word, always visible">
        {chats.length === 0 ? (
          <p className="help" style={{ margin: 0 }}>
            No conversations yet. Coach Chat runs at the end of every English Academy station.
          </p>
        ) : (
          <div className="list">
            {chats.slice(0, 20).map((c) => (
              <details className="transcript" key={c.id}>
                <summary>
                  {new Date(c.startedAt).toLocaleString()} · {c.turns.length} turns ·{' '}
                  {c.engine === 'api' ? 'Anthropic API' : 'offline script'}
                </summary>
                <div className="turns">
                  {c.turns.map((t, i) => (
                    <div className={`turn ${t.role}`} key={i}>
                      <span className="who">
                        {t.role === 'coach' ? 'Coach' : profile.name}
                        {t.spoken ? ' · spoke' : ''}
                      </span>
                      {t.text}
                    </div>
                  ))}
                </div>
              </details>
            ))}
          </div>
        )}
      </Card>

      <Card title="Day by day">
        {logs.length === 0 ? (
          <p className="help" style={{ margin: 0 }}>
            Nothing logged yet.
          </p>
        ) : (
          <div className="table-scroll">
            <table className="log-table">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Match</th>
                  <th>Watched</th>
                  <th>Earned</th>
                  <th>Saved</th>
                  <th>Traded</th>
                  <th>🥇</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.day}>
                    <td>{l.day.slice(5)}</td>
                    <td>{l.questWon ? '🏆' : '—'}</td>
                    <td>{clock(l.minutesWatched)}</td>
                    <td>{l.starsEarned}</td>
                    <td>{l.starsSaved}</td>
                    <td>{l.starsTraded}</td>
                    <td>{l.goldenBalls || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card title={`Drawings (${drawings.length})`}>
        {drawings.length === 0 ? (
          <p className="help" style={{ margin: 0 }}>
            Nothing yet. Finished drawings from Art Corner land here.
          </p>
        ) : (
          <div className="gallery">
            {drawings.slice(0, 24).map((d) => (
              <figure key={d.id}>
                <img src={d.image} alt={d.prompt} loading="lazy" />
                <figcaption>
                  {d.prompt}
                  <br />
                  {new Date(d.at).toLocaleDateString()}
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
