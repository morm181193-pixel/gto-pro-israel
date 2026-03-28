import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { RANKS } from '@/types/poker'
import type { RangeData, ActionFrequency } from '@/types/poker'
import { getHandStrategy, C_CHECK_SOLID, C_BET_SM_SOLID, C_BET_LG_SOLID } from '@/data/ranges/mockRanges'

interface RangeGridProps {
  range: RangeData
  strategy?: boolean
  onHandClick?: (hand: string) => void
  highlightHand?: string | null
  className?: string
  compact?: boolean
}

function getHandLabel(row: number, col: number): string {
  const r1 = RANKS[row]
  const r2 = RANKS[col]
  if (row === col) return `${r1}${r2}`
  if (col > row) return `${r1}${r2}s`
  return `${r2}${r1}o`
}

function isPair(row: number, col: number): boolean { return row === col }

// Mock EV data for tooltip
const mockEvMap: Record<string, number> = {
  'Check': 0.8, 'Bet 33%': 1.2, 'Bet 75%': 2.1,
}
function getMockEv(action: string): number {
  return mockEvMap[action] ?? +(Math.random() * 2).toFixed(1)
}

function solidActionColor(action: string): string {
  if (action.includes('Check') || action.includes('Call')) return C_CHECK_SOLID
  if (action.includes('33')) return C_BET_SM_SOLID
  return C_BET_LG_SOLID  // 75%, Raise, etc.
}

function hebrewAction(action: string): string {
  if (action === 'Check') return 'צ׳ק'
  if (action === 'Call') return 'קול'
  if (action === 'Fold') return 'פולד'
  if (action.startsWith('Bet')) return 'הימור ' + action.replace('Bet ', '')
  if (action.startsWith('Raise')) return 'העלאה ' + action.replace('Raise ', '')
  return action
}

