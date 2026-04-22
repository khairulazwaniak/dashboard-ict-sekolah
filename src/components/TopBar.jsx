import { NavLink, useLocation } from 'react-router-dom'

const NAV = [
  { to: '/',        label: 'Gambaran Keseluruhan', badge: null },
  { to: '/tempahan',label: 'Tempahan Bilik',        badge: 'tempahan' },
  { to: '/ict',     label: 'Peminjaman ICT',        badge: 'ict' },
  { to: '/delima',  label: 'DELIMA',                badge: null },
]

const TITLES = {
  '/':         'Gambaran Keseluruhan',
  '/tempahan': 'Tempahan Bilik Khas',
  '/ict':      'Peminjaman Barang ICT',
  '/delima':   'Pengurusan ID DELIMA',
}

export default function TopBar({ badgeCounts = {}, alertCount = 0 }) {
  const { pathname } = useLocation()

  return (
    <header className="sticky top-0 z-40 w-full"
      style={{ background: 'rgba(15,17,23,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex items-center gap-6 h-16">

          {/* Logo */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
              style={{ background: 'linear-gradient(135deg, #4A9EFF, #9B59B6)' }}>
              🏛️
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-black text-white leading-tight">ADMIN PANEL</div>
              <div className="text-xs leading-tight" style={{ color: '#8892a4' }}>Sekolah Kebangsaan</div>
            </div>
          </div>

          {/* Nav links */}
          <nav className="flex items-center gap-1 flex-1 overflow-x-auto scrollbar-hide">
            {NAV.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                    isActive
                      ? 'text-white'
                      : 'hover:text-white'
                  }`
                }
                style={({ isActive }) => ({
                  background: isActive ? 'rgba(74,158,255,0.15)' : 'transparent',
                  color: isActive ? '#4A9EFF' : '#8892a4',
                  border: isActive ? '1px solid rgba(74,158,255,0.3)' : '1px solid transparent',
                })}
              >
                {item.label}
                {item.badge && badgeCounts[item.badge] > 0 && (
                  <span className="text-white text-xs px-1.5 py-0.5 rounded-full font-bold"
                    style={{ background: item.badge === 'ict' ? '#E74C3C' : '#F5A623', fontSize: '10px' }}>
                    {badgeCounts[item.badge]}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="hidden md:block text-right">
              <div className="text-xs font-semibold text-white">Khairul Azwani</div>
              <div className="text-xs" style={{ color: '#8892a4' }}>Guru ICT</div>
            </div>
            <div className="relative w-8 h-8 rounded-lg flex items-center justify-center text-sm cursor-pointer hover:opacity-80 transition-opacity"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
              🔔
              {alertCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center font-bold text-white">
                  {alertCount}
                </span>
              )}
            </div>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #4A9EFF, #9B59B6)' }}>
              KA
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
