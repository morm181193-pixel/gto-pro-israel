import type { RangeData, StrategyData, ActionFrequency, Card as CardType } from '@/types/poker'
import { RANKS } from '@/types/poker'

// Action color constants — rgba to match setup grid feel
const C_CHECK = 'rgba(0, 244, 254, 0.7)'      // cyan — check/call
const C_BET_SM = 'rgba(222, 142, 255, 0.6)'   // purple — small bet (Bet 33%)
const C_BET_LG = 'rgba(255, 110, 129, 0.6)'   // pink — large bet (Bet 75%)
// Solid colors for legends & buttons
export const C_CHECK_SOLID = '#00f4fe'
export const C_BET_SM_SOLID = '#de8eff'
export const C_BET_LG_SOLID = '#ff6e81'

// BTN open raise range (Cash 6-max, 100BB)
export const btnOpenRange: RangeData = {
  'AA': 1.0, 'KK': 1.0, 'QQ': 1.0, 'JJ': 1.0, 'TT': 1.0,
  '99': 1.0, '88': 1.0, '77': 0.85, '66': 0.65, '55': 0.55,
  '44': 0.45, '33': 0.40, '22': 0.35,
  'AKs': 1.0, 'AQs': 1.0, 'AJs': 1.0, 'ATs': 1.0, 'A9s': 0.90,
  'A8s': 0.85, 'A7s': 0.80, 'A6s': 0.75, 'A5s': 0.90, 'A4s': 0.80,
  'A3s': 0.70, 'A2s': 0.65,
  'AKo': 1.0, 'AQo': 1.0, 'AJo': 0.95, 'ATo': 0.85, 'A9o': 0.45,
  'KQs': 1.0, 'KJs': 1.0, 'KTs': 1.0, 'K9s': 0.75, 'K8s': 0.40,
  'K7s': 0.30, 'K6s': 0.25, 'K5s': 0.25, 'K4s': 0.20, 'K3s': 0.15, 'K2s': 0.10,
  'KQo': 1.0, 'KJo': 0.85, 'KTo': 0.60, 'K9o': 0.20,
  'QJs': 1.0, 'QTs': 1.0, 'Q9s': 0.65, 'Q8s': 0.30,
  'QJo': 0.75, 'QTo': 0.45,
  'JTs': 1.0, 'J9s': 0.70, 'J8s': 0.35,
  'JTo': 0.55,
  'T9s': 0.90, 'T8s': 0.50, 'T7s': 0.15,
  'T9o': 0.30,
  '98s': 0.85, '97s': 0.40,
  '87s': 0.80, '86s': 0.30,
  '76s': 0.70, '75s': 0.25,
  '65s': 0.65, '64s': 0.20,
  '54s': 0.60, '53s': 0.15,
  '43s': 0.30,
}

