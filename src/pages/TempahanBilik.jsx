import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Layout from '../components/Layout'
import SectionHeader from '../components/SectionHeader'

const BILIK_LIST = [
  { nama: 'Makmal Sains 1',    icon: '🔬', kapasiti: '32 pelajar' },
  { nama: 'Makmal Sains 2',    icon: '🧪', kapasiti: '32 pelajar' },
  { nama: 'Makmal Komputer 1', icon: '💻', kapasiti: '40 pelajar' },
  { nama: 'Makmal Komputer 2', icon: '🖥️', kapasiti: '40 pelajar' },
  { nama: 'Bilik STEM',        icon: '⚙️', kapasiti: '30 pelajar' },
  { nama: 'Bilik Sumber',      icon: '📚', kapasiti: '25 pelajar' },
  { nama: 'Dewan Kuliah',      icon: '🏛️', kapasiti: '80 pelajar' },
  { nama: 'Bilik Tayangan',    icon: '📽️', kapasiti: '50 pelajar' },
]

const STATUS_CONFIG = {
  approved: { dot: 'bg-emerald-400', badge: 'bg-emerald-100 text-emerald-700', label: 'Lulus',  btn: 'bg-emerald-900/40 border-emerald-700 text-emerald-400' },
  pending:  { dot: 'bg-amber-400',   badge: 'bg-amber-100 text-amber-700',     label: 'Tunggu', btn: 'bg-amber-900/40 border-amber-700 text-amber-400' },
  rejected: { dot: 'bg-red-400',     badge: 'bg-red-100 text-red-700',         label: 'Tolak',  btn: 'bg-red-900/40 border-red-700 text-red-400' },
}

const MASA_LIST = [
  '07:30–08:30', '08:30–09:30', '09:30–10:30', '10:30–11:30',
  '11:30–12:30', '14:00–15:00', '15:00–16:00', '16:00–17:00',
]

const TODAY = new Date().toISOString().slice(0, 10)

