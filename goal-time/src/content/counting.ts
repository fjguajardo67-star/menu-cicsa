/** Count the Goals — counting, then simple addition, soccer-flavoured. */
export interface CountItem {
  id: string
  /** Spoken by Coach and shown as a caption. */
  prompt: string
  /** Emoji rows to count. Two rows means an addition. */
  rows: string[][]
  answer: number
  difficulty: number
}

const row = (emoji: string, n: number): string[] => Array.from({ length: n }, () => emoji)

export const COUNT_ITEMS: CountItem[] = [
  // Level 1 — count to five.
  { id: 'ct-1', prompt: 'How many balls do you see?', rows: [row('⚽', 3)], answer: 3, difficulty: 1 },
  { id: 'ct-2', prompt: 'Count the goals!', rows: [row('🥅', 2)], answer: 2, difficulty: 1 },
  { id: 'ct-3', prompt: 'How many players?', rows: [row('🧒', 5)], answer: 5, difficulty: 1 },
  { id: 'ct-4', prompt: 'Count the trophies.', rows: [row('🏆', 4)], answer: 4, difficulty: 1 },
  { id: 'ct-5', prompt: 'How many boots?', rows: [row('👟', 1)], answer: 1, difficulty: 1 },

  // Level 2 — count to ten.
  { id: 'ct-6', prompt: 'How many balls?', rows: [row('⚽', 7)], answer: 7, difficulty: 2 },
  { id: 'ct-7', prompt: 'Count the whistles.', rows: [row('📣', 6)], answer: 6, difficulty: 2 },
  { id: 'ct-8', prompt: 'How many stars?', rows: [row('⭐', 8)], answer: 8, difficulty: 2 },
  { id: 'ct-9', prompt: 'Count the players on the pitch.', rows: [row('🧒', 9)], answer: 9, difficulty: 2 },
  { id: 'ct-10', prompt: 'How many footballs?', rows: [row('⚽', 10)], answer: 10, difficulty: 2 },

  // Level 3 — adding small numbers.
  { id: 'ct-11', prompt: 'Two goals plus one goal. How many?', rows: [row('⚽', 2), row('⚽', 1)], answer: 3, difficulty: 3 },
  { id: 'ct-12', prompt: 'Three goals plus two goals!', rows: [row('⚽', 3), row('⚽', 2)], answer: 5, difficulty: 3 },
  { id: 'ct-13', prompt: 'One trophy plus three trophies.', rows: [row('🏆', 1), row('🏆', 3)], answer: 4, difficulty: 3 },
  { id: 'ct-14', prompt: 'Two players plus two players.', rows: [row('🧒', 2), row('🧒', 2)], answer: 4, difficulty: 3 },
  { id: 'ct-15', prompt: 'Four stars plus one star.', rows: [row('⭐', 4), row('⭐', 1)], answer: 5, difficulty: 3 },

  // Level 4 — adding to ten.
  { id: 'ct-16', prompt: 'Four goals plus three goals.', rows: [row('⚽', 4), row('⚽', 3)], answer: 7, difficulty: 4 },
  { id: 'ct-17', prompt: 'Five players plus four players.', rows: [row('🧒', 5), row('🧒', 4)], answer: 9, difficulty: 4 },
  { id: 'ct-18', prompt: 'Six stars plus two stars.', rows: [row('⭐', 6), row('⭐', 2)], answer: 8, difficulty: 4 },
  { id: 'ct-19', prompt: 'Three boots plus three boots.', rows: [row('👟', 3), row('👟', 3)], answer: 6, difficulty: 4 },
  { id: 'ct-20', prompt: 'Five goals plus five goals!', rows: [row('⚽', 5), row('⚽', 5)], answer: 10, difficulty: 4 },

  // Level 5 — bigger sums.
  { id: 'ct-21', prompt: 'Seven goals plus four goals.', rows: [row('⚽', 7), row('⚽', 4)], answer: 11, difficulty: 5 },
  { id: 'ct-22', prompt: 'Six players plus six players.', rows: [row('🧒', 6), row('🧒', 6)], answer: 12, difficulty: 5 },
  { id: 'ct-23', prompt: 'Eight stars plus five stars.', rows: [row('⭐', 8), row('⭐', 5)], answer: 13, difficulty: 5 },
  { id: 'ct-24', prompt: 'Nine goals plus two goals.', rows: [row('⚽', 9), row('⚽', 2)], answer: 11, difficulty: 5 },
  { id: 'ct-25', prompt: 'Seven trophies plus seven trophies.', rows: [row('🏆', 7), row('🏆', 7)], answer: 14, difficulty: 5 },
]
