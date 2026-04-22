import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Layout from '../components/Layout'
import StatCard from '../components/StatCard'
import SectionHeader from '../components/SectionHeader'

const TEMPAHAN_STATUS = {
  approved: { dot: 'bg-emerald-400', badge: 'bg-emerald-100 text-emerald-700', label: 'Lulus' },
  pending:  { dot: 'bg-amber-400',   badge: 'bg-amber-100 text-amber-700',     label: 'Tunggu' },
  rejected: { dot: 'bg-red-400',     badge: 'bg-red-100 text-red-700',         label: 'Tolak' },
}
const ICT_STATUS = {
  dipinjam:    { dot: 'bg-blue-400',    badge: 'bg-blue-100 text-blue-700',      label: 'Dipinjam' },
  lewat:       { dot: 'bg-red-400',     badge: 'bg-red-100 text-red-700',        label: 'Lewat' },
  dipulangkan: { dot: 'bg-emerald-400', badge: 'bg-emerald-100 text-emerald-700',label: 'Pulang' },
}

const SISTEM = [
  {
    id: 'tempahan',
    label: 'Tempahan Bilik Khas',
    icon: '🏫',
    desc: 'Makmal, Bilik STEM & Bilik Sumber',
    gradient: 'from-sky-600 to-cyan-500',
    route: '/tempahan',
  },
  {
    id: 'ict',
    label: 'Peminjaman Barang ICT',
    icon: '💻',
    desc: 'Laptop, Projektor, Tablet & lebih',
    gradient: 'from-indigo-600 to-violet-500',
    route: '/ict',
  },
  {
    id: 'delima',
    label: 'Pengurusan ID DELIMA',
    icon: '🌺',
    desc: 'Akaun guru & murid sekolah',
    gradient: 'from-rose-600 to-pink-500',
    route: '/delima',
  },
]

