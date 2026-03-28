import { analyzeSpotEnhanced, type TableSetup, type EnhancedAnalysisResult } from './poker-engine'

export interface WorkerRequest {
  id: number
  setup: TableSetup
}

export interface WorkerResponse {
  id: number
  result: EnhancedAnalysisResult | null
  error?: string
}

self.onmessage = (e: MessageEvent<WorkerRequest>) => {
  const { id, setup } = e.data
  try {
    // Debug logging
    console.log('[EquityWorker] Input:', {
      heroCards: setup.heroCards,
      board: setup.board,
      boardLength: setup.board.length,
      opponents: setup.opponents,
      opponentCount: setup.opponents.length,
    })

    const start = performance.now()
    const result = analyzeSpotEnhanced(setup)
    result.timeMs = Math.round(performance.now() - start)

    console.log('[EquityWorker] Result:', {
      heroEquity: (result.heroEquity * 100).toFixed(1) + '%',
      oppEquities: result.opponentEquities.map(o => `${o.position}: ${(o.equity * 100).toFixed(1)}%`),
      recommendation: result.recommendation,
      confidence: result.confidence,
      rangeBreakdowns: result.opponentRangeBreakdown.map(r => `${r.position}: ${r.totalCombos} combos`),
    })

    self.postMessage({ id, result } satisfies WorkerResponse)
  } catch (err) {
    console.error('[EquityWorker] Error:', err)
    self.postMessage({
      id,
      result: null,
      error: err instanceof Error ? err.message : String(err),
    } as WorkerResponse)
  }
}
