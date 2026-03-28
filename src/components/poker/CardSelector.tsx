import { motion } from 'framer-motion'
import { RANKS, SUITS, SUIT_SYMBOLS } from '@/types/poker'
import type { Card, Suit } from '@/types/poker'

interface CardSelectorProps {
  selectedCards: Card[]
  onCardSelect: (card: Card) => void
  onCardDeselect: (card: Card) => void
  disabledCards?: Card[]
  maxCards?: number
  className?: string
}

// Brand-only suit colors
const suitColorMap: Record<Suit, string> = {
  h: '#ff6e81',   // hearts — pink
  d: '#ff6e81',   // diamonds — pink (same as hearts)
  c: '#00f4fe',   // clubs — cyan
  s: '#a8abb3',   // spades — text secondary
}

// Selected card backgrounds per suit
const suitSelectedBg: Record<Suit, string> = {
  h: 'rgba(255, 110, 129, 0.2)',
  d: 'rgba(255, 110, 129, 0.2)',
  c: 'rgba(0, 244, 254, 0.2)',
  s: 'rgba(168, 171, 179, 0.2)',
}

export function CardSelector({
  selectedCards,
  onCardSelect,
  onCardDeselect,
  disabledCards = [],
  maxCards = 5,
  className = '',
}: CardSelectorProps) {
  const isSelected = (card: Card) =>
    selectedCards.some((c) => c.rank === card.rank && c.suit === card.suit)

  const isDisabled = (card: Card) =>
    disabledCards.some((c) => c.rank === card.rank && c.suit === card.suit)

  const handleClick = (card: Card) => {
    if (isDisabled(card)) return
    if (isSelected(card)) {
      onCardDeselect(card)
    } else if (selectedCards.length < maxCards) {
      onCardSelect(card)
    }
  }

  return (
    <div className={`space-y-1 ${className}`}>
      {SUITS.map((suit) => (
        <div key={suit} className="flex gap-[3px]">
          {RANKS.map((rank) => {
            const card: Card = { rank, suit }
            const selected = isSelected(card)
            const disabled = isDisabled(card)

            return (
              <motion.button
                key={`${rank}${suit}`}
                className="relative flex flex-col items-center justify-center rounded-lg font-mono font-extrabold transition-all"
                style={{
                  width: 36,
                  height: 46,
                  backgroundColor: selected
                    ? suitSelectedBg[suit]
                    : disabled
                      ? 'rgba(255,255,255,0.01)'
                      : '#1b2028',
                  color: selected
                    ? suitColorMap[suit]
                    : disabled
                      ? 'rgba(255,255,255,0.1)'
                      : suitColorMap[suit],
                  border: selected
                    ? `2px solid ${suitColorMap[suit]}`
                    : '1px solid rgba(255,255,255,0.05)',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  opacity: disabled ? 0.25 : 1,
                  boxShadow: selected ? `0 0 12px ${suitColorMap[suit]}40` : 'none',
                }}
                whileHover={!disabled ? { scale: 1.1, y: -2 } : {}}
                whileTap={!disabled ? { scale: 0.93 } : {}}
                onClick={() => handleClick(card)}
              >
                <span className="text-[12px] leading-none">{rank}</span>
                <span className="text-[10px] leading-none mt-0.5">{SUIT_SYMBOLS[suit]}</span>
              </motion.button>
            )
          })}
        </div>
      ))}
    </div>
  )
}

export function CardDisplay({ cards, className = '' }: { cards: Card[]; className?: string }) {
  return (
    <div className={`flex gap-2 ${className}`} dir="ltr">
      {cards.map((card, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, rotateY: 180 }}
          animate={{ scale: 1, rotateY: 0 }}
          transition={{ delay: i * 0.1, type: 'spring', stiffness: 300 }}
          className="flex flex-col items-center justify-center rounded-xl font-mono font-extrabold shadow-xl"
          style={{
            width: 50,
            height: 68,
            background: 'white',
            border: `2px solid rgba(0, 244, 254, 0.3)`,
            color: suitColorMap[card.suit],
            boxShadow: `0 4px 15px rgba(0,0,0,0.3), 0 0 10px rgba(0, 244, 254, 0.1)`,
          }}
        >
          <span className="text-xl leading-none">{card.rank}</span>
          <span className="text-base leading-none">{SUIT_SYMBOLS[card.suit]}</span>
        </motion.div>
      ))}
      {/* Empty card slots */}
      {Array.from({ length: 5 - cards.length }).map((_, i) => (
        <div
          key={`empty-${i}`}
          className="flex items-center justify-center rounded-xl"
          style={{
            width: 50,
            height: 68,
            backgroundColor: 'rgba(255,255,255,0.03)',
            border: '1px dashed rgba(255,255,255,0.1)',
          }}
        >
          <span className="text-base" style={{ color: '#72757d' }}>?</span>
        </div>
      ))}
    </div>
  )
}
