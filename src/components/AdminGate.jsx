import { useState } from 'react'
import { useAdmin } from '../contexts/AdminContext'

export default function AdminGate({ children }) {
  const { isAdmin, login, logout } = useAdmin()
  const [show, setShow] = useState(false)
  const [form, setForm] = useState({ user: '', pass: '' })
  const [error, setError] = useState('')

  const handleLogin = () => {
    const ok = login(form.user, form.pass)
    if (ok) {
      setShow(false)
      setForm({ user: '', pass: '' })
      setError('')
    } else {
      setError('Username atau password salah.')
    }
  }

  if (isAdmin) {
    return (
      <>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
            <span>🔓</span> Mod Admin Aktif
          </div>
          <button onClick={logout}
            className="text-xs text-gray-500 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg border border-gray-800 hover:border-red-800">
            Log Keluar Admin
          </button>
        </div>
        {children}
      </>
    )
  }

  return (
    <>
      {/* Prompt login */}
      <div style={{ background: '#1a1d27', border: '1px solid rgba(255,255,255,0.06)' }}
        className="rounded-2xl p-6 text-center">
        <div className="text-3xl mb-3">🔐</div>
        <div className="text-sm font-bold text-white mb-1">Kawasan Admin</div>
        <div className="text-xs text-gray-500 mb-4">Log masuk sebagai admin untuk mengurus data.</div>
        <button onClick={() => setShow(true)}
          style={{ background: 'linear-gradient(135deg, #4A9EFF, #9B59B6)' }}
          className="px-6 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90 transition-opacity">
          Log Masuk Admin
        </button>
      </div>

      {/* Modal login */}
      {show && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={e => e.target === e.currentTarget && setShow(false)}>
          <div style={{ background: '#1a1d27', border: '1px solid rgba(255,255,255,0.08)' }}
            className="rounded-2xl p-6 w-full max-w-sm">
            <div className="text-base font-bold text-white mb-1">Log Masuk Admin</div>
            <div className="text-xs text-gray-500 mb-5">Masukkan credentials untuk akses penuh.</div>

            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#4A9EFF' }}>Username</label>
                <input value={form.user} onChange={e => setForm(f => ({ ...f, user: e.target.value }))}
                  placeholder="admin"
                  className="w-full rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none"
                  style={{ background: '#0f1117', border: '1px solid rgba(255,255,255,0.08)' }}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#4A9EFF' }}>Password</label>
                <input type="password" value={form.pass} onChange={e => setForm(f => ({ ...f, pass: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none"
                  style={{ background: '#0f1117', border: '1px solid rgba(255,255,255,0.08)' }}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()} />
              </div>
              {error && <div className="text-xs text-red-400 font-semibold">{error}</div>}
            </div>

            <div className="flex gap-2">
              <button onClick={handleLogin}
                style={{ background: 'linear-gradient(135deg, #4A9EFF, #9B59B6)' }}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90">
                Masuk
              </button>
              <button onClick={() => { setShow(false); setError('') }}
                className="px-4 py-2.5 rounded-xl text-sm text-gray-400 border border-gray-700 hover:border-gray-500">
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
