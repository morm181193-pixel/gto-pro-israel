import { motion } from 'framer-motion'

interface EquityScenario {
  label: string
  value: number
}

interface EquityDisplayProps {
  equity: number        // 0-100
  scenarios: EquityScenario[]
  className?: string
}

export function EquityDisplay({ equity, scenarios, className = '' }: EquityDisplayProps) {
  const equityColor = equity >= 60 ? '#00f4fe' : equity >= 45 ? '#de8eff' : '#ff6e81'

  return (
    <div className={`glass-panel p-5 space-y-3 ${className}`}>
      <h3 className="text-[10px] uppercase tracking-widest font-bold text-text-muted">אקוויטי</h3>

      {/* Main equity value */}
      <div className="flex items-center gap-3">
        <motion.div
          className="text-3xl font-extrabold font-mono"
          style={{ color: equityColor }}
          dir="ltr"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          {equity.toFixed(1)}%
        </motion.div>
        <div className="flex-1">
          <div className="relative h-2.5 bg-bg-tertiary rounded-full overflow-hidden border border-white/5">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{
                backgroundColor: equityColor,
                boxShadow: `0 0 10px ${equityColor}40`,
              }}
              initial={{ width: 0 }}
              animate={{ width: `${equity}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      {/* Scenarios */}
      {scenarios.length > 0 && (
        <div className="space-y-2 border-t border-white/5 pt-3">
          <div className="text-[10px] uppercase tracking-widest font-bold text-text-muted">תרחישים</div>
          {scenarios.map((s, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <span className="text-text-secondary">{s.label}</span>
              <span
                className="font-mono font-bold"
                style={{ color: s.value >= 50 ? '#00f4fe' : '#ff6e81' }}
                dir="ltr"
              >
                {s.value.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
