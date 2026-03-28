interface BetSizeSelectorProps {
  label: string
  sizes: number[]
  selectedSizes: number[]
  onToggle: (size: number) => void
  className?: string
}

const AVAILABLE_SIZES = [25, 33, 50, 75, 100, 125, 150]

export function BetSizeSelector({
  label,
  selectedSizes,
  onToggle,
  className = '',
}: BetSizeSelectorProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="text-[10px] uppercase tracking-widest font-bold text-text-muted">{label}</div>
      <div className="flex flex-wrap gap-1.5" dir="ltr">
        {AVAILABLE_SIZES.map((size) => {
          const selected = selectedSizes.includes(size)
          return (
            <button
              key={size}
              className="px-3 py-1.5 rounded-lg text-xs font-mono font-extrabold transition-all border active:scale-95"
              style={{
                backgroundColor: selected ? 'rgba(222, 142, 255, 0.12)' : 'rgba(255,255,255,0.02)',
                borderColor: selected ? 'rgba(222, 142, 255, 0.25)' : 'rgba(255,255,255,0.05)',
                color: selected ? '#de8eff' : '#72757d',
                boxShadow: selected ? '0 0 10px rgba(222, 142, 255, 0.1)' : 'none',
              }}
              onClick={() => onToggle(size)}
            >
              {size}%
            </button>
          )
        })}
        <button
          className="px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all border active:scale-95"
          style={{
            backgroundColor: selectedSizes.includes(9999) ? 'rgba(222, 142, 255, 0.12)' : 'rgba(255,255,255,0.02)',
            borderColor: selectedSizes.includes(9999) ? 'rgba(222, 142, 255, 0.25)' : 'rgba(255,255,255,0.05)',
            color: selectedSizes.includes(9999) ? '#de8eff' : '#72757d',
            boxShadow: selectedSizes.includes(9999) ? '0 0 10px rgba(222, 142, 255, 0.1)' : 'none',
          }}
          onClick={() => onToggle(9999)}
        >
          אול-אין
        </button>
      </div>
    </div>
  )
}
