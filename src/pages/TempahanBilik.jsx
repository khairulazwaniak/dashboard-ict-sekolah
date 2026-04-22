import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Layout from '../components/Layout'
import SectionHeader from '../components/SectionHeader'
import AdminGate from '../components/AdminGate'
import { useAdmin } from '../contexts/AdminContext'

const ICON_LIST = ['🏫','🔬','🧪','💻','🖥️','⚙️','📚','🏛️','📽️','🎨','🎭','🏋️','🔭','🧬','📐']

const STATUS_CONFIG = {
  approved: { dot: 'bg-emerald-400', badge: 'bg-emerald-100 text-emerald-700', label: 'Lulus',  btn: 'bg-emerald-900/40 border-emerald-700 text-emerald-400' },
  pending:  { dot: 'bg-amber-400',   badge: 'bg-amber-100 text-amber-700',     label: 'Tunggu', btn: 'bg-amber-900/40 border-amber-700 text-amber-400' },
  rejected: { dot: 'bg-red-400',     badge: 'bg-red-100 text-red-700',         label: 'Tolak',  btn: 'bg-red-900/40 border-red-700 text-red-400' },
}

// Slot masa 30 minit ikut waktu sekolah
const SLOT_PAGI = [
  { masa: '06:50–07:20', label: 'P1' },
  { masa: '07:20–07:50', label: 'P2' },
  { masa: '07:50–08:20', label: 'P3' },
  { masa: '08:20–08:50', label: 'P4' },
  { masa: '08:50–09:20', label: 'P5' },
  { masa: '09:20–09:50', label: 'P6' },
  { masa: 'REHAT',       label: '—',  rehat: true },
  { masa: '10:10–10:40', label: 'P7' },
  { masa: '10:40–11:10', label: 'P8' },
  { masa: '11:10–11:40', label: 'P9' },
  { masa: '11:40–12:10', label: 'P10' },
]
const SLOT_PETANG = [
  { masa: '12:30–13:00', label: 'T1' },
  { masa: '13:00–13:30', label: 'T2' },
  { masa: '13:30–14:00', label: 'T3' },
  { masa: '14:00–14:30', label: 'T4' },
  { masa: '14:30–15:00', label: 'T5' },
  { masa: '15:00–15:30', label: 'T6' },
  { masa: '15:30–16:00', label: 'T7' },
  { masa: '16:00–16:30', label: 'T8' },
  { masa: '16:30–17:00', label: 'T9' },
  { masa: '17:00–17:20', label: 'T10' },
]
const MASA_LIST = [
  ...SLOT_PAGI.filter(s => !s.rehat).map(s => s.masa),
  ...SLOT_PETANG.map(s => s.masa),
]

const TODAY = new Date().toISOString().slice(0, 10)