// BB defend range vs BTN open
export const bbDefendRange: RangeData = {
  'AA': 1.0, 'KK': 1.0, 'QQ': 1.0, 'JJ': 1.0, 'TT': 1.0,
  '99': 1.0, '88': 1.0, '77': 1.0, '66': 0.90, '55': 0.85,
  '44': 0.80, '33': 0.75, '22': 0.70,
  'AKs': 1.0, 'AQs': 1.0, 'AJs': 1.0, 'ATs': 1.0, 'A9s': 1.0,
  'A8s': 1.0, 'A7s': 1.0, 'A6s': 0.95, 'A5s': 1.0, 'A4s': 0.95,
  'A3s': 0.90, 'A2s': 0.85,
  'AKo': 1.0, 'AQo': 1.0, 'AJo': 1.0, 'ATo': 0.95, 'A9o': 0.80,
  'A8o': 0.65, 'A7o': 0.50, 'A6o': 0.35, 'A5o': 0.50, 'A4o': 0.35,
  'A3o': 0.25, 'A2o': 0.20,
  'KQs': 1.0, 'KJs': 1.0, 'KTs': 1.0, 'K9s': 1.0, 'K8s': 0.85,
  'K7s': 0.80, 'K6s': 0.75, 'K5s': 0.70, 'K4s': 0.60, 'K3s': 0.55, 'K2s': 0.50,
  'KQo': 1.0, 'KJo': 1.0, 'KTo': 0.85, 'K9o': 0.55, 'K8o': 0.30,
  'QJs': 1.0, 'QTs': 1.0, 'Q9s': 1.0, 'Q8s': 0.75, 'Q7s': 0.50, 'Q6s': 0.45,
  'Q5s': 0.40, 'Q4s': 0.35, 'Q3s': 0.30, 'Q2s': 0.25,
  'QJo': 1.0, 'QTo': 0.80, 'Q9o': 0.45,
  'JTs': 1.0, 'J9s': 1.0, 'J8s': 0.75, 'J7s': 0.50, 'J6s': 0.30,
  'JTo': 0.85, 'J9o': 0.40,
  'T9s': 1.0, 'T8s': 0.85, 'T7s': 0.55, 'T6s': 0.30,
  'T9o': 0.60, 'T8o': 0.25,
  '98s': 1.0, '97s': 0.75, '96s': 0.40,
  '98o': 0.45, '97o': 0.20,
  '87s': 1.0, '86s': 0.65, '85s': 0.25,
  '87o': 0.35,
  '76s': 0.95, '75s': 0.55, '74s': 0.20,
  '76o': 0.25,
  '65s': 0.90, '64s': 0.45,
  '54s': 0.85, '53s': 0.35,
  '43s': 0.60, '42s': 0.15,
  '32s': 0.30,
}

// Mock strategy data for solution view (AhKd7c flop, BTN vs BB SRP)
export const mockStrategy: StrategyData = {
  'AA': [
    { action: 'Bet 75%', frequency: 0.45, color: C_BET_LG },
    { action: 'Bet 33%', frequency: 0.30, color: C_BET_SM },
    { action: 'Check', frequency: 0.25, color: C_CHECK },
  ],
  'KK': [
    { action: 'Bet 75%', frequency: 0.55, color: C_BET_LG },
    { action: 'Bet 33%', frequency: 0.25, color: C_BET_SM },
    { action: 'Check', frequency: 0.20, color: C_CHECK },
  ],
  'QQ': [
    { action: 'Check', frequency: 0.65, color: C_CHECK },
    { action: 'Bet 33%', frequency: 0.25, color: C_BET_SM },
    { action: 'Bet 75%', frequency: 0.10, color: C_BET_LG },
  ],
  'AKs': [
    { action: 'Bet 75%', frequency: 0.623, color: C_BET_LG },
    { action: 'Check', frequency: 0.377, color: C_CHECK },
  ],
  'AKo': [
    { action: 'Bet 75%', frequency: 0.55, color: C_BET_LG },
    { action: 'Bet 33%', frequency: 0.20, color: C_BET_SM },
    { action: 'Check', frequency: 0.25, color: C_CHECK },
  ],
  'AQs': [
    { action: 'Bet 33%', frequency: 0.60, color: C_BET_SM },
    { action: 'Check', frequency: 0.40, color: C_CHECK },
  ],
  'AJs': [
    { action: 'Bet 33%', frequency: 0.55, color: C_BET_SM },
    { action: 'Check', frequency: 0.45, color: C_CHECK },
  ],
  'ATs': [
    { action: 'Bet 33%', frequency: 0.50, color: C_BET_SM },
    { action: 'Check', frequency: 0.50, color: C_CHECK },
  ],
  'KQs': [
    { action: 'Bet 33%', frequency: 0.40, color: C_BET_SM },
    { action: 'Check', frequency: 0.60, color: C_CHECK },
  ],
  'JJ': [
    { action: 'Check', frequency: 0.70, color: C_CHECK },
    { action: 'Bet 33%', frequency: 0.30, color: C_BET_SM },
  ],
  'TT': [
    { action: 'Check', frequency: 0.75, color: C_CHECK },
    { action: 'Bet 33%', frequency: 0.25, color: C_BET_SM },
  ],
  '99': [
    { action: 'Check', frequency: 0.80, color: C_CHECK },
    { action: 'Bet 33%', frequency: 0.20, color: C_BET_SM },
  ],
  '77': [
    { action: 'Bet 75%', frequency: 0.40, color: C_BET_LG },
    { action: 'Bet 33%', frequency: 0.35, color: C_BET_SM },
    { action: 'Check', frequency: 0.25, color: C_CHECK },
  ],
  'A7s': [
    { action: 'Bet 75%', frequency: 0.70, color: C_BET_LG },
    { action: 'Bet 33%', frequency: 0.20, color: C_BET_SM },
    { action: 'Check', frequency: 0.10, color: C_CHECK },
  ],
  'K7s': [
    { action: 'Bet 33%', frequency: 0.55, color: C_BET_SM },
    { action: 'Check', frequency: 0.45, color: C_CHECK },
  ],
  '87s': [
    { action: 'Check', frequency: 0.55, color: C_CHECK },
    { action: 'Bet 33%', frequency: 0.35, color: C_BET_SM },
    { action: 'Bet 75%', frequency: 0.10, color: C_BET_LG },
  ],
  '76s': [
    { action: 'Check', frequency: 0.60, color: C_CHECK },
    { action: 'Bet 33%', frequency: 0.30, color: C_BET_SM },
    { action: 'Bet 75%', frequency: 0.10, color: C_BET_LG },
  ],
  '65s': [
    { action: 'Check', frequency: 0.70, color: C_CHECK },
    { action: 'Bet 33%', frequency: 0.30, color: C_BET_SM },
  ],
  '54s': [
    { action: 'Check', frequency: 0.65, color: C_CHECK },
    { action: 'Bet 33%', frequency: 0.35, color: C_BET_SM },
  ],
  '22': [
    { action: 'Check', frequency: 0.85, color: C_CHECK },
    { action: 'Bet 33%', frequency: 0.15, color: C_BET_SM },
  ],
}

