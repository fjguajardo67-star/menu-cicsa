/** Letters Field — letter recognition, then first words. */
export interface LetterItem {
  id: string
  kind: 'letter' | 'word'
  /** Spoken by Coach. */
  prompt: string
  /** The right answer, shown big. */
  answer: string
  /** Picture that goes with the answer. */
  emoji: string
  /** Wrong answers to sit beside it. */
  distractors: string[]
  difficulty: number
}

export const LETTER_ITEMS: LetterItem[] = [
  // Level 1–2 — which letter does the word start with?
  { id: 'lt-b', kind: 'letter', prompt: 'Ball starts with which letter?', answer: 'B', emoji: '⚽', distractors: ['D', 'M', 'S'], difficulty: 1 },
  { id: 'lt-g', kind: 'letter', prompt: 'Goal starts with which letter?', answer: 'G', emoji: '🥅', distractors: ['P', 'T', 'K'], difficulty: 1 },
  { id: 'lt-c', kind: 'letter', prompt: 'Cat starts with which letter?', answer: 'C', emoji: '🐱', distractors: ['S', 'N', 'R'], difficulty: 1 },
  { id: 'lt-d', kind: 'letter', prompt: 'Dog starts with which letter?', answer: 'D', emoji: '🐶', distractors: ['B', 'G', 'F'], difficulty: 1 },
  { id: 'lt-s', kind: 'letter', prompt: 'Sun starts with which letter?', answer: 'S', emoji: '☀️', distractors: ['C', 'Z', 'T'], difficulty: 1 },
  { id: 'lt-h', kind: 'letter', prompt: 'Hat starts with which letter?', answer: 'H', emoji: '🎩', distractors: ['A', 'N', 'K'], difficulty: 2 },
  { id: 'lt-f', kind: 'letter', prompt: 'Fish starts with which letter?', answer: 'F', emoji: '🐟', distractors: ['V', 'P', 'S'], difficulty: 2 },
  { id: 'lt-t', kind: 'letter', prompt: 'Tree starts with which letter?', answer: 'T', emoji: '🌳', distractors: ['D', 'R', 'L'], difficulty: 2 },
  { id: 'lt-m', kind: 'letter', prompt: 'Moon starts with which letter?', answer: 'M', emoji: '🌙', distractors: ['N', 'W', 'U'], difficulty: 2 },
  { id: 'lt-r', kind: 'letter', prompt: 'Red starts with which letter?', answer: 'R', emoji: '🟥', distractors: ['P', 'B', 'D'], difficulty: 2 },

  // Level 3 — read the whole short word.
  { id: 'lw-ball', kind: 'word', prompt: 'Which word says BALL?', answer: 'BALL', emoji: '⚽', distractors: ['BELL', 'BALD', 'TALL'], difficulty: 3 },
  { id: 'lw-goal', kind: 'word', prompt: 'Which word says GOAL?', answer: 'GOAL', emoji: '🥅', distractors: ['GOLD', 'COAL', 'GIRL'], difficulty: 3 },
  { id: 'lw-cat', kind: 'word', prompt: 'Which word says CAT?', answer: 'CAT', emoji: '🐱', distractors: ['COT', 'CUT', 'BAT'], difficulty: 3 },
  { id: 'lw-dog', kind: 'word', prompt: 'Which word says DOG?', answer: 'DOG', emoji: '🐶', distractors: ['DIG', 'DOT', 'LOG'], difficulty: 3 },
  { id: 'lw-sun', kind: 'word', prompt: 'Which word says SUN?', answer: 'SUN', emoji: '☀️', distractors: ['SON', 'SIT', 'RUN'], difficulty: 3 },

  // Level 4 — colours and numbers as words.
  { id: 'lw-red', kind: 'word', prompt: 'Which word says RED?', answer: 'RED', emoji: '🟥', distractors: ['BED', 'RAD', 'ROD'], difficulty: 4 },
  { id: 'lw-blue', kind: 'word', prompt: 'Which word says BLUE?', answer: 'BLUE', emoji: '🟦', distractors: ['BLOW', 'GLUE', 'BLUR'], difficulty: 4 },
  { id: 'lw-green', kind: 'word', prompt: 'Which word says GREEN?', answer: 'GREEN', emoji: '🟩', distractors: ['GREET', 'QUEEN', 'GRAIN'], difficulty: 4 },
  { id: 'lw-two', kind: 'word', prompt: 'Which word says TWO?', answer: 'TWO', emoji: '2️⃣', distractors: ['TOW', 'TOO', 'WHO'], difficulty: 4 },
  { id: 'lw-five', kind: 'word', prompt: 'Which word says FIVE?', answer: 'FIVE', emoji: '5️⃣', distractors: ['FILE', 'HIVE', 'FIRE'], difficulty: 4 },

  // Level 5 — everyday words.
  { id: 'lw-team', kind: 'word', prompt: 'Which word says TEAM?', answer: 'TEAM', emoji: '👕', distractors: ['TEAR', 'BEAM', 'TIME'], difficulty: 5 },
  { id: 'lw-play', kind: 'word', prompt: 'Which word says PLAY?', answer: 'PLAY', emoji: '🤸', distractors: ['PRAY', 'CLAY', 'PLAN'], difficulty: 5 },
  { id: 'lw-happy', kind: 'word', prompt: 'Which word says HAPPY?', answer: 'HAPPY', emoji: '😀', distractors: ['HAPPEN', 'PUPPY', 'HARPY'], difficulty: 5 },
  { id: 'lw-friend', kind: 'word', prompt: 'Which word says FRIEND?', answer: 'FRIEND', emoji: '🧑‍🤝‍🧑', distractors: ['FRIED', 'FRESH', 'FIEND'], difficulty: 5 },
  { id: 'lw-water', kind: 'word', prompt: 'Which word says WATER?', answer: 'WATER', emoji: '💧', distractors: ['WAITER', 'WINTER', 'LATER'], difficulty: 5 },
]
