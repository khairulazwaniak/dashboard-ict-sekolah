import { NavLink } from 'react-router-dom'

const NAV = [
  { to: '/',        icon: '🏠', label: 'Gambaran Keseluruhan', badge: null },
  { to: '/tempahan',icon: '🏫', label: 'Tempahan Bilik',       badge: 'tempahan' },
  { to: '/ict',     icon: '💻', label: 'Peminjaman ICT',       badge: 'ict' },
  { to: '/delima',  icon: '🌺', label: 'DELIMA',               badge: null },
]

export default function Sidebar({ badgeCounts = {} }) {
  return (
    <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 flex-col z-50"
      style={{ background: '#FFFFFF', borderRight: '1px solid #E5E7EB', boxShadow: '2px 0 12px rgba(0,0,0,0.04)' }}>

      {/* Logo */}
      <div className="p-6" style={{ borderBottom: '1px solid #E5E7EB' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg"
            style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}>
            🏛️
          </div>
          <div>
            <div className="text-sm font-bold leading-tight" style={{ color: '#111827' }}>ADMIN PANEL</div>
            <div className="text-xs" style={{ color: '#6B7280' }}>Sekolah Kebangsaan</div>
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
              `w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                isActive ? 'font-semibold' : 'hover:opacity-80'
              }`
            }
            style={({ isActive }) => ({
              background: isActive ? '#EEF2FF' : 'transparent',
              color: isActive ? '#4F46E5' : '#374151',
            })}
          >
            <span className="text-base">{item.icon}</span>
            <span className="flex-1">{item.label}</span>
            {item.badge && badgeCounts[item.badge] > 0 && (
              <span className="text-xs text-white px-1.5 py-0.5 rounded-full font-bold"
                style={{ background: item.badge === 'ict' ? '#DC2626' : '#D97706' }}>
                {badgeCounts[item.badge]}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="p-4" style={{ borderTop: '1px solid #E5E7EB' }}>
        <div className="flex items-center gap-3 px-3 py-2 rounded-2xl" style={{ background: '#F9FAFB' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}>
            KA
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold truncate" style={{ color: '#111827' }}>Khairul Azwani</div>
            <div className="text-xs truncate" style={{ color: '#6B7280' }}>Guru ICT</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
