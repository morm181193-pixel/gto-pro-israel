import { useRef, useState, useCallback, useEffect } from 'react'
import type { Card as AppCard, Position, PlayerAction } from '@/types/poker'
import type { Card as EngineCard, TableSetup, Action, EnhancedAnalysisResult, BoardTexture } from '@/engine/poker-engine'
import type { WorkerRequest, WorkerResponse } from '@/engine/equity.worker'
import EquityWorker from '@/engine/equity.worker?worker'

// ── Type conversion helpers ──

const RANK_TO_NUM: Record<string, number> = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8,
  '9': 9, 'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14,
}

function toEngineCard(c: AppCard): EngineCard {
  return { rank: RANK_TO_NUM[c.rank] as EngineCard['rank'], suit: c.suit }
}

const ACTION_MAP: Record<PlayerAction | string, Action> = {
  'Raise': 'raise',
  'Call': 'call',
  '3-Bet': '3bet',
  'Fold': 'fold',
  'none': 'call',
}

function toEngineAction(a: string): Action {
  return ACTION_MAP[a] ?? 'call'
}

// ── Public result type ──

export interface RangeBreakdown {
  position: string
  categories: {
    label: string
    hebrewLabel: string
    percentage: number
    combos: number
    color: string
  }[]
  totalCombos: number
}

export interface EquityAnalysis {
  heroEquity: number
  opponentEquities: { position: string; equity: number }[]
  recommendation: 'fold' | 'call' | 'raise'
  confidence: number
  simulations: number
  timeMs: number
  isCalculating: boolean
  boardTexture: BoardTexture | null
  opponentRangeBreakdown: RangeBreakdown[]
}

const EMPTY: EquityAnalysis = {
  heroEquity: 0,
  opponentEquities: [],
  recommendation: 'fold',
  confidence: 0,
  simulations: 0,
  timeMs: 0,
  isCalculating: false,
  boardTexture: null,
  opponentRangeBreakdown: [],
}

// ── Hook ──

export function useEquityAnalysis() {
  const workerRef = useRef<Worker | null>(null)
  const idRef = useRef(0)
  const [analysis, setAnalysis] = useState<EquityAnalysis>(EMPTY)

  useEffect(() => {
    const w = new EquityWorker()
    workerRef.current = w

    w.onmessage = (e: MessageEvent<WorkerResponse>) => {
      const { id, result, error } = e.data
      // Ignore stale responses
      if (id !== idRef.current) return
      if (error || !result) {
        setAnalysis((prev) => ({ ...prev, isCalculating: false }))
        return
      }
      setAnalysis({
        heroEquity: result.heroEquity,
        opponentEquities: result.opponentEquities,
        recommendation: result.recommendation,
        confidence: result.confidence,
        simulations: result.simulations,
        timeMs: result.timeMs,
        isCalculating: false,
        boardTexture: result.boardTexture,
        opponentRangeBreakdown: result.opponentRangeBreakdown,
      })
    }

    return () => w.terminate()
  }, [])

  const analyze = useCallback(
    (opts: {
      heroPosition: Position
      heroCards: AppCard[]
      board: AppCard[]
      opponents: { position: Position; action: PlayerAction | string }[]
    }) => {
      if (!workerRef.current) return
      if (opts.heroCards.length !== 2) return

      const id = ++idRef.current
      const setup: TableSetup = {
        heroPosition: opts.heroPosition,
        heroCards: opts.heroCards.map(toEngineCard),
        board: opts.board.map(toEngineCard),
        opponents: opts.opponents.map((o) => ({
          position: o.position,
          action: toEngineAction(o.action),
        })),
        numSimulations: 20000,
      }

      setAnalysis((prev) => ({ ...prev, isCalculating: true }))
      workerRef.current.postMessage({ id, setup } satisfies WorkerRequest)
    },
    [],
  )

  const clear = useCallback(() => setAnalysis(EMPTY), [])

  return { analysis, analyze, clear }
}