// Generate a default strategy for hands not explicitly defined
export function getHandStrategy(hand: string): ActionFrequency[] {
  if (mockStrategy[hand]) return mockStrategy[hand]

  const firstChar = hand[0]
  const secondChar = hand[1]
  const highCards = 'AKQJT'

  if (highCards.includes(firstChar) && highCards.includes(secondChar)) {
    return [
      { action: 'Bet 33%', frequency: 0.45, color: C_BET_SM },
      { action: 'Check', frequency: 0.55, color: C_CHECK },
    ]
  }

  return [
    { action: 'Check', frequency: 0.70, color: C_CHECK },
    { action: 'Bet 33%', frequency: 0.20, color: C_BET_SM },
    { action: 'Bet 75%', frequency: 0.10, color: C_BET_LG },
  ]
}

// Exported color constants for legend (solid versions)
export const ACTION_COLORS = {
  C_CHECK: C_CHECK_SOLID,
  C_BET_SM: C_BET_SM_SOLID,
  C_BET_LG: C_BET_LG_SOLID,
  C_FOLD: '#72757d',
  C_RAISE: C_BET_SM_SOLID,
}

// ─── Mock hand detail data (for clicked hand) ───
export interface MockHandDetail {
  handType: string
  hebrewType: string
  category: 'nuts' | 'strong' | 'medium' | 'weak' | 'air'
  rankInRange: number
  totalCombos: number
  equity: number
  scenarios: { label: string; value: number }[]
  heroAction: string
  heroAmount?: string
  heroConfidence: number
  heroExplanation: string
  heroResponseToRaise?: string
}

