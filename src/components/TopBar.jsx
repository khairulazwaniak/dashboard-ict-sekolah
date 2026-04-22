import { useLocation, Link } from 'react-router-dom'
import { useState } from 'react'

const TITLES = {
  '/':         'Gambaran Keseluruhan',
  '/tempahan': '🏫 Tempahan Bilik Khas',
  '/ict':      '💻 Peminjaman Barang ICT',
  '/delima':   '🌺 Pengurusan ID DELIMA',
}

const MOBILE_NAV = [
  { to: '/',         label: 'Gambaran' },
  { to: '/tempahan', label: 'Bilik' },
  { to: '/ict',      label: 'ICT' },
  { to: '/delima',   label: 'DELIMA' },
]

export default function TopBar({ alertCount = 0 }) {
  const { pathname } = useLocation()
  const title = TITLES[pathname] ?? 'Dashboard'

  return (
    <>
      <header className="sticky top-0 z-40 bg-gray-950/80 backdrop-blur border-b border-gray-800 px-4 lg:px-8 py-4 flex items-center justify-between">
        <div>
          <div className="text-lg font-bold text-white">{title}</div>
          <div className="text-xs text-gray-400 mt-0.5">
            {new Date().toLocaleDateString('ms-MY', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            })}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/" className="relative w-9 h-9 bg-gray-800 rounded-xl flex items-center justify-center text-lg hover:bg-gray-700 transition-colors">
            🔔
            {alertCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center font-bold text-white">
                {alertCount}
              </span>
            )}
          </Link>
          <div className="w-9 h-9 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-xl flex items-center justify-center text-sm font-bold text-white">
            A
          </div>
        </div>
      </header>

      {/* Mobile nav */}
      <div className="lg:hidden px-4 pt-4 pb-1">
        <div className="flex gap-1.5 bg-gray-900 rounded-2xl p-1.5 overflow-x-auto scrollbar-hide">
          {MOBILE_NAV.map(t => (
            <Link
              key={t.to}
              to={t.to}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                pathname === t.to ? 'bg-white text-gray-900' : 'text-gray-400'
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
