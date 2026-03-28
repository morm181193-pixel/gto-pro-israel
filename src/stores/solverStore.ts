import { create } from 'zustand'
import type { Card, Position, GameFormat, PotType, RangeData, ActionFrequency, StrategyData, TableSize, PlayerAction, PotPlayer, RaiseSize } from '@/types/poker'
import { btnOpenRange, bbDefendRange, mockSolveResult, mockStrategy, getRangeForPositionAction } from '@/data/ranges/mockRanges'

export interface SolverState {
  // Config
  format: GameFormat
  tableSize: TableSize
  stackDepth: number
  playersInPot: number
  potPlayers: PotPlayer[]
  raiseSize: RaiseSize
  oopPosition: Position
  ipPosition: Position
  potType: PotType
  board: Card[]
  holeCards: Card[]
  oopBetSizes: number[]
  ipBetSizes: number[]
  raiseSizes: number[]
  donkBet: boolean
  oopRange: RangeData
  ipRange: RangeData

  // Solve state
  isSolving: boolean
  solveProgress: number
  currentNashDistance: number
  currentIteration: number
  targetIterations: number
  elapsedTime: number

  // Results
  hasSolution: boolean
  oopEquity: number
  ipEquity: number
  oopEv: number
  ipEv: number
  overallActions: ActionFrequency[]
  strategy: StrategyData
  nashDistance: number

  // Main opponent (for multiway — solver analyzes HU: hero vs main opponent)
  mainOpponentIdx: number

  // Navigation
  activePlayer: 'oop' | 'ip'
  decisionPath: string[]

  // Actions
  setFormat: (format: GameFormat) => void
  setTableSize: (size: TableSize) => void
  setStackDepth: (depth: number) => void
  setPlayersInPot: (count: number) => void
  setPlayerPosition: (index: number, position: Position) => void
  setPlayerAction: (index: number, action: PlayerAction) => void
  setRaiseSize: (size: RaiseSize) => void
  setPositions: (oop: Position, ip: Position) => void
  setPotType: (potType: PotType) => void
  addBoardCard: (card: Card) => void
  removeBoardCard: (index: number) => void
  clearBoard: () => void
  addHoleCard: (card: Card) => void
  removeHoleCard: (index: number) => void
  clearHoleCards: () => void
  toggleOopBetSize: (size: number) => void
  toggleIpBetSize: (size: number) => void
  setMainOpponentIdx: (idx: number) => void
  setActivePlayer: (player: 'oop' | 'ip') => void
  startSolve: () => void
  stopSolve: () => void
  navigateAction: (action: string) => void
  navigateBack: () => void
  resetNavigation: () => void
}

