import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Square, RotateCcw, ChevronDown, X } from 'lucide-react'
import { useSolverStore, type SolverState } from '@/stores/solverStore'
import { RangeGrid } from '@/components/poker/RangeGrid'
import { CardSelector, CardDisplay } from '@/components/poker/CardSelector'
import { PokerTable } from '@/components/poker/PokerTable'
import { EqEvBar } from '@/components/charts/EqEvBar'
import { ActionButtons, hebrewAction } from '@/components/solver/ActionButtons'
import { SolveProgressBar } from '@/components/solver/SolveProgressBar'
import { DecisionTreeNav } from '@/components/solver/DecisionTreeNav'
import { BetSizeSelector } from '@/components/solver/BetSizeSelector'
import { HeroRecommendation } from '@/components/solver/HeroRecommendation'
import { HandStrength } from '@/components/solver/HandStrength'
import { EquityDisplay } from '@/components/solver/EquityDisplay'
import { PotMath } from '@/components/solver/PotMath'
import { OpponentRange } from '@/components/solver/OpponentRange'
import { getHandDetail, getHandStrategy, mockOpponentCategories, C_CHECK_SOLID, C_BET_SM_SOLID, C_BET_LG_SOLID, holeCardsToHandLabel, getMultiwayEquitiesForHand } from '@/data/ranges/mockRanges'
import type { Card, Position, GameFormat, PotType, TableSize, PlayerAction, RaiseSize } from '@/types/poker'
import { POSITIONS_6MAX, POSITIONS_9MAX } from '@/types/poker'
import { useEquityAnalysis } from '@/hooks/useEquityAnalysis'

type ViewMode = 'setup' | 'results' | 'solving'
const FORMATS: { value: GameFormat; label: string }[] = [
  { value: 'cash', label: 'קאש גיים' },
  { value: 'tournament', label: 'טורניר' },
  { value: 'sitgo', label: 'סיט אנד גו' },
]
const POT_TYPES: { value: PotType; label: string }[] = [
  { value: 'SRP', label: 'פוט רייז בודד' },
  { value: '3bet', label: 'פוט 3-בט' },
  { value: '4bet', label: 'פוט 4-בט' },
  { value: 'limp', label: 'פוט לימפ' },
]

