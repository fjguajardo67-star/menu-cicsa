/**
 * Story Bench — Coach reads a short story aloud, then asks 2–3 questions.
 * Answers are pictures, so nothing depends on reading.
 *
 * `{name}` is replaced with the child's name so every story stars them.
 */
export interface StoryQuestion {
  q: string
  options: { label: string; emoji: string }[]
  answerIndex: number
}

export interface Story {
  id: string
  title: string
  emoji: string
  /** Sentences, read one at a time so a five-year-old can follow. */
  lines: string[]
  questions: StoryQuestion[]
  difficulty: number
}

export const STORIES: Story[] = [
  {
    id: 'st-1',
    title: 'The Red Ball',
    emoji: '🔴',
    lines: [
      '{name} has a red ball.',
      '{name} kicks the ball to a friend.',
      'The friend laughs and kicks it back.',
      'They play until the sun goes down.',
    ],
    questions: [
      {
        q: 'What colour is the ball?',
        options: [
          { label: 'Red', emoji: '🔴' },
          { label: 'Blue', emoji: '🔵' },
          { label: 'Green', emoji: '🟢' },
        ],
        answerIndex: 0,
      },
      {
        q: 'Who does {name} kick the ball to?',
        options: [
          { label: 'A friend', emoji: '🧑‍🤝‍🧑' },
          { label: 'A dog', emoji: '🐶' },
          { label: 'Nobody', emoji: '🚫' },
        ],
        answerIndex: 0,
      },
    ],
    difficulty: 1,
  },
  {
    id: 'st-2',
    title: 'The Little Cat',
    emoji: '🐱',
    lines: [
      'A little cat sits on the pitch.',
      '{name} says hello to the cat.',
      'The cat runs after the ball.',
      'Now the cat wants to play too!',
    ],
    questions: [
      {
        q: 'What animal is in the story?',
        options: [
          { label: 'A cat', emoji: '🐱' },
          { label: 'A cow', emoji: '🐮' },
          { label: 'A bird', emoji: '🐦' },
        ],
        answerIndex: 0,
      },
      {
        q: 'What does the cat run after?',
        options: [
          { label: 'The ball', emoji: '⚽' },
          { label: 'The bus', emoji: '🚌' },
          { label: 'A fish', emoji: '🐟' },
        ],
        answerIndex: 0,
      },
    ],
    difficulty: 1,
  },
  {
    id: 'st-3',
    title: 'Rain on the Pitch',
    emoji: '🌧️',
    lines: [
      'It is raining on the pitch.',
      '{name} puts on a big blue coat.',
      'The grass is wet and slippery.',
      '{name} scores one goal and goes home warm.',
    ],
    questions: [
      {
        q: 'What is the weather?',
        options: [
          { label: 'Rainy', emoji: '🌧️' },
          { label: 'Sunny', emoji: '☀️' },
          { label: 'Snowy', emoji: '❄️' },
        ],
        answerIndex: 0,
      },
      {
        q: 'What colour is the coat?',
        options: [
          { label: 'Blue', emoji: '🔵' },
          { label: 'Yellow', emoji: '🟡' },
          { label: 'Black', emoji: '⚫' },
        ],
        answerIndex: 0,
      },
      {
        q: 'How many goals?',
        options: [
          { label: 'One', emoji: '1️⃣' },
          { label: 'Three', emoji: '3️⃣' },
          { label: 'Five', emoji: '5️⃣' },
        ],
        answerIndex: 0,
      },
    ],
    difficulty: 2,
  },
  {
    id: 'st-4',
    title: 'The Lost Boot',
    emoji: '👟',
    lines: [
      '{name} cannot find one boot.',
      'It is not under the bed.',
      'It is not in the bag.',
      'The dog has it! Everyone laughs.',
    ],
    questions: [
      {
        q: 'What is lost?',
        options: [
          { label: 'A boot', emoji: '👟' },
          { label: 'A hat', emoji: '🎩' },
          { label: 'A ball', emoji: '⚽' },
        ],
        answerIndex: 0,
      },
      {
        q: 'Who has it?',
        options: [
          { label: 'The dog', emoji: '🐶' },
          { label: 'The cat', emoji: '🐱' },
          { label: 'Mum', emoji: '👩' },
        ],
        answerIndex: 0,
      },
    ],
    difficulty: 2,
  },
  {
    id: 'st-5',
    title: 'The New Player',
    emoji: '🧍',
    lines: [
      'A new child stands by the fence.',
      'Nobody knows her name.',
      '{name} walks over and says, come and play.',
      'Now the team has one more friend.',
    ],
    questions: [
      {
        q: 'What does {name} say?',
        options: [
          { label: 'Come and play', emoji: '👋' },
          { label: 'Go away', emoji: '🙅' },
          { label: 'Nothing', emoji: '🤐' },
        ],
        answerIndex: 0,
      },
      {
        q: 'How does the story end?',
        options: [
          { label: 'A new friend', emoji: '🧑‍🤝‍🧑' },
          { label: 'A big fight', emoji: '💢' },
          { label: 'Everyone leaves', emoji: '🚪' },
        ],
        answerIndex: 0,
      },
    ],
    difficulty: 3,
  },
  {
    id: 'st-6',
    title: 'Ten Green Apples',
    emoji: '🍏',
    lines: [
      'After the match {name} is hungry.',
      'Mum brings ten green apples.',
      '{name} shares four with the team.',
      'Six apples are left in the bag.',
    ],
    questions: [
      {
        q: 'How many apples at the start?',
        options: [
          { label: 'Ten', emoji: '🔟' },
          { label: 'Four', emoji: '4️⃣' },
          { label: 'Six', emoji: '6️⃣' },
        ],
        answerIndex: 0,
      },
      {
        q: 'How many are left?',
        options: [
          { label: 'Six', emoji: '6️⃣' },
          { label: 'Two', emoji: '2️⃣' },
          { label: 'Ten', emoji: '🔟' },
        ],
        answerIndex: 0,
      },
      {
        q: 'What colour are the apples?',
        options: [
          { label: 'Green', emoji: '🟢' },
          { label: 'Red', emoji: '🔴' },
          { label: 'Blue', emoji: '🔵' },
        ],
        answerIndex: 0,
      },
    ],
    difficulty: 3,
  },
  {
    id: 'st-7',
    title: 'The Big Match',
    emoji: '🏟️',
    lines: [
      'Today is the big match.',
      '{name} is a little bit nervous.',
      'The team says, we play together.',
      'They do not win, but they all shake hands.',
    ],
    questions: [
      {
        q: 'How does {name} feel at first?',
        options: [
          { label: 'Nervous', emoji: '😟' },
          { label: 'Sleepy', emoji: '😴' },
          { label: 'Angry', emoji: '😠' },
        ],
        answerIndex: 0,
      },
      {
        q: 'What do they do at the end?',
        options: [
          { label: 'Shake hands', emoji: '🤝' },
          { label: 'Shout', emoji: '📣' },
          { label: 'Go home sad', emoji: '😢' },
        ],
        answerIndex: 0,
      },
    ],
    difficulty: 4,
  },
  {
    id: 'st-8',
    title: 'Grandpa’s Old Ball',
    emoji: '👴',
    lines: [
      'Grandpa keeps an old brown ball.',
      'He played with it when he was small.',
      'He gives it to {name} on Sunday.',
      '{name} says thank you and hugs him.',
    ],
    questions: [
      {
        q: 'Whose ball is it?',
        options: [
          { label: 'Grandpa’s', emoji: '👴' },
          { label: 'The dog’s', emoji: '🐶' },
          { label: 'The teacher’s', emoji: '🧑‍🏫' },
        ],
        answerIndex: 0,
      },
      {
        q: 'What does {name} say?',
        options: [
          { label: 'Thank you', emoji: '😊' },
          { label: 'I want more', emoji: '🙄' },
          { label: 'It is old', emoji: '👎' },
        ],
        answerIndex: 0,
      },
    ],
    difficulty: 4,
  },
  {
    id: 'st-9',
    title: 'The Night Practice',
    emoji: '🌙',
    lines: [
      'The moon is out and the pitch is quiet.',
      '{name} practises kicking to the wall.',
      'One, two, three, ten times in a row.',
      'Practice makes {name} strong.',
    ],
    questions: [
      {
        q: 'When does {name} practise?',
        options: [
          { label: 'At night', emoji: '🌙' },
          { label: 'At lunch', emoji: '🍽️' },
          { label: 'In the morning', emoji: '🌅' },
        ],
        answerIndex: 0,
      },
      {
        q: 'How many times in a row?',
        options: [
          { label: 'Ten', emoji: '🔟' },
          { label: 'Two', emoji: '2️⃣' },
          { label: 'Five', emoji: '5️⃣' },
        ],
        answerIndex: 0,
      },
      {
        q: 'What makes {name} strong?',
        options: [
          { label: 'Practice', emoji: '💪' },
          { label: 'Sleeping', emoji: '😴' },
          { label: 'Sweets', emoji: '🍬' },
        ],
        answerIndex: 0,
      },
    ],
    difficulty: 5,
  },
  {
    id: 'st-10',
    title: 'The Yellow Card',
    emoji: '🟨',
    lines: [
      'A player pushes {name} in the match.',
      'The referee shows a yellow card.',
      'The player says, I am sorry.',
      '{name} says, it is okay, and they play on.',
    ],
    questions: [
      {
        q: 'What colour is the card?',
        options: [
          { label: 'Yellow', emoji: '🟨' },
          { label: 'Red', emoji: '🟥' },
          { label: 'Green', emoji: '🟩' },
        ],
        answerIndex: 0,
      },
      {
        q: 'What does the player say?',
        options: [
          { label: 'I am sorry', emoji: '🫶' },
          { label: 'Nothing', emoji: '🤐' },
          { label: 'Go away', emoji: '🙅' },
        ],
        answerIndex: 0,
      },
    ],
    difficulty: 5,
  },
]

export const fillName = (text: string, name: string): string =>
  text.replaceAll('{name}', name)
