/** English Academy — Listen & choose, and Repeat with me. */

export interface ListenItem {
  id: string
  /** Coach says this; the child taps the matching picture. */
  word: string
  emoji: string
  distractors: { label: string; emoji: string }[]
  difficulty: number
}

export const LISTEN_ITEMS: ListenItem[] = [
  { id: 'ln-ball', word: 'ball', emoji: '⚽', distractors: [{ label: 'cat', emoji: '🐱' }, { label: 'sun', emoji: '☀️' }], difficulty: 1 },
  { id: 'ln-dog', word: 'dog', emoji: '🐶', distractors: [{ label: 'fish', emoji: '🐟' }, { label: 'tree', emoji: '🌳' }], difficulty: 1 },
  { id: 'ln-red', word: 'red', emoji: '🔴', distractors: [{ label: 'blue', emoji: '🔵' }, { label: 'green', emoji: '🟢' }], difficulty: 1 },
  { id: 'ln-sun', word: 'sun', emoji: '☀️', distractors: [{ label: 'moon', emoji: '🌙' }, { label: 'rain', emoji: '🌧️' }], difficulty: 1 },
  { id: 'ln-cat', word: 'cat', emoji: '🐱', distractors: [{ label: 'dog', emoji: '🐶' }, { label: 'bird', emoji: '🐦' }], difficulty: 1 },
  { id: 'ln-blue', word: 'blue', emoji: '🔵', distractors: [{ label: 'red', emoji: '🔴' }, { label: 'yellow', emoji: '🟡' }], difficulty: 2 },
  { id: 'ln-goal', word: 'goal', emoji: '🥅', distractors: [{ label: 'boot', emoji: '👟' }, { label: 'cup', emoji: '🏆' }], difficulty: 2 },
  { id: 'ln-happy', word: 'happy', emoji: '😀', distractors: [{ label: 'sad', emoji: '😢' }, { label: 'sleepy', emoji: '😴' }], difficulty: 2 },
  { id: 'ln-water', word: 'water', emoji: '💧', distractors: [{ label: 'fire', emoji: '🔥' }, { label: 'bread', emoji: '🍞' }], difficulty: 2 },
  { id: 'ln-mother', word: 'mother', emoji: '👩', distractors: [{ label: 'father', emoji: '👨' }, { label: 'baby', emoji: '👶' }], difficulty: 2 },
  { id: 'ln-three', word: 'three', emoji: '3️⃣', distractors: [{ label: 'eight', emoji: '8️⃣' }, { label: 'one', emoji: '1️⃣' }], difficulty: 3 },
  { id: 'ln-green', word: 'green', emoji: '🟢', distractors: [{ label: 'orange', emoji: '🟠' }, { label: 'purple', emoji: '🟣' }], difficulty: 3 },
  { id: 'ln-lion', word: 'lion', emoji: '🦁', distractors: [{ label: 'bear', emoji: '🐻' }, { label: 'horse', emoji: '🐴' }], difficulty: 3 },
  { id: 'ln-father', word: 'father', emoji: '👨', distractors: [{ label: 'sister', emoji: '👧' }, { label: 'grandma', emoji: '👵' }], difficulty: 3 },
  { id: 'ln-sad', word: 'sad', emoji: '😢', distractors: [{ label: 'happy', emoji: '😀' }, { label: 'angry', emoji: '😠' }], difficulty: 3 },
  { id: 'ln-twelve', word: 'twelve', emoji: '🕛', distractors: [{ label: 'two', emoji: '2️⃣' }, { label: 'twenty', emoji: '🔢' }], difficulty: 4 },
  { id: 'ln-brother', word: 'brother', emoji: '👦', distractors: [{ label: 'sister', emoji: '👧' }, { label: 'friend', emoji: '🧑‍🤝‍🧑' }], difficulty: 4 },
  { id: 'ln-elephant', word: 'elephant', emoji: '🐘', distractors: [{ label: 'monkey', emoji: '🐵' }, { label: 'rabbit', emoji: '🐰' }], difficulty: 4 },
  { id: 'ln-purple', word: 'purple', emoji: '🟣', distractors: [{ label: 'pink', emoji: '🩷' }, { label: 'brown', emoji: '🟤' }], difficulty: 4 },
  { id: 'ln-thirsty', word: 'thirsty', emoji: '🥤', distractors: [{ label: 'hungry', emoji: '🍎' }, { label: 'tired', emoji: '😴' }], difficulty: 5 },
  { id: 'ln-goalkeeper', word: 'goalkeeper', emoji: '🧤', distractors: [{ label: 'referee', emoji: '📣' }, { label: 'captain', emoji: '🎖️' }], difficulty: 5 },
  { id: 'ln-seventeen', word: 'seventeen', emoji: '🔢', distractors: [{ label: 'seven', emoji: '7️⃣' }, { label: 'seventy', emoji: '💯' }], difficulty: 5 },
]

