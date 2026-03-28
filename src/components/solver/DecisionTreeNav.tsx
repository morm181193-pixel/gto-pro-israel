import { ChevronLeft, RotateCcw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface DecisionTreeNavProps {
  path: string[]
  oopPosition?: string
  ipPosition?: string
  onBack: () => void
  onReset: () => void
  className?: string
}

export function DecisionTreeNav({ path, oopPosition = 'BB', onBack, onReset, className = '' }: DecisionTreeNavProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`} dir="ltr">
      <motion.button
        className="p-2 rounded-xl bg-bg-tertiary/60 border border-white/5 text-text-secondary hover:text-text-primary transition-all disabled:opacity-25"
        whileHover={{ scale: 1.05, backgroundColor: 'rgba(222,142,255,0.08)' }}
        whileTap={{ scale: 0.92 }}
        onClick={onBack}
        disabled={path.length === 0}
      >
        <ChevronLeft size={16} />
      </motion.button>

      <motion.button
        className="p-2 rounded-xl bg-bg-tertiary/60 border border-white/5 text-text-secondary hover:text-text-primary transition-all disabled:opacity-25"
        whileHover={{ scale: 1.05, backgroundColor: 'rgba(222,142,255,0.08)' }}
        whileTap={{ scale: 0.92 }}
        onClick={onReset}
        disabled={path.length === 0}
      >
        <RotateCcw size={14} />
      </motion.button>

      <div className="flex items-center gap-1.5 text-xs overflow-x-auto">
        <motion.span className="px-3 py-1.5 rounded-lg bg-bg-tertiary/60 border border-white/5 text-primary font-bold whitespace-nowrap" layout>
          Flop
        </motion.span>

        {path.length === 0 && (
          <>
            <span className="text-text-muted">→</span>
            <span className="px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary font-bold whitespace-nowrap">
              אסטרטגיית {oopPosition}
            </span>
          </>
        )}

        <AnimatePresence mode="popLayout">
          {path.map((step, i) => (
            <motion.div
              key={`${i}-${step}`}
              className="flex items-center gap-1.5"
              initial={{ opacity: 0, x: -10, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 10, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <span className="text-text-muted">→</span>
              <span className="px-3 py-1.5 rounded-lg bg-bg-tertiary/60 border border-white/5 text-text-primary font-bold whitespace-nowrap">
                {step}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