export function RangeGrid({ range, strategy = false, onHandClick, highlightHand, className = '', compact = false }: RangeGridProps) {
  const [hoveredHand, setHoveredHand] = useState<string | null>(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setTooltipPos({ x: e.clientX, y: e.clientY })
  }, [])

  return (
    <div className={`relative ${className}`}>
      <div className="overflow-x-auto pb-1">
        {/* Column labels */}
        <div
          className="grid mb-[2px]"
          style={{
            gridTemplateColumns: `14px repeat(13, minmax(${compact ? '18px' : '22px'}, 1fr))`,
            minWidth: compact ? '248px' : '300px',
          }}
          dir="ltr"
        >
          <div />
          {RANKS.map((r) => (
            <div key={r} className="text-center text-[9px] font-bold leading-none" style={{ color: '#72757d' }}>
              {r}
            </div>
          ))}
        </div>

        <div className="flex" dir="ltr">
          {/* Row labels */}
          <div
            className="flex flex-col mr-[2px]"
            style={{ width: '14px' }}
          >
            {RANKS.map((r) => (
              <div
                key={r}
                className="flex items-center justify-center text-[9px] font-bold leading-none"
                style={{ color: '#72757d', height: compact ? '18px' : '22px' }}
              >
                {r}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div
            className="flex-1 grid border border-white/5 rounded-lg overflow-hidden"
            style={{
              gridTemplateColumns: `repeat(13, minmax(${compact ? '18px' : '22px'}, 1fr))`,
              gap: '1px',
              backgroundColor: 'rgba(255,255,255,0.02)',
              minWidth: compact ? '234px' : '286px',
            }}
          >
            {RANKS.map((_, row) =>
              RANKS.map((_, col) => {
                const hand = getHandLabel(row, col)
                const freq = range[hand] ?? 0
                const pair = isPair(row, col)
                const actions = strategy ? getHandStrategy(hand) : null
                const isHighlighted = highlightHand === hand

                return (
                  <motion.div
                    key={`${row}-${col}`}
                    className="relative cursor-pointer select-none"
                    style={{
                      aspectRatio: '1',
                      border: isHighlighted ? '2px solid #00f4fe' : 'none',
                      boxShadow: isHighlighted ? '0 0 12px rgba(0, 244, 254, 0.4)' : 'none',
                      borderRadius: isHighlighted ? '4px' : undefined,
                      zIndex: isHighlighted ? 5 : undefined,
                    }}
                    whileHover={{ scale: 1.08, zIndex: 10 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    onMouseEnter={() => setHoveredHand(hand)}
                    onMouseLeave={() => setHoveredHand(null)}
                    onMouseMove={handleMouseMove}
                    onClick={() => onHandClick?.(hand)}
                  >
                    {strategy && actions && freq > 0 ? (
                      <StrategyCellContent actions={actions} hand={hand} freq={freq} compact={compact} />
                    ) : (
                      <FrequencyCellContent freq={freq} pair={pair} hand={hand} compact={compact} />
                    )}
                  </motion.div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {hoveredHand && (
        <HandTooltip
          hand={hoveredHand}
          freq={range[hoveredHand] ?? 0}
          strategy={strategy}
          x={tooltipPos.x}
          y={tooltipPos.y}
        />
      )}
    </div>
  )
}

/* Strategy mode: colored segments for each action */
function StrategyCellContent({ actions, hand, freq, compact }: { actions: ActionFrequency[]; hand: string; freq: number; compact: boolean }) {
  return (
    <div
      className="w-full h-full flex flex-col overflow-hidden rounded-sm"
      style={{ opacity: freq > 0 ? 0.4 + freq * 0.6 : 0.06 }}
    >
      {actions.map((action, i) => (
        <div
          key={i}
          className="w-full"
          style={{ height: `${action.frequency * 100}%`, backgroundColor: action.color }}
        />
      ))}
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="font-bold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] leading-none"
          style={{ fontSize: compact ? '7px' : 'clamp(7px, 1.1vw, 11px)' }}
        >
          {hand}
        </span>
      </div>
    </div>
  )
}

/* Setup mode: exact brand colors — cyan monochrome + purple pairs */
function FrequencyCellContent({ freq, pair, hand, compact }: { freq: number; pair: boolean; hand: string; compact: boolean }) {
  let bgColor: string
  let textColor: string

  if (freq <= 0) {
    bgColor = '#1b2028'
    textColor = '#72757d'
  } else if (pair && freq > 0) {
    // Pairs on diagonal — purple
    bgColor = 'rgba(222, 142, 255, 0.35)'
    textColor = '#f1f3fc'
  } else if (freq >= 1.0) {
    // 100% — bright cyan
    bgColor = 'rgba(0, 244, 254, 0.85)'
    textColor = '#0a0e14'
  } else if (freq >= 0.5) {
    // 50-99%
    bgColor = 'rgba(0, 244, 254, 0.5)'
    textColor = '#0a0e14'
  } else {
    // 1-49%
    bgColor = 'rgba(0, 244, 254, 0.25)'
    textColor = '#f1f3fc'
  }

  return (
    <div
      className="w-full h-full flex items-center justify-center rounded-sm transition-colors"
      style={{ backgroundColor: bgColor }}
    >
      <span
        className="font-semibold leading-none"
        style={{
          fontSize: compact ? '7px' : 'clamp(7px, 1.1vw, 11px)',
          color: textColor,
        }}
      >
        {hand}
      </span>
    </div>
  )
}

function HandTooltip({ hand, freq, strategy, x, y }: {
  hand: string; freq: number; strategy: boolean; x: number; y: number
}) {
  const actions = strategy ? getHandStrategy(hand) : null
  return (
    <div
      className="fixed z-[100] pointer-events-none glass-panel px-3.5 py-2.5 shadow-2xl"
      style={{ left: x + 16, top: y - 8, border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <div className="text-sm font-bold mb-1" style={{ color: '#f1f3fc' }} dir="ltr">{hand}</div>
      <div className="text-xs" style={{ color: '#a8abb3' }}>
        תדירות: <span className="font-bold" style={{ color: '#00f4fe' }} dir="ltr">{(freq * 100).toFixed(1)}%</span>
      </div>
      {strategy && actions && (
        <div className="mt-2 space-y-1">
          {actions.map((a, i) => (
            <div key={i} className="flex items-center gap-2 text-xs" dir="ltr">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: solidActionColor(a.action) }} />
              <span style={{ color: '#a8abb3' }}>{hebrewAction(a.action)}:</span>
              <span className="font-bold" style={{ color: '#f1f3fc' }}>{(a.frequency * 100).toFixed(1)}%</span>
              <span className="font-mono text-[10px]" style={{ color: '#72757d' }}>(EV: +{getMockEv(a.action).toFixed(1)}BB)</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
