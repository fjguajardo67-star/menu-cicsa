import { useMemo, useState } from 'react'
import { Card, Switch, SwitchRow } from '../components/Bits'
import { uid } from '../lib/db'
import { useStore } from '../lib/store'
import type { Profile } from '../lib/types'

const LABELS = {
  approvedContentOnly: 'Approved Content Only is ON',
  searchOff: 'Search is OFF',
  nativeTimerSet: 'The native timer is set',
  autoplayOff: 'Autoplay is OFF',
} as const

const DETAILS: Record<keyof typeof LABELS, string> = {
  approvedContentOnly:
    'In YouTube Kids: Settings → your child’s profile → Content settings → Approved content only.',
  searchOff: 'Same screen — turn Search off so nothing outside your list is reachable.',
  nativeTimerSet:
    'YouTube Kids has its own timer. Set it to match the minutes this app granted.',
  autoplayOff: 'Autoplay keeps a session going past the timer. Turn it off.',
}

/**
 * Catalog — the approved-channel list and the YouTube Kids checklist.
 *
 * The honesty here is deliberate: this app cannot control YouTube Kids.
 * The checklist is the parent's own record, and the UI says so.
 */
export function Catalog({ profile }: { profile: Profile }) {
  const { state, dispatch } = useStore()
  const [newName, setNewName] = useState('')
  const [newTopic, setNewTopic] = useState('Soccer')

  const byTopic = useMemo(() => {
    const groups = new Map<string, typeof state.channels>()
    for (const c of state.channels) {
      if (!groups.has(c.topic)) groups.set(c.topic, [])
      groups.get(c.topic)!.push(c)
    }
    return [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  }, [state.channels])

  const unchecked = (
    ['approvedContentOnly', 'searchOff', 'nativeTimerSet', 'autoplayOff'] as const
  ).filter((k) => !state.safety[k])

  return (
    <div className="panel">
      <div className="notice warn">
        <strong>This app cannot control YouTube Kids.</strong>
        Nothing here changes a setting in another app. The checklist below is your own record
        of what you have set up over there — enforcement lives in the native app, on the
        device, under your account.
      </div>

      <Card title="YouTube Kids safety checklist">
        {(['approvedContentOnly', 'searchOff', 'nativeTimerSet', 'autoplayOff'] as const).map(
          (key) => (
            <SwitchRow
              key={key}
              on={state.safety[key]}
              onChange={(v) => dispatch({ type: 'setSafety', patch: { [key]: v } })}
              title={LABELS[key]}
              detail={DETAILS[key]}
            />
          ),
        )}

        {unchecked.length > 0 && (
          <div className="notice danger" style={{ marginTop: 14 }}>
            <strong>
              {unchecked.length} item{unchecked.length > 1 ? 's' : ''} still unchecked.
            </strong>
            {unchecked.map((k) => LABELS[k]).join(' · ')}
          </div>
        )}

        {state.safety.reviewedAt && (
          <p className="help" style={{ marginTop: 10 }}>
            Last reviewed {new Date(state.safety.reviewedAt).toLocaleString()}.
          </p>
        )}
      </Card>

      <Card title="Content policy">
        <div className="notice info">
          <strong>No child-star channels.</strong>
          The kidfluencer genre is excluded by policy — channels built around a child
          performer unboxing, prank-ing, or demanding. It is the behaviour this app’s Fair
          Play field exists to counter-model, so it does not belong on the approved list.
        </div>
      </Card>

      {byTopic.map(([topic, channels]) => (
        <Card key={topic} title={topic}>
          <div className="list">
            {channels.map((c) => (
              <div className="list-item" key={c.id}>
                <span className="glyph" aria-hidden="true">
                  📺
                </span>
                <span className="grow">
                  <strong>{c.name}</strong>
                  {c.note && <span>{c.note}</span>}
                </span>
                <Switch
                  on={c.allowed[profile.id] ?? false}
                  onChange={(v) =>
                    dispatch({
                      type: 'setChannel',
                      channelId: c.id,
                      profileId: profile.id,
                      allowed: v,
                    })
                  }
                  label={`Allow ${c.name} for ${profile.name}`}
                />
              </div>
            ))}
          </div>
        </Card>
      ))}

      <Card title="Add a channel">
        <div className="field">
          <label htmlFor="cname">Channel name</label>
          <input
            id="cname"
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. Skills school"
          />
        </div>
        <div className="field">
          <label htmlFor="ctopic">Topic</label>
          <input
            id="ctopic"
            type="text"
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
          />
        </div>
        <button
          className="btn"
          disabled={!newName.trim()}
          onClick={() => {
            const channel = {
              id: uid('ch'),
              name: newName.trim(),
              topic: newTopic.trim() || 'Other',
              allowed: Object.fromEntries(state.profiles.map((p) => [p.id, p.id === profile.id])),
            }
            dispatch({ type: 'hydrate', state: { ...state, channels: [...state.channels, channel] } })
            setNewName('')
          }}
          type="button"
        >
          Add to the catalog
        </button>
      </Card>
    </div>
  )
}