const handDetailMap: Record<string, MockHandDetail> = {
  'AKs': {
    handType: 'Top Pair, Top Kicker',
    hebrewType: 'זוג עליון, קיקר גבוה',
    category: 'strong',
    rankInRange: 8,
    totalCombos: 4,
    equity: 72.4,
    scenarios: [{ label: 'מול טווח מלא', value: 72.4 }, { label: 'מול ערך', value: 38.2 }, { label: 'מול בלאפים', value: 91.0 }],
    heroAction: 'Bet 75%',
    heroAmount: '4.9 BB',
    heroConfidence: 0.82,
    heroExplanation: 'יד חזקה מאוד על בורד יבש. הימור גדול לערך מול ידיים חלשות יותר ולהגנה מפני דראו.',
    heroResponseToRaise: 'קול. יד חזקה מספיק כדי להמשיך מול רייז, אך לא מספיק לרי-רייז.',
  },
  'AA': {
    handType: 'Overpair (Aces)',
    hebrewType: 'אובר-פר (אסים)',
    category: 'nuts',
    rankInRange: 2,
    totalCombos: 6,
    equity: 85.3,
    scenarios: [{ label: 'מול טווח מלא', value: 85.3 }, { label: 'מול ערך', value: 62.1 }, { label: 'מול בלאפים', value: 97.5 }],
    heroAction: 'Bet 75%',
    heroAmount: '4.9 BB',
    heroConfidence: 0.91,
    heroExplanation: 'היד החזקה ביותר. הימור גדול לערך מקסימלי. ניתן לשקול slow-play לעתים רחוקות.',
    heroResponseToRaise: 'רי-רייז 3x. יד חזקה מספיק לבניית פוט.',
  },
  'QQ': {
    handType: 'Underpair (Queens)',
    hebrewType: 'אנדר-פר (מלכות)',
    category: 'medium',
    rankInRange: 18,
    totalCombos: 6,
    equity: 54.8,
    scenarios: [{ label: 'מול טווח מלא', value: 54.8 }, { label: 'מול ערך', value: 31.2 }, { label: 'מול בלאפים', value: 82.1 }],
    heroAction: 'Check',
    heroConfidence: 0.72,
    heroExplanation: 'יד בינונית מתחת לבורד. צ׳ק מאפשר שליטה בגודל הפוט ומשמש כ-trap מול בלאפים.',
    heroResponseToRaise: 'פולד מול הימור גדול. יד חלשה מדי להמשיך על בורד עם A-K.',
  },
  '76s': {
    handType: 'Gutshot Straight Draw',
    hebrewType: 'דראו לסטרייט (גאטשוט)',
    category: 'weak',
    rankInRange: 65,
    totalCombos: 4,
    equity: 28.6,
    scenarios: [{ label: 'מול טווח מלא', value: 28.6 }, { label: 'מול ערך', value: 14.3 }, { label: 'מול בלאפים', value: 55.2 }],
    heroAction: 'Check',
    heroConfidence: 0.68,
    heroExplanation: 'דראו חלש. צ׳ק כדי לראות קלף חינם. אפשר לשקול בלאף קטן לעתים.',
  },
  '22': {
    handType: 'Low Pair',
    hebrewType: 'זוג נמוך',
    category: 'weak',
    rankInRange: 72,
    totalCombos: 6,
    equity: 31.2,
    scenarios: [{ label: 'מול טווח מלא', value: 31.2 }, { label: 'מול ערך', value: 11.5 }],
    heroAction: 'Check',
    heroConfidence: 0.85,
    heroExplanation: 'זוג נמוך ללא שום ערך. צ׳ק וקיווי לסט הוא ההגנה הטובה ביותר.',
  },
}

// Default hand detail for non-mapped hands
const defaultDetail: MockHandDetail = {
  handType: 'High Card',
  hebrewType: 'קלף גבוה',
  category: 'air',
  rankInRange: 80,
  totalCombos: 12,
  equity: 22.5,
  scenarios: [{ label: 'מול טווח מלא', value: 22.5 }],
  heroAction: 'Check',
  heroConfidence: 0.75,
  heroExplanation: 'יד חלשה. צ׳ק ושמור על כמה שפחות הפסדים.',
}

