import { useEffect, useRef } from 'react'
import type { Card, Position } from '@/types/poker'
import { SUIT_SYMBOLS } from '@/types/poker'

/* ═══════════════════════════════════════════
   PUBLIC INTERFACE — unchanged, used by SolvePage
   ═══════════════════════════════════════════ */

export interface PlayerInfo {
  position: Position
  stack: number
  isActive: boolean
  isOop: boolean
  isHero?: boolean
  isMainOpponent?: boolean
  action?: string
}

interface PokerTableProps {
  players: PlayerInfo[]
  board: Card[]
  pot: number
  className?: string
}

/* ═══════════════════════════════════════════
   DESIGN TOKENS (from brief)
   ═══════════════════════════════════════════ */

const ACTION_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Fold:    { bg: 'rgba(100,100,100,0.2)', text: '#555',    border: '#333' },
  Call:    { bg: 'rgba(0,244,254,0.08)',   text: '#00f4fe', border: 'rgba(0,244,254,0.25)' },
  Raise:   { bg: 'rgba(222,142,255,0.1)',  text: '#de8eff', border: 'rgba(222,142,255,0.3)' },
  '3-Bet': { bg: 'rgba(255,110,129,0.1)',  text: '#ff6e81', border: 'rgba(255,110,129,0.3)' },
  none:    { bg: 'rgba(0,244,254,0.08)',   text: '#00f4fe', border: 'rgba(0,244,254,0.25)' },
}

const HERO_ACTION = { bg: 'rgba(0,244,254,0.12)', text: '#00f4fe', border: '#00f4fe' }

const SUIT_COLORS: Record<string, string> = {
  h: '#ef4444',
  d: '#3b82f6',
  c: '#22c55e',
  s: '#cbd5e1',
}

/* ═══════════════════════════════════════════
   ELLIPTICAL SEAT ALGORITHM (from brief — exact)
   ═══════════════════════════════════════════ */

function getSeats(count: number): { x: number; y: number }[] {
  const seats: { x: number; y: number }[] = []
  for (let i = 0; i < count; i++) {
    const angleDeg = 90 + (i * 360) / count
    const angleRad = (angleDeg * Math.PI) / 180
    const x = 50 + 46 * Math.cos(angleRad)
    const y = 50 + 42 * Math.sin(angleRad)
    seats.push({ x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 })
  }
  return seats
}

/* ═══════════════════════════════════════════
   CSS KEYFRAMES (injected once)
   ═══════════════════════════════════════════ */

const KF_ID = 'poker-table-kf'

function ensureKeyframes() {
  if (typeof document === 'undefined') return
  if (document.getElementById(KF_ID)) return
  const s = document.createElement('style')
  s.id = KF_ID
  s.textContent = `
    @keyframes ptCardDeal{from{opacity:0;transform:scale(.7) translateY(-12px)}to{opacity:1;transform:scale(1) translateY(0)}}
    @keyframes ptNodeIn{from{opacity:0;transform:translate(-50%,-50%) scale(.8)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}
    @keyframes ptHeroPulse{0%,100%{box-shadow:0 0 6px rgba(0,244,254,.25)}50%{box-shadow:0 0 18px rgba(0,244,254,.45)}}
  `
  document.head.appendChild(s)
}

/* ═══════════════════════════════════════════
   PLAYER NODE (matches reference exactly)
   ═══════════════════════════════════════════ */

