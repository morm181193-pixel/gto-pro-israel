import { motion } from 'framer-motion'
import type { ActionFrequency } from '@/types/poker'

interface ActionButtonsProps {
  actions: ActionFrequency[]
  onActionClick?: (action: string) => void
  className?: string
}

// Translate action names to Hebrew
function hebrewAction(action: string): string {
  if (action === 'Check') return 'צ׳ק'
  if (action === 'Call') return 'קול'
  if (action === 'Fold') return 'פולד'
  if (action === 'All-in') return 'אול-אין'
  if (action.startsWith('Bet')) return 'הימור ' + action.replace('Bet ', '')
  if (action.startsWith('Raise')) return 'העלאה ' + action.replace('Raise ', '')
  return action
}

function getActionStyle(action: string) {
  if (action.includes('Check') || action.includes('Call')) {
    return {
      bg: 'rgba(0, 244, 254, 0.08)',
      border: 'rgba(0, 244, 254, 0.2)',
      text: '#00f4fe',
      shadow: '0 0 15px rgba(0, 244, 254, 0.15)',
      hoverBg: 'rgba(0, 244, 254, 0.15)',
    }
  }
  if (action.includes('Fold')) {
    return {
      bg: 'rgba(114, 117, 125, 0.12)',
      border: 'rgba(114, 117, 125, 0.25)',
      text: '#a8abb3',
      shadow: 'none',
      hoverBg: 'rgba(114, 117, 125, 0.2)',
    }
  }
  if (action.includes('All-in')) {
    return {
      bg: 'rgba(222, 142, 255, 0.1)',
      border: 'rgba(222, 142, 255, 0.25)',
      text: '#de8eff',
      shadow: '0 0 15px rgba(222, 142, 255, 0.15)',
      hoverBg: 'rgba(222, 142, 255, 0.18)',
    }
  }
  // Small bet (33%) — purple
  if (action.includes('33')) {
    return {
      bg: 'rgba(222, 142, 255, 0.1)',
      border: 'rgba(222, 142, 255, 0.25)',
      text: '#de8eff',
      shadow: '0 0 15px rgba(222, 142, 255, 0.15)',
      hoverBg: 'rgba(222, 142, 255, 0.18)',
    }
  }
  // Large bet (75%) / Raise — pink
  return {
    bg: 'rgba(255, 110, 129, 0.1)',
    border: 'rgba(255, 110, 129, 0.25)',
    text: '#ff6e81',
    shadow: '0 0 15px rgba(255, 110, 129, 0.15)',
    hoverBg: 'rgba(255, 110, 129, 0.18)',
  }
}

export function ActionButtons({ actions, onActionClick, className = '' }: ActionButtonsProps) {
  return (
    <div className={`flex flex-row flex-wrap md:flex-nowrap gap-3 ${className}`} dir="ltr">
      {actions.map((action, i) => {
        const style = getActionStyle(action.action)
        return (
          <motion.button
            key={i}
            className="px-4 py-2.5 rounded-xl font-bold text-sm border transition-all"
            style={{
              backgroundColor: style.bg,
              borderColor: style.border,
              color: style.text,
              boxShadow: style.shadow,
            }}
            whileHover={{
              scale: 1.04,
              backgroundColor: style.hoverBg,
              boxShadow: style.shadow === 'none' ? '0 0 10px rgba(168,171,179,0.08)' : style.shadow.replace('15px', '25px'),
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onActionClick?.(action.action)}
          >
            <span>{hebrewAction(action.action)}</span>
            <span className="ml-2 opacity-70 font-semibold">
              {(action.frequency * 100).toFixed(1)}%
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}

export { hebrewAction }
