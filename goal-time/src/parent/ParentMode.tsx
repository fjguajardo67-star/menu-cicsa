import { useState } from 'react'
import { TabGlyph } from '../components/art'
import { sfx } from '../lib/sfx'
import { useStore } from '../lib/store'
import { Catalog } from './Catalog'
import { Plan } from './Plan'
import { Progress } from './Progress'
import { TasksRewards } from './TasksRewards'
import { Today } from './Today'

const TABS = [
  { id: 'today', label: 'Today' },
  { id: 'plan', label: 'Plan' },
  { id: 'catalog', label: 'Catalog' },
  { id: 'rewards', label: 'Rewards' },
  { id: 'progress', label: 'Progress' },
] as const

type TabId = (typeof TABS)[number]['id']

/** The Manager's Office shell: five tabs and the way back to the pitch. */
export function ParentMode({ onExit }: { onExit: () => void }) {
  const { state, dispatch, profile } = useStore()
  const [tab, setTab] = useState<TabId>('today')

  if (!profile) return null

  return (
    <div className="parent-root">
      <header className="office-head">
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1>Manager’s Office</h1>
          <span className="who">
            {profile.avatar} {profile.name}, age {profile.age}
          </span>
        </div>

        {state.profiles.length > 1 && (
          <select
            value={profile.id}
            onChange={(e) => dispatch({ type: 'setActiveProfile', id: e.target.value })}
            aria-label="Choose a child"
            style={{ width: 'auto', minHeight: 40 }}
          >
            {state.profiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.avatar} {p.name}
              </option>
            ))}
          </select>
        )}

        <button
          className="exit-button press"
          onClick={() => {
            sfx.tap()
            onExit()
          }}
          type="button"
        >
          ← Pitch
        </button>
      </header>

      <main key={tab} className="fade-in">
        {tab === 'today' && <Today profile={profile} />}
        {tab === 'plan' && <Plan profile={profile} />}
        {tab === 'catalog' && <Catalog profile={profile} />}
        {tab === 'rewards' && <TasksRewards profile={profile} />}
        {tab === 'progress' && <Progress profile={profile} />}
      </main>

      <nav className="tabs" role="tablist" aria-label="Manager’s Office">
        {TABS.map((t) => (
          <button
            key={t.id}
            className="tab"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => {
              sfx.tap()
              setTab(t.id)
            }}
            type="button"
          >
            <span className="glyph" aria-hidden="true">
              <TabGlyph kind={t.id} size={20} />
            </span>
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
