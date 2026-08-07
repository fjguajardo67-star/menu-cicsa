import { Card, Stat, clock } from '../components/Bits'
import { todayKey } from '../lib/db'
import {
  goldenBallCount,
  minutesWatchedOn,
  pendingStars,
  starBalance,
  watchStatus,
  weeklyBonusUsed,
} from '../lib/economy'
import { sfx } from '../lib/sfx'
import { useStore } from '../lib/store'
import type { Profile } from '../lib/types'

interface TabProps {
  profile: Profile
}

/**
 * Today — the tab a parent actually opens. Status, the day's numbers, the
 * pending honor claims, and the two award buttons, which sit front and
 * centre because special awards happen in the moment or not at all.
 */
export function Today({ profile }: TabProps) {
  const { state, dispatch, economy } = useStore()
  const day = todayKey()
  const quest = state.quests[`${profile.id}:${day}`]
  const status = watchStatus(state, profile.id, day)

  const earnedToday =
    Math.round(
      state.starEvents
        .filter(
          (e) => e.profileId === profile.id && e.day === day && !e.pending && !e.declined,
        )
        .reduce((n, e) => n + e.amount, 0) * 100,
    ) / 100

  const claims = state.starEvents.filter(
    (e) => e.profileId === profile.id && e.pending && !e.declined,
  )

  const bonusUsed = weeklyBonusUsed(state, profile.id, day)
  const capPct = economy.weeklyCapOverride
    ? 100
    : Math.min(100, (bonusUsed / Math.max(1, economy.weeklyBonusCapMinutes)) * 100)

  const award = (amount: number, golden: boolean) => {
    if (golden) sfx.golden()
    else sfx.star()
    dispatch({
      type: 'award',
      profileId: profile.id,
      amount,
      source: golden ? 'golden' : 'parent',
      golden,
      note: golden ? 'Golden Ball' : 'Awarded by parent',
    })
  }

  return (
    <div className="panel">
      <Card title="Award right now">
        <div className="award-row">
          <button className="award-button star" onClick={() => award(1, false)} type="button">
            <span aria-hidden="true">⭐</span> +1 Star
          </button>
          <button
            className="award-button golden"
            onClick={() => award(economy.goldenBallStars, true)}
            type="button"
          >
            <span aria-hidden="true">🥇</span> Golden Ball
          </button>
        </div>
        <p className="help" style={{ marginTop: 10 }}>
          A Golden Ball is worth {economy.goldenBallStars}⭐ and has no fixed trigger — it is
          your judgment for something exceptional. It gets the biggest celebration in the app.
        </p>
      </Card>

      <Card title="Today" hint={day}>
        <div className="stat-row">
          <Stat n={earnedToday} k="stars today" tone="gold" />
          <Stat n={starBalance(state, profile.id)} k="stars to spend" />
          <Stat n={goldenBallCount(state, profile.id)} k="golden balls" tone="gold" />
          <Stat
            n={quest ? `${quest.stations.filter((s) => s.done).length}/${quest.stations.length}` : '—'}
            k="stations"
            tone={quest?.won ? 'good' : undefined}
          />
        </div>

        <div className="stat-row" style={{ marginTop: 10 }}>
          <Stat n={clock(minutesWatchedOn(state, profile.id, day))} k="watched" />
          <Stat n={clock(status.left)} k="left today" tone="accent" />
          <Stat n={clock(status.allowance)} k="allowance" />
        </div>

        <div style={{ marginTop: 14 }}>
          <div className="row between" style={{ fontSize: 13, marginBottom: 6 }}>
            <strong>Weekly bonus minutes</strong>
            <span style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--ink-dim)' }}>
              {bonusUsed} / {economy.weeklyCapOverride ? '∞' : economy.weeklyBonusCapMinutes} min
            </span>
          </div>
          <div className="bar gold">
            <i style={{ width: `${capPct}%` }} />
          </div>
          {economy.weeklyCapOverride && (
            <p className="help" style={{ marginTop: 6, color: 'var(--warn)' }}>
              Override is ON — the cap is not being enforced this week.
            </p>
          )}
        </div>

        {quest?.won ? (
          <div className="notice info" style={{ marginTop: 14 }}>
            <strong>Match won.</strong>
            Watch Time is unlocked
            {status.inWindow ? '.' : ` but the viewing window is closed right now.`}
          </div>
        ) : (
          <div className="notice warn" style={{ marginTop: 14 }}>
            <strong>Match not finished.</strong>
            {economy.questGate
              ? ' Watch Time is locked until every station is done.'
              : ' The quest gate is off, so Watch Time is already available.'}
          </div>
        )}
      </Card>

      <Card title={`Honor claims (${claims.length})`} hint="“I stopped on time!”">
        {claims.length === 0 ? (
          <p className="help" style={{ margin: 0 }}>
            Nothing waiting. When your child taps “I stopped on time!”, the star lands here
            greyed out until you confirm it.
          </p>
        ) : (
          <div className="list">
            {claims.map((c) => (
              <div className="claim" key={c.id}>
                <span style={{ fontSize: 22 }} aria-hidden="true">
                  🏅
                </span>
                <div className="grow" style={{ flex: 1 }}>
                  <strong style={{ display: 'block', fontSize: 14 }}>
                    {c.note ?? 'Stopped on time'}
                  </strong>
                  <span style={{ fontSize: 12, color: 'var(--ink-faint)' }}>
                    {new Date(c.at).toLocaleString()} — {c.amount}⭐
                  </span>
                </div>
                <button
                  className="btn ok small"
                  onClick={() => dispatch({ type: 'resolveHonor', eventId: c.id, confirm: true })}
                  type="button"
                >
                  Confirm
                </button>
                <button
                  className="btn ghost small"
                  onClick={() =>
                    dispatch({ type: 'resolveHonor', eventId: c.id, confirm: false })
                  }
                  type="button"
                >
                  Decline
                </button>
              </div>
            ))}
          </div>
        )}
        {pendingStars(state, profile.id) > 0 && (
          <p className="help" style={{ marginTop: 10 }}>
            {pendingStars(state, profile.id)}⭐ pending — shown grey in your child’s count until
            you decide.
          </p>
        )}
      </Card>

      <Card title="Log a task">
        <div className="list">
          {(state.tasks[profile.id] ?? [])
            .filter((t) => !t.retired)
            .map((t) => (
              <button
                key={t.id}
                className="list-item press"
                style={{ textAlign: 'left', width: '100%' }}
                onClick={() => {
                  sfx.star()
                  dispatch({
                    type: 'award',
                    profileId: profile.id,
                    amount: t.stars,
                    source: 'chore',
                    note: t.label,
                  })
                }}
                type="button"
              >
                <span className="glyph" aria-hidden="true">
                  {t.emoji}
                </span>
                <span className="grow">
                  <strong>{t.label}</strong>
                </span>
                <span style={{ color: 'var(--warn)', fontWeight: 800 }}>+{t.stars}⭐</span>
              </button>
            ))}
        </div>
        <p className="help" style={{ marginTop: 10 }}>
          Edit this list in Tasks &amp; Rewards to target what your child needs support with
          right now.
        </p>
      </Card>
    </div>
  )
}
