import { useRef, useState } from 'react'
import { Card, SwitchRow, parseTime, timeLabel } from '../components/Bits'
import { testKey } from '../lib/coach'
import { exportJSON, hashPin, importJSON } from '../lib/db'
import { setMuted } from '../lib/sfx'
import { capabilities, requestMic } from '../lib/speech'
import { useStore } from '../lib/store'
import type { EconomyConfig, Profile } from '../lib/types'

const MODELS = [
  { id: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6 — fast and inexpensive' },
  { id: 'claude-haiku-4-5', label: 'Claude Haiku 4.5 — cheapest' },
  { id: 'claude-opus-5', label: 'Claude Opus 5 — most capable' },
]

/** Plan — every number in the economy, plus Coach's key and backups. */
export function Plan({ profile }: { profile: Profile }) {
  const { state, dispatch, economy } = useStore()
  const fileInput = useRef<HTMLInputElement | null>(null)
  const [keyDraft, setKeyDraft] = useState(state.apiKey ?? '')
  const [keyStatus, setKeyStatus] = useState('')
  const [pinDraft, setPinDraft] = useState('')
  const [pinNote, setPinNote] = useState('')
  const [micNote, setMicNote] = useState('')
  const [importNote, setImportNote] = useState('')

  const set = (patch: Partial<EconomyConfig>) =>
    dispatch({ type: 'setEconomy', profileId: profile.id, patch })

  const download = () => {
    const blob = new Blob([exportJSON(state)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `goal-time-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const upload = async (file: File) => {
    try {
      const next = importJSON(await file.text())
      dispatch({ type: 'hydrate', state: next })
      setImportNote('Backup restored.')
    } catch (err) {
      setImportNote(err instanceof Error ? err.message : 'That file could not be read.')
    }
  }

  return (
    <div className="panel">
      <Card title="Screen time" hint={profile.name}>
        <div className="field">
          <label htmlFor="base">Base minutes every day: {economy.baseDailyMinutes}</label>
          <input
            id="base"
            type="range"
            min={0}
            max={90}
            step={5}
            value={economy.baseDailyMinutes}
            onChange={(e) => set({ baseDailyMinutes: Number(e.target.value) })}
          />
          <p className="help">Given every day without spending stars.</p>
        </div>

        <div className="field">
          <label>Viewing window</label>
          <div className="row">
            <input
              type="time"
              value={timeLabel(economy.windowStart)}
              onChange={(e) => set({ windowStart: parseTime(e.target.value) })}
            />
            <span>to</span>
            <input
              type="time"
              value={timeLabel(economy.windowEnd)}
              onChange={(e) => set({ windowEnd: parseTime(e.target.value) })}
            />
          </div>
          <p className="help">Outside this window the Watch button stays locked.</p>
        </div>

        <SwitchRow
          on={economy.questGate}
          onChange={(v) => set({ questGate: v })}
          title="Winning the match unlocks Watch Time"
          detail="The core inversion of the app. Default on."
        />

        <div className="field" style={{ marginTop: 14 }}>
          <label htmlFor="stations">Stations per day: {economy.stationsPerDay}</label>
          <input
            id="stations"
            type="range"
            min={3}
            max={4}
            value={economy.stationsPerDay}
            onChange={(e) => set({ stationsPerDay: Number(e.target.value) })}
          />
          <p className="help">English Academy is always one of them.</p>
        </div>
      </Card>

      <Card title="Stars and minutes">
        <div className="field">
          <label>Exchange rate</label>
          <div className="row">
            <input
              type="number"
              min={1}
              max={20}
              value={economy.starsPerBlock}
              onChange={(e) => set({ starsPerBlock: Number(e.target.value) || 1 })}
              style={{ width: 80 }}
            />
            <span>⭐ =</span>
            <input
              type="number"
              min={5}
              max={60}
              step={5}
              value={economy.minutesPerBlock}
              onChange={(e) => set({ minutesPerBlock: Number(e.target.value) || 5 })}
              style={{ width: 90 }}
            />
            <span>minutes</span>
          </div>
        </div>

        <div className="field">
          <label htmlFor="gb">Golden Ball value: {economy.goldenBallStars} ⭐</label>
          <input
            id="gb"
            type="range"
            min={1}
            max={20}
            value={economy.goldenBallStars}
            onChange={(e) => set({ goldenBallStars: Number(e.target.value) })}
          />
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
            onChange={(e) => set({ weeklyBonusCapMinutes: Number(e.target.value) })}
          />
          <p className="help">
            The hard ceiling on redeemed bonus minutes per week (Monday to Sunday). Stars
            beyond it can only go to the wishlist — they are never lost.
          </p>
        </div>

        <SwitchRow
          on={economy.weeklyCapOverride}
          onChange={(v) => set({ weeklyCapOverride: v })}
          title="Override the weekly cap"
          detail="For exceptional days, good or bad. Remember to switch it back."
          warn
        />
      </Card>

      <Card title="Sound and voice">
        <SwitchRow
          on={!economy.muted}
          onChange={(v) => {
            set({ muted: !v })
            setMuted(!v)
          }}
          title="Sound effects"
          detail="Whistle, crowd, kicks and star chimes. Coach's voice is separate and always on."
        />
        <div className="row" style={{ marginTop: 14 }}>
          <button
            className="btn ghost"
            onClick={async () => {
              const ok = await requestMic()
              setMicNote(
                ok
                  ? 'Microphone allowed. Spoken answers earn bonus stars.'
                  : 'Microphone unavailable. Every station is still completable by tapping.',
              )
            }}
            type="button"
          >
            🎤 Check the microphone
          </button>
        </div>
        <p className="help" style={{ marginTop: 10 }}>
          Speech synthesis {capabilities.tts ? 'is available' : 'is NOT available'} on this
          device. Speech recognition {capabilities.stt ? 'is available' : 'is NOT available'}.
        </p>
        {micNote && (
          <div className="notice info" style={{ marginTop: 10 }}>
            {micNote}
          </div>
        )}
      </Card>

      <Card title="Coach Chat" hint="optional">
        <p className="help" style={{ marginTop: 0 }}>
          Coach Chat works without any of this — with no key it runs a scripted dialogue tree
          covering the same vocabulary, fully offline. Adding an Anthropic API key lets Coach
          hold a freer conversation.
        </p>

        <div className="notice warn" style={{ margin: '12px 0' }}>
          <strong>The tradeoff, stated plainly.</strong>
          This app has no server, so the key is stored in this browser and sent straight from
          the device to Anthropic. Anyone with the unlocked device and devtools could read it.
          Use a key with a low spending cap that you can rotate, or leave this blank and use
          the offline Coach.
        </div>

        <div className="field">
          <label htmlFor="key">Anthropic API key</label>
          <input
            id="key"
            type="password"
            value={keyDraft}
            onChange={(e) => setKeyDraft(e.target.value)}
            placeholder="sk-ant-…"
            autoComplete="off"
          />
        </div>

        <div className="field">
          <label htmlFor="model">Model</label>
          <select
            id="model"
            value={state.coachModel}
            onChange={(e) => dispatch({ type: 'setCoachModel', model: e.target.value })}
          >
            {MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        <div className="row wrap">
          <button
            className="btn"
            onClick={() => {
              dispatch({ type: 'setApiKey', key: keyDraft.trim() || null })
              setKeyStatus(keyDraft.trim() ? 'Key saved on this device.' : 'Key removed.')
            }}
            type="button"
          >
            Save key
          </button>
          <button
            className="btn ghost"
            disabled={!keyDraft.trim()}
            onClick={async () => {
              setKeyStatus('Testing…')
              setKeyStatus(await testKey(keyDraft.trim(), state.coachModel))
            }}
            type="button"
          >
            Test connection
          </button>
          <button
            className="btn danger"
            onClick={() => {
              setKeyDraft('')
              dispatch({ type: 'setApiKey', key: null })
              setKeyStatus('Key removed. Coach will use the offline script.')
            }}
            type="button"
          >
            Remove
          </button>
        </div>
        {keyStatus && (
          <div className="notice info" style={{ marginTop: 12 }}>
            {keyStatus}
          </div>
        )}

        <p className="help" style={{ marginTop: 12 }}>
          Coach’s instructions are hard-locked to the beginner-English script: one short
          sentence, a fixed vocabulary, never “wrong”, never off-topic, and never a request
          for personal information. Only your child’s first name and age are ever sent. Every
          transcript is saved and readable in Progress.
        </p>
      </Card>

      <Card title="PIN">
        <div className="field">
          <label htmlFor="newpin">Change the PIN</label>
          <input
            id="newpin"
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={pinDraft}
            onChange={(e) => setPinDraft(e.target.value.replace(/\D/g, ''))}
            autoComplete="new-password"
          />
        </div>
        <button
          className="btn"
          disabled={pinDraft.length !== 4}
          onClick={async () => {
            dispatch({ type: 'setPin', hash: await hashPin(pinDraft) })
            setPinDraft('')
            setPinNote('PIN updated.')
          }}
          type="button"
        >
          Update PIN
        </button>
        {pinNote && (
          <div className="notice info" style={{ marginTop: 12 }}>
            {pinNote}
          </div>
        )}
      </Card>

      <Card title="Backup">
        <p className="help" style={{ marginTop: 0 }}>
          Everything lives in this browser’s storage. Clearing site data, or a new device,
          means starting over — so export a backup now and then.
        </p>
        <div className="row wrap" style={{ marginTop: 12 }}>
          <button className="btn" onClick={download} type="button">
            ⬇️ Export JSON
          </button>
          <button className="btn ghost" onClick={() => fileInput.current?.click()} type="button">
            ⬆️ Import JSON
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="application/json"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void upload(file)
              e.target.value = ''
            }}
          />
        </div>
        {importNote && (
          <div className="notice info" style={{ marginTop: 12 }}>
            {importNote}
          </div>
        )}
      </Card>
    </div>
  )
}
