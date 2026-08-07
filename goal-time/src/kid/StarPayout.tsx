import { useEffect } from 'react'
import { Gift, KitBag, StarRow, SunIcon } from '../components/art'
import { todayKey } from '../lib/db'
import { activeWish, canTrade, minutesForStars, weeklyBonusRemaining } from '../lib/economy'
import { sfx } from '../lib/sfx'
import { speak } from '../lib/speech'
import { useStore } from '../lib/store'

interface StarPayoutProps {
  profileId: string
  childName: string
  stars: number
  onDone: () => void
}

/**
 * Every star payout ends here: save it for the prize, or trade it for
 * minutes. Saving is irreversible by design — there is no path in the app
 * that moves a saved star back out — and trading is refused outright when
 * it would push the week past the parent's bonus cap.
 */
export function StarPayout({ profileId, childName, stars, onDone }: StarPayoutProps) {
  const { state, dispatch, economy } = useStore()
  const day = todayKey()
  const wish = activeWish(state, profileId)
  const tradeOk = canTrade(state, profileId, stars, day)
  const remaining = weeklyBonusRemaining(state, profileId, day)
  const minutes = minutesForStars(economy, stars)

  useEffect(() => {
    sfx.star()
    void speak(
      `${childName}, you earned ${stars === 1 ? 'one star' : `${stars} stars`}! What will you do?`,
    )
  }, [childName, stars])

  const save = () => {
    sfx.tap()
    dispatch({ type: 'saveStars', profileId, stars })
    void speak(wish ? 'Saved for your prize!' : 'Kept in your bag!')
    onDone()
  }

  const trade = () => {
    sfx.unlock()
    dispatch({ type: 'tradeStars', profileId, stars })
    void speak(`${minutes} more minutes! Well done.`)
    onDone()
  }

  return (
    <div className="payout rise-in" role="dialog" aria-label="You earned stars">
      <div className="earned pop-in" aria-hidden="true">
        <StarRow count={Math.round(stars)} size="1em" />
      </div>
      <p
        style={{
          fontFamily: 'var(--display)',
          fontSize: 'clamp(22px, 6vw, 32px)',
          margin: 0,
          textAlign: 'center',
        }}
      >
        {stars === 1 ? 'One star!' : `${stars} stars!`}
      </p>

      <div className="payout-choices stagger">
        <button className="payout-choice save press" onClick={save} type="button">
          <span className="glyph" aria-hidden="true">
            {wish ? <Gift size={46} /> : <KitBag size={46} />}
          </span>
          <span>
            {wish ? 'Save for my prize' : 'Keep my stars'}
            {wish && (
              <small
                style={{
                  display: 'block',
                  fontFamily: 'var(--body)',
                  fontWeight: 800,
                  fontSize: 13,
                  opacity: 0.75,
                }}
              >
                {wish.name} — {wish.savedStars + stars}/{wish.priceStars}
              </small>
            )}
          </span>
        </button>

        <button
          className="payout-choice trade press"
          onClick={trade}
          disabled={!tradeOk}
          type="button"
        >
          <span className="glyph" aria-hidden="true">
            <SunIcon size={46} />
          </span>
          <span>
            Trade for minutes
            <small
              style={{
                display: 'block',
                fontFamily: 'var(--body)',
                fontWeight: 800,
                fontSize: 13,
                opacity: 0.75,
              }}
            >
              {tradeOk ? `+${minutes} minutes` : 'Full for this week'}
            </small>
          </span>
        </button>
      </div>

      {!tradeOk && (
        <p className="payout-note">
          Your minutes bag is full this week
          {Number.isFinite(remaining) ? ` (${remaining} min left)` : ''}. Save these stars for
          your prize!
        </p>
      )}
    </div>
  )
}