export function getHandDetail(hand: string): MockHandDetail {
  return handDetailMap[hand] ?? defaultDetail
}

// Mock opponent range categories
export const mockOpponentCategories = [
  { label: 'Value', hebrewLabel: 'ערך', percentage: 22.5, combos: 42, color: '#00f4fe' },
  { label: 'Marginal', hebrewLabel: 'שוליים', percentage: 31.8, combos: 59, color: '#de8eff' },
  { label: 'Draws', hebrewLabel: 'דראו', percentage: 18.2, combos: 34, color: '#ff6e81' },
  { label: 'Air', hebrewLabel: 'אוויר', percentage: 27.5, combos: 51, color: '#72757d' },
]

// Mock solve result
export const mockSolveResult = {
  oopEquity: 48.2,
  ipEquity: 51.8,
  oopEv: 3.45,
  ipEv: 6.55,
  actions: [
    { action: 'Check', frequency: 0.564, color: C_CHECK_SOLID },
    { action: 'Bet 33%', frequency: 0.254, color: C_BET_SM_SOLID },
    { action: 'Bet 75%', frequency: 0.182, color: C_BET_LG_SOLID },
  ] as ActionFrequency[],
  nashDistance: 0.48,
  iterations: 10000,
}

// ─── Multiway mock data ───

// UTG raise range (~12%)
export const utgRaiseRange: RangeData = {
  'AA': 1.0, 'KK': 1.0, 'QQ': 1.0, 'JJ': 1.0, 'TT': 1.0,
  '99': 0.85, '88': 0.55,
  'AKs': 1.0, 'AQs': 1.0, 'AJs': 1.0, 'ATs': 0.70,
  'AKo': 1.0, 'AQo': 0.85,
  'KQs': 1.0, 'KJs': 0.65,
  'QJs': 0.50, 'JTs': 0.45,
}

// CO raise range (~22%)
export const coRaiseRange: RangeData = {
  'AA': 1.0, 'KK': 1.0, 'QQ': 1.0, 'JJ': 1.0, 'TT': 1.0,
  '99': 1.0, '88': 0.90, '77': 0.75, '66': 0.50, '55': 0.40,
  'AKs': 1.0, 'AQs': 1.0, 'AJs': 1.0, 'ATs': 1.0, 'A9s': 0.80,
  'A8s': 0.65, 'A7s': 0.55, 'A5s': 0.75, 'A4s': 0.60,
  'AKo': 1.0, 'AQo': 1.0, 'AJo': 0.85, 'ATo': 0.55,
  'KQs': 1.0, 'KJs': 1.0, 'KTs': 0.85, 'K9s': 0.40,
  'KQo': 0.90, 'KJo': 0.50,
  'QJs': 1.0, 'QTs': 0.85, 'Q9s': 0.35,
  'JTs': 1.0, 'J9s': 0.50,
  'T9s': 0.80, 'T8s': 0.30,
  '98s': 0.70, '87s': 0.60, '76s': 0.50, '65s': 0.40, '54s': 0.35,
}

// BTN call vs CO raise (~25%)
export const btnCallRange: RangeData = {
  'AA': 0.15, 'KK': 0.15, 'QQ': 0.60, 'JJ': 0.80, 'TT': 0.90,
  '99': 1.0, '88': 1.0, '77': 1.0, '66': 0.90, '55': 0.80, '44': 0.65, '33': 0.50, '22': 0.40,
  'AKs': 0.20, 'AQs': 0.50, 'AJs': 0.80, 'ATs': 1.0, 'A9s': 1.0,
  'A8s': 0.85, 'A7s': 0.75, 'A6s': 0.65, 'A5s': 0.80, 'A4s': 0.70, 'A3s': 0.55, 'A2s': 0.45,
  'AQo': 0.40, 'AJo': 0.65, 'ATo': 0.75, 'A9o': 0.30,
  'KQs': 0.55, 'KJs': 0.80, 'KTs': 1.0, 'K9s': 0.85, 'K8s': 0.40,
  'KQo': 0.50, 'KJo': 0.55, 'KTo': 0.35,
  'QJs': 0.75, 'QTs': 1.0, 'Q9s': 0.75, 'Q8s': 0.30,
  'QJo': 0.50, 'QTo': 0.30,
  'JTs': 1.0, 'J9s': 0.85, 'J8s': 0.40,
  'JTo': 0.45,
  'T9s': 1.0, 'T8s': 0.70, 'T7s': 0.20,
  '98s': 1.0, '97s': 0.55,
  '87s': 1.0, '86s': 0.40,
  '76s': 0.90, '75s': 0.30,
  '65s': 0.85, '54s': 0.75, '43s': 0.35,
}

