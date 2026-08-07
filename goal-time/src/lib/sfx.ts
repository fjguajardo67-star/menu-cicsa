/**
 * Sound effects, synthesised with WebAudio.
 *
 * No audio files: the app stays tiny and works offline on first load. Every
 * sound is short and starts from a user gesture, which is what iPad Safari
 * needs. A global mute lives in Parent Mode.
 */

let ctx: AudioContext | null = null
let muted = false

export function setMuted(value: boolean): void {
  muted = value
}

function audio(): AudioContext | null {
  if (muted) return null
  try {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    ctx ??= new Ctor()
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

/** Call from the first tap, alongside speech.unlock(). */
export function unlockAudio(): void {
  audio()
}

interface ToneOptions {
  freq: number
  to?: number
  duration: number
  type?: OscillatorType
  gain?: number
  delay?: number
}

function tone({ freq, to, duration, type = 'sine', gain = 0.2, delay = 0 }: ToneOptions): void {
  const ac = audio()
  if (!ac) return
  const t0 = ac.currentTime + delay
  const osc = ac.createOscillator()
  const amp = ac.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  if (to !== undefined) osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), t0 + duration)
  amp.gain.setValueAtTime(0.0001, t0)
  amp.gain.exponentialRampToValueAtTime(gain, t0 + 0.012)
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)
  osc.connect(amp).connect(ac.destination)
  osc.start(t0)
  osc.stop(t0 + duration + 0.05)
}

function noise(duration: number, gain = 0.12, delay = 0, filterHz = 1400): void {
  const ac = audio()
  if (!ac) return
  const t0 = ac.currentTime + delay
  const frames = Math.floor(ac.sampleRate * duration)
  const buffer = ac.createBuffer(1, frames, ac.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < frames; i++) {
    // Fade the tail so the crowd swells rather than clicking off.
    data[i] = (Math.random() * 2 - 1) * (1 - i / frames)
  }
  const src = ac.createBufferSource()
  src.buffer = buffer
  const filter = ac.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = filterHz
  const amp = ac.createGain()
  amp.gain.setValueAtTime(0.0001, t0)
  amp.gain.exponentialRampToValueAtTime(gain, t0 + duration * 0.35)
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)
  src.connect(filter).connect(amp).connect(ac.destination)
  src.start(t0)
}

export const sfx = {
  /** Light press confirmation. */
  tap() {
    tone({ freq: 640, to: 820, duration: 0.06, type: 'triangle', gain: 0.09 })
  },
  /** A star landed. */
  star() {
    tone({ freq: 880, duration: 0.1, type: 'triangle', gain: 0.14 })
    tone({ freq: 1320, duration: 0.14, type: 'triangle', gain: 0.11, delay: 0.07 })
  },
  /** Correct answer. */
  correct() {
    tone({ freq: 523, duration: 0.11, type: 'sine', gain: 0.16 })
    tone({ freq: 659, duration: 0.11, type: 'sine', gain: 0.16, delay: 0.09 })
    tone({ freq: 784, duration: 0.2, type: 'sine', gain: 0.16, delay: 0.18 })
  },
  /** Not right — warm and low, never a buzzer. */
  retry() {
    tone({ freq: 330, to: 262, duration: 0.22, type: 'sine', gain: 0.11 })
  },
  /** Ball struck. */
  kick() {
    tone({ freq: 180, to: 60, duration: 0.13, type: 'square', gain: 0.16 })
    noise(0.09, 0.09, 0, 900)
  },
  /** Referee's whistle — starts the match. */
  whistle() {
    tone({ freq: 2100, to: 2500, duration: 0.16, type: 'sine', gain: 0.1 })
    tone({ freq: 2400, to: 2000, duration: 0.16, type: 'sine', gain: 0.08, delay: 0.14 })
  },
  /** Crowd cheer — match won. */
  cheer() {
    noise(1.5, 0.16, 0, 1100)
    noise(1.2, 0.1, 0.2, 2200)
    tone({ freq: 523, duration: 0.3, type: 'triangle', gain: 0.1, delay: 0.05 })
    tone({ freq: 784, duration: 0.4, type: 'triangle', gain: 0.1, delay: 0.2 })
  },
  /** Golden Ball — the biggest sound in the app. */
  golden() {
    const notes = [523, 659, 784, 1047, 1319]
    notes.forEach((f, i) =>
      tone({ freq: f, duration: 0.35, type: 'triangle', gain: 0.15, delay: i * 0.1 }),
    )
    noise(1.8, 0.14, 0.25, 1600)
  },
  /** Prize reached. */
  prize() {
    const notes = [392, 523, 659, 784, 1047]
    notes.forEach((f, i) =>
      tone({ freq: f, duration: 0.28, type: 'sine', gain: 0.14, delay: i * 0.08 }),
    )
    noise(1.4, 0.12, 0.3, 1300)
  },
  /** Padlock opening — watch time unlocked. */
  unlock() {
    tone({ freq: 440, duration: 0.09, type: 'square', gain: 0.1 })
    tone({ freq: 880, to: 1320, duration: 0.25, type: 'triangle', gain: 0.13, delay: 0.08 })
  },
}