function PlayerNode({
  player,
  seat,
  index,
}: {
  player: PlayerInfo
  seat: { x: number; y: number }
  index: number
}) {
  const hero = !!player.isHero
  const folded = player.action === 'Fold'
  const c = hero ? HERO_ACTION : (ACTION_COLORS[player.action ?? 'none'] ?? ACTION_COLORS.none)

  return (
    <div
      style={{
        position: 'absolute',
        left: `${seat.x}%`,
        top: `${seat.y}%`,
        transform: 'translate(-50%,-50%)',
        opacity: folded ? 0.28 : 1,
        transition: 'opacity 0.3s',
        animation: `ptNodeIn 0.35s ease ${index * 50}ms both`,
        zIndex: hero ? 10 : 2,
      }}
    >
      <div
        style={{
          background: c.bg,
          border: `1.5px solid ${
            player.isMainOpponent ? '#de8eff' : c.border
          }`,
          borderRadius: 9,
          padding: '6px 20px',
          whiteSpace: 'nowrap' as const,
          textAlign: 'center' as const,
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          boxShadow: hero
            ? '0 0 18px rgba(0,244,254,0.2)'
            : player.isMainOpponent
              ? '0 0 14px rgba(222,142,255,0.2)'
              : '0 2px 8px rgba(0,0,0,0.25)',
          position: 'relative' as const,
        }}
      >
        {/* Line 1: position · stackBB */}
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: '#e2e8f0',
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          }}
          dir="ltr"
        >
          {player.position}
          <span style={{ color: '#64748b', fontWeight: 400, fontSize: 11 }}> · {player.stack}BB</span>
        </div>

        {/* Line 2: action or HERO */}
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: c.text,
            marginTop: 2,
            letterSpacing: 0.8,
            textTransform: 'uppercase' as const,
          }}
        >
          {hero ? 'HERO' : (player.action && player.action !== 'none' ? player.action : '')}
        </div>

        {/* Hero animated pulse border overlay */}
        {hero && (
          <div
            style={{
              position: 'absolute',
              inset: -1.5,
              borderRadius: 9,
              border: '1.5px solid #00f4fe',
              animation: 'ptHeroPulse 2.2s ease-in-out infinite',
              pointerEvents: 'none',
            }}
          />
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   CARD COMPONENTS (matches reference sizes)
   ═══════════════════════════════════════════ */

// md size for board cards: 42×60, rank 16px, suit 12px
function BoardCardEl({ card, index }: { card: Card; index: number }) {
  return (
    <div
      style={{
        width: 42,
        height: 60,
        borderRadius: 7,
        background: 'linear-gradient(145deg, #fff, #f1f1f1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 3px 10px rgba(0,0,0,0.4)',
        animation: `ptCardDeal 0.3s ease ${index * 70}ms both`,
      }}
    >
      <span style={{ fontSize: 16, fontWeight: 800, color: SUIT_COLORS[card.suit], lineHeight: 1, fontFamily: 'Georgia, serif' }}>
        {card.rank}
      </span>
      <span style={{ fontSize: 12, color: SUIT_COLORS[card.suit], lineHeight: 1, marginTop: -1 }}>
        {SUIT_SYMBOLS[card.suit]}
      </span>
    </div>
  )
}

function EmptySlot({ index }: { index: number }) {
  return (
    <div
      style={{
        width: 42,
        height: 60,
        borderRadius: 7,
        border: '1.5px dashed rgba(255,255,255,0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'rgba(255,255,255,0.15)',
        fontSize: 16,
        background: 'rgba(255,255,255,0.02)',
        animation: `ptCardDeal 0.4s ease ${index * 70}ms both`,
      }}
    >
      ?
    </div>
  )
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */

export function PokerTable({ players, board, pot, className = '' }: PokerTableProps) {
  const injected = useRef(false)
  useEffect(() => {
    if (!injected.current) {
      ensureKeyframes()
      injected.current = true
    }
  }, [])

  const seats = getSeats(players.length)

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: 720,
        margin: '0 auto',
        aspectRatio: '16 / 10',
        overflow: 'visible',
      }}
    >
      {/* ── Outer ellipse ── */}
      <div
        style={{
          position: 'absolute',
          top: '14%',
          bottom: '14%',
          left: '8%',
          right: '8%',
          borderRadius: '50%',
          background: 'linear-gradient(160deg, #192033, #111827, #0d1321)',
          border: '2.5px solid rgba(255,255,255,0.05)',
          boxShadow: 'inset 0 2px 40px rgba(0,0,0,0.6), 0 0 80px rgba(0,10,30,0.5)',
          overflow: 'hidden',
        }}
      >
        {/* Inner felt */}
        <div
          style={{
            position: 'absolute',
            inset: 10,
            borderRadius: '50%',
            background: 'radial-gradient(ellipse at 50% 45%, #1a2540, #131c30, #0c1322)',
            border: '1px solid rgba(255,255,255,0.03)',
          }}
        />
      </div>

      {/* ── Pot ── */}
      <div
        style={{
          position: 'absolute',
          top: '22%',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          zIndex: 5,
        }}
      >
        <div style={{ fontSize: 10, color: '#4a5568', fontWeight: 600, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 1 }}>
          פוט
        </div>
        <div
          style={{
            fontSize: 24,
            fontWeight: 800,
            color: '#00f4fe',
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            textShadow: '0 0 16px rgba(0,244,254,0.25)',
          }}
          dir="ltr"
        >
          {pot.toFixed(1)}
          <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}> BB</span>
        </div>
      </div>

      {/* ── Board cards ── */}
      <div
        style={{
          position: 'absolute',
          top: '55%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          gap: 5,
          zIndex: 5,
        }}
        dir="ltr"
      >
        {board.map((card, i) => (
          <BoardCardEl key={`${card.rank}${card.suit}`} card={card} index={i} />
        ))}
        {Array.from({ length: 5 - board.length }).map((_, i) => (
          <EmptySlot key={`e-${i}`} index={board.length + i} />
        ))}
      </div>

      {/* ── Player nodes on ellipse ── */}
      {players.map((player, i) => (
        <PlayerNode
          key={`${player.position}-${i}`}
          player={player}
          seat={seats[i]}
          index={i}
        />
      ))}
    </div>
  )
}
