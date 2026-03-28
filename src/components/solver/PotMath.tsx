interface PotMathProps {
  potSize: number
  potOdds: number       // percentage needed to call
  spr: number           // stack-to-pot ratio
  impliedOdds?: string  // descriptive: "טובים", "בינוניים", "חלשים"
  effectiveStack: number
  className?: string
}

export function PotMath({ potSize, potOdds, spr, impliedOdds, effectiveStack, className = '' }: PotMathProps) {
  const sprColor = spr > 10 ? '#00f4fe' : spr > 4 ? '#de8eff' : '#ff6e81'
  const sprLabel = spr > 10 ? 'עמוק' : spr > 4 ? 'בינוני' : 'רדוד'

  return (
    <div className={`glass-panel p-5 space-y-3 ${className}`}>
      <h3 className="text-[10px] uppercase tracking-widest font-bold text-text-muted">מתמטיקה</h3>

      <div className="grid grid-cols-2 gap-3">
        {/* Pot size */}
        <div className="space-y-1">
          <div className="text-[10px] uppercase tracking-widest font-bold text-text-muted">גודל פוט</div>
          <div className="text-lg font-extrabold font-mono text-text-primary" dir="ltr">
            {potSize.toFixed(1)} <span className="text-[10px] text-text-muted">BB</span>
          </div>
        </div>

        {/* Effective stack */}
        <div className="space-y-1">
          <div className="text-[10px] uppercase tracking-widest font-bold text-text-muted">סטאק אפקטיבי</div>
          <div className="text-lg font-extrabold font-mono text-text-primary" dir="ltr">
            {effectiveStack} <span className="text-[10px] text-text-muted">BB</span>
          </div>
        </div>

        {/* Pot odds */}
        <div className="space-y-1">
          <div className="text-[10px] uppercase tracking-widest font-bold text-text-muted">סיכויי פוט</div>
          <div className="text-lg font-extrabold font-mono" style={{ color: '#00f4fe' }} dir="ltr">
            {potOdds.toFixed(1)}%
          </div>
        </div>

        {/* SPR */}
        <div className="space-y-1">
          <div className="text-[10px] uppercase tracking-widest font-bold text-text-muted">SPR</div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-extrabold font-mono" style={{ color: sprColor }} dir="ltr">
              {spr.toFixed(1)}
            </span>
            <span className="text-[10px] font-bold" style={{ color: sprColor }}>
              ({sprLabel})
            </span>
          </div>
        </div>
      </div>

      {/* Implied odds */}
      {impliedOdds && (
        <div className="border-t border-white/5 pt-3 flex justify-between items-center">
          <span className="text-[10px] uppercase tracking-widest font-bold text-text-muted">סיכויים משתמעים</span>
          <span className="text-xs font-bold text-primary">{impliedOdds}</span>
        </div>
      )}
    </div>
  )
}
