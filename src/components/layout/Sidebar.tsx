import { motion } from 'framer-motion'
import { Grid3X3, Layers, Lock, Library, GraduationCap, HelpCircle } from 'lucide-react'

const sidebarItems = [
  { icon: Grid3X3, label: 'עורך טווחים', active: true, color: '#de8eff' },
  { icon: Layers, label: 'תצוגת מטריצה', color: '#00f4fe' },
  { icon: Lock, label: 'נעילת נוד', color: '#de8eff' },
  { icon: Library, label: 'ספרייה', color: '#a8abb3' },
  { icon: GraduationCap, label: 'אימון', color: '#a8abb3' },
  { icon: HelpCircle, label: 'תמיכה', color: '#a8abb3' },
]

export function LeftSidebar() {
  return (
    <aside className="hidden md:flex w-[60px] shrink-0 border-l border-white/5 bg-bg-secondary/40 backdrop-blur-md flex-col items-center py-4 gap-1.5">
      {sidebarItems.map((item) => (
        <motion.button
          key={item.label}
          className="group relative w-10 h-10 rounded-xl flex items-center justify-center transition-all"
          style={{
            backgroundColor: item.active ? 'rgba(222, 142, 255, 0.1)' : 'transparent',
            boxShadow: item.active ? '0 0 12px rgba(222, 142, 255, 0.08)' : 'none',
          }}
          whileHover={{
            backgroundColor: 'rgba(222, 142, 255, 0.08)',
            scale: 1.08,
          }}
          whileTap={{ scale: 0.92 }}
        >
          <item.icon
            size={18}
            style={{ color: item.active ? item.color : '#72757d' }}
            className="transition-colors group-hover:!text-[#de8eff]"
          />
          {/* Tooltip on hover */}
          <div className="absolute right-full mr-3 px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity glass-panel text-text-primary pointer-events-none z-50"
            style={{ border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {item.label}
          </div>
          {/* Active indicator */}
          {item.active && (
            <div className="absolute -right-[1px] top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-l-full bg-primary" />
          )}
        </motion.button>
      ))}
    </aside>
  )
}