export const useSolverStore = create<SolverState>((set, get) => ({
  // Config defaults
  format: 'cash',
  tableSize: '6max',
  stackDepth: 100,
  playersInPot: 2,
  potPlayers: [
    { position: 'BTN', action: 'Raise', isHero: false, range: btnOpenRange },
    { position: 'BB', action: 'none', isHero: true, range: bbDefendRange },
  ],
  raiseSize: 2.5,
  oopPosition: 'BB',
  ipPosition: 'BTN',
  potType: 'SRP',
  board: [
    { rank: 'A', suit: 'h' },
    { rank: 'K', suit: 'd' },
    { rank: '7', suit: 'c' },
  ],
  holeCards: [],
  oopBetSizes: [33, 75],
  ipBetSizes: [33, 75],
  raiseSizes: [2.5],
  donkBet: false,
  oopRange: bbDefendRange,
  ipRange: btnOpenRange,

  // Solve state
  isSolving: false,
  solveProgress: 0,
  currentNashDistance: 100,
  currentIteration: 0,
  targetIterations: 10000,
  elapsedTime: 0,

  // Results (pre-loaded with mock data)
  hasSolution: true,
  oopEquity: mockSolveResult.oopEquity,
  ipEquity: mockSolveResult.ipEquity,
  oopEv: mockSolveResult.oopEv,
  ipEv: mockSolveResult.ipEv,
  overallActions: mockSolveResult.actions,
  strategy: mockStrategy,
  nashDistance: mockSolveResult.nashDistance,

  // Main opponent (default: first raiser, or first non-hero)
  mainOpponentIdx: 0,

  // Navigation
  activePlayer: 'oop',
  decisionPath: [],

  // Actions
  setFormat: (format) => set({ format }),
  setTableSize: (tableSize) => {
    const { playersInPot } = get()
    const maxPlayers = tableSize === '6max' ? 6 : 9
    if (playersInPot > maxPlayers) {
      // Reset to 2 if current count exceeds new table size
      get().setPlayersInPot(2)
    }
    set({ tableSize })
  },
  setStackDepth: (stackDepth) => set({ stackDepth }),
  setPlayersInPot: (count) => {
    const { tableSize } = get()
    const allPos: Position[] = tableSize === '6max'
      ? ['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB']
      : ['UTG', 'UTG+1', 'UTG+2', 'MP', 'MP+1', 'CO', 'BTN', 'SB', 'BB']
    // Pick last `count` positions from the table
    const positions = allPos.slice(-count)
    const players: PotPlayer[] = positions.map((pos, i) => ({
      position: pos,
      action: i === positions.length - 1 ? 'none' as PlayerAction : i === 0 ? 'Raise' as PlayerAction : 'Call' as PlayerAction,
      isHero: i === positions.length - 1,
      range: getRangeForPositionAction(pos, i === 0 ? 'Raise' : 'Call'),
    }))
    // Auto-pick main opponent: first raiser, or first non-hero
    const raiserIdx = players.findIndex(p => p.action === 'Raise' && !p.isHero)
    const mainOpp = raiserIdx >= 0 ? raiserIdx : players.findIndex(p => !p.isHero)
    set({
      playersInPot: count,
      potPlayers: players,
      oopPosition: players[players.length - 1].position,
      ipPosition: players[0].position,
      mainOpponentIdx: mainOpp >= 0 ? mainOpp : 0,
    })
  },
  setPlayerPosition: (index, position) => {
    const { potPlayers } = get()
    const updated = [...potPlayers]
    updated[index] = { ...updated[index], position, range: getRangeForPositionAction(position, updated[index].action) }
    set({ potPlayers: updated })
  },
  setPlayerAction: (index, action) => {
    const { potPlayers } = get()
    const updated = [...potPlayers]
    updated[index] = { ...updated[index], action, range: getRangeForPositionAction(updated[index].position, action) }
    set({ potPlayers: updated })
  },
  setRaiseSize: (raiseSize) => set({ raiseSize }),
  setPositions: (oop, ip) => set({ oopPosition: oop, ipPosition: ip }),
  setPotType: (potType) => set({ potType }),
  addBoardCard: (card) => {
    const { board } = get()
    if (board.length < 5) {
      set({ board: [...board, card] })
    }
  },
  removeBoardCard: (index) => {
    const { board } = get()
    set({ board: board.filter((_, i) => i !== index) })
  },
  clearBoard: () => set({ board: [] }),
  addHoleCard: (card) => {
    const { holeCards } = get()
    if (holeCards.length < 2) {
      set({ holeCards: [...holeCards, card] })
    }
  },
  removeHoleCard: (index) => {
    const { holeCards } = get()
    set({ holeCards: holeCards.filter((_, i) => i !== index) })
  },
  clearHoleCards: () => set({ holeCards: [] }),
  toggleOopBetSize: (size) => {
    const { oopBetSizes } = get()
    if (oopBetSizes.includes(size)) {
      set({ oopBetSizes: oopBetSizes.filter((s) => s !== size) })
    } else {
      set({ oopBetSizes: [...oopBetSizes, size].sort((a, b) => a - b) })
    }
  },
  toggleIpBetSize: (size) => {
    const { ipBetSizes } = get()
    if (ipBetSizes.includes(size)) {
      set({ ipBetSizes: ipBetSizes.filter((s) => s !== size) })
    } else {
      set({ ipBetSizes: [...ipBetSizes, size].sort((a, b) => a - b) })
    }
  },
  setMainOpponentIdx: (idx) => set({ mainOpponentIdx: idx }),
  setActivePlayer: (player) => set({ activePlayer: player }),

  startSolve: () => {
    set({
      isSolving: true,
      solveProgress: 0,
      currentNashDistance: 100,
      currentIteration: 0,
      elapsedTime: 0,
    })

    // Simulate solving with mock progress
    let iteration = 0
    const interval = setInterval(() => {
      iteration += 500
      const progress = Math.min(iteration / 10000, 1)
      const nd = 100 * Math.exp(-iteration / 2000)

      if (iteration >= 10000) {
        clearInterval(interval)
        set({
          isSolving: false,
          solveProgress: 1,
          currentNashDistance: mockSolveResult.nashDistance,
          currentIteration: 10000,
          hasSolution: true,
          oopEquity: mockSolveResult.oopEquity,
          ipEquity: mockSolveResult.ipEquity,
          oopEv: mockSolveResult.oopEv,
          ipEv: mockSolveResult.ipEv,
          overallActions: mockSolveResult.actions,
          strategy: mockStrategy,
          nashDistance: mockSolveResult.nashDistance,
        })
      } else {
        set({
          solveProgress: progress,
          currentNashDistance: nd,
          currentIteration: iteration,
          elapsedTime: iteration / 500,
        })
      }
    }, 100)
  },

  stopSolve: () => set({ isSolving: false }),

  navigateAction: (action) => {
    const { decisionPath } = get()
    set({ decisionPath: [...decisionPath, action] })
  },
  navigateBack: () => {
    const { decisionPath } = get()
    set({ decisionPath: decisionPath.slice(0, -1) })
  },
  resetNavigation: () => set({ decisionPath: [] }),
}))
