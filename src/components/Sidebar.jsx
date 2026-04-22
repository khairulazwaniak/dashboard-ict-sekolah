import { NavLink } from 'react-router-dom'

const NAV = [
  { to: '/',        icon: '⬡', label: 'Gambaran Keseluruhan', badge: null },
  { to: '/tempahan',icon: '🏫', label: 'Tempahan Bilik',       badge: 'tempahan' },
  { to: '/ict',     icon: '💻', label: 'Peminjaman ICT',       badge: 'ict' },
  { to: '/delima',  icon: '🌺', label: 'DELIMA',               badge: null },
]

export default function Sidebar({ badgeCounts = {} }) {
  return (
    <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-gray-900 border-r border-gray-800 flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-lg">
            🏛️
          </div>
          <div>
            <div className="text-sm font-bold text-white leading-tight">ADMIN PANEL</div>
            <div className="text-xs text-gray-400">Sekolah Kebangsaan</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {NAV.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <span className="text-base">{item.icon}</span>
            <span className="flex-1">{item.label}</span>
            {item.badge && badgeCounts[item.badge] > 0 && (
              <span className={`text-xs text-white px-1.5 py-0.5 rounded-full font-bold ${
                item.badge === 'ict' ? 'bg-red-500' : 'bg-amber-500'
              }`}>
                {badgeCounts[item.badge]}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center text-sm">
            👤
          </div>
          <div>
            <div className="text-xs font-semibold text-white">Pentadbir</div>
            <div className="text-xs text-gray-500">admin@sekolah.edu.my</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
