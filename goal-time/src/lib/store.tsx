import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react'
import { economyFor, load, save, todayKey, uid } from './db'
import { canTrade, minutesForStars } from './economy'
import { progressFor, recordAnswer } from './mastery'
import {
  DEFAULT_ECONOMY,
  DEFAULT_TASKS,
  emptyEnglish,
  emptyProgress,
  type AppState,
  type ChatTranscript,
  type ChatTurn,
  type Drawing,
  type EconomyConfig,
  type EnglishProgress,
  type Profile,
  type QuestDay,
  type SafetyChecklist,
  type SkillField,
  type StarSource,
  type Task,
  type WishlistItem,
} from './types'

export type Action =
  | { type: 'hydrate'; state: AppState }
  | { type: 'setPin'; hash: string }
  | { type: 'addProfile'; profile: Profile }
  | { type: 'updateProfile'; id: string; patch: Partial<Profile> }
  | { type: 'setActiveProfile'; id: string | null }
  | { type: 'setEconomy'; profileId: string; patch: Partial<EconomyConfig> }
  | { type: 'upsertTask'; profileId: string; task: Task }
  | { type: 'removeTask'; profileId: string; taskId: string }
  | { type: 'upsertWish'; profileId: string; item: WishlistItem }
  | { type: 'deliverWish'; profileId: string; itemId: string }
  | {
      type: 'award'
      profileId: string
      amount: number
      source: StarSource
      golden?: boolean
      pending?: boolean
      note?: string
    }
  | { type: 'resolveHonor'; eventId: string; confirm: boolean }
  | { type: 'saveStars'; profileId: string; stars: number }
  | { type: 'tradeStars'; profileId: string; stars: number }
  | { type: 'ensureQuest'; profileId: string; fields: SkillField[] }
  | { type: 'completeStation'; profileId: string; field: SkillField; stars: number }
  | { type: 'markServed'; profileId: string; field: SkillField; ids: string[] }
  | { type: 'setShootout'; profileId: string; goals: number }
  | {
      type: 'answer'
      profileId: string
      field: SkillField
      contentId: string
      correct: boolean
    }
  | { type: 'addWatchMinutes'; profileId: string; minutes: number }
  | { type: 'addChat'; chat: ChatTranscript }
  | { type: 'appendTurn'; chatId: string; turn: ChatTurn }
  | { type: 'addDrawing'; drawing: Drawing }
  | { type: 'setChannel'; channelId: string; profileId: string; allowed: boolean }
  | { type: 'setSafety'; patch: Partial<SafetyChecklist> }
  | { type: 'setApiKey'; key: string | null }
  | { type: 'setCoachModel'; model: string }
  | { type: 'english'; profileId: string; patch: Partial<EnglishProgress> }
  | { type: 'englishAdd'; profileId: string; word?: string; phrase?: string }
  | { type: 'finishOnboarding' }
  | { type: 'reset' }

const questKey = (profileId: string, day: string) => `${profileId}:${day}`

function withProgress(state: AppState, profileId: string): AppState {
  if (state.progress[profileId]) return state
  return { ...state, progress: { ...state.progress, [profileId]: emptyProgress() } }
}