export default function TempahanBilik() {
  const [tab, setTab] = useState('dashboard')
  const [tempahan, setTempahan] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [toast, setToast] = useState(null)
  const [filterStatus, setFilterStatus] = useState('semua')

  const [form, setForm] = useState({
    guru: '', bilik: '', tarikh: TODAY, masa: '', tujuan: '',
  })

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }

  async function fetchTempahan() {
    const { data } = await supabase
      .from('tempahan_bilik')
      .select('*')
      .order('created_at', { ascending: false })
    setTempahan(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchTempahan() }, [])

  const pendingCount = tempahan.filter(t => t.status === 'pending').length
  const todayCount   = tempahan.filter(t => t.tarikh === TODAY).length

  // Room status: setiap bilik, cek ada tempahan approved hari ini
  function getRoomStatus(namaBilik) {
    const masaHariIni = tempahan.filter(t =>
      t.bilik === namaBilik && t.tarikh === TODAY && t.status === 'approved'
    )
    const pendingBilik = tempahan.find(t =>
      t.bilik === namaBilik && t.tarikh === TODAY && t.status === 'pending'
    )
    if (masaHariIni.length > 0) return 'booked'
    if (pendingBilik) return 'pending'
    return 'available'
  }

  async function submitTempahan() {
    if (!form.guru || !form.bilik || !form.tarikh || !form.masa) {
      showToast('Sila lengkapkan semua maklumat!', 'error'); return
    }
    const { error } = await supabase.from('tempahan_bilik').insert([{
      guru: form.guru, bilik: form.bilik, tarikh: form.tarikh,
      masa: form.masa, tujuan: form.tujuan, status: 'pending',
    }])
    if (error) { showToast('Ralat: ' + error.message, 'error'); return }
    setForm({ guru: '', bilik: '', tarikh: TODAY, masa: '', tujuan: '' })
    showToast('✅ Tempahan berjaya dihantar!')
    fetchTempahan()
    setTab('senarai')
  }

  async function updateStatus(id, status) {
    const { error } = await supabase
      .from('tempahan_bilik').update({ status }).eq('id', id)
    if (error) { showToast('Ralat: ' + error.message, 'error'); return }
    showToast(status === 'approved' ? '✅ Tempahan diluluskan!' : '❌ Tempahan ditolak!')
    setModal(null)
    fetchTempahan()
  }

  const filtered = filterStatus === 'semua'
    ? tempahan
    : tempahan.filter(t => t.status === filterStatus)

  const TABS = [
    { id: 'dashboard', label: '🏠 Utama' },
    { id: 'tempah',    label: '➕ Tempah' },
    { id: 'senarai',   label: '📋 Senarai' },
    { id: 'admin',     label: '⚙️ Admin' },
  ]

  return (
    <Layout badgeCounts={{ tempahan: pendingCount }}>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-full text-sm font-semibold text-white shadow-xl transition-all max-w-xs text-center ${
          toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-600'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Tab Nav */}
      <div className="flex gap-1.5 bg-gray-900 rounded-2xl p-1.5 overflow-x-auto scrollbar-hide">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              tab === t.id ? 'bg-sky-600 text-white' : 'text-gray-400 hover:text-white'
            }`}>
            {t.label}
            {t.id === 'admin' && pendingCount > 0 && (
              <span className="ml-1.5 bg-amber-500 text-white text-xs px-1.5 py-0.5 rounded-full">{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── DASHBOARD ── */}
      {tab === 'dashboard' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { num: BILIK_LIST.length, label: 'Jumlah Bilik',   color: 'text-sky-400' },
              { num: pendingCount,      label: 'Menunggu Lulus', color: 'text-amber-400' },
              { num: todayCount,        label: 'Tempahan Hari Ini', color: 'text-emerald-400' },
            ].map((s, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center">
                <div className={`text-3xl font-black ${s.color}`}>{s.num}</div>
                <div className="text-xs text-gray-400 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Room Grid */}
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-5">
            <SectionHeader icon="🏫" title="Status Bilik Khas" color="text-sky-400" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
              {BILIK_LIST.map(b => {
                const status = getRoomStatus(b.nama)
                const styles = {
                  available: 'bg-emerald-950/30 border-emerald-800',
                  booked:    'bg-red-950/30 border-red-800',
                  pending:   'bg-amber-950/30 border-amber-800',
                }
                const badges = {
                  available: 'bg-emerald-900/60 text-emerald-400',
                  booked:    'bg-red-900/60 text-red-400',
                  pending:   'bg-amber-900/60 text-amber-400',
                }
                const badgeLabel = { available: 'Kosong', booked: 'Ditempah', pending: 'Tunggu' }
                return (
                  <div key={b.nama}
                    className={`border rounded-2xl p-3 cursor-pointer transition-all hover:scale-[1.02] ${styles[status]}`}
                    onClick={() => setTab('tempah')}>
                    <div className="text-2xl mb-2">{b.icon}</div>
                    <div className="text-xs font-bold text-white leading-tight">{b.nama}</div>
                    <div className="text-xs text-gray-500 mt-1">{b.kapasiti}</div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full mt-2 inline-block ${badges[status]}`}>
                      {badgeLabel[status]}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Terkini */}
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-5">
            <SectionHeader icon="📋" title="Tempahan Terkini" color="text-sky-400"
              onMore={() => setTab('senarai')} />
            <div className="space-y-2.5 mt-4">
              {tempahan.slice(0, 4).map(t => {
                const s = STATUS_CONFIG[t.status] ?? STATUS_CONFIG.pending
                return (
                  <div key={t.id} className="flex items-center gap-3 bg-gray-800/50 rounded-xl p-3 cursor-pointer hover:bg-gray-800"
                    onClick={() => setModal(t)}>
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-white truncate">{t.guru}</div>
                      <div className="text-xs text-gray-500 truncate">{t.bilik} • {t.masa}</div>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${s.badge}`}>{s.label}</span>
                  </div>
                )
              })}
              {tempahan.length === 0 && !loading && (
                <div className="text-center text-xs text-gray-500 py-6">Tiada rekod tempahan</div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── FORM TEMPAH ── */}
      {tab === 'tempah' && (
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-5 space-y-4">
          <div className="text-sm font-bold text-sky-400 flex items-center gap-2">
            <span>📝</span> Borang Tempahan Bilik Khas
          </div>

          {[
            { label: 'Nama Guru *', field: 'guru', type: 'text', placeholder: 'Nama penuh guru' },
          ].map(f => (
            <div key={f.field}>
              <label className="block text-xs font-semibold text-sky-400 mb-1.5">{f.label}</label>
              <input type={f.type} value={form[f.field]}
                onChange={e => setForm(p => ({ ...p, [f.field]: e.target.value }))}
                placeholder={f.placeholder}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-sky-500" />
            </div>
          ))}

          <div>
            <label className="block text-xs font-semibold text-sky-400 mb-1.5">Pilih Bilik *</label>
            <select value={form.bilik} onChange={e => setForm(p => ({ ...p, bilik: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500">
              <option value="">-- Pilih Bilik --</option>
              {BILIK_LIST.map(b => <option key={b.nama}>{b.nama}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-sky-400 mb-1.5">Tarikh *</label>
              <input type="date" value={form.tarikh} min={TODAY}
                onChange={e => setForm(p => ({ ...p, tarikh: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-sky-400 mb-1.5">Masa *</label>
              <select value={form.masa} onChange={e => setForm(p => ({ ...p, masa: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500">
                <option value="">-- Pilih Masa --</option>
                {MASA_LIST.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-sky-400 mb-1.5">Tujuan / Catatan</label>
            <textarea value={form.tujuan} onChange={e => setForm(p => ({ ...p, tujuan: e.target.value }))}
              placeholder="Tujuan penggunaan bilik..."
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-sky-500 resize-none" />
          </div>

          <div className="bg-sky-950/40 border border-sky-800/50 rounded-xl p-3 text-xs text-sky-400">
            ℹ️ Tempahan akan diproses oleh pentadbir dalam masa 24 jam.
          </div>

          <button onClick={submitTempahan}
            className="w-full bg-gradient-to-r from-sky-600 to-cyan-500 text-white py-3.5 rounded-2xl text-sm font-bold shadow-lg hover:opacity-90 transition-opacity">
            📤 Hantar Permohonan Tempahan
          </button>
        </div>
      )}

      {/* ── SENARAI ── */}
      {tab === 'senarai' && (
        <>
          {/* Filter */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {['semua', 'pending', 'approved', 'rejected'].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold border whitespace-nowrap transition-all ${
                  filterStatus === s
                    ? 'bg-sky-600 text-white border-sky-600'
                    : 'bg-gray-900 text-gray-400 border-gray-700 hover:border-gray-500'
                }`}>
                {s === 'semua' ? 'Semua' : STATUS_CONFIG[s]?.label}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filtered.map(t => {
              const s = STATUS_CONFIG[t.status] ?? STATUS_CONFIG.pending
              return (
                <div key={t.id}
                  className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-start gap-3 cursor-pointer hover:border-gray-600 transition-colors"
                  onClick={() => setModal(t)}>
                  <div className="w-10 h-10 bg-sky-900/40 rounded-xl flex items-center justify-center text-xl flex-shrink-0">🏫</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-white">{t.guru}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{t.bilik}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{t.tarikh} • {t.masa}</div>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${s.badge}`}>{s.label}</span>
                </div>
              )
            })}
            {filtered.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <div className="text-5xl mb-3">📭</div>
                <div className="text-sm">Tiada rekod ditemui</div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── ADMIN ── */}
      {tab === 'admin' && (
        <>
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-5">
            <SectionHeader icon="⏳" title="Menunggu Kelulusan" color="text-amber-400" />
            <div className="space-y-3 mt-4">
              {tempahan.filter(t => t.status === 'pending').map(t => (
                <div key={t.id} className="bg-gray-800 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-amber-900/40 rounded-xl flex items-center justify-center text-xl flex-shrink-0">🏫</div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-white">{t.guru}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{t.bilik}</div>
                      <div className="text-xs text-gray-500">{t.tarikh} • {t.masa}</div>
                      {t.tujuan && <div className="text-xs text-gray-500 mt-1 italic">"{t.tujuan}"</div>}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => updateStatus(t.id, 'approved')}
                      className="flex-1 px-3 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold hover:bg-emerald-500/30 transition-colors">
                      ✅ Luluskan
                    </button>
                    <button onClick={() => updateStatus(t.id, 'rejected')}
                      className="flex-1 px-3 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold hover:bg-red-500/30 transition-colors">
                      ❌ Tolak
                    </button>
                  </div>
                </div>
              ))}
              {tempahan.filter(t => t.status === 'pending').length === 0 && (
                <div className="text-center py-8 text-gray-500 text-xs">Tiada tempahan menunggu kelulusan</div>
              )}
            </div>
          </div>

          {/* Semua tempahan */}
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-5">
            <SectionHeader icon="📋" title="Semua Tempahan" color="text-sky-400" />
            <div className="space-y-2.5 mt-4">
              {tempahan.map(t => {
                const s = STATUS_CONFIG[t.status] ?? STATUS_CONFIG.pending
                return (
                  <div key={t.id} className="flex items-center gap-3 bg-gray-800/50 rounded-xl p-3 cursor-pointer hover:bg-gray-800"
                    onClick={() => setModal(t)}>
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-white truncate">{t.guru}</div>
                      <div className="text-xs text-gray-500 truncate">{t.bilik} • {t.tarikh} • {t.masa}</div>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${s.badge}`}>{s.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}

      {/* ── MODAL ── */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center"
          onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="bg-gray-900 border border-gray-800 rounded-t-3xl w-full max-w-lg p-6">
            <div className="w-10 h-1 bg-gray-700 rounded-full mx-auto mb-5" />
            <div className="text-base font-bold text-sky-400 mb-4">Detail Tempahan</div>
            {[
              ['Guru', modal.guru],
              ['Bilik', modal.bilik],
              ['Tarikh', modal.tarikh],
              ['Masa', modal.masa],
              ['Tujuan', modal.tujuan || '—'],
              ['Status', STATUS_CONFIG[modal.status]?.label ?? modal.status],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-2 border-b border-gray-800">
                <span className="text-xs text-gray-500">{k}</span>
                <span className="text-xs font-bold text-white">{v}</span>
              </div>
            ))}
            {modal.status === 'pending' && (
              <div className="flex gap-2 mt-4">
                <button onClick={() => updateStatus(modal.id, 'approved')}
                  className="flex-1 py-2.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold hover:bg-emerald-500/30">
                  ✅ Luluskan
                </button>
                <button onClick={() => updateStatus(modal.id, 'rejected')}
                  className="flex-1 py-2.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold hover:bg-red-500/30">
                  ❌ Tolak
                </button>
              </div>
            )}
            <button onClick={() => setModal(null)}
              className="w-full mt-3 border border-gray-700 text-gray-400 py-2.5 rounded-xl text-sm font-bold">
              Tutup
            </button>
          </div>
        </div>
      )}

    </Layout>
  )
}
