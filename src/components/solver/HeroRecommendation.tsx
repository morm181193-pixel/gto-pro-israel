import { motion } from 'framer-motion'

interface HeroRecommendationProps {
  action: string
  amount?: string
  confidence: number // 0-1
  explanation: string
  responseToRaise?: string
  hasHoleCards?: boolean
  className?: string
}

function hebrewAction(action: string): string {
  if (action === 'Check') return 'צ׳ק'
  if (action === 'Call') return 'קול'
  if (action === 'Fold') return 'פולד'
  if (action === 'All-in') return 'אול-אין'
  if (action.startsWith('Bet')) return 'הימור ' + action.replace('Bet ', '')
  if (action.startsWith('Raise')) return 'העלאה ' + action.replace('Raise ', '')
  return action
}

function getActionColor(action: string) {
  if (action.includes('Check') || action.includes('Call')) return '#00f4fe'
  if (action.includes('Fold')) return '#72757d'
  if (action.includes('All-in')) return '#de8eff'
  return '#ff6e81' // bet/raise
}

export function HeroRecommendation({ action, amount, confidence, explanation, responseToRaise, hasHoleCards = true, className = '' }: HeroRecommendationProps) {
  const color = getActionColor(action)

  if (!hasHoleCards) {
    return (
      <div className={`glass-panel p-5 space-y-3 ${className}`}>
        <h3 className="text-[10px] uppercase tracking-widest font-bold text-text-muted">המלצת פעולה</h3>
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 244, 254, 0.1)', border: '1px solid rgba(0, 244, 254, 0.2)' }}>
            <span className="text-lg" style={{ color: '#00f4fe' }}>🃏</span>
          </div>
          <div className="text-sm text-text-secondary text-center">
            בחר את הקלפים שלך כדי לקבל המלצה מותאמת
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`glass-panel p-5 space-y-4 ${className}`}>
      <h3 className="text-[10px] uppercase tracking-widest font-bold text-text-muted">המלצת פעולה</h3>

      {/* Main action */}
      <div className="flex items-center gap-3">
        <motion.div
          className="px-5 py-3 rounded-2xl font-extrabold text-lg border"
          style={{
            backgroundColor: `${color}15`,
            borderColor: `${color}40`,
            color: color,
            boxShadow: `0 0 20px ${color}20`,
          }}
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          {hebrewAction(action)}
        </motion.div>
        {amount && (
          <div className="text-text-secondary text-sm font-bold" dir="ltr">
            {amount}
          </div>
        )}
      </div>

      {/* Confidence bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold">
          <span className="text-text-muted">רמת ביטחון</span>
          <span style={{ color }} dir="ltr">{(confidence * 100).toFixed(0)}%</span>
        </div>
        <div className="relative h-2 bg-bg-tertiary rounded-full overflow-hidden border border-white/5">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}60` }}
            initial={{ width: 0 }}
            animate={{ width: `${confidence * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Explanation */}
      <div className="text-xs text-text-secondary leading-relaxed">
        {explanation}
      </div>

      {/* Response to raise */}
      {responseToRaise && (
        <div className="border-t border-white/5 pt-3 space-y-1">
          <div className="text-[10px] uppercase tracking-widest font-bold text-text-muted">תגובה להעלאה</div>
          <div className="text-xs text-text-secondary">{responseToRaise}</div>
        </div>
      )}
    </div>
  )
}
