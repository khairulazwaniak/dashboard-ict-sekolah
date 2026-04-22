import { useNavigate } from 'react-router-dom'

const STATS = [
  { num: '3',     label: 'Sistem Aktif',    icon: '⚡' },
  { num: '100%',  label: 'Integriti Data',  icon: '🛡️' },
  { num: 'KPM',   label: 'Platform Rasmi',  icon: '🏛️' },
  { num: 'Aktif', label: 'Status Sistem',   icon: '🟢' },
]

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div style={{ background: '#0f1117', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}
      className="flex flex-col">

      {/* Top bar */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div style={{ background: 'linear-gradient(135deg, #4A9EFF, #9B59B6)' }}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-white">
            SK
          </div>
          <div>
            <div className="text-xs font-bold text-white tracking-widest">UNIT ICT</div>
            <div className="text-xs" style={{ color: '#8892a4' }}>Sekolah Kebangsaan</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold" style={{ color: '#8892a4' }}>Sistem Aktif</span>
          <span className="text-xs font-bold" style={{ color: '#8892a4' }}>
            {new Date().toLocaleDateString('ms-MY', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">

        {/* Badge */}
        <div style={{ background: 'rgba(74,158,255,0.1)', border: '1px solid rgba(74,158,255,0.2)' }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          <span className="text-xs font-semibold" style={{ color: '#4A9EFF' }}>UNIT KOKURIKULUM • SK DARAU</span>
        </div>

        {/* Title */}
        <h1 style={{ fontFamily: "'Manrope', sans-serif", fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, lineHeight: 1.1 }}
          className="mb-4">
          <span className="text-white">PORTAL DIGITAL</span>
          <br />
          <span style={{ color: '#4A9EFF' }}>SISTEM ICT</span>
        </h1>

        <p style={{ color: '#8892a4', maxWidth: 520 }}
          className="text-sm leading-relaxed mb-12">
          Pusat sehenti pengurusan tempahan bilik khas, peminjaman barang ICT
          dan pengurusan ID DELIMA sekolah dalam satu platform bersepadu.
        </p>

        {/* Teacher Cards */}
        <div className="flex flex-col sm:flex-row gap-4 mb-12 w-full max-w-lg">
          <div style={{ background: '#1a1d27', border: '1px solid rgba(74,158,255,0.3)', borderLeft: '3px solid #4A9EFF' }}
            className="flex-1 rounded-2xl p-5 flex items-center gap-4 text-left">
            <div style={{ background: 'linear-gradient(135deg, #4A9EFF, #9B59B6)' }}
              className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black text-white flex-shrink-0">
              KA
            </div>
            <div>
              <div className="text-xs font-bold tracking-widest mb-1" style={{ color: '#4A9EFF' }}>GURU ICT</div>
              <div className="text-sm font-bold text-white leading-tight">Khairul Azwani</div>
              <div className="text-xs font-semibold text-white/70">bin Hj Ahinin</div>
              <div style={{ background: 'rgba(46,204,113,0.15)', color: '#2ECC71' }}
                className="text-xs font-bold px-2 py-0.5 rounded-full inline-block mt-2">
                • SISTEM DIBENARKAN
              </div>
            </div>
          </div>

          <div style={{ background: '#1a1d27', border: '1px solid rgba(155,89,182,0.3)', borderLeft: '3px solid #9B59B6' }}
            className="flex-1 rounded-2xl p-5 flex items-center gap-4 text-left">
            <div style={{ background: 'linear-gradient(135deg, #9B59B6, #E74C3C)' }}
              className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black text-white flex-shrink-0">
              👤
            </div>
            <div>
              <div className="text-xs font-bold tracking-widest mb-1" style={{ color: '#9B59B6' }}>PENTADBIR</div>
              <div className="text-sm font-bold text-white">Admin Sistem</div>
              <div className="text-xs text-white/50">admin@sekolah.edu.my</div>
              <div style={{ background: 'rgba(46,204,113,0.15)', color: '#2ECC71' }}
                className="text-xs font-bold px-2 py-0.5 rounded-full inline-block mt-2">
                • SISTEM DIBENARKAN
              </div>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mb-16">
          <button
            onClick={() => navigate('/')}
            style={{ background: 'linear-gradient(135deg, #4A9EFF, #9B59B6)', boxShadow: '0 8px 32px rgba(74,158,255,0.3)' }}
            className="px-8 py-3.5 rounded-xl text-sm font-bold text-white hover:opacity-90 transition-opacity flex items-center gap-2">
            Buka Dashboard →
          </button>
          <button
            onClick={() => navigate('/tempahan')}
            style={{ background: '#1a1d27', border: '1px solid rgba(255,255,255,0.1)' }}
            className="px-8 py-3.5 rounded-xl text-sm font-bold text-white/70 hover:text-white hover:border-white/30 transition-all">
            Tempah Bilik
          </button>
        </div>

        {/* Stats Row */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
          className="w-full max-w-2xl pt-8 grid grid-cols-2 sm:grid-cols-4 gap-6">
          {STATS.map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div style={{ fontFamily: "'Manrope', sans-serif" }}
                className="text-xl font-black text-white">{s.num}</div>
              <div className="text-xs mt-0.5" style={{ color: '#8892a4' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', color: '#4a5568' }}
        className="px-6 py-4 text-center text-xs">
        © {new Date().getFullYear()} Sistem ICT Sekolah • Dibangunkan oleh Unit ICT
      </div>
    </div>
  )
}
