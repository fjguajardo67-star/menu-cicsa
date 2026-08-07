/**
 * Coach Chat.
 *
 * Two engines behind one interface. `askCoach` prefers the Anthropic API
 * when the parent has entered a key and the network is up, and silently
 * falls back to a scripted dialogue tree otherwise — the child never sees
 * an error, only Coach.
 *
 * Privacy: the only child data that ever leaves the device is the first
 * name and the age. No surname, no profile, no history beyond this chat.
 */

const API_URL = 'https://api.anthropic.com/v1/messages'
const API_VERSION = '2023-06-01'

export interface CoachReply {
  text: string
  /** 2–3 big tappable/sayable options for the child. */
  options: string[]
  engine: 'api' | 'offline'
}

export interface CoachContext {
  childName: string
  age: number
  /** Prior turns, oldest first. */
  history: { role: 'coach' | 'child'; text: string }[]
}

/**
 * The system prompt is hard-locked to the ESL script. It is the only place
 * Coach's behaviour is defined, and it is never assembled from child input.
 */
export function systemPrompt(name: string, age: number): string {
  return [
    `You are Coach, a warm cartoon soccer coach teaching beginner English to ${name}, a ${age}-year-old child whose home language is Spanish.`,
    '',
    'RULES — follow every one, always:',
    '- Reply with ONE short sentence. Never more. Maximum 8 words.',
    '- Use only beginner ESL vocabulary: greetings, colors, numbers 1 to 20, animals, family words, soccer words, and manners phrases (please, thank you, sorry, your turn).',
    `- Use ${name}'s name often and warmly.`,
    '- Never say "wrong", "no", or "incorrect". If the child makes a mistake, simply model the correct phrase back cheerfully.',
    '- Always be encouraging. Celebrate every attempt.',
    '- Ask a simple question most turns so the child keeps talking.',
    '- NEVER discuss anything outside this English lesson. Not news, not violence, not scary topics, not adult topics, not other apps or websites, not personal information.',
    `- NEVER ask for any personal information beyond the first name you already know (${name}).`,
    '- If the child says something off-script, upsetting, or concerning, do not engage with it. Warmly redirect to the lesson with a simple question.',
    '- Never mention that you are an AI, a model, or a computer program. You are Coach.',
    '',
    'After your sentence, on a new line, write exactly:',
    'OPTIONS: option one | option two | option three',
    'Each option is something the child could say back, 1 to 4 simple English words.',
  ].join('\n')
}

function parseReply(raw: string): { text: string; options: string[] } {
  const lines = raw.split('\n')
  const optionLine = lines.find((l) => l.trim().toUpperCase().startsWith('OPTIONS:'))
  const text = lines
    .filter((l) => l !== optionLine)
    .join(' ')
    .trim()
  const options = optionLine
    ? optionLine
        .slice(optionLine.indexOf(':') + 1)
        .split('|')
        .map((o) => o.trim())
        .filter(Boolean)
        .slice(0, 3)
    : []
  return { text: text || 'Good job!', options }
}

/**
 * Validate anything the model returns before a child sees it. A reply that
 * fails this check is replaced by the scripted tree rather than shown.
 */
function isSafeShape(text: string, options: string[]): boolean {
  if (!text || text.length > 160) return false
  if (options.length < 2) return false
  if (options.some((o) => o.length > 28)) return false
  // Nothing that looks like a link, a prompt leak, or markup.
  const suspicious = /(https?:|www\.|<[a-z/]|\bsystem\b|\bassistant\b|\bAI\b|\bmodel\b)/i
  return !suspicious.test(text) && !options.some((o) => suspicious.test(o))
}

interface ApiOptions {
  apiKey: string
  model: string
  signal?: AbortSignal
}

async function callApi(ctx: CoachContext, opts: ApiOptions): Promise<CoachReply | null> {
  const messages = ctx.history.map((t) => ({
    role: t.role === 'coach' ? ('assistant' as const) : ('user' as const),
    content: t.text,
  }))
  // The API requires the conversation to open on the child's turn.
  while (messages.length && messages[0].role === 'assistant') messages.shift()
  if (!messages.length) return null

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': opts.apiKey,
      'anthropic-version': API_VERSION,
      // Required for calling the API straight from a browser. The tradeoff
      // is documented for the parent in Parent Mode → Coach.
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: opts.model,
      max_tokens: 120,
      system: systemPrompt(ctx.childName, ctx.age),
      messages,
    }),
    signal: opts.signal,
  })

  if (!res.ok) return null
  const data = (await res.json()) as {
    stop_reason?: string
    content?: { type: string; text?: string }[]
  }
  if (data.stop_reason === 'refusal') return null

  const raw = (data.content ?? [])
    .filter((b) => b.type === 'text')
    .map((b) => b.text ?? '')
    .join('\n')
  if (!raw.trim()) return null

  const { text, options } = parseReply(raw)
  if (!isSafeShape(text, options)) return null
  return { text, options, engine: 'api' }
}

