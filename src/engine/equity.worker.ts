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
    const start = performance.now()
    const result = analyzeSpotEnhanced(setup)
    result.timeMs = Math.round(performance.now() - start)
    self.postMessage({ id, result } satisfies WorkerResponse)
  } catch (err) {
    self.postMessage({
      id,
      result: null,
      error: err instanceof Error ? err.message : String(err),
    } as WorkerResponse)
  }
}
