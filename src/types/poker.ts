export type Suit = 'h' | 'd' | 'c' | 's'
export type Rank = 'A' | 'K' | 'Q' | 'J' | 'T' | '9' | '8' | '7' | '6' | '5' | '4' | '3' | '2'

export interface Card {
  rank: Rank
  suit: Suit
}

export type Position = 'UTG' | 'UTG+1' | 'UTG+2' | 'MP' | 'MP+1' | 'CO' | 'BTN' | 'SB' | 'BB'
export type GameFormat = 'cash' | 'tournament' | 'sitgo'
export type PotType = 'SRP' | '3bet' | '4bet' | 'limp'
export type TableSize = '6max' | '9max'
export type PlayerAction = 'Raise' | 'Call' | '3-Bet' | 'none'
export type RaiseSize = 2 | 2.5 | 3 | 4

export interface PotPlayer {
  position: Position
  action: PlayerAction
  isHero: boolean
  range: RangeData
}

export const POSITIONS_6MAX: Position[] = ['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB']
export const POSITIONS_9MAX: Position[] = ['UTG', 'UTG+1', 'UTG+2', 'MP', 'MP+1', 'CO', 'BTN', 'SB', 'BB']

export interface ActionFrequency {
  action: string
  frequency: number
  color: string
}

export interface HandStrategy {
  hand: string
  actions: ActionFrequency[]
  ev: number
  equity: number
}

export interface RangeData {
  [hand: string]: number
}

export interface StrategyData {
  [hand: string]: ActionFrequency[]
}

export interface SolveResult {
  oopEquity: number
  ipEquity: number
  oopEv: number
  ipEv: number
  actions: ActionFrequency[]
  strategy: StrategyData
  nashDistance: number
  iterations: number
}

export interface SolveConfig {
  format: GameFormat
  stackDepth: number
  oopPosition: Position
  ipPosition: Position
  potType: PotType
  board: Card[]
  oopBetSizes: number[]
  ipBetSizes: number[]
  raiseSizes: number[]
  donkBet: boolean
  oopRange: RangeData
  ipRange: RangeData
}

export const RANKS: Rank[] = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2']
export const SUITS: Suit[] = ['h', 'd', 'c', 's']

export const SUIT_SYMBOLS: Record<Suit, string> = {
  h: '♥',
  d: '♦',
  c: '♣',
  s: '♠',
}

export const SUIT_COLORS: Record<Suit, string> = {
  h: 'var(--color-suit-hearts)',
  d: 'var(--color-suit-diamonds)',
  c: 'var(--color-suit-clubs)',
  s: 'var(--color-suit-spades)',
}

export function cardToString(card: Card): string {
  return `${card.rank}${SUIT_SYMBOLS[card.suit]}`
}

export function getHandLabel(row: number, col: number): string {
  const r1 = RANKS[row]
  const r2 = RANKS[col]
  if (row === col) return `${r1}${r2}`
  if (row < col) return `${r1}${r2}s`
  return `${r2}${r1}o`
}

export function isHandSuited(row: number, col: number): boolean {
  return row < col
}

export function isHandPair(row: number, col: number): boolean {
  return row === col
}
