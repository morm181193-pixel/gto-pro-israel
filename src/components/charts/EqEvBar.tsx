import { motion } from 'framer-motion'

interface EqEvBarProps {
  oopValue: number
  ipValue: number
  oopLabel?: string
  ipLabel?: string
  label: string
  unit?: string
  className?: string
}

export function EqEvBar({
  oopValue,
  ipValue,
  oopLabel = 'OOP',
  ipLabel = 'IP',
  label,
  unit = '%',
  className = '',
}: EqEvBarProps) {
  const total = oopValue + ipValue
  const oopPct = total > 0 ? (oopValue / total) * 100 : 50

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label */}
      <div className="flex justify-center">
        <span className="text-[10px] uppercase tracking-widest font-bold text-text-muted">{label}</span>
      </div>

      <div className="flex items-center gap-3">
        {/* OOP side — pink */}
        <div className="min-w-[90px] text-right" dir="ltr">
          <div className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color: '#ff6e81' }}>{oopLabel}</div>
          <div className="text-lg font-extrabold text-text-primary tracking-tight">
            {oopValue.toFixed(unit === 'BB' ? 2 : 1)}
            <span className="text-xs font-bold text-text-muted mr-0.5">{unit}</span>
          </div>
        </div>

        {/* Bar */}
        <div className="flex-1 h-7 rounded-full overflow-hidden bg-bg-tertiary flex border border-white/5">
          <motion.div
            className="h-full flex items-center justify-end px-2"
            style={{
              background: 'linear-gradient(90deg, rgba(255,110,129,0.3), rgba(255,110,129,0.6))',
            }}
            initial={{ width: 0 }}
            animate={{ width: `${oopPct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            {oopPct > 18 && (
              <span className="text-[10px] font-extrabold text-white/90 tracking-tight">
                {oopValue.toFixed(1)}
              </span>
            )}
          </motion.div>
          <motion.div
            className="h-full flex items-center justify-start px-2"
            style={{
              background: 'linear-gradient(90deg, rgba(0,244,254,0.6), rgba(0,244,254,0.3))',
            }}
            initial={{ width: 0 }}
            animate={{ width: `${100 - oopPct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            {(100 - oopPct) > 18 && (
              <span className="text-[10px] font-extrabold text-white/90 tracking-tight">
                {ipValue.toFixed(1)}
              </span>
            )}
          </motion.div>
        </div>

        {/* IP side — cyan */}
        <div className="min-w-[90px] text-left" dir="ltr">
          <div className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color: '#00f4fe' }}>{ipLabel}</div>
          <div className="text-lg font-extrabold text-text-primary tracking-tight">
            {ipValue.toFixed(unit === 'BB' ? 2 : 1)}
            <span className="text-xs font-bold text-text-muted mr-0.5">{unit}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
