/**
 * Lenient scoring for a five-year-old's spoken English.
 *
 * The bar is deliberately low. A child saying "mai neim is Tomas" must pass
 * "my name is Tomás". Being too strict here is the single fastest way to
 * make a kid stop talking, so every rule below leans toward accepting.
 */

/** Spanish-speaker phonetic substitutions, applied before comparison. */
const PHONETIC: [RegExp, string][] = [
  [/ph/g, 'f'],
  [/ck|qu?/g, 'k'],
  [/c(?=[eiy])/g, 's'],
  [/c/g, 'k'],
  [/z/g, 's'],
  [/x/g, 's'],
  [/j/g, 'y'],
  [/ll/g, 'y'],
  [/v/g, 'b'],
  [/w/g, 'b'],
  [/th/g, 't'],
  [/sh|ch/g, 'ch'],
  [/gh/g, ''],
  [/h/g, ''],
  [/ee|ea|ie|y\b/g, 'i'],
  [/oo|ou|ow/g, 'u'],
  [/ai|ay|ei|ey/g, 'ei'],
  [/(.)\1+/g, '$1'], // collapse doubled letters
]

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function phonetic(text: string): string {
  let s = normalize(text).replace(/\s/g, '')
  for (const [re, to] of PHONETIC) s = s.replace(re, to)
  return s
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0
  if (!a.length) return b.length
  if (!b.length) return a.length
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    const row = [i]
    for (let j = 1; j <= b.length; j++) {
      row[j] = Math.min(
        prev[j] + 1,
        row[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      )
    }
    prev = row
  }
  return prev[b.length]
}

const ratio = (a: string, b: string): number => {
  const longest = Math.max(a.length, b.length)
  if (longest === 0) return 1
  return 1 - levenshtein(a, b) / longest
}

/** Filler the child (or the recognizer) may add; never penalised. */
const FILLER = new Set(['um', 'uh', 'eh', 'the', 'a', 'is', 'i', 'ok', 'okay', 'yes'])

/** 0..1 — how close the heard phrase is to the best of the expected ones. */
export function score(heard: string, expected: string | string[]): number {
  const options = Array.isArray(expected) ? expected : [expected]
  const h = normalize(heard)
  if (!h) return 0
  const hp = phonetic(heard)

  let best = 0
  for (const option of options) {
    const e = normalize(option)
    const ep = phonetic(option)
    if (!e) continue

    let s = 0

    // Containment either way — a child who says more than asked still passes.
    if (h === e || hp === ep) s = 1
    else if (h.includes(e) || e.includes(h)) s = Math.max(s, 0.95)
    else if (hp.includes(ep) || ep.includes(hp)) s = Math.max(s, 0.9)

    // Content-word overlap.
    const hw = h.split(' ').filter((w) => !FILLER.has(w))
    const ew = e.split(' ').filter((w) => !FILLER.has(w))
    if (ew.length) {
      const matched = ew.filter((w) =>
        hw.some((x) => x === w || phonetic(x) === phonetic(w) || ratio(x, w) >= 0.65),
      ).length
      s = Math.max(s, matched / ew.length)
    }

    // Whole-string similarity, phonetic form weighted a little higher.
    s = Math.max(s, ratio(h, e), ratio(hp, ep) * 0.95)
    best = Math.max(best, s)
  }
  return Math.min(1, best)
}

/** The pass bar. Low on purpose. */
export const PASS_THRESHOLD = 0.55

export function passes(heard: string, expected: string | string[]): boolean {
  return score(heard, expected) >= PASS_THRESHOLD
}

/** Did the child say any of these words at all? Used for open questions. */
export function mentionsAny(heard: string, keywords: string[]): boolean {
  const h = normalize(heard)
  const hp = phonetic(heard)
  return keywords.some((k) => {
    const n = normalize(k)
    return h.includes(n) || hp.includes(phonetic(k)) || score(heard, k) >= 0.7
  })
}