/* ------------------------------------------------------------------ */
/* Offline scripted tree — same vocabulary, no network.                */
/* ------------------------------------------------------------------ */

interface TreeNode {
  say: (name: string) => string
  options: string[]
  /** Keyword → next node. Anything unmatched goes to `fallback`. */
  next: Record<string, string>
  fallback: string
}

const TREE: Record<string, TreeNode> = {
  start: {
    say: (n) => `Hello ${n}! How are you today?`,
    options: ['I am good', 'I am happy', 'I am sleepy'],
    next: { good: 'colors', happy: 'colors', sleepy: 'colors', fine: 'colors' },
    fallback: 'colors',
  },
  colors: {
    say: () => 'Great! What is your favourite colour?',
    options: ['Blue', 'Red', 'Green'],
    next: { blue: 'ball', red: 'ball', green: 'ball', yellow: 'ball' },
    fallback: 'ball',
  },
  ball: {
    say: (n) => `Nice, ${n}! Do you like soccer?`,
    options: ['Yes I do', 'I like it', 'No'],
    next: { yes: 'count', like: 'count', no: 'animals' },
    fallback: 'count',
  },
  count: {
    say: () => 'Let us count goals. One, two, and?',
    options: ['Three', 'Four', 'Five'],
    next: { three: 'animals', four: 'animals', five: 'animals' },
    fallback: 'animals',
  },
  animals: {
    say: () => 'Good counting! What animal do you like?',
    options: ['A dog', 'A cat', 'A lion'],
    next: { dog: 'family', cat: 'family', lion: 'family' },
    fallback: 'family',
  },
  family: {
    say: (n) => `Lovely, ${n}. Who do you play with?`,
    options: ['My mum', 'My dad', 'My friend'],
    next: { mum: 'manners', mom: 'manners', dad: 'manners', friend: 'manners' },
    fallback: 'manners',
  },
  manners: {
    say: () => 'Kind! What do we say for a gift?',
    options: ['Thank you', 'Please', 'Sorry'],
    next: { thank: 'end', please: 'manners2', sorry: 'manners2' },
    fallback: 'manners2',
  },
  manners2: {
    say: () => 'We say thank you. Can you say it?',
    options: ['Thank you', 'Thank you Coach'],
    next: { thank: 'end' },
    fallback: 'end',
  },
  end: {
    say: (n) => `Super English today, ${n}! See you soon.`,
    options: ['Bye Coach', 'Thank you', 'See you'],
    next: {},
    fallback: 'start',
  },
}

const offlineState = new Map<string, string>()

function offlineReply(ctx: CoachContext, sessionId: string): CoachReply {
  const heard = (ctx.history.at(-1)?.text ?? '').toLowerCase()
  const currentId = offlineState.get(sessionId) ?? 'start'
  const current = TREE[currentId] ?? TREE.start

  let nextId = current.fallback
  if (ctx.history.length <= 1) {
    nextId = 'start'
  } else {
    for (const [word, target] of Object.entries(current.next)) {
      if (heard.includes(word)) {
        nextId = target
        break
      }
    }
  }

  const node = TREE[nextId] ?? TREE.start
  offlineState.set(sessionId, nextId)
  return { text: node.say(ctx.childName), options: node.options, engine: 'offline' }
}

export function resetOffline(sessionId: string): void {
  offlineState.delete(sessionId)
}

export function offlineOpening(ctx: CoachContext, sessionId: string): CoachReply {
  offlineState.set(sessionId, 'start')
  return { text: TREE.start.say(ctx.childName), options: TREE.start.options, engine: 'offline' }
}

/**
 * Ask Coach. Falls back to the scripted tree on a missing key, a network
 * failure, a slow response, or a reply that fails the safety shape check.
 */
export async function askCoach(
  ctx: CoachContext,
  sessionId: string,
  apiKey: string | null,
  model: string,
): Promise<CoachReply> {
  if (!apiKey || !navigator.onLine) return offlineReply(ctx, sessionId)

  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), 9000)
  try {
    const reply = await callApi(ctx, { apiKey, model, signal: controller.signal })
    return reply ?? offlineReply(ctx, sessionId)
  } catch {
    return offlineReply(ctx, sessionId)
  } finally {
    window.clearTimeout(timer)
  }
}

/** Parent Mode uses this to check a key without starting a chat. */
export async function testKey(apiKey: string, model: string): Promise<string> {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': API_VERSION,
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model,
        max_tokens: 16,
        messages: [{ role: 'user', content: 'Say OK.' }],
      }),
    })
    if (res.ok) return 'Connected. Coach Chat will use the Anthropic API.'
    if (res.status === 401) return 'That key was not accepted (401).'
    if (res.status === 404) return `Model "${model}" was not found for this key.`
    if (res.status === 429) return 'Rate limited — the key works, try again shortly.'
    return `The API replied with ${res.status}. Coach will use the offline script.`
  } catch {
    return 'Could not reach the API. Coach will use the offline script.'
  }
}
