interface RangeCategory {
  label: string
  hebrewLabel: string
  percentage: number
  combos: number
  color: string
}

interface OpponentRangeProps {
  categories: RangeCategory[]
  totalCombos: number
  className?: string
}

export function OpponentRange({ categories, totalCombos, className = '' }: OpponentRangeProps) {
  return (
    <div className={`glass-panel p-5 space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] uppercase tracking-widest font-bold text-text-muted">טווח יריב</h3>
        <span className="text-[10px] font-mono font-bold text-text-muted" dir="ltr">{totalCombos} combos</span>
      </div>

      {/* Stacked bar */}
      <div className="relative h-4 rounded-full overflow-hidden flex border border-white/5" dir="ltr">
        {categories.map((cat, i) => (
          <div
            key={i}
            className="h-full transition-all duration-500"
            style={{
              width: `${cat.percentage}%`,
              backgroundColor: cat.color,
              opacity: 0.7,
            }}
          />
        ))}
      </div>

      {/* Category breakdown */}
      <div className="space-y-2">
        {categories.map((cat, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: cat.color }} />
              <span className="text-xs font-bold text-text-secondary">{cat.hebrewLabel}</span>
            </div>
            <div className="flex items-center gap-3 text-xs" dir="ltr">
              <span className="font-mono text-text-muted">{cat.combos} combos</span>
              <span className="font-mono font-bold text-text-primary">{cat.percentage.toFixed(1)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