export default function TempahanBilik() {
  const { isAdmin } = useAdmin()
  const [tab, setTab] = useState('dashboard')
  const [tempahan, setTempahan] = useState([])
  const [bilikList, setBilikList] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [toast, setToast] = useState(null)
  const [filterStatus, setFilterStatus] = useState('semua')
  const [jadualDate, setJadualDate] = useState(TODAY)

  const [form, setForm] = useState({
    guru: '', bilik: '', tarikh: TODAY, masa: '', tujuan: '',
  })

  const [formBilik, setFormBilik] = useState({ nama: '', icon: '🏫', kapasiti: '30 pelajar' })

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

  async function fetchBilik() {
    const { data } = await supabase.from('bilik_khas').select('*').order('created_at')
    setBilikList(data ?? [])
  }

  async function tambahBilik() {
    if (!formBilik.nama) { showToast('Sila masukkan nama bilik!', 'error'); return }
    const { error } = await supabase.from('bilik_khas').insert([formBilik])
    if (error) { showToast('Ralat: ' + error.message, 'error'); return }
    setFormBilik({ nama: '', icon: '🏫', kapasiti: '30 pelajar' })
    showToast('✅ Bilik berjaya ditambah!')
    fetchBilik()
  }

  async function deleteBilik(id) {
    await supabase.from('bilik_khas').delete().eq('id', id)
    showToast('🗑️ Bilik dipadam!')
    fetchBilik()
  }

  useEffect(() => { fetchTempahan(); fetchBilik() }, [])

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

  // Semak status slot semasa isi borang
  const slotKonflik = form.bilik && form.tarikh && form.masa
    ? tempahan.find(t =>
        t.bilik === form.bilik &&
        t.tarikh === form.tarikh &&
        t.masa === form.masa &&
        t.status !== 'rejected'
      )
    : null

  async function submitTempahan() {
    if (!form.guru || !form.bilik || !form.tarikh || !form.masa) {
      showToast('Sila lengkapkan semua maklumat!', 'error'); return
    }
    if (slotKonflik) {
      showToast(`⚠️ Slot ini sudah ditempah oleh ${slotKonflik.guru}!`, 'error'); return
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

  async function bulkApprove() {
    const pendingIds = tempahan.filter(t => t.status === 'pending').map(t => t.id)
    if (!pendingIds.length) return
    await supabase.from('tempahan_bilik').update({ status: 'approved' }).in('id', pendingIds)
    showToast(`✅ ${pendingIds.length} tempahan diluluskan sekaligus!`)
    fetchTempahan()
  }

  async function deleteTempahan(id) {
    await supabase.from('tempahan_bilik').delete().eq('id', id)
    showToast('🗑️ Rekod berjaya dipadam!')
    setModal(null)
    fetchTempahan()
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
    { id: 'jadual',    label: '📅 Jadual' },
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
      <div className="flex gap-1.5 bg-white border border-gray-200 rounded-2xl p-1.5 overflow-x-auto scrollbar-hide">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              tab === t.id ? 'bg-sky-600 text-white' : 'text-gray-500 hover:text-gray-900'
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
              { num: bilikList.length, label: 'Jumlah Bilik',   color: 'text-sky-400' },
              { num: pendingCount,      label: 'Menunggu Lulus', color: 'text-amber-400' },
              { num: todayCount,        label: 'Tempahan Hari Ini', color: 'text-emerald-400' },
            ].map((s, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl p-4 text-center">
                <div className={`text-3xl font-black ${s.color}`}>{s.num}</div>
                <div className="text-xs text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Room Grid */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <SectionHeader icon="🏫" title="Status Bilik Khas" color="text-sky-400" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
              {bilikList.map(b => {
                const status = getRoomStatus(b.nama)
                const styles = {
                  available: 'bg-emerald-50 border-emerald-200',
                  booked:    'bg-red-50 border-red-200',
                  pending:   'bg-amber-50 border-amber-200',
                }
                const badges = {
                  available: 'bg-emerald-100 text-emerald-700',
                  booked:    'bg-red-100 text-red-700',
                  pending:   'bg-amber-100 text-amber-700',
                }
                const badgeLabel = { available: 'Kosong', booked: 'Ditempah', pending: 'Tunggu' }
                return (
                  <div key={b.nama}
                    className={`border rounded-2xl p-3 cursor-pointer transition-all hover:scale-[1.02] ${styles[status]}`}
                    onClick={() => setTab('tempah')}>
                    <div className="text-2xl mb-2">{b.icon}</div>
                    <div className="text-xs font-bold text-gray-900 leading-tight">{b.nama}</div>
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
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <SectionHeader icon="📋" title="Tempahan Terkini" color="text-sky-400"
              onMore={() => setTab('senarai')} />
            <div className="space-y-2.5 mt-4">
              {tempahan.slice(0, 4).map(t => {
                const s = STATUS_CONFIG[t.status] ?? STATUS_CONFIG.pending
                return (
                  <div key={t.id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 cursor-pointer hover:bg-gray-100"
                    onClick={() => setModal(t)}>
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-gray-900 truncate">{t.guru}</div>
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

      {/* ── JADUAL MASA ── */}
      {tab === 'jadual' && (
        <>
          {/* Print button */}
          <div className="flex justify-end no-print">
            <button onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border border-gray-200 text-gray-600 hover:border-sky-500 hover:text-sky-600 transition-colors">
              🖨️ Print Jadual
            </button>
          </div>

          {/* Date picker */}
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-sky-400">Pilih Tarikh:</label>
            <input type="date" value={jadualDate}
              onChange={e => setJadualDate(e.target.value)}
              className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-indigo-400" />
            <span className="text-xs text-gray-500">
              {new Date(jadualDate).toLocaleDateString('ms-MY', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>

          {/* Legend */}
          <div className="flex gap-4 text-xs">
            {[
              { color: 'bg-emerald-100 border-emerald-300', label: 'Lulus' },
              { color: 'bg-amber-100 border-amber-300',     label: 'Tunggu' },
              { color: 'bg-white border-gray-200',          label: 'Kosong' },
              { color: 'bg-blue-100 border-blue-300',       label: 'Rehat' },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded border ${l.color}`} />
                <span className="text-gray-500">{l.label}</span>
              </div>
            ))}
          </div>

          {/* Timetable — scroll horizontal */}
          <div className="overflow-x-auto rounded-2xl border border-gray-200">
            <table className="w-full min-w-[700px] border-collapse text-xs">
              <thead>
                <tr style={{ background: '#F9FAFB' }}>
                  <th className="p-3 text-left text-gray-500 font-semibold border-b border-r border-gray-200 w-32 sticky left-0" style={{ background: '#F9FAFB' }}>
                    Masa
                  </th>
                  {bilikList.map(b => (
                    <th key={b.nama} className="p-2 text-center text-gray-700 font-semibold border-b border-r border-gray-200 min-w-[100px]">
                      <div>{b.icon}</div>
                      <div className="text-xs leading-tight mt-0.5">{b.nama}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Sesi Pagi header */}
                <tr style={{ background: 'rgba(74,158,255,0.05)' }}>
                  <td colSpan={bilikList.length + 1}
                    className="px-3 py-1.5 text-xs font-bold border-b border-gray-200"
                    style={{ color: '#4A9EFF' }}>
                    ☀️ SESI PAGI
                  </td>
                </tr>

                {SLOT_PAGI.map((slot, i) => {
                  if (slot.rehat) {
                    return (
                      <tr key="rehat" style={{ background: 'rgba(74,158,255,0.03)' }}>
                        <td className="px-3 py-2 font-bold border-b border-r border-gray-200 sticky left-0 text-blue-600"
                          style={{ background: '#EFF6FF' }}>
                          09:50–10:10
                        </td>
                        <td colSpan={bilikList.length}
                          className="text-center py-2 border-b border-gray-200 font-bold"
                          style={{ background: 'rgba(74,158,255,0.05)', color: '#4A9EFF' }}>
                          — WAKTU REHAT —
                        </td>
                      </tr>
                    )
                  }
                  return (
                    <JadualRow key={slot.masa} slot={slot} bilikList={bilikList}
                      tempahan={tempahan} tarikh={jadualDate} onBook={(bilik, masa) => {
                        setTab('tempah')
                      }} />
                  )
                })}

                {/* Sesi Petang header */}
                <tr style={{ background: 'rgba(245,166,35,0.05)' }}>
                  <td colSpan={bilikList.length + 1}
                    className="px-3 py-1.5 text-xs font-bold border-b border-gray-200"
                    style={{ color: '#F5A623' }}>
                    🌙 SESI PETANG
                  </td>
                </tr>

                {SLOT_PETANG.map(slot => (
                  <JadualRow key={slot.masa} slot={slot} bilikList={bilikList}
                    tempahan={tempahan} tarikh={jadualDate} onBook={(bilik, masa) => {
                      setTab('tempah')
                    }} />
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── FORM TEMPAH ── */}
      {tab === 'tempah' && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
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
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-400" />
            </div>
          ))}

          <div>
            <label className="block text-xs font-semibold text-sky-400 mb-1.5">Pilih Bilik *</label>
            <select value={form.bilik} onChange={e => setForm(p => ({ ...p, bilik: e.target.value }))}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-indigo-400">
              <option value="">-- Pilih Bilik --</option>
              {bilikList.map(b => <option key={b.nama}>{b.nama}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-sky-400 mb-1.5">Tarikh *</label>
              <input type="date" value={form.tarikh} min={TODAY}
                onChange={e => setForm(p => ({ ...p, tarikh: e.target.value }))}
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-indigo-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-sky-400 mb-1.5">Masa *</label>
              <select value={form.masa} onChange={e => setForm(p => ({ ...p, masa: e.target.value }))}
                className={`w-full bg-white border rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none ${
                  slotKonflik ? 'border-red-600 focus:border-red-500' : 'border-gray-200 focus:border-indigo-400'
                }`}>
                <option value="">-- Pilih Masa --</option>
                {MASA_LIST.map(m => <option key={m}>{m}</option>)}
              </select>
              {slotKonflik && (
                <div className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-red-400">
                  🔴 Slot ini sudah ditempah oleh <span className="font-bold">{slotKonflik.guru}</span>
                  {slotKonflik.status === 'pending' && ' (menunggu lulus)'}
                </div>
              )}
              {!slotKonflik && form.bilik && form.tarikh && form.masa && (
                <div className="mt-1.5 text-xs font-semibold text-emerald-400">🟢 Slot ini kosong</div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-sky-400 mb-1.5">Tujuan / Catatan</label>
            <textarea value={form.tujuan} onChange={e => setForm(p => ({ ...p, tujuan: e.target.value }))}
              placeholder="Tujuan penggunaan bilik..."
              rows={3}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-400 resize-none" />
          </div>

          <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 text-xs text-sky-700">
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
                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
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
                  className="bg-white border border-gray-200 rounded-2xl p-4 flex items-start gap-3 cursor-pointer hover:border-gray-600 transition-colors"
                  onClick={() => setModal(t)}>
                  <div className="w-10 h-10 bg-sky-900/40 rounded-xl flex items-center justify-center text-xl flex-shrink-0">🏫</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-gray-900">{t.guru}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{t.bilik}</div>
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
        <AdminGate>
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <SectionHeader icon="⏳" title="Menunggu Kelulusan" color="text-amber-400" />
              {pendingCount > 1 && (
                <button onClick={bulkApprove}
                  className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold hover:bg-emerald-500/30 transition-colors">
                  ✅ Luluskan Semua ({pendingCount})
                </button>
              )}
            </div>
            <div className="space-y-3 mt-4">
              {tempahan.filter(t => t.status === 'pending').map(t => (
                <div key={t.id} className="bg-gray-100 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0">🏫</div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-gray-900">{t.guru}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{t.bilik}</div>
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
                    <button onClick={() => deleteTempahan(t.id)}
                      className="px-3 py-2 bg-red-900/30 text-red-400 border border-red-800/50 rounded-xl text-xs font-bold hover:bg-red-900/60 transition-colors">
                      🗑️
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
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <SectionHeader icon="📋" title="Semua Tempahan" color="text-sky-400" />
            <div className="space-y-2.5 mt-4">
              {tempahan.map(t => {
                const s = STATUS_CONFIG[t.status] ?? STATUS_CONFIG.pending
                return (
                  <div key={t.id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setModal(t)}>
                      <div className="text-xs font-semibold text-gray-900 truncate">{t.guru}</div>
                      <div className="text-xs text-gray-500 truncate">{t.bilik} • {t.tarikh} • {t.masa}</div>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${s.badge}`}>{s.label}</span>
                    <button onClick={() => deleteTempahan(t.id)}
                      className="text-xs text-red-500 hover:text-red-400 px-2 py-1 rounded-lg hover:bg-red-900/30 transition-colors flex-shrink-0">
                      🗑️
                    </button>
                  </div>
                )
              })}
              {tempahan.length === 0 && (
                <div className="text-center py-8 text-gray-500 text-xs">Tiada rekod</div>
              )}
            </div>
          </div>

          {/* Urus Bilik */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
            <SectionHeader icon="🏫" title="Urus Bilik Khas" color="text-sky-400" />

            {/* Form tambah bilik */}
            <div className="bg-gray-100 rounded-2xl p-4 space-y-3">
              <div className="text-xs font-bold text-sky-400">➕ Tambah Bilik Baru</div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Nama Bilik *</label>
                <input value={formBilik.nama} onChange={e => setFormBilik(f => ({ ...f, nama: e.target.value }))}
                  placeholder="Contoh: Makmal ICT 3"
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-400" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Ikon</label>
                  <select value={formBilik.icon} onChange={e => setFormBilik(f => ({ ...f, icon: e.target.value }))}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-indigo-400">
                    {ICON_LIST.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Kapasiti</label>
                  <input value={formBilik.kapasiti} onChange={e => setFormBilik(f => ({ ...f, kapasiti: e.target.value }))}
                    placeholder="30 pelajar"
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-400" />
                </div>
              </div>
              <button onClick={tambahBilik}
                className="w-full bg-sky-600 hover:bg-sky-500 text-white py-2.5 rounded-xl text-xs font-bold transition-colors">
                ➕ Tambah Bilik
              </button>
            </div>

            {/* Senarai bilik */}
            <div className="space-y-2">
              {bilikList.map(b => (
                <div key={b.id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                  <span className="text-xl">{b.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-gray-900">{b.nama}</div>
                    <div className="text-xs text-gray-500">{b.kapasiti}</div>
                  </div>
                  <button onClick={() => deleteBilik(b.id)}
                    className="text-xs text-red-500 hover:text-red-400 px-2 py-1 rounded-lg hover:bg-red-900/30 transition-colors">
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>
        </AdminGate>
      )}

      {/* ── MODAL ── */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center"
          onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="bg-white border border-gray-200 rounded-t-3xl w-full max-w-lg p-6">
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-5" />
            <div className="text-base font-bold text-sky-400 mb-4">Detail Tempahan</div>
            {[
              ['Guru', modal.guru],
              ['Bilik', modal.bilik],
              ['Tarikh', modal.tarikh],
              ['Masa', modal.masa],
              ['Tujuan', modal.tujuan || '—'],
              ['Status', STATUS_CONFIG[modal.status]?.label ?? modal.status],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-xs text-gray-500">{k}</span>
                <span className="text-xs font-bold text-gray-900">{v}</span>
              </div>
            ))}
            {modal.status === 'pending' && isAdmin && (
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
            {isAdmin && (
              <button onClick={() => deleteTempahan(modal.id)}
                className="w-full mt-3 border border-red-800 text-red-500 py-2.5 rounded-xl text-sm font-bold hover:bg-red-900/30 transition-colors">
                🗑️ Padam Rekod
              </button>
            )}
            <button onClick={() => setModal(null)}
              className="w-full mt-3 border border-gray-200 text-gray-500 py-2.5 rounded-xl text-sm font-bold">
              Tutup
            </button>
          </div>
        </div>
      )}

    </Layout>
  )
}

function JadualRow({ slot, bilikList, tempahan, tarikh, onBook }) {
  return (
    <tr className="hover:bg-white/[0.02] transition-colors">
      <td className="px-3 py-2 font-mono font-semibold border-b border-r border-gray-200 sticky left-0 text-gray-600 text-xs"
        style={{ background: '#FFFFFF' }}>
        <span className="text-gray-600 mr-1">{slot.label}</span>
        {slot.masa}
      </td>
      {bilikList.map(bilik => {
        const booking = tempahan.find(t =>
          t.bilik === bilik.nama && t.tarikh === tarikh && t.masa === slot.masa
        )
        if (!booking) {
          return (
            <td key={bilik.nama} className="p-1 border-b border-r border-gray-200 text-center">
              <button onClick={() => onBook(bilik.nama, slot.masa)}
                className="w-full h-8 rounded-lg text-xs text-gray-600 hover:bg-sky-900/30 hover:text-sky-400 transition-all">
                +
              </button>
            </td>
          )
        }
        const isApproved = booking.status === 'approved'
        const isPending  = booking.status === 'pending'
        return (
          <td key={bilik.nama} className="p-1 border-b border-r border-gray-200">
            <div className={`rounded-lg px-1.5 py-1 text-center border ${
              isApproved ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
              isPending  ? 'bg-amber-50 border-amber-200 text-amber-800' :
                           'bg-red-50 border-red-200 text-red-800'
            }`}>
              <div className="text-xs font-bold truncate">{booking.guru}</div>
              <div className={`text-xs mt-0.5 ${
                isApproved ? 'text-emerald-600' : isPending ? 'text-amber-600' : 'text-red-600'
              }`}>
                {isApproved ? '✓ Lulus' : isPending ? '⏳ Tunggu' : '✗ Tolak'}
              </div>
            </div>
          </td>
        )
      })}
    </tr>
  )
}
