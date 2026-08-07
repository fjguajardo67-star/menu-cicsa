/** National teams for Flags Match — memory pairs and "find the flag". */
export interface Team {
  id: string
  country: string
  flag: string
  /** Kit colours, used for the shirt shown next to the flag. */
  kit: [string, string]
  difficulty: number
}

export const TEAMS: Team[] = [
  { id: 'fl-mex', country: 'Mexico', flag: '🇲🇽', kit: ['#0B6B3A', '#ffffff'], difficulty: 1 },
  { id: 'fl-bra', country: 'Brazil', flag: '🇧🇷', kit: ['#FFD400', '#0B7A3B'], difficulty: 1 },
  { id: 'fl-arg', country: 'Argentina', flag: '🇦🇷', kit: ['#75AADB', '#ffffff'], difficulty: 1 },
  { id: 'fl-esp', country: 'Spain', flag: '🇪🇸', kit: ['#C60B1E', '#FFC400'], difficulty: 1 },
  { id: 'fl-usa', country: 'United States', flag: '🇺🇸', kit: ['#ffffff', '#3C3B6E'], difficulty: 1 },
  { id: 'fl-fra', country: 'France', flag: '🇫🇷', kit: ['#0055A4', '#ffffff'], difficulty: 2 },
  { id: 'fl-eng', country: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', kit: ['#ffffff', '#CE1124'], difficulty: 2 },
  { id: 'fl-ger', country: 'Germany', flag: '🇩🇪', kit: ['#ffffff', '#000000'], difficulty: 2 },
  { id: 'fl-ita', country: 'Italy', flag: '🇮🇹', kit: ['#1565C0', '#ffffff'], difficulty: 2 },
  { id: 'fl-por', country: 'Portugal', flag: '🇵🇹', kit: ['#C8102E', '#006847'], difficulty: 2 },
  { id: 'fl-jpn', country: 'Japan', flag: '🇯🇵', kit: ['#1B2A6B', '#ffffff'], difficulty: 3 },
  { id: 'fl-kor', country: 'South Korea', flag: '🇰🇷', kit: ['#C60C30', '#003478'], difficulty: 3 },
  { id: 'fl-ned', country: 'Netherlands', flag: '🇳🇱', kit: ['#F36C21', '#ffffff'], difficulty: 3 },
  { id: 'fl-bel', country: 'Belgium', flag: '🇧🇪', kit: ['#C8102E', '#000000'], difficulty: 3 },
  { id: 'fl-uru', country: 'Uruguay', flag: '🇺🇾', kit: ['#8DB9E2', '#ffffff'], difficulty: 3 },
  { id: 'fl-col', country: 'Colombia', flag: '🇨🇴', kit: ['#FCD116', '#003893'], difficulty: 3 },
  { id: 'fl-can', country: 'Canada', flag: '🇨🇦', kit: ['#D80621', '#ffffff'], difficulty: 4 },
  { id: 'fl-aus', country: 'Australia', flag: '🇦🇺', kit: ['#FFD100', '#00843D'], difficulty: 4 },
  { id: 'fl-nga', country: 'Nigeria', flag: '🇳🇬', kit: ['#008751', '#ffffff'], difficulty: 4 },
  { id: 'fl-mar', country: 'Morocco', flag: '🇲🇦', kit: ['#C1272D', '#006233'], difficulty: 4 },
  { id: 'fl-cro', country: 'Croatia', flag: '🇭🇷', kit: ['#ffffff', '#C8102E'], difficulty: 4 },
  { id: 'fl-gha', country: 'Ghana', flag: '🇬🇭', kit: ['#ffffff', '#CE1126'], difficulty: 5 },
  { id: 'fl-sen', country: 'Senegal', flag: '🇸🇳', kit: ['#ffffff', '#00853F'], difficulty: 5 },
  { id: 'fl-pol', country: 'Poland', flag: '🇵🇱', kit: ['#ffffff', '#DC143C'], difficulty: 5 },
  { id: 'fl-den', country: 'Denmark', flag: '🇩🇰', kit: ['#C60C30', '#ffffff'], difficulty: 5 },
  { id: 'fl-swi', country: 'Switzerland', flag: '🇨🇭', kit: ['#D52B1E', '#ffffff'], difficulty: 5 },
]

export const teamById = (id: string): Team | undefined => TEAMS.find((t) => t.id === id)
