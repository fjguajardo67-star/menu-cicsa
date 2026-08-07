/**
 * Fair Play.
 *
 * This field exists to counter-model the rude behaviour of the kidfluencer
 * genre: grabbing, shouting, showing off, refusing to share. Every scenario
 * has one kind answer, and every kind answer is a phrase the child can say
 * out loud.
 */
export interface MannersItem {
  id: string
  /** Read aloud by Coach. */
  scene: string
  emoji: string
  /** The kind answer. `say` is what the child is asked to speak. */
  answer: { label: string; emoji: string; say: string }
  /** Two picture answers that are not kind — never mocked, just not chosen. */
  distractors: { label: string; emoji: string }[]
  /** Coach's line after a correct answer. */
  praise: string
  difficulty: number
}

export const MANNERS_ITEMS: MannersItem[] = [
  {
    id: 'fp-1',
    scene: 'Tomás wants Ana’s ball. What should he say?',
    emoji: '⚽',
    answer: { label: 'Please', emoji: '🙏', say: 'May I play please' },
    distractors: [
      { label: 'Grab it', emoji: '✊' },
      { label: 'Shout', emoji: '📣' },
    ],
    praise: 'Yes! We ask with please.',
    difficulty: 1,
  },
  {
    id: 'fp-2',
    scene: 'Ana gives Tomás a snack. What should he say?',
    emoji: '🍎',
    answer: { label: 'Thank you', emoji: '😊', say: 'Thank you' },
    distractors: [
      { label: 'Nothing', emoji: '🤐' },
      { label: 'Run away', emoji: '🏃' },
    ],
    praise: 'Lovely! Thank you is kind.',
    difficulty: 1,
  },
  {
    id: 'fp-3',
    scene: 'Two friends want one swing. What is fair?',
    emoji: '🛝',
    answer: { label: 'Take turns', emoji: '🔁', say: 'Your turn now' },
    distractors: [
      { label: 'Push', emoji: '💥' },
      { label: 'Cry', emoji: '😭' },
    ],
    praise: 'Great! Taking turns is fair play.',
    difficulty: 1,
  },
  {
    id: 'fp-4',
    scene: 'Tomás steps on Ana’s foot by accident. What now?',
    emoji: '👟',
    answer: { label: 'Say sorry', emoji: '🫶', say: 'I am sorry' },
    distractors: [
      { label: 'Laugh', emoji: '😂' },
      { label: 'Walk off', emoji: '🚶' },
    ],
    praise: 'Yes. Sorry fixes it.',
    difficulty: 2,
  },
  {
    id: 'fp-5',
    scene: 'Ana has one ball and Tomás has none. What can she do?',
    emoji: '🤝',
    answer: { label: 'Share', emoji: '🤝', say: 'Let us share' },
    distractors: [
      { label: 'Hide it', emoji: '🙈' },
      { label: 'Say no', emoji: '🙅' },
    ],
    praise: 'Sharing makes two happy players!',
    difficulty: 2,
  },
  {
    id: 'fp-6',
    scene: 'Someone is talking. Tomás wants to speak. What should he do?',
    emoji: '🗣️',
    answer: { label: 'Wait', emoji: '⏳', say: 'I will wait' },
    distractors: [
      { label: 'Interrupt', emoji: '📢' },
      { label: 'Shout louder', emoji: '🔊' },
    ],
    praise: 'Good waiting! That is respect.',
    difficulty: 2,
  },
  {
    id: 'fp-7',
    scene: 'Ana scores a goal against Tomás. What can he say?',
    emoji: '🥅',
    answer: { label: 'Well done', emoji: '👏', say: 'Well done Ana' },
    distractors: [
      { label: 'That is unfair', emoji: '😠' },
      { label: 'Quit', emoji: '🚪' },
    ],
    praise: 'A real teammate says well done!',
    difficulty: 3,
  },
  {
    id: 'fp-8',
    scene: 'A new child stands alone at the pitch. What can Tomás do?',
    emoji: '🧍',
    answer: { label: 'Invite them', emoji: '👋', say: 'Come and play' },
    distractors: [
      { label: 'Ignore', emoji: '🙄' },
      { label: 'Point', emoji: '👉' },
    ],
    praise: 'Kind! Everybody plays.',
    difficulty: 3,
  },
  {
    id: 'fp-9',
    scene: 'Tomás loses the match. What is fair play?',
    emoji: '🤝',
    answer: { label: 'Shake hands', emoji: '🤝', say: 'Good game' },
    distractors: [
      { label: 'Throw the ball', emoji: '💢' },
      { label: 'Blame a friend', emoji: '😤' },
    ],
    praise: 'Good game! That is a champion.',
    difficulty: 3,
  },
  {
    id: 'fp-10',
    scene: 'Ana needs help carrying the goal net. What can Tomás say?',
    emoji: '🥅',
    answer: { label: 'I can help', emoji: '💪', say: 'I can help you' },
    distractors: [
      { label: 'Not my job', emoji: '🤷' },
      { label: 'Watch', emoji: '👀' },
    ],
    praise: 'Helping is what teammates do.',
    difficulty: 4,
  },
  {
    id: 'fp-11',
    scene: 'Tomás wants a snack at a friend’s house. How does he ask?',
    emoji: '🍪',
    answer: { label: 'May I please', emoji: '🙏', say: 'May I have one please' },
    distractors: [
      { label: 'Take it', emoji: '🫳' },
      { label: 'Give me', emoji: '😠' },
    ],
    praise: 'Beautiful asking!',
    difficulty: 4,
  },
  {
    id: 'fp-12',
    scene: 'A friend made a mistake in the game. What does Tomás say?',
    emoji: '😟',
    answer: { label: 'It is okay', emoji: '🫂', say: 'It is okay try again' },
    distractors: [
      { label: 'You are bad', emoji: '👎' },
      { label: 'Sigh loudly', emoji: '😮‍💨' },
    ],
    praise: 'Kind words help a friend try again.',
    difficulty: 5,
  },
  {
    id: 'fp-13',
    scene: 'It is time to stop playing. What does Tomás do?',
    emoji: '⏰',
    answer: { label: 'Stop kindly', emoji: '👍', say: 'Okay I will stop' },
    distractors: [
      { label: 'Five more', emoji: '🥺' },
      { label: 'Hide', emoji: '🙈' },
    ],
    praise: 'Stopping on time is very strong!',
    difficulty: 5,
  },
  {
    id: 'fp-14',
    scene: 'Ana is sad because she missed a goal. What can Tomás do?',
    emoji: '😢',
    answer: { label: 'Cheer her up', emoji: '🌟', say: 'You can do it' },
    distractors: [
      { label: 'Laugh', emoji: '😆' },
      { label: 'Say nothing', emoji: '😐' },
    ],
    praise: 'You are a great friend!',
    difficulty: 5,
  },
]
