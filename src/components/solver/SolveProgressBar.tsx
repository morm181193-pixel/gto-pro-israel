import { motion } from 'framer-motion'

interface SolveProgressBarProps {
  progress: number
  nashDistance: number
  iteration: number
  targetIterations: number
  elapsedTime: number
  className?: string
}

export function SolveProgressBar({
  progress,
  nashDistance,
  iteration,
  targetIterations,
  elapsedTime,
  className = '',
}: SolveProgressBarProps) {
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className={`glass-panel p-5 space-y-3 ${className}`}>
      {/* Progress bar */}
      <div className="relative h-2.5 bg-bg-tertiary rounded-full overflow-hidden border border-white/5">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            background: 'linear-gradient(90deg, #b90afc, #de8eff, #00f4fe)',
            boxShadow: '0 0 15px rgba(222, 142, 255, 0.4)',
          }}
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Stats */}
      <div className="flex justify-between items-center text-xs" dir="ltr">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-text-muted text-[10px] font-bold">איטרציה </span>
            <span className="text-text-primary font-mono font-extrabold">
              {iteration.toLocaleString()}/{targetIterations.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-text-muted text-[10px] font-bold">מרחק נאש </span>
            <span
              className="font-mono font-extrabold"
              style={{ color: nashDistance < 1 ? '#00f4fe' : nashDistance < 5 ? '#de8eff' : '#ff6e81' }}
            >
              {nashDistance.toFixed(2)}%
            </span>
          </div>
        </div>
        <div>
          <span className="text-text-muted text-[10px] font-bold">זמן </span>
          <span className="text-text-primary font-mono font-bold">{formatTime(elapsedTime)}</span>
        </div>
      </div>

      <div className="text-center">
        <span className="text-3xl font-extrabold gradient-text-purple tracking-tight">
          {(progress * 100).toFixed(0)}%
        </span>
      </div>
    </div>
  )
}