// SB 3-bet range (~8%)
export const sb3BetRange: RangeData = {
  'AA': 1.0, 'KK': 1.0, 'QQ': 1.0, 'JJ': 0.70,
  'AKs': 1.0, 'AQs': 0.85, 'AJs': 0.40,
  'AKo': 1.0, 'AQo': 0.55,
  'A5s': 0.80, 'A4s': 0.65,
  'KQs': 0.50,
  '76s': 0.25, '65s': 0.20, '54s': 0.15,
}

// MP raise range (~16%)
export const mpRaiseRange: RangeData = {
  'AA': 1.0, 'KK': 1.0, 'QQ': 1.0, 'JJ': 1.0, 'TT': 1.0,
  '99': 0.95, '88': 0.70, '77': 0.40,
  'AKs': 1.0, 'AQs': 1.0, 'AJs': 1.0, 'ATs': 0.85, 'A9s': 0.40,
  'AKo': 1.0, 'AQo': 0.95, 'AJo': 0.50,
  'KQs': 1.0, 'KJs': 0.85, 'KTs': 0.55,
  'KQo': 0.60,
  'QJs': 0.80, 'QTs': 0.50,
  'JTs': 0.75, 'J9s': 0.25,
  'T9s': 0.55, '98s': 0.40, '87s': 0.30, '76s': 0.20,
}

// Get mock range for a position + action combination
export function getRangeForPositionAction(position: string, action: string): RangeData {
  if (action === '3-Bet') return sb3BetRange
  if (position === 'UTG' || position === 'UTG+1' || position === 'UTG+2') return utgRaiseRange
  if (position === 'MP' || position === 'MP+1') return mpRaiseRange
  if (position === 'CO') return coRaiseRange
  if (position === 'BTN' && action === 'Call') return btnCallRange
  if (position === 'BTN') return btnOpenRange
  if (position === 'SB') return sb3BetRange
  return bbDefendRange
}

// Multiway equity mock data
export interface MultiwayEquity {
  position: string
  equity: number
  ev: number
  isHero: boolean
}

export function getMultiwayEquities(playerCount: number): MultiwayEquity[] {
  if (playerCount === 3) {
    return [
      { position: 'BB', equity: 42.3, ev: 2.85, isHero: true },
      { position: 'CO', equity: 31.5, ev: 1.92, isHero: false },
      { position: 'BTN', equity: 26.2, ev: 1.68, isHero: false },
    ]
  }
  if (playerCount === 4) {
    return [
      { position: 'BB', equity: 33.8, ev: 2.15, isHero: true },
      { position: 'UTG', equity: 28.4, ev: 1.78, isHero: false },
      { position: 'CO', equity: 21.2, ev: 1.35, isHero: false },
      { position: 'BTN', equity: 16.6, ev: 1.02, isHero: false },
    ]
  }
  // 5+
  return [
    { position: 'BB', equity: 28.5, ev: 1.85, isHero: true },
    { position: 'UTG', equity: 24.2, ev: 1.52, isHero: false },
    { position: 'MP', equity: 19.8, ev: 1.25, isHero: false },
    { position: 'CO', equity: 15.3, ev: 0.98, isHero: false },
    { position: 'BTN', equity: 12.2, ev: 0.75, isHero: false },
  ]
}

