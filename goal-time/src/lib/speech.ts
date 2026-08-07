/**
 * Web Speech wrappers, feature-detected at startup.
 *
 * Two hard rules the whole app depends on:
 *  1. Nothing here ever throws into a station. If speech is unavailable the
 *     call resolves quietly and the caller falls back to tap.
 *  2. Audio only starts from a user gesture, which is what iPad Safari
 *     requires. `unlock()` is called on the first tap of the session.
 */

type Rec = {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  start(): void
  stop(): void
  abort(): void
  onresult: ((e: any) => void) | null
  onerror: ((e: any) => void) | null
  onend: (() => void) | null
}

const w = window as unknown as {
  SpeechRecognition?: new () => Rec
  webkitSpeechRecognition?: new () => Rec
}

export const hasTTS = (): boolean => typeof window.speechSynthesis !== 'undefined'
export const hasSTT = (): boolean => Boolean(w.SpeechRecognition ?? w.webkitSpeechRecognition)

export interface SpeechCapabilities {
  tts: boolean
  stt: boolean
  /** Set false once the user denies the mic; every station goes tap-only. */
  micAllowed: boolean
}

export const capabilities: SpeechCapabilities = {
  tts: hasTTS(),
  stt: hasSTT(),
  micAllowed: true,
}

let unlocked = false
let voice: SpeechSynthesisVoice | null = null

function pickVoice(): SpeechSynthesisVoice | null {
  if (!hasTTS()) return null
  const voices = window.speechSynthesis.getVoices()
  if (!voices.length) return null
  const en = voices.filter((v) => v.lang?.toLowerCase().startsWith('en'))
  if (!en.length) return null
  // Prefer a US voice, then any English one. Named voices first — they are
  // consistently clearer than the platform default on iOS.
  const preferred = ['Samantha', 'Karen', 'Moira', 'Google US English', 'Alex']
  for (const name of preferred) {
    const found = en.find((v) => v.name === name)
    if (found) return found
  }
  return en.find((v) => v.lang.toLowerCase() === 'en-us') ?? en[0]
}

if (hasTTS()) {
  voice = pickVoice()
  window.speechSynthesis.onvoiceschanged = () => {
    voice = pickVoice()
  }
}

/**
 * Call from the first user gesture. iOS will not speak until synthesis has
 * been touched inside a real tap handler.
 */
export function unlock(): void {
  if (unlocked || !hasTTS()) return
  try {
    const u = new SpeechSynthesisUtterance(' ')
    u.volume = 0
    window.speechSynthesis.speak(u)
    window.speechSynthesis.resume()
    unlocked = true
    if (!voice) voice = pickVoice()
  } catch {
    /* speech stays off; every caller has a tap path */
  }
}

let currentUtterance: SpeechSynthesisUtterance | null = null

export interface SpeakOptions {
  /** Default 0.85 — slow and clear for a five-year-old learning English. */
  rate?: number
  pitch?: number
  /** Cancel anything already speaking. Default true. */
  interrupt?: boolean
}

/** Speak English aloud. Resolves when finished (or immediately if unavailable). */
export function speak(text: string, opts: SpeakOptions = {}): Promise<void> {
  if (!capabilities.tts || !text.trim()) return Promise.resolve()
  const { rate = 0.85, pitch = 1.05, interrupt = true } = opts

  return new Promise<void>((resolve) => {
    try {
      if (interrupt) window.speechSynthesis.cancel()
      const u = new SpeechSynthesisUtterance(text)
      u.lang = 'en-US'
      u.rate = rate
      u.pitch = pitch
      u.volume = 1
      if (voice) u.voice = voice

      let settled = false
      const done = () => {
        if (settled) return
        settled = true
        currentUtterance = null
        resolve()
      }
      u.onend = done
      u.onerror = done
      currentUtterance = u

      // Safari occasionally drops onend. A ceiling keeps the UI moving.
      const ceiling = Math.min(20000, 1200 + text.length * 110)
      window.setTimeout(done, ceiling)

      window.speechSynthesis.speak(u)
    } catch {
      resolve()
    }
  })
}

export function stopSpeaking(): void {
  if (!capabilities.tts) return
  try {
    window.speechSynthesis.cancel()
    currentUtterance = null
  } catch {
    /* ignore */
  }
}

export const isSpeaking = (): boolean => currentUtterance !== null

export interface ListenResult {
  /** Best transcript, or '' if nothing was heard. */
  text: string
  /** Why listening stopped — the caller decides how to respond. */
  status: 'ok' | 'no-speech' | 'denied' | 'unavailable' | 'error' | 'aborted'
}

let activeRecognition: Rec | null = null

/**
 * Listen for one short answer. Never rejects: a failure comes back as a
 * status the station turns into "let's tap instead".
 */
export function listen(timeoutMs = 7000): Promise<ListenResult> {
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition
  if (!Ctor || !capabilities.stt || !capabilities.micAllowed) {
    return Promise.resolve({ text: '', status: 'unavailable' })
  }

  stopListening()
  stopSpeaking()

  return new Promise<ListenResult>((resolve) => {
    let settled = false
    let best = ''
    const finish = (status: ListenResult['status']) => {
      if (settled) return
      settled = true
      window.clearTimeout(timer)
      activeRecognition = null
      resolve({ text: best.trim(), status: best.trim() ? 'ok' : status })
    }

    let rec: Rec
    try {
      rec = new Ctor()
    } catch {
      resolve({ text: '', status: 'unavailable' })
      return
    }

    rec.lang = 'en-US'
    rec.continuous = false
    rec.interimResults = true
    rec.maxAlternatives = 3

    rec.onresult = (e: any) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const result = e.results[i]
        for (let a = 0; a < result.length; a++) {
          const t = String(result[a].transcript ?? '')
          if (t.trim().length > best.trim().length) best = t
        }
      }
    }
    rec.onerror = (e: any) => {
      const code = String(e?.error ?? '')
      if (code === 'not-allowed' || code === 'service-not-allowed') {
        capabilities.micAllowed = false
        finish('denied')
      } else if (code === 'no-speech') finish('no-speech')
      else if (code === 'aborted') finish('aborted')
      else finish('error')
    }
    rec.onend = () => finish('no-speech')

    const timer = window.setTimeout(() => {
      try {
        rec.stop()
      } catch {
        /* ignore */
      }
      finish('no-speech')
    }, timeoutMs)

    try {
      activeRecognition = rec
      rec.start()
    } catch {
      finish('error')
    }
  })
}

export function stopListening(): void {
  if (!activeRecognition) return
  try {
    activeRecognition.abort()
  } catch {
    /* ignore */
  }
  activeRecognition = null
}

/**
 * Ask for the mic once, so the browser prompt appears in Parent Mode rather
 * than mid-quest. Returns false if unavailable or denied.
 */
export async function requestMic(): Promise<boolean> {
  if (!capabilities.stt) return false
  try {
    const stream = await navigator.mediaDevices?.getUserMedia({ audio: true })
    stream?.getTracks().forEach((t) => t.stop())
    capabilities.micAllowed = true
    return true
  } catch {
    capabilities.micAllowed = false
    return false
  }
}
