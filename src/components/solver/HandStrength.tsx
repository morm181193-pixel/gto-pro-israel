interface HandStrengthProps {
  handType: string
  hebrewType: string
  category: 'nuts' | 'strong' | 'medium' | 'weak' | 'air'
  rankInRange: number
  totalCombos: number
  className?: string
}

// Brand-only colors for categories
const CATEGORY_STYLES = {
  nuts:   { color: '#00f4fe', bg: 'rgba(0, 244, 254, 0.08)', label: 'נאטס' },
  strong: { color: '#de8eff', bg: 'rgba(222, 142, 255, 0.08)', label: 'חזקה' },
  medium: { color: '#a8abb3', bg: 'rgba(168, 171, 179, 0.08)', label: 'בינונית' },
  weak:   { color: '#ff6e81', bg: 'rgba(255, 110, 129, 0.08)', label: 'חלשה' },
  air:    { color: '#72757d', bg: 'rgba(114, 117, 125, 0.08)', label: 'אוויר' },
}

export function HandStrength({ handType, hebrewType, category, rankInRange, totalCombos, className = '' }: HandStrengthProps) {
  const style = CATEGORY_STYLES[category]

  return (
    <div className={`glass-panel p-5 space-y-3 ${className}`}>
      <h3 className="text-[10px] uppercase tracking-widest font-bold" style={{ color: '#72757d' }}>חוזק יד</h3>

      {/* Hand type + category badge */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="text-sm font-bold" style={{ color: '#f1f3fc' }}>{hebrewType}</div>
          <div className="text-[10px] font-mono" style={{ color: '#72757d' }} dir="ltr">{handType}</div>
        </div>
        <span
          className="px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider border"
          style={{
            color: style.color,
            backgroundColor: style.bg,
            borderColor: `${style.color}30`,
          }}
        >
          {style.label}
        </span>
      </div>

      {/* Rank in range bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold">
          <span style={{ color: '#72757d' }}>דירוג בטווח</span>
          <span className="font-mono" style={{ color: '#f1f3fc' }} dir="ltr">Top {rankInRange}%</span>
        </div>
        <div className="relative h-1.5 rounded-full overflow-hidden border border-white/5" style={{ backgroundColor: '#1b2028' }}>
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
            style={{
              width: `${rankInRange}%`,
              background: `linear-gradient(90deg, ${style.color}, ${style.color}60)`,
            }}
          />
        </div>
      </div>

      {/* Combos */}
      <div className="text-[10px]" style={{ color: '#72757d' }}>
        <span className="font-mono font-bold" style={{ color: '#a8abb3' }} dir="ltr">{totalCombos}</span> קומבינציות בטווח
      </div>
    </div>
  )
}
