/** Art Corner — a daily drawing prompt. Completion earns the star; nobody judges the drawing. */
export interface ArtPrompt {
  id: string
  prompt: string
  emoji: string
  difficulty: number
}

export const ART_PROMPTS: ArtPrompt[] = [
  { id: 'ar-1', prompt: 'Draw your favourite ball.', emoji: '⚽', difficulty: 1 },
  { id: 'ar-2', prompt: 'Draw a big yellow sun.', emoji: '☀️', difficulty: 1 },
  { id: 'ar-3', prompt: 'Draw your team shirt.', emoji: '👕', difficulty: 1 },
  { id: 'ar-4', prompt: 'Draw a happy face.', emoji: '😀', difficulty: 1 },
  { id: 'ar-5', prompt: 'Draw a goal with a net.', emoji: '🥅', difficulty: 2 },
  { id: 'ar-6', prompt: 'Draw your favourite animal.', emoji: '🐶', difficulty: 2 },
  { id: 'ar-7', prompt: 'Draw a green tree and a blue sky.', emoji: '🌳', difficulty: 2 },
  { id: 'ar-8', prompt: 'Draw a flag for your own team.', emoji: '🚩', difficulty: 3 },
  { id: 'ar-9', prompt: 'Draw your family at the match.', emoji: '👨‍👩‍👧', difficulty: 3 },
  { id: 'ar-10', prompt: 'Draw a trophy with three stars.', emoji: '🏆', difficulty: 3 },
  { id: 'ar-11', prompt: 'Draw the weather today.', emoji: '🌦️', difficulty: 4 },
  { id: 'ar-12', prompt: 'Draw two friends sharing a ball.', emoji: '🤝', difficulty: 4 },
  { id: 'ar-13', prompt: 'Draw a stadium full of people.', emoji: '🏟️', difficulty: 5 },
  { id: 'ar-14', prompt: 'Draw yourself scoring the winning goal.', emoji: '🌟', difficulty: 5 },
]

export const CRAYONS = [
  '#1B1B1B',
  '#E63946',
  '#F4A62A',
  '#FFD400',
  '#0B6B3A',
  '#2D9CDB',
  '#7B4BC9',
  '#8B5E3C',
  '#FF8FB1',
  '#FFFFFF',
]