export default function DashboardUtama() {
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [tempahan, setTempahan] = useState([])
  const [peminjaman, setPeminjaman] = useState([])
  const [barang, setBarang] = useState([])
  const [guru, setGuru] = useState([])
  const [murid, setMurid] = useState([])

  useEffect(() => {
    async function fetchAll() {
      setLoading(true)
      const [t, p, b, g, m] = await Promise.all([
        supabase.from('tempahan_bilik').select('*').order('created_at', { ascending: false }),
        supabase.from('peminjaman_ict').select('*').order('created_at', { ascending: false }),
        supabase.from('barang_ict').select('*'),
        supabase.from('guru_delima').select('*'),
        supabase.from('murid_delima').select('*'),
      ])
      setTempahan(t.data ?? [])
      setPeminjaman(p.data ?? [])
      setBarang(b.data ?? [])
      setGuru(g.data ?? [])
      setMurid(m.data ?? [])
      setLoading(false)
    }
    fetchAll()
  }, [])

  // Derived stats
  const pendingTempahan = tempahan.filter(t => t.status === 'pending').length
  const lewatICT = peminjaman.filter(p => p.status === 'lewat').length
  const dipinjamICT = peminjaman.filter(p => p.status === 'dipinjam').length
  const guruAktif = guru.filter(g => g.status === 'aktif').length
  const muridAktif = murid.filter(m => m.status === 'aktif').length

  const bilikUnik = [...new Set(tempahan.map(t => t.bilik))].length || barang.length

  const alerts = [
    pendingTempahan > 0 && {
      icon: '🏫', color: 'border-l-amber-400 bg-amber-50',
      title: `${pendingTempahan} Tempahan Menunggu Kelulusan`,
      desc: 'Semak dan luluskan permohonan bilik khas.',
      route: '/tempahan',
    },
    lewatICT > 0 && {
      icon: '⚠️', color: 'border-l-red-400 bg-red-50',
      title: `${lewatICT} Barang ICT Lewat Dipulangkan`,
      desc: 'Hubungi peminjam untuk pulangkan barang segera.',
      route: '/ict',
    },
  ].filter(Boolean)

  const sistemStats = {
    tempahan: [
      { num: bilikUnik,        label: 'Bilik' },
      { num: pendingTempahan,  label: 'Menunggu' },
      { num: tempahan.filter(t => t.tarikh === new Date().toISOString().slice(0, 10)).length, label: 'Hari Ini' },
    ],
    ict: [
      { num: barang.length,   label: 'Jenis' },
      { num: dipinjamICT,     label: 'Dipinjam' },
      { num: lewatICT,        label: 'Lewat' },
    ],
    delima: [
      { num: guruAktif,  label: 'Guru' },
      { num: muridAktif, label: 'Murid' },
      { num: guru.length + murid.length, label: 'Jumlah' },
    ],
  }

  if (loading) {
    return (
      <Layout badgeCounts={{ tempahan: pendingTempahan, ict: lewatICT }} alertCount={alerts.length}>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400 text-sm animate-pulse">Memuatkan data...</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout badgeCounts={{ tempahan: pendingTempahan, ict: lewatICT }} alertCount={alerts.length}>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2.5">
          {alerts.map((a, i) => (
            <div key={i} className={`border-l-4 rounded-r-2xl p-4 flex items-start gap-3 ${a.color}`}>
              <span className="text-xl mt-0.5">{a.icon}</span>
              <div className="flex-1">
                <div className="text-sm font-bold text-gray-800">{a.title}</div>
                <div className="text-xs text-gray-500 mt-0.5">{a.desc}</div>
              </div>
              <button
                onClick={() => navigate(a.route)}
                className="text-xs font-bold text-gray-600 border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-white/50 transition-colors flex-shrink-0"
              >
                Urus →
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Mega Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard num={barang.length + bilikUnik}  label="Jumlah Aset"       icon="📊" color="text-sky-400" />
        <StatCard num={pendingTempahan + lewatICT} label="Perlu Tindakan"    icon="⚡" color="text-amber-400" />
        <StatCard num={guruAktif + muridAktif}     label="Pengguna DELIMA"   icon="👥" color="text-rose-400" />
        <StatCard num={guru.filter(g => g.status === 'aktif').length} label="Guru Aktif" icon="🏆" color="text-emerald-400" />
      </div>

      {/* 3 Sistem Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {SISTEM.map(s => (
          <div
            key={s.id}
            className="bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden hover:border-gray-600 transition-all cursor-pointer"
            onClick={() => navigate(s.route)}
          >
            <div className={`bg-gradient-to-br ${s.gradient} p-5`}>
              <div className="flex items-start justify-between">
                <div className="text-3xl">{s.icon}</div>
                <span className="text-xs font-bold bg-white/20 text-white px-2.5 py-1 rounded-full">Buka →</span>
              </div>
              <div className="mt-3">
                <div className="text-base font-bold text-white leading-tight">{s.label}</div>
                <div className="text-xs text-white/70 mt-1">{s.desc}</div>
              </div>
            </div>
            <div className="p-4 grid grid-cols-3 divide-x divide-gray-800">
              {(sistemStats[s.id] ?? []).map((st, i) => (
                <div key={i} className="text-center px-2">
                  <div className="text-xl font-black text-white">{st.num}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{st.label}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Split: Tempahan terkini + ICT terkini */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Tempahan terkini */}
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-5">
          <SectionHeader icon="🏫" title="Tempahan Terkini" color="text-sky-400"
            onMore={() => navigate('/tempahan')} />
          <div className="space-y-2.5 mt-4">
            {tempahan.slice(0, 4).map(t => {
              const s = TEMPAHAN_STATUS[t.status] ?? TEMPAHAN_STATUS.pending
              return (
                <div key={t.id} className="flex items-center gap-3 bg-gray-800/50 rounded-xl p-3">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-white truncate">{t.guru}</div>
                    <div className="text-xs text-gray-500 truncate">{t.bilik} • {t.masa}</div>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${s.badge}`}>{s.label}</span>
                </div>
              )
            })}
            {tempahan.length === 0 && (
              <div className="text-center text-xs text-gray-500 py-6">Tiada rekod tempahan</div>
            )}
          </div>
        </div>

        {/* ICT terkini */}
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-5">
          <SectionHeader icon="💻" title="Peminjaman ICT Terkini" color="text-indigo-400"
            onMore={() => navigate('/ict')} />
          <div className="space-y-2.5 mt-4">
            {peminjaman.slice(0, 4).map(t => {
              const s = ICT_STATUS[t.status] ?? ICT_STATUS.dipinjam
              return (
                <div key={t.id} className="flex items-center gap-3 bg-gray-800/50 rounded-xl p-3">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-white truncate">{t.peminjam}</div>
                    <div className="text-xs text-gray-500 truncate">{t.barang} • Pulang: {t.tarikh_pulang}</div>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${s.badge}`}>{s.label}</span>
                </div>
              )
            })}
            {peminjaman.length === 0 && (
              <div className="text-center text-xs text-gray-500 py-6">Tiada rekod peminjaman</div>
            )}
          </div>
        </div>
      </div>

      {/* DELIMA summary */}
      <div className="bg-gray-900 border border-gray-800 rounded-3xl p-5">
        <SectionHeader icon="🌺" title="Ringkasan DELIMA" color="text-rose-400"
          onMore={() => navigate('/delima')} />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {[
            { num: guru.length,                                    label: 'Jumlah Guru',    icon: '👨‍🏫', color: 'text-violet-400' },
            { num: murid.length,                                   label: 'Jumlah Murid',   icon: '🎓',  color: 'text-pink-400' },
            { num: guru.filter(g => g.status === 'aktif').length,  label: 'Guru Aktif',     icon: '✅',  color: 'text-emerald-400' },
            { num: murid.filter(m => m.status === 'kunci').length, label: 'Akaun Dikunci',  icon: '🔒',  color: 'text-red-400' },
          ].map((s, i) => (
            <div key={i} className="bg-gray-800/50 rounded-2xl p-4 text-center">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className={`text-2xl font-black ${s.color}`}>{s.num}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

    </Layout>
  )
}