// Convert hole cards to hand label (e.g. A♥ K♦ → "AKo")
export function holeCardsToHandLabel(cards: CardType[]): string | null {
  if (cards.length !== 2) return null
  const [c1, c2] = cards
  const r1idx = RANKS.indexOf(c1.rank)
  const r2idx = RANKS.indexOf(c2.rank)
  const high = r1idx <= r2idx ? c1 : c2
  const low = r1idx <= r2idx ? c2 : c1
  if (high.rank === low.rank) return `${high.rank}${low.rank}`
  const suffix = high.suit === low.suit ? 's' : 'o'
  return `${high.rank}${low.rank}${suffix}`
}

// Mock equity based on hand strength (for hero hand display)
const handEquityMap: Record<string, { hu: number; multi: number }> = {
  'AA': { hu: 85.3, multi: 45.2 },
  'KK': { hu: 82.1, multi: 42.8 },
  'QQ': { hu: 79.6, multi: 38.5 },
  'JJ': { hu: 77.2, multi: 35.8 },
  'TT': { hu: 74.8, multi: 33.2 },
  'AKs': { hu: 67.4, multi: 35.1 },
  'AKo': { hu: 65.2, multi: 33.8 },
  'AQs': { hu: 66.1, multi: 32.5 },
  'AQo': { hu: 63.8, multi: 30.9 },
  'AJs': { hu: 65.0, multi: 31.2 },
  'KQs': { hu: 63.2, multi: 29.8 },
  'ATs': { hu: 63.8, multi: 30.1 },
  '99': { hu: 72.1, multi: 30.8 },
  '88': { hu: 69.5, multi: 28.5 },
  '77': { hu: 66.8, multi: 26.2 },
  '76s': { hu: 51.2, multi: 18.5 },
  '72o': { hu: 35.8, multi: 10.2 },
}

export function getHeroEquity(handLabel: string, isMultiway: boolean): number {
  const entry = handEquityMap[handLabel]
  if (entry) return isMultiway ? entry.multi : entry.hu
  // Estimate based on first char
  const rank = handLabel[0]
  const highCards = 'AKQJT'
  if (highCards.includes(rank)) return isMultiway ? 25 + Math.random() * 10 : 55 + Math.random() * 10
  return isMultiway ? 12 + Math.random() * 10 : 38 + Math.random() * 10
}

// Get multiway equities adjusted for hero's hand
export function getMultiwayEquitiesForHand(
  handLabel: string | null,
  playerCount: number,
  potPlayers: { position: string; action: string; isHero: boolean }[],
): MultiwayEquity[] {
  const heroEq = handLabel ? getHeroEquity(handLabel, playerCount >= 3) : null
  if (playerCount === 2) {
    const hero = heroEq ?? 48.2
    return [
      { position: potPlayers[potPlayers.length - 1]?.position ?? 'BB', equity: hero, ev: hero * 0.1, isHero: true },
      { position: potPlayers[0]?.position ?? 'BTN', equity: 100 - hero, ev: (100 - hero) * 0.1, isHero: false },
    ]
  }
  const hero = heroEq ?? 28
  const remaining = 100 - hero
  const opponents = potPlayers.filter(p => !p.isHero)
  const shares = opponents.map((_, i) => remaining * (1 - i * 0.18) / opponents.length)
  const shareTotal = shares.reduce((a, b) => a + b, 0)
  const result: MultiwayEquity[] = [
    { position: potPlayers.find(p => p.isHero)?.position ?? 'BB', equity: hero, ev: hero * 0.065, isHero: true },
  ]
  opponents.forEach((opp, i) => {
    const eq = (shares[i] / shareTotal) * remaining
    result.push({ position: opp.position, equity: +eq.toFixed(1), ev: +(eq * 0.065).toFixed(2), isHero: false })
  })
  return result
}
