import { useEffect, useState } from 'react'
import { KidHome } from './kid/KidHome'
import { MatchDay } from './kid/MatchDay'
import { WatchTime } from './kid/WatchTime'
import { setMuted, unlockAudio } from './lib/sfx'
import { unlock } from './lib/speech'
import { useStore } from './lib/store'
import { Onboarding } from './onboarding/Onboarding'
import { ParentMode } from './parent/ParentMode'
import { PinGate } from './parent/PinGate'

type Screen = 'home' | 'match' | 'watch' | 'pin' | 'office' | 'picker'

export function App() {
  const { state, dispatch, profile, economy } = useStore()
  const [screen, setScreen] = useState<Screen>('home')

  // Keep the sfx mute flag in step with the active child's setting.
  useEffect(() => {
    setMuted(economy.muted)
  }, [economy.muted])

  /**
   * iPad Safari will not speak or play audio until synthesis has been
   * touched inside a real user gesture. One listener on the first tap of
   * the session covers the whole app.
   */
  useEffect(() => {
    const arm = () => {
      unlock()
      unlockAudio()
    }
    window.addEventListener('pointerdown', arm, { once: true })
    window.addEventListener('keydown', arm, { once: true })
    return () => {
      window.removeEventListener('pointerdown', arm)
      window.removeEventListener('keydown', arm)
    }
  }, [])

  if (!state.onboarded || state.profiles.length === 0) return <Onboarding />

  if (screen === 'pin') {
    return (
      <PinGate
        expectedHash={state.pinHash}
        onPass={() => setScreen('office')}
        onCancel={() => setScreen('home')}
      />
    )
  }

  if (screen === 'office') return <ParentMode onExit={() => setScreen('home')} />

  if (!profile) return null

  // Profile picker only exists when there is more than one child.
  if (screen === 'picker') {
    return (
      <div className="kid-root">
        <div
          className="pitch"
          style={{ alignItems: 'center', justifyContent: 'center', gap: 24, padding: 24 }}
        >
          <h1
            style={{
              fontFamily: 'var(--display)',
              fontSize: 'clamp(26px, 7vw, 38px)',
              textAlign: 'center',
              margin: 0,
            }}
          >
            Who is playing?
          </h1>
          <div className="profile-grid stagger">
            {state.profiles.map((p) => (
              <button
                key={p.id}
                className="profile-card press"
                onClick={() => {
                  dispatch({ type: 'setActiveProfile', id: p.id })
                  setScreen('home')
                }}
                type="button"
              >
                <span className="face" aria-hidden="true">
                  {p.avatar}
                </span>
                <span className="name">{p.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="kid-root">
      {/* Keyed fade so screen changes never teleport. Opacity only — fixed
          overlays (payout, celebrations, toasts) stay viewport-anchored. */}
      <div key={screen} className="fade-in">
      {screen === 'home' && (
        <>
          <KidHome
            profile={profile}
            onTrain={() => setScreen('match')}
            onWatch={() => setScreen('watch')}
            onOffice={() => setScreen('pin')}
          />
          {state.profiles.length > 1 && (
            <button
              className="office-key press"
              style={{ top: 'auto', bottom: 'calc(8px + env(safe-area-inset-bottom))' }}
              onClick={() => setScreen('picker')}
              aria-label="Switch player"
              type="button"
            >
              {profile.avatar}
            </button>
          )}
        </>
      )}

      {screen === 'match' && <MatchDay profile={profile} onExit={() => setScreen('home')} />}
      {screen === 'watch' && <WatchTime profile={profile} onExit={() => setScreen('home')} />}
      </div>
    </div>
  )
}
