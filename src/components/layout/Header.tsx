import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, History, BarChart3, Crosshair, Bell, User, Menu, X } from 'lucide-react'

const navItems = [
  { labelHe: 'סולבר', href: '/app/solve', icon: Crosshair, active: true },
  { labelHe: 'היסטוריה', href: '/app/history', icon: History },
  { labelHe: 'דוחות', href: '/app/reports', icon: BarChart3 },
]

function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-md text-xs font-bold whitespace-nowrap z-50 glass-panel text-text-primary"
          style={{ border: '1px solid rgba(255,255,255,0.08)' }}
        >
          {text}
        </motion.div>
      )}
    </div>
  )
}

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="border-b border-white/5 bg-bg-secondary/60 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 h-14 md:h-16 flex items-center justify-between">
        {/* Logo */}
        <motion.div
          className="flex items-center gap-2.5"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="relative w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden glow-purple"
            style={{ background: 'linear-gradient(135deg, #de8eff, #b90afc)' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-extrabold tracking-tight gradient-text-purple leading-tight">
              GTO Pro
            </span>
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-secondary leading-none">
              Israel
            </span>
          </div>
        </motion.div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 bg-bg-tertiary/40 rounded-xl p-1 border border-white/5">
          {navItems.map((item) => (
            <motion.a
              key={item.href}
              href={item.href}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-bold transition-all"
              style={{
                backgroundColor: item.active ? 'rgba(222, 142, 255, 0.1)' : 'transparent',
                color: item.active ? '#de8eff' : '#a8abb3',
                boxShadow: item.active ? '0 0 12px rgba(222, 142, 255, 0.08)' : 'none',
              }}
              whileHover={{ backgroundColor: 'rgba(222, 142, 255, 0.08)', color: '#de8eff' }}
            >
              <item.icon size={15} />
              <span>{item.labelHe}</span>
            </motion.a>
          ))}
        </nav>

        {/* Desktop right actions */}
        <div className="hidden md:flex items-center gap-2">
          <Tooltip text="התראות">
            <motion.button
              className="p-2 rounded-xl bg-bg-tertiary/40 border border-white/5 text-text-secondary hover:text-text-primary transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Bell size={15} />
            </motion.button>
          </Tooltip>
          <Tooltip text="הגדרות">
            <motion.button
              className="p-2 rounded-xl bg-bg-tertiary/40 border border-white/5 text-text-secondary hover:text-text-primary transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Settings size={15} />
            </motion.button>
          </Tooltip>
          <Tooltip text="פרופיל">
            <motion.button
              className="p-2 rounded-xl border border-white/5 transition-all"
              style={{ background: 'linear-gradient(135deg, rgba(222,142,255,0.12), rgba(0,244,254,0.08))' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <User size={15} className="text-primary" />
            </motion.button>
          </Tooltip>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-xl bg-bg-tertiary/40 border border-white/5 text-text-secondary"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile menu with overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Dark overlay */}
            <motion.div
              className="fixed inset-0 z-40 bg-black/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              style={{ top: '56px' }}
            />
            {/* Menu panel */}
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden relative z-50"
              style={{ background: '#0a0e14', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
            >
              <div className="p-3 space-y-1">
                {navItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all"
                    style={{
                      backgroundColor: item.active ? 'rgba(222, 142, 255, 0.1)' : 'transparent',
                      color: item.active ? '#de8eff' : '#a8abb3',
                    }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon size={16} />
                    {item.labelHe}
                  </a>
                ))}
                <div className="flex gap-2 pt-2 border-t border-white/5">
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-bg-tertiary/40 border border-white/5 text-text-secondary text-sm font-bold">
                    <Settings size={15} /> הגדרות
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-bg-tertiary/40 border border-white/5 text-text-secondary text-sm font-bold">
                    <User size={15} /> פרופיל
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}