export function SolvePage() {
  const store = useSolverStore()
  const [viewMode, setViewMode] = useState<ViewMode>(store.hasSolution ? 'results' : 'setup')
  const [showCardModal, setShowCardModal] = useState(false)
  const [activeRangePlayer, setActiveRangePlayer] = useState<'oop' | 'ip'>('oop')
  const [activeRangeIdx, setActiveRangeIdx] = useState(0)

  const handleSolve = () => {
    store.startSolve()
    setViewMode('solving')
  }

  // Auto-switch to results when solve completes
  useEffect(() => {
    if (viewMode === 'solving' && !store.isSolving && store.hasSolution) {
      const timer = setTimeout(() => setViewMode('results'), 400)
      return () => clearTimeout(timer)
    }
  }, [viewMode, store.isSolving, store.hasSolution])

  const handleCardSelect = useCallback((card: Card) => {
    store.addBoardCard(card)
  }, [store])

  const handleCardDeselect = useCallback((card: Card) => {
    const idx = store.board.findIndex((c) => c.rank === card.rank && c.suit === card.suit)
    if (idx >= 0) store.removeBoardCard(idx)
  }, [store])

  const handleHoleCardSelect = useCallback((card: Card) => {
    store.addHoleCard(card)
  }, [store])

  const handleHoleCardDeselect = useCallback((card: Card) => {
    const idx = store.holeCards.findIndex((c) => c.rank === card.rank && c.suit === card.suit)
    if (idx >= 0) store.removeHoleCard(idx)
  }, [store])

  // Derive hero hand label from hole cards
  const heroHandLabel = holeCardsToHandLabel(store.holeCards)

  return (
    <div className="flex-1 w-full px-3 md:px-5 py-4 md:py-5">
      {/* View toggle tabs — cyan active style */}
      <div className="flex items-center gap-1 mb-5 md:mb-6 bg-bg-tertiary/40 rounded-xl p-1 w-fit border border-white/5">
        <button
          className="px-4 md:px-5 py-2 rounded-lg text-xs md:text-sm font-bold transition-all active:scale-95"
          style={{
            backgroundColor: viewMode === 'setup' ? 'rgba(0, 244, 254, 0.12)' : 'transparent',
            color: viewMode === 'setup' ? '#00f4fe' : '#72757d',
            boxShadow: viewMode === 'setup' ? '0 0 12px rgba(0, 244, 254, 0.08)' : 'none',
            borderBottom: viewMode === 'setup' ? '2px solid #00f4fe' : '2px solid transparent',
          }}
          onClick={() => setViewMode('setup')}
        >
          הגדרת סיטואציה
        </button>
        <button
          className="px-4 md:px-5 py-2 rounded-lg text-xs md:text-sm font-bold transition-all active:scale-95"
          style={{
            backgroundColor: (viewMode === 'results' || viewMode === 'solving') ? 'rgba(0, 244, 254, 0.12)' : 'transparent',
            color: (viewMode === 'results' || viewMode === 'solving') ? '#00f4fe' : '#72757d',
            boxShadow: (viewMode === 'results' || viewMode === 'solving') ? '0 0 12px rgba(0, 244, 254, 0.08)' : 'none',
            borderBottom: (viewMode === 'results' || viewMode === 'solving') ? '2px solid #00f4fe' : '2px solid transparent',
            opacity: store.hasSolution || store.isSolving ? 1 : 0.3,
          }}
          onClick={() => (store.hasSolution || store.isSolving) && setViewMode(store.isSolving ? 'solving' : 'results')}
          disabled={!store.hasSolution && !store.isSolving}
        >
          תוצאות
        </button>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'setup' ? (
          <SetupView
            store={store}
            activeRangePlayer={activeRangePlayer}
            setActiveRangePlayer={setActiveRangePlayer}
            activeRangeIdx={activeRangeIdx}
            setActiveRangeIdx={setActiveRangeIdx}
            showCardModal={showCardModal}
            setShowCardModal={setShowCardModal}
            handleSolve={handleSolve}
            handleCardSelect={handleCardSelect}
            handleCardDeselect={handleCardDeselect}
            handleHoleCardSelect={handleHoleCardSelect}
            handleHoleCardDeselect={handleHoleCardDeselect}
          />
        ) : viewMode === 'solving' ? (
          <SolvingView store={store} onStop={() => { store.stopSolve(); setViewMode('setup') }} />
        ) : (
          <ResultsView store={store} heroHandLabel={heroHandLabel} />
        )}
      </AnimatePresence>

      {/* Card selector modal */}
      <AnimatePresence>
        {showCardModal && (
          <CardSelectorModal
            board={store.board}
            onSelect={handleCardSelect}
            onDeselect={handleCardDeselect}
            onClose={() => setShowCardModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

/* ═══════════════════════════════════════════
   SOLVING VIEW — Loading with progress
   ═══════════════════════════════════════════ */
function SolvingView({ store, onStop }: { store: SolverState; onStop: () => void }) {
  return (
    <motion.div
      key="solving"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2 }}
      className="max-w-lg mx-auto space-y-6 pt-8"
    >
      <div className="text-center space-y-2">
        <motion.div
          className="text-2xl font-extrabold gradient-text-purple"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          מחשב פתרון...
        </motion.div>
        <div className="text-sm text-text-muted">
          אנא המתן, מחשב אסטרטגיית GTO אופטימלית
        </div>
      </div>

      <SolveProgressBar
        progress={store.solveProgress}
        nashDistance={store.currentNashDistance}
        iteration={store.currentIteration}
        targetIterations={store.targetIterations}
        elapsedTime={store.elapsedTime}
      />

      <div className="flex justify-center">
        <motion.button
          className="px-6 py-3 rounded-xl font-bold text-sm border transition-all"
          style={{
            backgroundColor: 'rgba(255, 110, 129, 0.15)',
            borderColor: 'rgba(255, 110, 129, 0.25)',
            color: '#ff6e81',
          }}
          whileHover={{ scale: 1.04, backgroundColor: 'rgba(255, 110, 129, 0.25)' }}
          whileTap={{ scale: 0.95 }}
          onClick={onStop}
        >
          <span className="flex items-center gap-2"><Square size={14} /> עצור חישוב</span>
        </motion.button>
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════
   SETUP VIEW
   ═══════════════════════════════════════════ */
function SetupView({
  store, activeRangePlayer, setActiveRangePlayer,
  activeRangeIdx, setActiveRangeIdx,
  showCardModal: _showCardModal, setShowCardModal, handleSolve,
  handleCardSelect, handleCardDeselect,
  handleHoleCardSelect, handleHoleCardDeselect,
}: {
  store: SolverState
  activeRangePlayer: 'oop' | 'ip'
  setActiveRangePlayer: (p: 'oop' | 'ip') => void
  activeRangeIdx: number
  setActiveRangeIdx: (i: number) => void
  showCardModal: boolean
  setShowCardModal: (v: boolean) => void
  handleSolve: () => void
  handleCardSelect: (card: Card) => void
  handleCardDeselect: (card: Card) => void
  handleHoleCardSelect: (card: Card) => void
  handleHoleCardDeselect: (card: Card) => void
}) {
  return (
    <motion.div
      key="setup"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2 }}
      className="grid grid-cols-1 lg:grid-cols-12 gap-6"
    >
      {/* ═══ RIGHT — Settings + Bet Sizes + Solve ═══ */}
      <div className="lg:col-span-3 space-y-6">
        {/* Game settings */}
        <div className="glass-panel p-5 space-y-4">
          <h3 className="text-[10px] uppercase tracking-widest font-bold text-text-muted">הגדרות משחק</h3>

          {/* 1. Format */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-text-muted">פורמט</label>
            <div className="flex gap-1.5">
              {FORMATS.map((f) => (
                <button
                  key={f.value}
                  className="flex-1 px-2 py-2 rounded-xl text-[11px] font-bold transition-all border active:scale-95"
                  style={{
                    backgroundColor: store.format === f.value ? 'rgba(222, 142, 255, 0.1)' : 'rgba(255,255,255,0.02)',
                    borderColor: store.format === f.value ? 'rgba(222, 142, 255, 0.2)' : 'rgba(255,255,255,0.05)',
                    color: store.format === f.value ? '#de8eff' : '#72757d',
                  }}
                  onClick={() => store.setFormat(f.value)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Table size */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-text-muted">גודל שולחן</label>
            <div className="flex gap-1.5">
              {(['6max', '9max'] as TableSize[]).map((ts) => (
                <button
                  key={ts}
                  className="flex-1 px-2 py-2 rounded-xl text-[11px] font-bold transition-all border active:scale-95"
                  style={{
                    backgroundColor: store.tableSize === ts ? 'rgba(0, 244, 254, 0.15)' : '#1b2028',
                    borderColor: store.tableSize === ts ? 'rgba(0, 244, 254, 0.3)' : 'rgba(255,255,255,0.05)',
                    color: store.tableSize === ts ? '#00f4fe' : '#a8abb3',
                  }}
                  onClick={() => store.setTableSize(ts)}
                >
                  {ts === '6max' ? '6-Max' : '9-Max'}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Stack depth */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-text-muted">עומק סטאק</label>
            <div className="flex items-center gap-3">
              <input
                type="range" min={10} max={200}
                value={store.stackDepth}
                onChange={(e) => store.setStackDepth(Number(e.target.value))}
                className="flex-1"
              />
              <div className="w-[65px] text-center py-1.5 rounded-xl bg-bg-tertiary/60 border border-white/5 text-sm font-mono font-extrabold text-primary" dir="ltr">
                {store.stackDepth}<span className="text-text-muted text-[9px]"> BB</span>
              </div>
            </div>
          </div>

          {/* 4. Players in pot — dynamic based on table size */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-text-muted">שחקנים בפוט</label>
            <div className="flex flex-wrap gap-1">
              {Array.from({ length: (store.tableSize === '6max' ? 6 : 9) - 1 }, (_, i) => i + 2).map((n) => (
                <button
                  key={n}
                  className="px-2 py-1.5 rounded-lg font-bold transition-all border active:scale-95"
                  style={{
                    fontSize: store.tableSize === '9max' ? '10px' : '11px',
                    minWidth: store.tableSize === '9max' ? '32px' : '36px',
                    backgroundColor: store.playersInPot === n ? 'rgba(0, 244, 254, 0.15)' : '#1b2028',
                    borderColor: store.playersInPot === n ? 'rgba(0, 244, 254, 0.3)' : 'rgba(255,255,255,0.05)',
                    color: store.playersInPot === n ? '#00f4fe' : '#a8abb3',
                  }}
                  onClick={() => store.setPlayersInPot(n)}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Player positions (dynamic, 3+ only) */}
          {store.playersInPot >= 3 && (
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-text-muted">פוזיציות שחקנים</label>
              <div className="space-y-2">
                {store.potPlayers.map((player, idx) => {
                  const positions = store.tableSize === '6max' ? POSITIONS_6MAX : POSITIONS_9MAX
                  const actions: PlayerAction[] = ['Raise', 'Call', '3-Bet']
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2 rounded-xl transition-all"
                      style={{
                        backgroundColor: player.isHero ? 'rgba(0, 244, 254, 0.06)' : 'rgba(255,255,255,0.02)',
                        border: player.isHero ? '1px solid rgba(0, 244, 254, 0.2)' : '1px solid rgba(255,255,255,0.05)',
                      }}
                    >
                      <span className="text-[10px] font-bold text-text-muted whitespace-nowrap w-[55px]">
                        שחקן {idx + 1}{player.isHero && <span style={{ color: '#00f4fe' }}> (אתה)</span>}
                      </span>
                      <div className="relative flex-1">
                        <select
                          className="w-full bg-bg-tertiary/60 border border-white/5 rounded-lg px-2 py-1.5 text-[11px] font-bold text-text-primary cursor-pointer"
                          value={player.position}
                          onChange={(e) => store.setPlayerPosition(idx, e.target.value as Position)}
                        >
                          {positions.map((p) => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                      {!player.isHero && (
                        <div className="relative flex-1">
                          <select
                            className="w-full bg-bg-tertiary/60 border border-white/5 rounded-lg px-2 py-1.5 text-[11px] font-bold text-text-primary cursor-pointer"
                            value={player.action}
                            onChange={(e) => store.setPlayerAction(idx, e.target.value as PlayerAction)}
                          >
                            {actions.map((a) => <option key={a} value={a}>{a}</option>)}
                          </select>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Main opponent selection (3+ players) */}
          {store.playersInPot >= 3 && (
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-text-muted">יריב עיקרי לניתוח</label>
              <div className="relative">
                <select
                  className="w-full bg-bg-tertiary/60 border border-white/5 rounded-xl px-3 py-2 text-[11px] font-bold text-text-primary cursor-pointer hover:border-white/10 transition-all"
                  value={store.mainOpponentIdx}
                  onChange={(e) => store.setMainOpponentIdx(Number(e.target.value))}
                >
                  {store.potPlayers.map((player, idx) =>
                    !player.isHero && (
                      <option key={idx} value={idx}>
                        שחקן {idx + 1} ({player.position} — {player.action === 'none' ? 'Hero' : player.action})
                      </option>
                    )
                  )}
                </select>
                <ChevronDown size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
              </div>
            </div>
          )}

          {/* Positions (HU mode — only when 2 players) */}
          {store.playersInPot === 2 && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest font-bold" style={{ color: '#ff6e81' }}>OOP</label>
                <div className="relative">
                  <select
                    className="w-full bg-bg-tertiary/60 border border-white/5 rounded-xl px-3 py-2 text-sm font-bold text-text-primary cursor-pointer hover:border-white/10 transition-all"
                    value={store.oopPosition}
                    onChange={(e) => store.setPositions(e.target.value as Position, store.ipPosition)}
                  >
                    {(store.tableSize === '6max' ? POSITIONS_6MAX : POSITIONS_9MAX).map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <ChevronDown size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest font-bold" style={{ color: '#00f4fe' }}>IP</label>
                <div className="relative">
                  <select
                    className="w-full bg-bg-tertiary/60 border border-white/5 rounded-xl px-3 py-2 text-sm font-bold text-text-primary cursor-pointer hover:border-white/10 transition-all"
                    value={store.ipPosition}
                    onChange={(e) => store.setPositions(store.oopPosition, e.target.value as Position)}
                  >
                    {(store.tableSize === '6max' ? POSITIONS_6MAX : POSITIONS_9MAX).map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <ChevronDown size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                </div>
              </div>
            </div>
          )}

          {/* 6. Pot type */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-text-muted">סוג פוט</label>
            <div className="grid grid-cols-2 gap-1.5">
              {POT_TYPES.map((pt) => (
                <button
                  key={pt.value}
                  className="px-2 py-2 rounded-xl text-[11px] font-bold transition-all border active:scale-95"
                  style={{
                    backgroundColor: store.potType === pt.value ? 'rgba(0, 244, 254, 0.08)' : 'rgba(255,255,255,0.02)',
                    borderColor: store.potType === pt.value ? 'rgba(0, 244, 254, 0.15)' : 'rgba(255,255,255,0.05)',
                    color: store.potType === pt.value ? '#00f4fe' : '#72757d',
                  }}
                  onClick={() => store.setPotType(pt.value)}
                >
                  {pt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 7. Raise size */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-text-muted">גודל רייז</label>
            <div className="flex gap-1.5">
              {([2, 2.5, 3, 4] as RaiseSize[]).map((rs) => (
                <button
                  key={rs}
                  className="flex-1 px-2 py-2 rounded-xl text-[11px] font-bold transition-all border active:scale-95"
                  style={{
                    backgroundColor: store.raiseSize === rs ? 'rgba(0, 244, 254, 0.15)' : '#1b2028',
                    borderColor: store.raiseSize === rs ? 'rgba(0, 244, 254, 0.3)' : 'rgba(255,255,255,0.05)',
                    color: store.raiseSize === rs ? '#00f4fe' : '#a8abb3',
                  }}
                  onClick={() => store.setRaiseSize(rs)}
                >
                  {rs}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bet sizes */}
        <div className="glass-panel p-5 space-y-4">
          <h3 className="text-[10px] uppercase tracking-widest font-bold text-text-muted">גדלי הימור</h3>
          <BetSizeSelector
            label="גדלי הימור OOP"
            sizes={[25, 33, 50, 75, 100, 125, 150]}
            selectedSizes={store.oopBetSizes}
            onToggle={(s) => store.toggleOopBetSize(s)}
          />
          <div className="border-t border-white/5" />
          <BetSizeSelector
            label="גדלי הימור IP"
            sizes={[25, 33, 50, 75, 100, 125, 150]}
            selectedSizes={store.ipBetSizes}
            onToggle={(s) => store.toggleIpBetSize(s)}
          />
        </div>

        {/* SOLVE BUTTON — flat, no gradient */}
        <motion.button
          className="w-full py-3.5 rounded-xl font-extrabold text-base text-white tracking-tight transition-all active:scale-[0.97]"
          style={{
            background: 'rgba(185, 10, 252, 0.3)',
            border: '1px solid rgba(222, 142, 255, 0.25)',
            boxShadow: '0 0 20px rgba(222, 142, 255, 0.12)',
            opacity: store.board.length < 3 ? 0.35 : 1,
          }}
          whileHover={{ background: 'rgba(185, 10, 252, 0.45)' }}
          whileTap={{ scale: 0.97 }}
          onClick={handleSolve}
          disabled={store.board.length < 3}
        >
          <span className="flex items-center justify-center gap-2">
            <Play size={16} /> חשב פתרון
          </span>
        </motion.button>
      </div>

      {/* ═══ CENTER — Board cards ═══ */}
      <div className="lg:col-span-4 space-y-6">
        <div className="glass-panel p-5 space-y-4">
          <h3 className="text-[10px] uppercase tracking-widest font-bold text-text-muted">קלפי הבורד</h3>
          <div className="flex justify-center">
            <CardDisplay cards={store.board} />
          </div>

          <div className="flex items-center gap-3 justify-center">
            <motion.button
              className="px-4 py-2 rounded-xl text-xs font-bold border transition-all active:scale-95"
              style={{
                backgroundColor: 'rgba(222,142,255,0.08)',
                borderColor: 'rgba(222,142,255,0.2)',
                color: '#de8eff',
              }}
              whileHover={{ backgroundColor: 'rgba(222,142,255,0.15)' }}
              onClick={() => setShowCardModal(true)}
            >
              בחר קלפים
            </motion.button>
            {store.board.length > 0 && (
              <button
                className="px-3 py-2 rounded-xl text-xs font-bold text-text-muted hover:text-action-bet transition-colors flex items-center gap-1 border border-white/5"
                onClick={() => store.clearBoard()}
              >
                <RotateCcw size={11} /> נקה
              </button>
            )}
          </div>

          {/* Inline card selector */}
          <div className="border-t border-white/5 pt-3">
            <CardSelector
              selectedCards={store.board}
              onCardSelect={handleCardSelect}
              onCardDeselect={handleCardDeselect}
              disabledCards={store.holeCards}
              maxCards={5}
            />
          </div>
        </div>

        {/* ═══ Hole Cards ═══ */}
        <div
          className="glass-panel p-5 space-y-4"
          style={{ border: '1px solid rgba(0, 244, 254, 0.2)', boxShadow: '0 0 15px rgba(0, 244, 254, 0.1)' }}
        >
          <h3 className="text-[10px] uppercase tracking-widest font-bold" style={{ color: '#00f4fe' }}>הקלפים שלי</h3>
          <div className="flex justify-center">
            <HoleCardDisplay cards={store.holeCards} />
          </div>
          <div className="flex items-center gap-3 justify-center">
            {store.holeCards.length > 0 && (
              <button
                className="px-3 py-2 rounded-xl text-xs font-bold text-text-muted hover:text-action-bet transition-colors flex items-center gap-1 border border-white/5"
                onClick={() => store.clearHoleCards()}
              >
                <RotateCcw size={11} /> נקה
              </button>
            )}
          </div>
          <div className="border-t border-white/5 pt-3">
            <CardSelector
              selectedCards={store.holeCards}
              onCardSelect={handleHoleCardSelect}
              onCardDeselect={handleHoleCardDeselect}
              disabledCards={store.board}
              maxCards={2}
            />
          </div>
        </div>
      </div>

      {/* ═══ LEFT — Preflop range grid ═══ */}
      <div className="lg:col-span-5 space-y-6">
        <div className="glass-panel p-5 space-y-4">
          {/* Player toggle tabs */}
          {store.playersInPot >= 3 ? (
            /* Multiway: tabs per player */
            <div className="flex items-center gap-1 bg-bg-tertiary/40 rounded-xl p-1 border border-white/5 overflow-x-auto">
              {store.potPlayers.map((player, idx) => (
                <button
                  key={idx}
                  className="flex-1 px-2 py-2 rounded-lg text-[10px] font-bold transition-all active:scale-95 whitespace-nowrap"
                  style={{
                    backgroundColor: activeRangeIdx === idx
                      ? player.isHero ? 'rgba(0, 244, 254, 0.12)' : 'rgba(222, 142, 255, 0.1)'
                      : 'transparent',
                    color: activeRangeIdx === idx
                      ? player.isHero ? '#00f4fe' : '#de8eff'
                      : '#72757d',
                    boxShadow: activeRangeIdx === idx
                      ? player.isHero ? '0 0 10px rgba(0,244,254,0.06)' : '0 0 10px rgba(222,142,255,0.06)'
                      : 'none',
                  }}
                  onClick={() => setActiveRangeIdx(idx)}
                >
                  {player.position}{player.isHero ? ' (אתה)' : ''}
                </button>
              ))}
            </div>
          ) : (
            /* HU: OOP vs IP tabs */
            <div className="flex items-center gap-1.5 bg-bg-tertiary/40 rounded-xl p-1 border border-white/5">
              <button
                className="flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all active:scale-95"
                style={{
                  backgroundColor: activeRangePlayer === 'oop' ? 'rgba(255, 110, 129, 0.12)' : 'transparent',
                  color: activeRangePlayer === 'oop' ? '#ff6e81' : '#72757d',
                  boxShadow: activeRangePlayer === 'oop' ? '0 0 10px rgba(255,110,129,0.06)' : 'none',
                }}
                onClick={() => setActiveRangePlayer('oop')}
              >
                OOP ({store.oopPosition})
              </button>
              <button
                className="flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all active:scale-95"
                style={{
                  backgroundColor: activeRangePlayer === 'ip' ? 'rgba(0, 244, 254, 0.12)' : 'transparent',
                  color: activeRangePlayer === 'ip' ? '#00f4fe' : '#72757d',
                  boxShadow: activeRangePlayer === 'ip' ? '0 0 10px rgba(0,244,254,0.06)' : 'none',
                }}
                onClick={() => setActiveRangePlayer('ip')}
              >
                IP ({store.ipPosition})
              </button>
            </div>
          )}

          <RangeGrid
            range={
              store.playersInPot >= 3
                ? (store.potPlayers[activeRangeIdx]?.range ?? {})
                : activeRangePlayer === 'oop' ? store.oopRange : store.ipRange
            }
          />

          <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold text-text-muted">
            <span>טווח ידיים</span>
            <span dir="ltr">
              {Object.values(
                store.playersInPot >= 3
                  ? (store.potPlayers[activeRangeIdx]?.range ?? {})
                  : activeRangePlayer === 'oop' ? store.oopRange : store.ipRange
              ).filter((v) => v > 0).length} combos
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════
   RESULTS VIEW — 6 information layers
   Mobile order: results → decision tree → hero rec → strength/equity/math → grid → table → opponent
   Desktop: 3 columns (left info | center grid | right table+opponent)
   ═══════════════════════════════════════════ */
function ResultsView({ store, heroHandLabel }: { store: SolverState; heroHandLabel: string | null }) {
  const [selectedHand, setSelectedHand] = useState<string | null>(heroHandLabel ?? 'AKs')
  const activeHand = selectedHand ?? heroHandLabel ?? 'AKs'
  const handDetail = getHandDetail(activeHand)
  const handActions = getHandStrategy(activeHand)
  const potSize = store.potType === 'SRP' ? 6.5 : store.potType === '3bet' ? 22 : 50
  const isMultiway = store.playersInPot >= 3
  const heroPlayer = store.potPlayers.find(p => p.isHero)
  const mainOpponent = store.potPlayers[store.mainOpponentIdx]
  const equities = getMultiwayEquitiesForHand(heroHandLabel, store.playersInPot, store.potPlayers)
  const playerColors = ['#00f4fe', '#de8eff', '#ff6e81', '#a8abb3', '#72757d']

  // Auto-select hero hand when hole cards change
  useEffect(() => {
    if (heroHandLabel) setSelectedHand(heroHandLabel)
  }, [heroHandLabel])

  // ── Engine equity analysis ──
  const { analysis: engineAnalysis, analyze: runEngine } = useEquityAnalysis()

  // Trigger engine on any input change (including preflop with empty board)
  useEffect(() => {
    if (store.holeCards.length !== 2) return
    const heroPos = heroPlayer?.position ?? store.oopPosition
    const opponents = store.potPlayers
      .filter((p) => !p.isHero)
      .map((p) => ({ position: p.position, action: p.action }))
    runEngine({
      heroPosition: heroPos,
      heroCards: store.holeCards,
      board: store.board,
      opponents,
    })
  }, [store.holeCards, store.board, store.potPlayers, heroPlayer, store.oopPosition, runEngine])

  // Engine-powered recommendation (when available)
  const hasEngineResult = engineAnalysis.heroEquity > 0 && !engineAnalysis.isCalculating
  const engineAction = hasEngineResult
    ? engineAnalysis.recommendation === 'raise' ? 'Raise' : engineAnalysis.recommendation === 'call' ? 'Call' : 'Fold'
    : null

  // Build explanation with board texture info
  const textureParts: string[] = []
  if (hasEngineResult && engineAnalysis.boardTexture) {
    const bt = engineAnalysis.boardTexture
    if (bt.flushPossible) textureParts.push('פלאש אפשרי')
    if (bt.straightPossible) textureParts.push('סטרייט אפשרי')
    if (bt.pairedBoard) textureParts.push('בורד מזווג')
    if (bt.flushDraw && !bt.flushPossible) textureParts.push('דראו לפלאש')
  }
  const textureStr = textureParts.length > 0 ? ` | בורד: ${textureParts.join(', ')}` : ''
  const streetLabel = store.board.length === 0 ? 'פריפלופ' : store.board.length <= 3 ? 'פלופ' : store.board.length === 4 ? 'טרן' : 'ריבר'
  const engineExplanation = hasEngineResult
    ? `${streetLabel} — אקוויטי ${(engineAnalysis.heroEquity * 100).toFixed(1)}%${textureStr} (${engineAnalysis.simulations.toLocaleString()} סימולציות, ${engineAnalysis.timeMs}ms)`
    : ''

  // Engine-powered equity bars for the multiway/hero section
  const engineEquities = hasEngineResult
    ? [
        { position: heroPlayer?.position ?? store.oopPosition, equity: engineAnalysis.heroEquity * 100, ev: 0, isHero: true },
        ...engineAnalysis.opponentEquities.map((o) => ({ position: o.position, equity: o.equity * 100, ev: 0, isHero: false })),
      ]
    : null

  // Engine-powered opponent range breakdown for OpponentRange component
  // mainOpponentIdx is an index into potPlayers (includes hero),
  // but opponentRangeBreakdown only has non-hero entries — need to map
  const mainOppPosition = store.potPlayers[store.mainOpponentIdx]?.position
  const mainOppBreakdown = hasEngineResult && engineAnalysis.opponentRangeBreakdown.length > 0
    ? engineAnalysis.opponentRangeBreakdown.find(r => r.position === mainOppPosition)
      ?? engineAnalysis.opponentRangeBreakdown[0]
    : null

  return (
    <motion.div
      key="results"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      {/* ── 1. EQ / EV + Nash Distance ── */}
      <div className="glass-panel p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-[10px] uppercase tracking-widest font-bold text-text-muted">תוצאות פתרון</h3>
          <div className="flex items-center gap-3 text-xs" dir="ltr">
            <div>
              <span className="text-text-muted text-[10px] uppercase tracking-wider font-bold">מרחק נאש </span>
              <span className="font-mono font-extrabold" style={{ color: '#00f4fe' }}>{store.nashDistance.toFixed(2)}%</span>
            </div>
            <div className="w-px h-4 bg-white/5" />
            <div>
              <span className="text-text-muted text-[10px] uppercase tracking-wider font-bold">איטרציות </span>
              <span className="font-mono font-bold text-text-primary">10,000</span>
            </div>
          </div>
        </div>

        {heroHandLabel && (
          <div className="text-center text-xs font-bold mb-2" style={{ color: '#00f4fe' }}>
            היד שלך: <span className="font-mono" dir="ltr">{heroHandLabel}</span>
          </div>
        )}

        {isMultiway || heroHandLabel ? (
          /* Multiway or hero-hand equity bars — use engine data when available */
          <div className="space-y-3">
            <div className="text-[10px] uppercase tracking-widest font-bold text-text-muted text-center">
              אקוויטי
              {engineAnalysis.isCalculating && <span className="mr-2 text-primary animate-pulse"> ⏳</span>}
            </div>
            {(engineEquities ?? equities).map((p, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold" style={{ color: playerColors[i] }}>
                    {p.isHero ? `אתה${heroHandLabel ? ` (${heroHandLabel})` : ''} — ${p.position}` : `${isMultiway ? `שחקן ${i}` : 'יריב'} (${p.position})`}
                  </span>
                  <span className="font-mono font-extrabold text-text-primary" dir="ltr">{p.equity.toFixed(1)}%</span>
                </div>
                <div className="h-2 rounded-full bg-bg-tertiary border border-white/5 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: playerColors[i] }}
                    initial={{ width: 0 }}
                    animate={{ width: `${p.equity}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
              </div>
            ))}
            <div className="border-t border-white/5 pt-3 space-y-3">
              <div className="text-[10px] uppercase tracking-widest font-bold text-text-muted text-center">ערך צפוי (EV)</div>
              {equities.map((p, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="font-bold" style={{ color: playerColors[i] }}>
                    {p.isHero ? `אתה — ${p.position}` : `${isMultiway ? `שחקן ${i}` : 'יריב'} (${p.position})`}
                  </span>
                  <span className="font-mono font-extrabold text-text-primary" dir="ltr">{p.ev.toFixed(2)} BB</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* HU without hero hand — classic bars */
          <>
            <EqEvBar
              oopValue={store.oopEquity}
              ipValue={store.ipEquity}
              oopLabel={`${store.oopPosition} (OOP)`}
              ipLabel={`${store.ipPosition} (IP)`}
              label="אקוויטי"
            />
            <EqEvBar
              oopValue={store.oopEv}
              ipValue={store.ipEv}
              oopLabel={`${store.oopPosition} (OOP)`}
              ipLabel={`${store.ipPosition} (IP)`}
              label="ערך צפוי (EV)"
              unit="BB"
            />
          </>
        )}
      </div>

      {/* ── 2. Decision tree + Actions ── */}
      <div className="glass-panel p-5 space-y-4">
        <DecisionTreeNav
          path={store.decisionPath}
          oopPosition={store.oopPosition}
          onBack={store.navigateBack}
          onReset={store.resetNavigation}
        />
        <div className="border-t border-white/5 pt-3 space-y-2">
          <div className="text-[10px] uppercase tracking-widest font-bold text-text-muted">
            {store.activePlayer === 'oop' ? store.oopPosition : store.ipPosition} אסטרטגיה
          </div>
          <ActionButtons
            actions={store.overallActions}
            onActionClick={store.navigateAction}
          />
        </div>
      </div>

      {/* ── 3. Hero Recommendation (mobile: before grid, desktop: in left col) ── */}
      <div className="lg:hidden">
        {engineAction && heroHandLabel ? (
          <HeroRecommendation
            action={engineAction}
            confidence={engineAnalysis.confidence}
            explanation={engineExplanation}
            hasHoleCards={true}
          />
        ) : handDetail ? (
          <HeroRecommendation
            action={handDetail.heroAction}
            amount={handDetail.heroAmount}
            confidence={handDetail.heroConfidence}
            explanation={handDetail.heroExplanation}
            responseToRaise={handDetail.heroResponseToRaise}
            hasHoleCards={!!heroHandLabel}
          />
        ) : (
          <HeroRecommendation
            action="Check"
            confidence={0}
            explanation=""
            hasHoleCards={false}
          />
        )}
      </div>

      {/* ── 4. Compact info row (mobile only) ── */}
      <div className="lg:hidden grid grid-cols-2 gap-4">
        {handDetail && (
          <>
            <HandStrength
              handType={engineAnalysis.handStrength?.category ?? handDetail.handType}
              hebrewType={engineAnalysis.handStrength?.hebrewCategory ?? handDetail.hebrewType}
              category={engineAnalysis.handStrength?.strength ?? handDetail.category}
              rankInRange={engineAnalysis.handStrength ? Math.max(1, Math.round((100 - engineAnalysis.handStrength.rankPercentile) / 100 * handDetail.totalCombos)) : handDetail.rankInRange}
              totalCombos={handDetail.totalCombos}
            />
            <EquityDisplay
              equity={hasEngineResult ? engineAnalysis.heroEquity * 100 : handDetail.equity}
              scenarios={hasEngineResult
                ? engineAnalysis.opponentEquities.map((o) => ({ label: `נגד ${o.position}`, value: (1 - o.equity) * 100 }))
                : handDetail.scenarios
              }
            />
          </>
        )}
      </div>
      <div className="lg:hidden">
        <PotMath
          potSize={potSize}
          potOdds={store.potType === 'SRP' ? 23.1 : store.potType === '3bet' ? 18.5 : 15.2}
          spr={store.stackDepth / potSize}
          impliedOdds={store.stackDepth > 50 ? 'טובים' : store.stackDepth > 20 ? 'בינוניים' : 'חלשים'}
          effectiveStack={store.stackDepth}
        />
      </div>

      {/* ── Main 3-column desktop layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ═══ LEFT COLUMN: Info layers (desktop only) ═══ */}
        <div className="hidden lg:block lg:col-span-3 space-y-6">
          {/* Layer 5: Hero Recommendation — engine-powered when available */}
          <AnimatePresence mode="wait">
            {engineAction && heroHandLabel ? (
              <motion.div key={`engine-${engineAnalysis.heroEquity}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <HeroRecommendation
                  action={engineAction}
                  confidence={engineAnalysis.confidence}
                  explanation={engineExplanation}
                  hasHoleCards={true}
                />
              </motion.div>
            ) : handDetail ? (
              <motion.div key={selectedHand} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <HeroRecommendation
                  action={handDetail.heroAction}
                  amount={handDetail.heroAmount}
                  confidence={handDetail.heroConfidence}
                  explanation={handDetail.heroExplanation}
                  responseToRaise={handDetail.heroResponseToRaise}
                  hasHoleCards={!!heroHandLabel}
                />
              </motion.div>
            ) : (
              <motion.div key="no-hand" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <HeroRecommendation
                  action="Check"
                  confidence={0}
                  explanation=""
                  hasHoleCards={false}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Layer 1: Hand Strength */}
          <AnimatePresence mode="wait">
            {handDetail && (
              <motion.div key={selectedHand} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <HandStrength
                  handType={engineAnalysis.handStrength?.category ?? handDetail.handType}
                  hebrewType={engineAnalysis.handStrength?.hebrewCategory ?? handDetail.hebrewType}
                  category={engineAnalysis.handStrength?.strength ?? handDetail.category}
                  rankInRange={engineAnalysis.handStrength ? Math.max(1, Math.round((100 - engineAnalysis.handStrength.rankPercentile) / 100 * handDetail.totalCombos)) : handDetail.rankInRange}
                  totalCombos={handDetail.totalCombos}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Layer 2: Equity — engine-powered when available */}
          <AnimatePresence mode="wait">
            {handDetail && (
              <motion.div key={selectedHand} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <EquityDisplay
                  equity={hasEngineResult ? engineAnalysis.heroEquity * 100 : handDetail.equity}
                  scenarios={hasEngineResult
                    ? engineAnalysis.opponentEquities.map((o) => ({ label: `נגד ${o.position}`, value: (1 - o.equity) * 100 }))
                    : handDetail.scenarios
                  }
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Layer 3: Pot Math */}
          <PotMath
            potSize={potSize}
            potOdds={store.potType === 'SRP' ? 23.1 : store.potType === '3bet' ? 18.5 : 15.2}
            spr={store.stackDepth / potSize}
            impliedOdds={store.stackDepth > 50 ? 'טובים' : store.stackDepth > 20 ? 'בינוניים' : 'חלשים'}
            effectiveStack={store.stackDepth}
          />
        </div>

        {/* ═══ CENTER COLUMN: Strategy grid ═══ */}
        <div className="lg:col-span-6">
          <div className="glass-panel p-5">
            {/* Player toggle + Hebrew legend */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              {isMultiway ? (
                /* Multiway: hero + main opponent tabs */
                <div className="flex items-center gap-1 bg-bg-tertiary/40 rounded-xl p-1 border border-white/5">
                  <button
                    className="px-3 py-2 rounded-lg text-[11px] font-bold transition-all active:scale-95"
                    style={{
                      backgroundColor: store.activePlayer === 'oop' ? '#00f4fe' : 'transparent',
                      color: store.activePlayer === 'oop' ? '#0a0e14' : '#72757d',
                      boxShadow: store.activePlayer === 'oop' ? '0 0 12px rgba(0,244,254,0.2)' : 'none',
                    }}
                    onClick={() => store.setActivePlayer('oop')}
                  >
                    אתה ({heroPlayer?.position ?? store.oopPosition})
                  </button>
                  <button
                    className="px-3 py-2 rounded-lg text-[11px] font-bold transition-all active:scale-95"
                    style={{
                      backgroundColor: store.activePlayer === 'ip' ? '#de8eff' : 'transparent',
                      color: store.activePlayer === 'ip' ? '#0a0e14' : '#72757d',
                      boxShadow: store.activePlayer === 'ip' ? '0 0 12px rgba(222,142,255,0.2)' : 'none',
                    }}
                    onClick={() => store.setActivePlayer('ip')}
                  >
                    יריב ({mainOpponent?.position ?? store.ipPosition} — {mainOpponent?.action ?? 'Raise'})
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1 bg-bg-tertiary/40 rounded-xl p-1 border border-white/5">
                  <button
                    className="px-4 py-2 rounded-lg text-xs font-bold transition-all active:scale-95"
                    style={{
                      backgroundColor: store.activePlayer === 'oop' ? '#ff6e81' : 'transparent',
                      color: store.activePlayer === 'oop' ? '#0a0e14' : '#72757d',
                      boxShadow: store.activePlayer === 'oop' ? '0 0 12px rgba(255,110,129,0.2)' : 'none',
                    }}
                    onClick={() => store.setActivePlayer('oop')}
                  >
                    {store.oopPosition} (OOP)
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg text-xs font-bold transition-all active:scale-95"
                    style={{
                      backgroundColor: store.activePlayer === 'ip' ? '#00f4fe' : 'transparent',
                      color: store.activePlayer === 'ip' ? '#0a0e14' : '#72757d',
                      boxShadow: store.activePlayer === 'ip' ? '0 0 12px rgba(0,244,254,0.2)' : 'none',
                    }}
                    onClick={() => store.setActivePlayer('ip')}
                  >
                    {store.ipPosition} (IP)
                  </button>
                </div>
              )}

              {/* Hebrew legend */}
              <div className="flex items-center gap-3 text-[10px] uppercase tracking-wider font-bold" dir="ltr">
                {store.overallActions.map((a, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: a.color }} />
                    <span className="text-text-muted">{hebrewAction(a.action)}</span>
                  </div>
                ))}
              </div>
            </div>

            <RangeGrid
              range={
                isMultiway
                  ? store.activePlayer === 'oop'
                    ? (heroPlayer?.range ?? store.oopRange)
                    : (mainOpponent?.range ?? store.ipRange)
                  : store.activePlayer === 'oop' ? store.oopRange : store.ipRange
              }
              strategy
              onHandClick={(hand) => setSelectedHand(hand)}
              highlightHand={heroHandLabel}
            />

            {/* Selected hand indicator */}
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] uppercase tracking-widest font-bold text-text-muted">יד נבחרת:</span>
                <span className="text-sm font-extrabold" style={{ color: activeHand === heroHandLabel ? '#00f4fe' : '#de8eff' }} dir="ltr">
                  {activeHand}{activeHand === heroHandLabel ? ' (שלך)' : ''}
                </span>
                {handActions && (
                  <div className="flex items-center gap-1.5" dir="ltr">
                    {handActions.map((a, i) => {
                      const solidColor = a.action.includes('Check') || a.action.includes('Call')
                        ? C_CHECK_SOLID
                        : a.action.includes('33')
                          ? C_BET_SM_SOLID
                          : C_BET_LG_SOLID
                      return (
                        <div key={i} className="flex items-center gap-1 text-[10px]">
                          <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: solidColor }} />
                          <span className="text-text-muted">{hebrewAction(a.action)}</span>
                          <span className="font-mono font-bold text-text-secondary">{(a.frequency * 100).toFixed(0)}%</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {heroHandLabel && selectedHand !== heroHandLabel && (
                  <button
                    className="text-[10px] font-bold px-2 py-1 rounded-lg transition-all"
                    style={{ color: '#00f4fe', backgroundColor: 'rgba(0,244,254,0.08)', border: '1px solid rgba(0,244,254,0.15)' }}
                    onClick={() => setSelectedHand(heroHandLabel)}
                  >
                    חזור ליד שלי
                  </button>
                )}
                <button
                  className="text-[10px] text-text-muted hover:text-text-primary transition-colors"
                  onClick={() => setSelectedHand(heroHandLabel)}
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ RIGHT COLUMN: Table + Opponent Range ═══ */}
        <div className="lg:col-span-3 space-y-6">
          {/* Poker table */}
          <div className="glass-panel p-5" style={{ overflow: 'visible' }}>
            <h4 className="text-[10px] uppercase tracking-widest font-bold text-text-muted mb-3">שולחן</h4>
            <PokerTable
              players={
                isMultiway
                  ? store.potPlayers.map((p, i) => ({
                      position: p.position,
                      stack: store.stackDepth,
                      isActive: p.isHero,
                      isOop: i === store.potPlayers.length - 1,
                      isHero: p.isHero,
                      isMainOpponent: i === store.mainOpponentIdx,
                      action: p.action,
                    }))
                  : [
                      { position: store.oopPosition, stack: store.stackDepth, isActive: store.activePlayer === 'oop', isOop: true },
                      { position: store.ipPosition, stack: store.stackDepth, isActive: store.activePlayer === 'ip', isOop: false },
                    ]
              }
              board={store.board}
              pot={potSize}
            />
          </div>

          {/* Layer 6: Opponent Range — engine-powered when available */}
          <OpponentRange
            categories={mainOppBreakdown?.categories ?? mockOpponentCategories}
            totalCombos={mainOppBreakdown?.totalCombos ?? 186}
          />
        </div>
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════
   HOLE CARD DISPLAY
   ═══════════════════════════════════════════ */
function HoleCardDisplay({ cards }: { cards: Card[] }) {
  const suitColorMap: Record<string, string> = { h: '#ff6e81', d: '#ff6e81', c: '#00f4fe', s: '#a8abb3' }
  const suitSymbols: Record<string, string> = { h: '♥', d: '♦', c: '♣', s: '♠' }
  return (
    <div className="flex gap-3" dir="ltr">
      {cards.map((card, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, rotateY: 180 }}
          animate={{ scale: 1, rotateY: 0 }}
          transition={{ delay: i * 0.1, type: 'spring', stiffness: 300 }}
          className="flex flex-col items-center justify-center rounded-xl font-mono font-extrabold shadow-xl"
          style={{
            width: 56,
            height: 76,
            background: 'white',
            border: '2px solid rgba(0, 244, 254, 0.4)',
            color: suitColorMap[card.suit],
            boxShadow: '0 4px 15px rgba(0,0,0,0.3), 0 0 12px rgba(0, 244, 254, 0.15)',
          }}
        >
          <span className="text-2xl leading-none">{card.rank}</span>
          <span className="text-lg leading-none">{suitSymbols[card.suit]}</span>
        </motion.div>
      ))}
      {Array.from({ length: 2 - cards.length }).map((_, i) => (
        <div
          key={`empty-${i}`}
          className="flex items-center justify-center rounded-xl"
          style={{
            width: 56,
            height: 76,
            backgroundColor: 'rgba(0, 244, 254, 0.04)',
            border: '1px dashed rgba(0, 244, 254, 0.2)',
          }}
        >
          <span className="text-base" style={{ color: '#72757d' }}>?</span>
        </div>
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════
   CARD SELECTOR MODAL
   ═══════════════════════════════════════════ */
function CardSelectorModal({
  board,
  onSelect,
  onDeselect,
  onClose,
}: {
  board: Card[]
  onSelect: (card: Card) => void
  onDeselect: (card: Card) => void
  onClose: () => void
}) {
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <motion.div
        className="relative glass-panel p-5 max-w-lg w-full space-y-4"
        style={{ border: '1px solid rgba(222,142,255,0.15)', boxShadow: '0 0 40px rgba(222,142,255,0.1)' }}
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-text-primary">בחירת קלפים לבורד</h3>
          <button
            className="p-1.5 rounded-lg bg-bg-tertiary/60 border border-white/5 text-text-secondary hover:text-text-primary transition-all"
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex justify-center">
          <CardDisplay cards={board} />
        </div>

        <CardSelector
          selectedCards={board}
          onCardSelect={onSelect}
          onCardDeselect={onDeselect}
          maxCards={5}
        />

        <div className="flex justify-between items-center">
          <span className="text-xs text-text-muted">
            {board.length}/5 קלפים נבחרו
          </span>
          <button
            className="px-4 py-2 rounded-xl text-xs font-bold border transition-all active:scale-95"
            style={{
              backgroundColor: 'rgba(222,142,255,0.1)',
              borderColor: 'rgba(222,142,255,0.2)',
              color: '#de8eff',
            }}
            onClick={onClose}
          >
            סגור
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
