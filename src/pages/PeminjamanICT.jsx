import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Layout from '../components/Layout'
import SectionHeader from '../components/SectionHeader'
import AdminGate from '../components/AdminGate'
import { useAdmin } from '../contexts/AdminContext'

const KATEGORI_ICON = {
  Laptop: '💻', Projektor: '📽️', Tablet: '📱',
  Kamera: '📷', Audio: '🎙️', Lain: '📦',
}

const STATUS_CONFIG = {
  dipinjam:    { bg: 'bg-blue-100',   text: 'text-blue-700',   label: 'Dipinjam',    dot: 'bg-blue-400' },
  dipulangkan: { bg: 'bg-emerald-100',text: 'text-emerald-700',label: 'Dipulangkan', dot: 'bg-emerald-400' },
  lewat:       { bg: 'bg-red-100',    text: 'text-red-700',    label: 'Lewat',       dot: 'bg-red-400' },
  pending:     { bg: 'bg-amber-100',  text: 'text-amber-700',  label: 'Menunggu',    dot: 'bg-amber-400' },
}

const TODAY = new Date().toISOString().slice(0, 10)

function getKategoriIcon(nama) {
  const found = Object.entries(KATEGORI_ICON).find(([k]) =>
    nama?.toLowerCase().includes(k.toLowerCase())
  )
  return found ? found[1] : '📦'
}

const KATEGORI_LIST = ['Laptop','Projektor','Tablet','Kamera','Audio','Lain']

