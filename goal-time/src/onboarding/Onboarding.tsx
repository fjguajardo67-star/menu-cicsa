import { useState } from 'react'
import { Ball, Mic, StarInline } from '../components/art'
import { SwitchRow, parseTime, timeLabel } from '../components/Bits'
import { hashPin, uid } from '../lib/db'
import { sfx } from '../lib/sfx'
import { requestMic, speak, unlock } from '../lib/speech'
import { useStore } from '../lib/store'
import { DEFAULT_ECONOMY, type Profile, type ThemeId } from '../lib/types'

const INTERESTS = [
  'soccer', 'trucks', 'dinosaurs', 'space', 'animals', 'drawing',
  'music', 'building', 'superheroes', 'cooking',
]

const AVATARS = ['⚽', '🦖', '🚚', '🚀', '🦁', '🐯', '🐼', '🦄', '🐙', '🦊']

const themeFor = (interests: string[]): ThemeId => {
  if (interests.includes('space')) return 'space'
  if (interests.includes('dinosaurs')) return 'dino'
  return 'soccer'
}

/**
 * First run. Four steps, no accounts, no server: a PIN, a child, the star
 * economy, and a short honest note about what the app does and does not do.
 */
export function Onboarding() {
  const { dispatch } = useStore()
  const [step, setStep] = useState(0)

  const [pin, setPin] = useState('')
  const [pin2, setPin2] = useState('')
  const [pinError, setPinError] = useState('')

  const [name, setName] = useState('')
  const [age, setAge] = useState(5)
  const [avatar, setAvatar] = useState(AVATARS[0])
  const [interests, setInterests] = useState<string[]>(['soccer'])

  const [economy, setEconomy] = useState({ ...DEFAULT_ECONOMY })
  const [micNote, setMicNote] = useState('')

  const next = () => {
    sfx.tap()
    setStep((s) => s + 1)
  }

  const savePin = async () => {
    if (!/^\d{4}$/.test(pin)) {
      setPinError('The PIN must be four digits.')
      return
    }
    if (pin !== pin2) {
      setPinError('Those two PINs are different.')
      return
    }
    setPinError('')
    dispatch({ type: 'setPin', hash: await hashPin(pin) })
    next()
  }

  const finish = () => {
    const profile: Profile = {
      id: uid('kid'),
      name: name.trim() || 'Champion',
      age,
      interests,
      theme: themeFor(interests),
      avatar,
      createdAt: new Date().toISOString(),
    }
    dispatch({ type: 'addProfile', profile })
    dispatch({ type: 'setEconomy', profileId: profile.id, patch: economy })
    dispatch({ type: 'setActiveProfile', id: profile.id })
    dispatch({ type: 'finishOnboarding' })
    // The first tap of the session is what unlocks audio on iPad Safari.
    unlock()
    void speak(`Welcome to Goal Time, ${profile.name}!`)
  }

  return (
    <div className="parent-root">
      <div className="onboard">
        <div className="steps" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <i key={i} data-on={i <= step} />
          ))}
        </div>

        {step === 0 && (
          <div className="rise-in" style={{ display: 'grid', gap: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'center' }} aria-hidden="true">
              <Ball size={72} />
            </div>
            <h1>GOAL TIME</h1>
            <p className="lede">
              A learning app that <strong>pays out</strong> screen time. Your child trains
              first — flags, counting, letters, stories, manners and spoken English — and
              winning the daily match is what unlocks watching.
            </p>
            <div className="notice info">
              <strong>Everything stays on this device.</strong>
              No accounts, no server, no analytics. The only thing that can ever leave is
              your child’s first name and age, and only if you turn on Coach Chat with your
              own Anthropic API key.
            </div>
            <p className="lede">
              The whole interface is in simple English on purpose — the app itself is the
              immersion.
            </p>
            <button className="btn" onClick={next} type="button">
              Let’s set up →
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="rise-in" style={{ display: 'grid', gap: 16 }}>
            <h1>Your PIN</h1>
            <p className="lede">
              Four digits to open the Manager’s Office. This keeps a curious five-year-old
              out of the settings — it is not a lock against an adult with the device.
            </p>
            <div className="card">
              <div className="field">
                <label htmlFor="pin1">Choose a 4-digit PIN</label>
                <input
                  id="pin1"
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  autoComplete="new-password"
                />
              </div>
              <div className="field">
                <label htmlFor="pin2">Type it again</label>
                <input
                  id="pin2"
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={pin2}
                  onChange={(e) => setPin2(e.target.value.replace(/\D/g, ''))}
                  autoComplete="new-password"
                />
              </div>
              {pinError && <div className="notice danger">{pinError}</div>}
            </div>
            <button className="btn" onClick={savePin} type="button">
              Save PIN →
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="rise-in" style={{ display: 'grid', gap: 16 }}>
            <h1>Who is playing?</h1>
            <p className="lede">
              The name and age personalise everything: Coach greets by name, stories star
              your child, and the tasks calibrate to their age.
            </p>

            <div className="card">
              <div className="field">
                <label htmlFor="kidname">First name</label>
                <input
                  id="kidname"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tomás"
                  autoComplete="off"
                />
              </div>

              <div className="field">
                <label htmlFor="kidage">Age: {age}</label>
                <input
                  id="kidage"
                  type="range"
                  min={3}
                  max={10}
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                />
              </div>

              <div className="field">
                <label>Pick a badge</label>
                <div className="avatar-picker">
                  {AVATARS.map((a) => (
                    <button
                      key={a}
                      className="avatar-option"
                      data-on={a === avatar}
                      onClick={() => setAvatar(a)}
                      type="button"
                      aria-label={`Badge ${a}`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              <div className="field">
                <label>What do they love?</label>
                <p className="help">
                  Interests flavour the content and pick the theme. Soccer is the launch
                  theme; the structure is the same whichever you choose.
                </p>
                <div className="chips">
                  {INTERESTS.map((tag) => (
                    <button
                      key={tag}
                      className="chip"
                      data-on={interests.includes(tag)}
                      onClick={() =>
                        setInterests((cur) =>
                          cur.includes(tag) ? cur.filter((t) => t !== tag) : [...cur, tag],
                        )
                      }
                      type="button"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button className="btn" onClick={next} disabled={!name.trim()} type="button">
              Next →
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="rise-in" style={{ display: 'grid', gap: 16 }}>
            <h1>The star economy</h1>
            <p className="lede">These are the defaults. Everything is editable later in Plan.</p>

            <div className="card">
              <div className="field">
                <label>Exchange rate</label>
                <div className="row">
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={economy.starsPerBlock}
                    onChange={(e) =>
                      setEconomy({ ...economy, starsPerBlock: Number(e.target.value) || 1 })
                    }
                    style={{ width: 80 }}
                  />
                  <span>
                    <StarInline /> =
                  </span>
                  <input
                    type="number"
                    min={5}
                    max={60}
                    step={5}
                    value={economy.minutesPerBlock}
                    onChange={(e) =>
                      setEconomy({ ...economy, minutesPerBlock: Number(e.target.value) || 5 })
                    }
                    style={{ width: 90 }}
                  />
                  <span>minutes</span>
                </div>
              </div>

              <div className="field">
                <label htmlFor="base">Base minutes every day: {economy.baseDailyMinutes}</label>
                <input
                  id="base"
                  type="range"
                  min={0}
                  max={60}
                  step={5}
                  value={economy.baseDailyMinutes}
                  onChange={(e) =>
                    setEconomy({ ...economy, baseDailyMinutes: Number(e.target.value) })
                  }
                />
                <p className="help">Given regardless of stars, once the match is won.</p>
              </div>

              <div className="field">
                <label htmlFor="cap">
                  Weekly bonus cap: {economy.weeklyBonusCapMinutes} minutes
                </label>
                <input
                  id="cap"
                  type="range"
                  min={30}
                  max={60}
                  step={5}
                  value={economy.weeklyBonusCapMinutes}
                  onChange={(e) =>
                    setEconomy({ ...economy, weeklyBonusCapMinutes: Number(e.target.value) })
                  }
                />
                <p className="help">
                  The most bonus screen time that can ever be redeemed in a week. Stars beyond
                  the cap can only go to the wishlist.
                </p>
              </div>

              <div className="field">
                <label htmlFor="gb">
                  Golden Ball value: {economy.goldenBallStars} <StarInline />
                </label>
                <input
                  id="gb"
                  type="range"
                  min={1}
                  max={20}
                  value={economy.goldenBallStars}
                  onChange={(e) =>
                    setEconomy({ ...economy, goldenBallStars: Number(e.target.value) })
                  }
                />
                <p className="help">
                  Your award for exceptional acts. No fixed trigger — it is your judgment.
                </p>
              </div>

              <div className="field">
                <label>Viewing window</label>
                <div className="row">
                  <input
                    type="time"
                    value={timeLabel(economy.windowStart)}
                    onChange={(e) =>
                      setEconomy({ ...economy, windowStart: parseTime(e.target.value) })
                    }
                  />
                  <span>to</span>
                  <input
                    type="time"
                    value={timeLabel(economy.windowEnd)}
                    onChange={(e) =>
                      setEconomy({ ...economy, windowEnd: parseTime(e.target.value) })
                    }
                  />
                </div>
                <p className="help">
                  Outside these hours the Watch button stays locked even after a won match.
                  Set it to whenever screen time actually happens in your house.
                </p>
              </div>

              <SwitchRow
                on={economy.questGate}
                onChange={(v) => setEconomy({ ...economy, questGate: v })}
                title="Winning the match unlocks Watch Time"
                detail="The core of the app. Leave this on unless you have a reason not to."
              />
            </div>

            <div className="card">
              <h2>Microphone</h2>
              <p className="help" style={{ marginTop: 0 }}>
                Speaking is the rewarded way to answer. If you allow the mic now, your child
                never sees a permission prompt mid-quest. If you decline, every station is
                still fully playable by tapping.
              </p>
              <div className="row" style={{ marginTop: 12 }}>
                <button
                  className="btn ghost"
                  onClick={async () => {
                    unlock()
                    const ok = await requestMic()
                    setMicNote(
                      ok
                        ? 'Microphone allowed. Speaking answers will earn bonus stars.'
                        : 'No microphone. Every station still works by tapping.',
                    )
                  }}
                  type="button"
                >
                  <Mic size={15} style={{ verticalAlign: '-0.14em', marginRight: 6 }} />
                  Allow the microphone
                </button>
              </div>
              {micNote && (
                <div className="notice info" style={{ marginTop: 12 }}>
                  {micNote}
                </div>
            )}
            </div>

            <button className="btn ok" onClick={finish} type="button">
              Start playing
              <Ball size="1.05em" style={{ verticalAlign: '-0.18em', marginLeft: 8 }} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
