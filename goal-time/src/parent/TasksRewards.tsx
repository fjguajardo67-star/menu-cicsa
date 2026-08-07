import { useRef, useState } from 'react'
import { Card } from '../components/Bits'
import { uid } from '../lib/db'
import { activeWish } from '../lib/economy'
import { useStore } from '../lib/store'
import type { Profile, Task, WishlistItem } from '../lib/types'

const EMOJI = ['🛏️', '🧸', '🪥', '🙏', '🍽️', '🤝', '📚', '🧹', '🚿', '👕', '🐕', '💧']

/** Tasks & Rewards — the chore list, the Golden Ball, and the wishlist. */
export function TasksRewards({ profile }: { profile: Profile }) {
  const { state, dispatch, economy } = useStore()
  const tasks = state.tasks[profile.id] ?? []
  const wishes = state.wishlist[profile.id] ?? []
  const current = activeWish(state, profile.id)
  const photoInput = useRef<HTMLInputElement | null>(null)

  const [draft, setDraft] = useState<Task>({
    id: '',
    label: '',
    emoji: '⭐',
    stars: 1,
    retired: false,
  })
  const [wishDraft, setWishDraft] = useState({ name: '', priceStars: 60, photo: '' })

  const weeklyEarn = economy.stationsPerDay + 3 // stations + a typical shootout
  const suggested = Math.round(weeklyEarn * 7 * 0.55)

  const saveTask = () => {
    if (!draft.label.trim()) return
    dispatch({
      type: 'upsertTask',
      profileId: profile.id,
      task: { ...draft, id: draft.id || uid('task'), label: draft.label.trim() },
    })
    setDraft({ id: '', label: '', emoji: '⭐', stars: 1, retired: false })
  }

  const readPhoto = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => setWishDraft((w) => ({ ...w, photo: String(reader.result) }))
    reader.readAsDataURL(file)
  }

  return (
    <div className="panel">
      <Card title="Chores and behaviour" hint="fully editable">
        <p className="help" style={{ marginTop: 0 }}>
          Change this list whenever your child’s needs change — retire what is now automatic,
          add what needs support this month. Log them from the Today tab.
        </p>

        <div className="list" style={{ marginTop: 12 }}>
          {tasks.map((t) => (
            <div className={`list-item${t.retired ? ' retired' : ''}`} key={t.id}>
              <span className="glyph" aria-hidden="true">
                {t.emoji}
              </span>
              <span className="grow">
                <strong>{t.label}</strong>
                <span>{t.stars}⭐{t.retired ? ' — retired' : ''}</span>
              </span>
              <button
                className="btn ghost small"
                onClick={() => setDraft(t)}
                type="button"
              >
                Edit
              </button>
              <button
                className="btn ghost small"
                onClick={() =>
                  dispatch({
                    type: 'upsertTask',
                    profileId: profile.id,
                    task: { ...t, retired: !t.retired },
                  })
                }
                type="button"
              >
                {t.retired ? 'Restore' : 'Retire'}
              </button>
              <button
                className="btn danger small"
                onClick={() =>
                  dispatch({ type: 'removeTask', profileId: profile.id, taskId: t.id })
                }
                aria-label={`Delete ${t.label}`}
                type="button"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </Card>

      <Card title={draft.id ? 'Edit task' : 'Add a task'}>
        <div className="field">
          <label htmlFor="tlabel">What is it?</label>
          <input
            id="tlabel"
            type="text"
            value={draft.label}
            onChange={(e) => setDraft({ ...draft, label: e.target.value })}
            placeholder="Put shoes away"
          />
        </div>
        <div className="field">
          <label>Picture</label>
          <div className="chips">
            {EMOJI.map((e) => (
              <button
                key={e}
                className="chip"
                data-on={e === draft.emoji}
                onClick={() => setDraft({ ...draft, emoji: e })}
                type="button"
                aria-label={`Icon ${e}`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
        <div className="field">
          <label htmlFor="tstars">Worth: {draft.stars} ⭐</label>
          <input
            id="tstars"
            type="range"
            min={1}
            max={10}
            value={draft.stars}
            onChange={(e) => setDraft({ ...draft, stars: Number(e.target.value) })}
          />
        </div>
        <div className="row wrap">
          <button className="btn" onClick={saveTask} disabled={!draft.label.trim()} type="button">
            {draft.id ? 'Save changes' : 'Add task'}
          </button>
          {draft.id && (
            <button
              className="btn ghost"
              onClick={() =>
                setDraft({ id: '', label: '', emoji: '⭐', stars: 1, retired: false })
              }
              type="button"
            >
              Cancel
            </button>
          )}
        </div>
      </Card>

      <Card title="Golden Ball">
        <div className="field">
          <label htmlFor="gbv">Worth: {economy.goldenBallStars} ⭐</label>
          <input
            id="gbv"
            type="range"
            min={1}
            max={20}
            value={economy.goldenBallStars}
            onChange={(e) =>
              dispatch({
                type: 'setEconomy',
                profileId: profile.id,
                patch: { goldenBallStars: Number(e.target.value) },
              })
            }
          />
        </div>
        <p className="help">
          Awarded only by you, from the Today tab. There is deliberately no rule that earns
          one — it is for something exceptional, and it is celebrated with the biggest
          animation in the app.
        </p>
      </Card>

      <Card title="Wishlist" hint="the prize your child is saving for">
        {current ? (
          <div className="list-item" style={{ marginBottom: 12 }}>
            {current.photo ? (
              <img
                src={current.photo}
                alt=""
                style={{ width: 46, height: 46, borderRadius: 10, objectFit: 'cover' }}
              />
            ) : (
              <span className="glyph" aria-hidden="true">
                🎁
              </span>
            )}
            <span className="grow">
              <strong>{current.name}</strong>
              <span>
                {current.savedStars} / {current.priceStars} ⭐ saved
              </span>
              <span className="bar" style={{ display: 'block', marginTop: 6 }}>
                <i
                  style={{
                    width: `${Math.min(100, (current.savedStars / Math.max(1, current.priceStars)) * 100)}%`,
                  }}
                />
              </span>
            </span>
            <button
              className="btn ok small"
              disabled={current.savedStars < current.priceStars}
              onClick={() =>
                dispatch({ type: 'deliverWish', profileId: profile.id, itemId: current.id })
              }
              type="button"
            >
              Delivered 🎁
            </button>
          </div>
        ) : (
          <p className="help" style={{ marginTop: 0 }}>
            No active prize. Set one up below so saving has a target.
          </p>
        )}

        <div className="notice info">
          <strong>Saved stars are locked.</strong>
          Once your child chooses “Save for my prize”, those stars cannot be converted to
          minutes by any path in the app. That is deliberate — it is what makes saving mean
          something.
        </div>

        {!current && (
          <div style={{ marginTop: 14 }}>
            <div className="field">
              <label htmlFor="wname">Prize name</label>
              <input
                id="wname"
                type="text"
                value={wishDraft.name}
                onChange={(e) => setWishDraft({ ...wishDraft, name: e.target.value })}
                placeholder="New football boots"
              />
            </div>
            <div className="field">
              <label htmlFor="wprice">Price: {wishDraft.priceStars} ⭐</label>
              <input
                id="wprice"
                type="range"
                min={10}
                max={300}
                step={5}
                value={wishDraft.priceStars}
                onChange={(e) =>
                  setWishDraft({ ...wishDraft, priceStars: Number(e.target.value) })
                }
              />
              <p className="help">
                Aim for a 2–4 week save. At this child’s current pace that is roughly{' '}
                <strong>{suggested}–{suggested * 2}⭐</strong>.
              </p>
            </div>
            <div className="field">
              <label>Photo</label>
              <div className="row wrap">
                <button
                  className="btn ghost"
                  onClick={() => photoInput.current?.click()}
                  type="button"
                >
                  📷 Choose a photo
                </button>
                {wishDraft.photo && (
                  <img
                    src={wishDraft.photo}
                    alt=""
                    style={{ width: 46, height: 46, borderRadius: 10, objectFit: 'cover' }}
                  />
                )}
              </div>
              <input
                ref={photoInput}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) readPhoto(file)
                  e.target.value = ''
                }}
              />
              <p className="help">The photo stays on this device, inside the app’s storage.</p>
            </div>
            <button
              className="btn"
              disabled={!wishDraft.name.trim()}
              onClick={() => {
                const item: WishlistItem = {
                  id: uid('wish'),
                  name: wishDraft.name.trim(),
                  photo: wishDraft.photo || undefined,
                  priceStars: wishDraft.priceStars,
                  savedStars: 0,
                  status: 'active',
                  createdAt: new Date().toISOString(),
                }
                dispatch({ type: 'upsertWish', profileId: profile.id, item })
                setWishDraft({ name: '', priceStars: 60, photo: '' })
              }}
              type="button"
            >
              Set this prize
            </button>
          </div>
        )}

        {wishes.filter((w) => w.status === 'delivered').length > 0 && (
          <>
            <h2 style={{ marginTop: 20 }}>Delivered</h2>
            <div className="list">
              {wishes
                .filter((w) => w.status === 'delivered')
                .map((w) => (
                  <div className="list-item" key={w.id}>
                    <span className="glyph" aria-hidden="true">
                      🏅
                    </span>
                    <span className="grow">
                      <strong>{w.name}</strong>
                      <span>
                        {w.priceStars}⭐ ·{' '}
                        {w.deliveredAt ? new Date(w.deliveredAt).toLocaleDateString() : ''}
                      </span>
                    </span>
                  </div>
                ))}
            </div>
          </>
        )}
      </Card>
    </div>
  )
}