export interface RepeatItem {
  id: string
  /** Coach says this and the child repeats it into the mic. */
  phrase: string
  /** Anything in here also passes — a five-year-old rarely nails it. */
  accepts: string[]
  emoji: string
  /** Tap-fallback choices when the mic is unavailable. */
  tapOptions: string[]
  difficulty: number
}

export const REPEAT_ITEMS: RepeatItem[] = [
  { id: 'rp-hello', phrase: 'Hello Coach', accepts: ['hello', 'hello coach', 'hi coach'], emoji: '👋', tapOptions: ['Hello Coach', 'Goodbye', 'Thank you'], difficulty: 1 },
  { id: 'rp-name', phrase: 'My name is', accepts: ['my name is', 'my name'], emoji: '🙋', tapOptions: ['My name is', 'I am five', 'Good morning'], difficulty: 1 },
  { id: 'rp-blue', phrase: 'I like blue', accepts: ['i like blue', 'like blue', 'blue'], emoji: '🔵', tapOptions: ['I like blue', 'I like cake', 'I am red'], difficulty: 1 },
  { id: 'rp-count', phrase: 'One, two, three, goal!', accepts: ['one two three goal', 'one two three', 'goal'], emoji: '⚽', tapOptions: ['One two three goal', 'Four five six', 'Ten goals'], difficulty: 1 },
  { id: 'rp-please', phrase: 'May I play please', accepts: ['may i play please', 'can i play please', 'play please', 'please'], emoji: '🙏', tapOptions: ['May I play please', 'Give me that', 'Go away'], difficulty: 2 },
  { id: 'rp-thanks', phrase: 'Thank you very much', accepts: ['thank you very much', 'thank you', 'thanks'], emoji: '😊', tapOptions: ['Thank you very much', 'No thank you', 'See you'], difficulty: 2 },
  { id: 'rp-howareyou', phrase: 'How are you today', accepts: ['how are you today', 'how are you'], emoji: '🤗', tapOptions: ['How are you today', 'Where is it', 'What is that'], difficulty: 2 },
  { id: 'rp-iamgood', phrase: 'I am very good', accepts: ['i am very good', 'i am good', 'very good', 'good'], emoji: '👍', tapOptions: ['I am very good', 'I am a ball', 'It is blue'], difficulty: 2 },
  { id: 'rp-dog', phrase: 'I have a dog', accepts: ['i have a dog', 'have a dog', 'a dog'], emoji: '🐶', tapOptions: ['I have a dog', 'I am a dog', 'The dog is ten'], difficulty: 3 },
  { id: 'rp-family', phrase: 'This is my family', accepts: ['this is my family', 'my family', 'family'], emoji: '👨‍👩‍👧', tapOptions: ['This is my family', 'This is my ball', 'I am happy'], difficulty: 3 },
  { id: 'rp-turn', phrase: 'It is your turn', accepts: ['it is your turn', 'your turn', 'you turn'], emoji: '🔁', tapOptions: ['It is your turn', 'It is my ball', 'Go home'], difficulty: 3 },
  { id: 'rp-sorry', phrase: 'I am sorry my friend', accepts: ['i am sorry my friend', 'i am sorry', 'sorry'], emoji: '🫶', tapOptions: ['I am sorry my friend', 'It was not me', 'You are wrong'], difficulty: 3 },
  { id: 'rp-play', phrase: 'Do you want to play', accepts: ['do you want to play', 'want to play', 'you play'], emoji: '⚽', tapOptions: ['Do you want to play', 'I want the ball', 'Where is Mum'], difficulty: 4 },
  { id: 'rp-hungry', phrase: 'I am a little hungry', accepts: ['i am a little hungry', 'i am hungry', 'hungry'], emoji: '🍎', tapOptions: ['I am a little hungry', 'I am a little cat', 'I like water'], difficulty: 4 },
  { id: 'rp-goodgame', phrase: 'Good game everybody', accepts: ['good game everybody', 'good game'], emoji: '🤝', tapOptions: ['Good game everybody', 'We lost again', 'That is unfair'], difficulty: 4 },
  { id: 'rp-favourite', phrase: 'My favourite colour is green', accepts: ['my favourite colour is green', 'my favorite color is green', 'favourite colour green', 'green'], emoji: '🟢', tapOptions: ['My favourite colour is green', 'My favourite dog is green', 'Green is a number'], difficulty: 5 },
  { id: 'rp-tomorrow', phrase: 'See you tomorrow Coach', accepts: ['see you tomorrow coach', 'see you tomorrow', 'see you'], emoji: '👋', tapOptions: ['See you tomorrow Coach', 'See you never', 'Hello Coach'], difficulty: 5 },
  { id: 'rp-share', phrase: 'Let us share the ball', accepts: ['let us share the ball', 'lets share the ball', 'share the ball', 'share'], emoji: '🤝', tapOptions: ['Let us share the ball', 'It is my ball', 'Give it to me'], difficulty: 5 },
]

/** Every vocabulary word the app teaches, for the Parent → Progress report. */
export const VOCABULARY = LISTEN_ITEMS.map((i) => i.word)