export default function PeminjamanICT() {
  const { isAdmin } = useAdmin()
  const [tab, setTab] = useState('dashboard')
  const [items, setItems] = useState([])
  const [peminjaman, setPeminjaman] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('semua')
  const [modal, setModal] = useState(null)
  const [toast, setToast] = useState(null)

  const [form, setForm] = useState({
    peminjam: '', jawatan: '', barang: '', kod: '',
    kuantiti: 1, tarikh_pinjam: TODAY, tarikh_pulang: '', catatan: '',
  })

  const [formBarang, setFormBarang] = useState({ nama: '', kod: '', kategori: 'Laptop', kuantiti: 1 })

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2500)
  }

  async function fetchData() {
    setLoading(true)
    const [{ data: b }, { data: p }] = await Promise.all([
      supabase.from('barang_ict').select('*'),
      supabase.from('peminjaman_ict').select('*').order('created_at', { ascending: false }),
    ])
    setItems(b ?? [])
    setPeminjaman(p ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const stats = {
    totalBarang: items.length,
    sedangDipinjam: peminjaman.filter(p => p.status === 'dipinjam').length,
    lewat: peminjaman.filter(p => p.status === 'lewat').length,
    dipulangkan: peminjaman.filter(p => p.status === 'dipulangkan').length,
  }

  function handleFormChange(e) {
    const { name, value } = e.target
    if (name === 'barang') {
      const item = items.find(i => i.nama === value)
      setForm(f => ({ ...f, barang: value, kod: item?.kod ?? '' }))
    } else {
      setForm(f => ({ ...f, [name]: value }))
    }
  }

  async function submitPeminjaman() {
    if (!form.peminjam || !form.barang || !form.tarikh_pinjam || !form.tarikh_pulang) {
      showToast('Sila lengkapkan semua maklumat!', 'error'); return
    }
    const item = items.find(i => i.nama === form.barang)
    if (!item || item.tersedia < parseInt(form.kuantiti)) {
      showToast('Stok tidak mencukupi!', 'error'); return
    }

    const { error: e1 } = await supabase.from('peminjaman_ict').insert([{
      ...form, kuantiti: parseInt(form.kuantiti), status: 'dipinjam',
    }])
    if (e1) { showToast('Ralat: ' + e1.message, 'error'); return }

    const { error: e2 } = await supabase.from('barang_ict')
      .update({ tersedia: item.tersedia - parseInt(form.kuantiti) })
      .eq('id', item.id)
    if (e2) { showToast('Ralat kemaskini stok: ' + e2.message, 'error'); return }

    setForm({ peminjam: '', jawatan: '', barang: '', kod: '', kuantiti: 1, tarikh_pinjam: TODAY, tarikh_pulang: '', catatan: '' })
    showToast('✅ Rekod peminjaman berjaya disimpan!')
    fetchData()
    setTab('senarai')
  }

  async function tambahBarang() {
    if (!formBarang.nama || !formBarang.kod) { showToast('Sila isi nama dan kod barang!', 'error'); return }
    const qty = parseInt(formBarang.kuantiti) || 1
    const { error } = await supabase.from('barang_ict').insert([{
      ...formBarang, kuantiti: qty, tersedia: qty,
    }])
    if (error) { showToast('Ralat: ' + error.message, 'error'); return }
    setFormBarang({ nama: '', kod: '', kategori: 'Laptop', kuantiti: 1 })
    showToast('✅ Barang berjaya ditambah!')
    fetchData()
  }

  async function deletePeminjaman(rec) {
    const item = items.find(i => i.nama === rec.barang)
    await supabase.from('peminjaman_ict').delete().eq('id', rec.id)
    if (item && rec.status !== 'dipulangkan') {
      await supabase.from('barang_ict')
        .update({ tersedia: item.tersedia + rec.kuantiti })
        .eq('id', item.id)
    }
    setModal(null)
    showToast('🗑️ Rekod berjaya dipadam!')
    fetchData()
  }

  async function deleteBarang(id) {
    await supabase.from('barang_ict').delete().eq('id', id)
    showToast('🗑️ Barang dipadam!')
    fetchData()
  }

  async function pulangBarang(rec) {
    const item = items.find(i => i.nama === rec.barang)
    await supabase.from('peminjaman_ict').update({ status: 'dipulangkan' }).eq('id', rec.id)
    if (item) {
      await supabase.from('barang_ict')
        .update({ tersedia: item.tersedia + rec.kuantiti })
        .eq('id', item.id)
    }
    setModal(null)
    showToast('✅ Barang berjaya dipulangkan!')
    fetchData()
  }

  const filteredPeminjaman = filterStatus === 'semua'
    ? peminjaman
    : peminjaman.filter(p => p.status === filterStatus)

  const TABS = [
    { id: 'dashboard', label: '🏠 Utama' },
    { id: 'pinjam',    label: '➕ Pinjam' },
    { id: 'senarai',   label: '📋 Senarai' },
    { id: 'inventori', label: '📦 Inventori' },
    { id: 'admin',     label: '⚙️ Admin' },
  ]

  return (
    <Layout badgeCounts={{ ict: stats.lewat }}>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-full text-sm font-semibold text-white shadow-lg ${
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
              tab === t.id ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-900'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── DASHBOARD ── */}
      {tab === 'dashboard' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { num: stats.totalBarang,    label: 'Jenis Barang',   color: 'text-indigo-400' },
              { num: stats.sedangDipinjam, label: 'Sedang Dipinjam',color: 'text-blue-400' },
              { num: stats.lewat,          label: 'Lewat Pulang',   color: 'text-red-400' },
              { num: stats.dipulangkan,    label: 'Dipulangkan',    color: 'text-emerald-400' },
            ].map((s, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl p-4">
                <div className={`text-3xl font-black ${s.color}`}>{s.num}</div>
                <div className="text-xs text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {stats.lewat > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3 items-start">
              <span className="text-2xl">🚨</span>
              <div>
                <div className="text-sm font-bold text-red-700">{stats.lewat} Peminjaman Lewat!</div>
                <div className="text-xs text-red-600 mt-1">Sila hubungi peminjam untuk pulangkan barang segera.</div>
              </div>
            </div>
          )}

          {/* Inventori ringkas */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <SectionHeader icon="📦" title="Status Inventori" color="text-indigo-400" />
            <div className="space-y-3 mt-4">
              {items.map(item => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                    {getKategoriIcon(item.nama)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-gray-900 truncate">{item.nama}</div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1.5">
                      <div className={`h-1.5 rounded-full ${
                        item.tersedia === 0 ? 'bg-red-400' : item.tersedia < item.kuantiti / 2 ? 'bg-amber-400' : 'bg-emerald-400'
                      }`}
                        style={{ width: `${(item.tersedia / item.kuantiti) * 100}%` }} />
                    </div>
                  </div>
                  <div className="text-xs font-bold text-gray-500 flex-shrink-0">
                    {item.tersedia}/{item.kuantiti}
                  </div>
                </div>
              ))}
              {items.length === 0 && !loading && (
                <div className="text-center text-xs text-gray-500 py-4">Tiada barang dalam inventori</div>
              )}
            </div>
          </div>

          {/* Terkini */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <SectionHeader icon="📋" title="Peminjaman Terkini" color="text-indigo-400"
              onMore={() => setTab('senarai')} />
            <div className="space-y-2.5 mt-4">
              {peminjaman.slice(0, 4).map(p => {
                const s = STATUS_CONFIG[p.status] ?? STATUS_CONFIG.dipinjam
                return (
                  <div key={p.id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 cursor-pointer hover:bg-gray-100"
                    onClick={() => setModal({ type: 'detail', data: p })}>
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-gray-900 truncate">{p.peminjam}</div>
                      <div className="text-xs text-gray-500 truncate">{p.barang} • Pulang: {p.tarikh_pulang}</div>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${s.bg} ${s.text}`}>{s.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}

      {/* ── FORM PINJAM ── */}
      {tab === 'pinjam' && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
          <div className="text-sm font-bold text-indigo-400 flex items-center gap-2">
            <span>📝</span> Borang Peminjaman Baru
          </div>

          {[
            { label: 'Nama Peminjam *', name: 'peminjam', placeholder: 'Nama penuh' },
            { label: 'Jawatan',         name: 'jawatan',  placeholder: 'Contoh: Guru Sains' },
          ].map(f => (
            <div key={f.name}>
              <label className="block text-xs font-semibold text-indigo-400 mb-1.5">{f.label}</label>
              <input name={f.name} value={form[f.name]} onChange={handleFormChange}
                placeholder={f.placeholder}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-400" />
            </div>
          ))}

          <div>
            <label className="block text-xs font-semibold text-indigo-400 mb-1.5">Pilih Barang *</label>
            <select name="barang" value={form.barang} onChange={handleFormChange}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-indigo-400">
              <option value="">-- Pilih Barang --</option>
              {items.filter(i => i.tersedia > 0).map(i => (
                <option key={i.id} value={i.nama}>{i.nama} (Tersedia: {i.tersedia})</option>
              ))}
            </select>
          </div>

          {form.kod && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-2.5 text-xs text-indigo-700 font-semibold">
              Kod Aset: {form.kod}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-indigo-400 mb-1.5">Kuantiti</label>
            <input name="kuantiti" type="number" min="1" value={form.kuantiti} onChange={handleFormChange}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-indigo-400" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-indigo-400 mb-1.5">Tarikh Pinjam</label>
              <input name="tarikh_pinjam" type="date" value={form.tarikh_pinjam} onChange={handleFormChange}
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-indigo-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-indigo-400 mb-1.5">Tarikh Pulang *</label>
              <input name="tarikh_pulang" type="date" value={form.tarikh_pulang} onChange={handleFormChange}
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-indigo-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-indigo-400 mb-1.5">Catatan</label>
            <textarea name="catatan" value={form.catatan} onChange={handleFormChange}
              placeholder="Tujuan peminjaman..."
              rows={3}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-400 resize-none" />
          </div>

          <button onClick={submitPeminjaman}
            className="w-full bg-gradient-to-r from-indigo-600 to-violet-500 text-white py-3.5 rounded-2xl text-sm font-bold shadow-lg hover:opacity-90 transition-opacity">
            💾 Simpan Rekod Peminjaman
          </button>
        </div>
      )}

      {/* ── SENARAI ── */}
      {tab === 'senarai' && (
        <>
          <div className="flex items-center justify-between no-print">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {['semua', 'dipinjam', 'lewat', 'dipulangkan'].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold border whitespace-nowrap transition-all ${
                  filterStatus === s
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                }`}>
                {s === 'semua' ? 'Semua' : STATUS_CONFIG[s]?.label}
              </button>
            ))}
            </div>
            <button onClick={() => window.print()}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-gray-200 text-gray-600 hover:border-indigo-500 hover:text-indigo-600 transition-colors">
              🖨️ Print
            </button>
          </div>

          <div className="space-y-3">
            {filteredPeminjaman.map(p => {
              const s = STATUS_CONFIG[p.status] ?? STATUS_CONFIG.dipinjam
              return (
                <div key={p.id}
                  className="bg-white border border-gray-200 rounded-2xl p-4 flex items-start gap-3 cursor-pointer hover:border-gray-600 transition-colors"
                  onClick={() => setModal({ type: 'detail', data: p })}>
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                    {getKategoriIcon(p.barang)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-gray-900">{p.peminjam}</div>
                    <div className="text-xs text-gray-500 mt-0.5 truncate">{p.barang} • {p.kuantiti} unit</div>
                    <div className="text-xs text-gray-500">📅 {p.tarikh_pinjam} → {p.tarikh_pulang}</div>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${s.bg} ${s.text}`}>{s.label}</span>
                </div>
              )
            })}
            {filteredPeminjaman.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <div className="text-5xl mb-3">📭</div>
                <div className="text-sm">Tiada rekod ditemui</div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── INVENTORI ── */}
      {tab === 'inventori' && (
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id}
              className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:border-gray-600 transition-colors"
              onClick={() => setModal({ type: 'item', data: item })}>
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                {getKategoriIcon(item.nama)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-gray-900">{item.nama}</div>
                <div className="text-xs text-gray-500 mt-0.5">{item.kod} • {item.kategori}</div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div className={`h-2 rounded-full ${
                      item.tersedia === 0 ? 'bg-red-400' : item.tersedia < item.kuantiti / 2 ? 'bg-amber-400' : 'bg-emerald-400'
                    }`}
                      style={{ width: `${(item.tersedia / item.kuantiti) * 100}%` }} />
                  </div>
                  <span className="text-xs font-bold text-gray-400">{item.tersedia}/{item.kuantiti}</span>
                </div>
              </div>
              <div className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                item.tersedia === 0 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
              }`}>
                {item.tersedia === 0 ? 'Habis' : 'Ada'}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── ADMIN ── */}
      {tab === 'admin' && (
        <AdminGate>
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <SectionHeader icon="📋" title="Semua Peminjaman" color="text-indigo-400" />
            <div className="space-y-2.5 mt-4">
              {peminjaman.map(p => {
                const s = STATUS_CONFIG[p.status] ?? STATUS_CONFIG.dipinjam
                return (
                  <div key={p.id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setModal({ type: 'detail', data: p })}>
                      <div className="text-xs font-semibold text-gray-900 truncate">{p.peminjam}</div>
                      <div className="text-xs text-gray-500 truncate">{p.barang} • {p.tarikh_pulang}</div>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${s.bg} ${s.text}`}>{s.label}</span>
                    <button onClick={() => deletePeminjaman(p)}
                      className="text-xs text-red-500 hover:text-red-400 px-2 py-1 rounded-lg hover:bg-red-900/30 transition-colors flex-shrink-0">
                      🗑️
                    </button>
                  </div>
                )
              })}
              {peminjaman.length === 0 && <div className="text-center py-8 text-gray-500 text-xs">Tiada rekod</div>}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
            <SectionHeader icon="📦" title="Urus Inventori" color="text-indigo-400" />

            {/* Form tambah barang */}
            <div className="bg-gray-100 rounded-2xl p-4 space-y-3">
              <div className="text-xs font-bold text-indigo-400">➕ Tambah Barang Baru</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Nama Barang *</label>
                  <input value={formBarang.nama} onChange={e => setFormBarang(f => ({ ...f, nama: e.target.value }))}
                    placeholder="Contoh: Laptop Acer"
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-400" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Kod Aset *</label>
                  <input value={formBarang.kod} onChange={e => setFormBarang(f => ({ ...f, kod: e.target.value }))}
                    placeholder="Contoh: SK/ICT/001"
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-400" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Kategori</label>
                  <select value={formBarang.kategori} onChange={e => setFormBarang(f => ({ ...f, kategori: e.target.value }))}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-indigo-400">
                    {KATEGORI_LIST.map(k => <option key={k}>{k}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Kuantiti</label>
                  <input type="number" min="1" value={formBarang.kuantiti}
                    onChange={e => setFormBarang(f => ({ ...f, kuantiti: e.target.value }))}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-indigo-400" />
                </div>
              </div>
              <button onClick={tambahBarang}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl text-xs font-bold transition-colors">
                ➕ Tambah Barang
              </button>
            </div>

            {/* Senarai barang */}
            <div className="space-y-2.5">
              {items.map(item => (
                <div key={item.id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                  <div className="text-xl">{getKategoriIcon(item.nama)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-gray-900 truncate">{item.nama}</div>
                    <div className="text-xs text-gray-500">{item.kod} • {item.tersedia}/{item.kuantiti} tersedia</div>
                  </div>
                  <button onClick={() => deleteBarang(item.id)}
                    className="text-xs text-red-500 hover:text-red-400 px-2 py-1 rounded-lg hover:bg-red-900/30 transition-colors flex-shrink-0">
                    🗑️
                  </button>
                </div>
              ))}
              {items.length === 0 && <div className="text-center py-8 text-gray-500 text-xs">Tiada barang</div>}
            </div>
          </div>
        </AdminGate>
      )}

      {/* ── MODAL ── */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center"
          onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="bg-white border border-gray-200 rounded-t-3xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-6">
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-5" />

            {modal.type === 'detail' && (() => {
              const p = modal.data
              const live = peminjaman.find(x => x.id === p.id)
              const s = STATUS_CONFIG[live?.status] ?? STATUS_CONFIG.dipinjam
              return (
                <>
                  <div className="text-base font-bold text-indigo-400 mb-4">Detail Peminjaman</div>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${s.bg} ${s.text} mb-4`}>{s.label}</div>
                  {[
                    ['Peminjam', p.peminjam], ['Jawatan', p.jawatan], ['Barang', p.barang],
                    ['Kod Aset', p.kod], ['Kuantiti', p.kuantiti + ' unit'],
                    ['Tarikh Pinjam', p.tarikh_pinjam], ['Tarikh Pulang', p.tarikh_pulang],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-xs text-gray-500">{k}</span>
                      <span className="text-xs font-bold text-gray-900">{v}</span>
                    </div>
                  ))}
                  {p.catatan && <div className="mt-3 text-xs bg-gray-100 rounded-xl p-3 text-gray-600">{p.catatan}</div>}
                  {(live?.status === 'dipinjam' || live?.status === 'lewat') && (
                    <button onClick={() => pulangBarang(live)}
                      className="w-full mt-4 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 py-3 rounded-2xl text-sm font-bold hover:bg-emerald-500/30">
                      ✅ Tandakan Dipulangkan
                    </button>
                  )}
                  {isAdmin && (
                    <button onClick={() => deletePeminjaman(live ?? p)}
                      className="w-full mt-2 border border-red-800 text-red-500 py-3 rounded-2xl text-sm font-bold hover:bg-red-900/30 transition-colors">
                      🗑️ Padam Rekod
                    </button>
                  )}
                  <button onClick={() => setModal(null)} className="w-full mt-2 border border-gray-200 text-gray-500 py-3 rounded-2xl text-sm font-bold">Tutup</button>
                </>
              )
            })()}

            {modal.type === 'item' && (() => {
              const item = modal.data
              const rekodBarang = peminjaman.filter(p => p.barang === item.nama && p.status !== 'dipulangkan')
              return (
                <>
                  <div className="text-base font-bold text-indigo-400 mb-1">{item.nama}</div>
                  <div className="text-xs text-gray-500 mb-4">{item.kod}</div>
                  {[['Kategori', item.kategori], ['Jumlah', item.kuantiti + ' unit'], ['Tersedia', item.tersedia + ' unit']].map(([k, v]) => (
                    <div key={k} className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-xs text-gray-500">{k}</span>
                      <span className="text-xs font-bold text-gray-900">{v}</span>
                    </div>
                  ))}
                  {rekodBarang.length > 0 && (
                    <div className="mt-4">
                      <div className="text-xs font-bold text-gray-500 mb-2">Sedang Dipinjam Oleh:</div>
                      {rekodBarang.map(r => (
                        <div key={r.id} className="bg-gray-100 rounded-xl px-3 py-2 text-xs mb-2 text-gray-700">
                          <span className="font-bold text-gray-900">{r.peminjam}</span> — {r.kuantiti} unit • Pulang: {r.tarikh_pulang}
                        </div>
                      ))}
                    </div>
                  )}
                  <button onClick={() => setModal(null)} className="w-full mt-4 border border-gray-200 text-gray-500 py-3 rounded-2xl text-sm font-bold">Tutup</button>
                </>
              )
            })()}
          </div>
        </div>
      )}

    </Layout>
  )
}
