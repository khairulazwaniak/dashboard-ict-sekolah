import { useLocation, Link } from 'react-router-dom'

const TITLES = {
  '/':         'Gambaran Keseluruhan',
  '/tempahan': '🏫 Tempahan Bilik Khas',
  '/ict':      '💻 Peminjaman Barang ICT',
  '/delima':   '🌺 Pengurusan ID DELIMA',
}

const MOBILE_NAV = [
  { to: '/',         label: '🏠 Utama' },
  { to: '/tempahan', label: '🏫 Bilik' },
  { to: '/ict',      label: '💻 ICT' },
  { to: '/delima',   label: '🌺 DELIMA' },
]

export default function TopBar({ alertCount = 0 }) {
  const { pathname } = useLocation()
  const title = TITLES[pathname] ?? 'Dashboard'

  return (
    <>
      <header className="sticky top-0 z-40 px-4 lg:px-8 py-4 flex items-center justify-between"
        style={{ background: 'rgba(238,242,255,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #E5E7EB' }}>
        <div>
          <div className="text-lg font-bold" style={{ color: '#111827' }}>{title}</div>
          <div className="text-xs mt-0.5" style={{ color: '#6B7280' }}>
            {new Date().toLocaleDateString('ms-MY', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            })}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/" className="relative w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-colors"
            style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            🔔
            {alertCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center font-bold text-white">
                {alertCount}
              </span>
            )}
          </Link>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black text-white"
            style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}>
            KA
          </div>
        </div>
      </header>

      {/* Mobile nav */}
      <div className="lg:hidden px-4 pt-3 pb-1">
        <div className="flex gap-1.5 rounded-2xl p-1.5 overflow-x-auto scrollbar-hide"
          style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
          {MOBILE_NAV.map(t => (
            <Link key={t.to} to={t.to}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all`}
              style={{ background: pathname === t.to ? '#4F46E5' : 'transparent', color: pathname === t.to ? '#fff' : '#6B7280' }}>
              {t.label}
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