export function reducer(state: AppState, action: Action): AppState {
  const day = todayKey()

  switch (action.type) {
    case 'hydrate':
      return action.state

    case 'reset':
      return { ...state, onboarded: false }

    case 'setPin':
      return { ...state, pinHash: action.hash }

    case 'addProfile': {
      const p = action.profile
      return {
        ...state,
        profiles: [...state.profiles, p],
        activeProfileId: state.activeProfileId ?? p.id,
        economy: { ...state.economy, [p.id]: { ...DEFAULT_ECONOMY } },
        tasks: {
          ...state.tasks,
          [p.id]: DEFAULT_TASKS.map((t) => ({ ...t, id: uid('task') })),
        },
        wishlist: { ...state.wishlist, [p.id]: [] },
        progress: { ...state.progress, [p.id]: emptyProgress() },
        english: { ...state.english, [p.id]: emptyEnglish() },
        channels: state.channels.map((c) => ({
          ...c,
          allowed: { ...c.allowed, [p.id]: true },
        })),
      }
    }

    case 'updateProfile':
      return {
        ...state,
        profiles: state.profiles.map((p) =>
          p.id === action.id ? { ...p, ...action.patch } : p,
        ),
      }

    case 'setActiveProfile':
      return { ...state, activeProfileId: action.id }

    case 'setEconomy':
      return {
        ...state,
        economy: {
          ...state.economy,
          [action.profileId]: {
            ...economyFor(state, action.profileId),
            ...action.patch,
          },
        },
      }

    case 'upsertTask': {
      const list = state.tasks[action.profileId] ?? []
      const exists = list.some((t) => t.id === action.task.id)
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.profileId]: exists
            ? list.map((t) => (t.id === action.task.id ? action.task : t))
            : [...list, action.task],
        },
      }
    }

    case 'removeTask':
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.profileId]: (state.tasks[action.profileId] ?? []).filter(
            (t) => t.id !== action.taskId,
          ),
        },
      }

    case 'upsertWish': {
      const list = state.wishlist[action.profileId] ?? []
      const exists = list.some((w) => w.id === action.item.id)
      return {
        ...state,
        wishlist: {
          ...state.wishlist,
          [action.profileId]: exists
            ? list.map((w) => (w.id === action.item.id ? action.item : w))
            : [...list, action.item],
        },
      }
    }

    case 'deliverWish':
      return {
        ...state,
        wishlist: {
          ...state.wishlist,
          [action.profileId]: (state.wishlist[action.profileId] ?? []).map((w) =>
            w.id === action.itemId
              ? { ...w, status: 'delivered' as const, deliveredAt: new Date().toISOString() }
              : w,
          ),
        },
      }

    case 'award': {
      if (action.amount <= 0) return state
      return {
        ...state,
        starEvents: [
          ...state.starEvents,
          {
            id: uid('star'),
            profileId: action.profileId,
            day,
            at: new Date().toISOString(),
            source: action.source,
            amount: action.amount,
            golden: action.golden,
            pending: action.pending,
            note: action.note,
          },
        ],
      }
    }

    case 'resolveHonor':
      return {
        ...state,
        starEvents: state.starEvents.map((e) =>
          e.id === action.eventId
            ? action.confirm
              ? { ...e, pending: false }
              : { ...e, pending: false, declined: true }
            : e,
        ),
      }

    case 'saveStars': {
      const wish = (state.wishlist[action.profileId] ?? []).find(
        (w) => w.status === 'active',
      )
      // With no prize set there is nowhere for the stars to go, so they stay
      // in the child's balance rather than being spent into nothing.
      if (!wish) return state
      return {
        ...state,
        // Saved stars are locked the moment they land on the prize: no action
        // anywhere in this reducer moves them back out.
        wishlist: {
          ...state.wishlist,
          [action.profileId]: state.wishlist[action.profileId].map((w) =>
            w.id === wish.id ? { ...w, savedStars: w.savedStars + action.stars } : w,
          ),
        },
        spendEvents: [
          ...state.spendEvents,
          {
            id: uid('spend'),
            profileId: action.profileId,
            day,
            at: new Date().toISOString(),
            kind: 'save',
            stars: action.stars,
            wishlistItemId: wish.id,
          },
        ],
      }
    }

    case 'tradeStars': {
      // The weekly cap is enforced here so no UI path can bypass it.
      if (!canTrade(state, action.profileId, action.stars, day)) return state
      const eco = economyFor(state, action.profileId)
      const minutes = minutesForStars(eco, action.stars)
      if (minutes <= 0) return state
      return {
        ...state,
        spendEvents: [
          ...state.spendEvents,
          {
            id: uid('spend'),
            profileId: action.profileId,
            day,
            at: new Date().toISOString(),
            kind: 'trade',
            stars: action.stars,
            minutes,
          },
        ],
      }
    }

    case 'ensureQuest': {
      const key = questKey(action.profileId, day)
      if (state.quests[key]) return state
      const quest: QuestDay = {
        profileId: action.profileId,
        day,
        stations: action.fields.map((field) => ({
          field,
          servedIds: [],
          done: false,
          starsEarned: 0,
        })),
        won: false,
        shootoutGoals: null,
      }
      return withProgress({ ...state, quests: { ...state.quests, [key]: quest } }, action.profileId)
    }

    case 'markServed': {
      const key = questKey(action.profileId, day)
      const quest = state.quests[key]
      if (!quest) return state
      return {
        ...state,
        quests: {
          ...state.quests,
          [key]: {
            ...quest,
            stations: quest.stations.map((s) =>
              s.field === action.field
                ? { ...s, servedIds: [...new Set([...s.servedIds, ...action.ids])] }
                : s,
            ),
          },
        },
      }
    }

    case 'completeStation': {
      const key = questKey(action.profileId, day)
      const quest = state.quests[key]
      if (!quest) return state
      const stations = quest.stations.map((s) =>
        s.field === action.field
          ? { ...s, done: true, starsEarned: s.starsEarned + action.stars }
          : s,
      )
      return {
        ...state,
        quests: {
          ...state.quests,
          [key]: { ...quest, stations, won: stations.every((s) => s.done) },
        },
      }
    }

    case 'setShootout': {
      const key = questKey(action.profileId, day)
      const quest = state.quests[key]
      if (!quest) return state
      return {
        ...state,
        quests: { ...state.quests, [key]: { ...quest, shootoutGoals: action.goals } },
      }
    }

    case 'answer': {
      const withP = withProgress(state, action.profileId)
      const list = withP.progress[action.profileId]
      return {
        ...withP,
        progress: {
          ...withP.progress,
          [action.profileId]: list.map((p) =>
            p.field === action.field
              ? recordAnswer(progressFor(list, action.field), action.contentId, action.correct)
              : p,
          ),
        },
      }
    }

    case 'addWatchMinutes': {
      const open = [...state.watch]
        .reverse()
        .find((w) => w.profileId === action.profileId && w.day === day)
      if (open) {
        return {
          ...state,
          watch: state.watch.map((w) =>
            w.id === open.id
              ? { ...w, minutesUsed: w.minutesUsed + action.minutes, endedAt: new Date().toISOString() }
              : w,
          ),
        }
      }
      return {
        ...state,
        watch: [
          ...state.watch,
          {
            id: uid('watch'),
            profileId: action.profileId,
            day,
            startedAt: new Date().toISOString(),
            endedAt: new Date().toISOString(),
            minutesUsed: action.minutes,
          },
        ],
      }
    }

    case 'addChat':
      return { ...state, chats: [...state.chats, action.chat] }

    case 'appendTurn':
      return {
        ...state,
        chats: state.chats.map((c) =>
          c.id === action.chatId ? { ...c, turns: [...c.turns, action.turn] } : c,
        ),
      }

    case 'addDrawing':
      return { ...state, drawings: [...state.drawings, action.drawing] }

    case 'setChannel':
      return {
        ...state,
        channels: state.channels.map((c) =>
          c.id === action.channelId
            ? { ...c, allowed: { ...c.allowed, [action.profileId]: action.allowed } }
            : c,
        ),
      }

    case 'setSafety':
      return {
        ...state,
        safety: { ...state.safety, ...action.patch, reviewedAt: new Date().toISOString() },
      }

    case 'setApiKey':
      return { ...state, apiKey: action.key }

    case 'setCoachModel':
      return { ...state, coachModel: action.model }

    case 'english': {
      const cur = state.english[action.profileId] ?? emptyEnglish()
      return {
        ...state,
        english: { ...state.english, [action.profileId]: { ...cur, ...action.patch } },
      }
    }

    case 'englishAdd': {
      const cur = state.english[action.profileId] ?? emptyEnglish()
      return {
        ...state,
        english: {
          ...state.english,
          [action.profileId]: {
            ...cur,
            wordsMastered: action.word
              ? [...new Set([...cur.wordsMastered, action.word])]
              : cur.wordsMastered,
            phrasesSaid: action.phrase
              ? [...new Set([...cur.phrasesSaid, action.phrase])]
              : cur.phrasesSaid,
          },
        },
      }
    }

    case 'finishOnboarding':
      return { ...state, onboarded: true }

    default:
      return state
  }
}

interface StoreValue {
  state: AppState
  dispatch: React.Dispatch<Action>
  profile: Profile | null
  economy: EconomyConfig
}

const StoreContext = createContext<StoreValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load)

  useEffect(() => {
    save(state)
  }, [state])

  const value = useMemo<StoreValue>(() => {
    const profile =
      state.profiles.find((p) => p.id === state.activeProfileId) ?? state.profiles[0] ?? null
    return {
      state,
      dispatch,
      profile,
      economy: profile ? economyFor(state, profile.id) : DEFAULT_ECONOMY,
    }
  }, [state])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>')
  return ctx
}
