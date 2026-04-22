import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Layout from '../components/Layout'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'

const MONTHS_MS = ['Jan','Feb','Mac','Apr','Mei','Jun','Jul','Ogs','Sep','Okt','Nov','Dis']

function getMonthlyData(records, dateField = 'created_at', months = 6) {
  const now = new Date()
  return Array.from({ length: months }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1)
    const label = MONTHS_MS[d.getMonth()]
    const count = records.filter(r => {
      const rd = new Date(r[dateField])
      return rd.getFullYear() === d.getFullYear() && rd.getMonth() === d.getMonth()
    }).length
    return { label, count }
  })
}

const DONUT_COLORS = ['#4A9EFF', '#2ECC71', '#F5A623', '#E74C3C', '#9B59B6']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
      className="rounded-xl px-3 py-2 text-xs">
      <div className="mb-1" style={{ color: '#6B7280' }}>{label}</div>
      <div className="font-bold" style={{ color: '#111827' }}>{payload[0].value}</div>
    </div>
  )
}

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

  const TODAY = new Date().toISOString().slice(0, 10)
  const pendingTempahan = tempahan.filter(t => t.status === 'pending').length
  const approvedTempahan = tempahan.filter(t => t.status === 'approved').length
  const lewatICT = peminjaman.filter(p => p.status === 'lewat').length
  const dipinjamICT = peminjaman.filter(p => p.status === 'dipinjam').length
  const guruAktif = guru.filter(g => g.status === 'aktif').length
  const muridAktif = murid.filter(m => m.status === 'aktif').length
  const todayTempahan = tempahan.filter(t => t.tarikh === TODAY).length

  // Chart data
  const tempahanTrend = getMonthlyData(tempahan, 'created_at', 6)
  const peminjamanTrend = getMonthlyData(peminjaman, 'created_at', 6)

  const ictBarData = barang.slice(0, 6).map(b => ({
    label: b.nama?.length > 10 ? b.nama.slice(0, 10) + '…' : b.nama,
    tersedia: b.tersedia,
    dipinjam: b.kuantiti - b.tersedia,
  }))

  const delimaDonut = [
    { name: 'Guru Aktif',    value: guruAktif },
    { name: 'Murid Aktif',   value: muridAktif },
    { name: 'Akaun Dikunci', value: murid.filter(m => m.status === 'kunci').length },
    { name: 'Tidak Aktif',   value: [...guru, ...murid].filter(x => x.status === 'tidak_aktif').length },
  ].filter(d => d.value > 0)

  const alerts = [
    pendingTempahan > 0 && {
      color: '#D97706', bg: '#FFFBEB', border: '#FDE68A',
      icon: '🏫', title: `${pendingTempahan} Tempahan Menunggu Kelulusan`,
      desc: 'Semak dan luluskan permohonan bilik khas.', route: '/tempahan',
    },
    lewatICT > 0 && {
      color: '#DC2626', bg: '#FEF2F2', border: '#FECACA',
      icon: '⚠️', title: `${lewatICT} Barang ICT Lewat Dipulangkan`,
      desc: 'Hubungi peminjam untuk pulangkan barang segera.', route: '/ict',
    },
  ].filter(Boolean)

  const kpiCards = [
    {
      num: barang.length,
      label: 'Jenis Barang ICT',
      sub: `${dipinjamICT} sedang dipinjam`,
      color: '#4A9EFF',
      icon: '💻',
    },
    {
      num: pendingTempahan + lewatICT,
      label: 'Perlu Tindakan',
      sub: pendingTempahan + lewatICT > 0 ? 'Ada item mendesak' : 'Tiada tindakan perlu',
      color: pendingTempahan + lewatICT > 0 ? '#E74C3C' : '#2ECC71',
      icon: '⚡',
    },
    {
      num: guruAktif + muridAktif,
      label: 'Pengguna DELIMA',
      sub: `${guruAktif} guru • ${muridAktif} murid`,
      color: '#9B59B6',
      icon: '👥',
    },
    {
      num: approvedTempahan,
      label: 'Tempahan Diluluskan',
      sub: `${todayTempahan} tempahan hari ini`,
      color: '#2ECC71',
      icon: '✅',
    },
  ]

  if (loading) {
    return (
      <Layout badgeCounts={{ tempahan: pendingTempahan, ict: lewatICT }}>
        <div className="flex items-center justify-center h-64">
          <div className="text-sm animate-pulse" style={{ color: '#6B7280' }}>Memuatkan data...</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout badgeCounts={{ tempahan: pendingTempahan, ict: lewatICT }}>

      {/* ── ALERTS ── */}
      {alerts.length > 0 && (
        <div className="space-y-2.5">
          {alerts.map((a, i) => (
            <div key={i} className="flex items-center gap-3 rounded-2xl px-4 py-3"
              style={{ background: a.bg, border: `1px solid ${a.border}` }}>
              <span className="text-xl flex-shrink-0">{a.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold" style={{ color: '#111827' }}>{a.title}</div>
                <div className="text-xs mt-0.5" style={{ color: '#6B7280' }}>{a.desc}</div>
              </div>
              <button onClick={() => navigate(a.route)}
                className="text-xs font-bold px-3 py-1.5 rounded-lg flex-shrink-0 transition-opacity hover:opacity-80"
                style={{ background: a.color, color: '#fff' }}>
                Urus →
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── KPI CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((k, i) => (
          <div key={i} className="rounded-2xl p-5 transition-all hover:scale-[1.01]"
            style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <div className="flex items-start justify-between mb-3">
              <span className="text-2xl">{k.icon}</span>
              <div className="w-2 h-2 rounded-full mt-1" style={{ background: k.color }} />
            </div>
            <div className="text-3xl font-black" style={{ fontFamily: 'Manrope, Inter, sans-serif', color: '#111827' }}>{k.num}</div>
            <div className="text-xs font-semibold mt-1" style={{ color: '#374151' }}>{k.label}</div>
            <div className="text-xs mt-0.5" style={{ color: '#6B7280' }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* ── AKTIVITI TERKINI ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Tempahan terkini */}
        <div className="rounded-2xl p-5"
          style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-semibold" style={{ color: '#111827' }}>🏫 Tempahan Terkini</div>
            <button onClick={() => navigate('/tempahan')}
              className="text-xs font-semibold hover:text-white transition-colors"
              style={{ color: '#4A9EFF' }}>
              Lihat semua →
            </button>
          </div>
          <div className="space-y-2">
            {tempahan.slice(0, 5).map(t => {
              const colors = { approved: '#2ECC71', pending: '#F5A623', rejected: '#E74C3C' }
              const labels = { approved: 'Lulus', pending: 'Tunggu', rejected: 'Tolak' }
              const c = colors[t.status] ?? '#F5A623'
              return (
                <div key={t.id} className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors"
                  style={{ background: '#F9FAFB' }}>
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: c }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-white truncate">{t.guru}</div>
                    <div className="text-xs truncate" style={{ color: '#6B7280' }}>{t.bilik} • {t.masa}</div>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: c + '22', color: c }}>
                    {labels[t.status] ?? 'Tunggu'}
                  </span>
                </div>
              )
            })}
            {tempahan.length === 0 && (
              <div className="text-center py-6 text-xs" style={{ color: '#9CA3AF' }}>Tiada rekod tempahan</div>
            )}
          </div>
        </div>

        {/* ICT terkini */}
        <div className="rounded-2xl p-5"
          style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-semibold" style={{ color: '#111827' }}>💻 Peminjaman ICT Terkini</div>
            <button onClick={() => navigate('/ict')}
              className="text-xs font-semibold hover:text-white transition-colors"
              style={{ color: '#9B59B6' }}>
              Lihat semua →
            </button>
          </div>
          <div className="space-y-2">
            {peminjaman.slice(0, 5).map(p => {
              const colors = { dipinjam: '#4A9EFF', lewat: '#E74C3C', dipulangkan: '#2ECC71', pending: '#F5A623' }
              const labels = { dipinjam: 'Dipinjam', lewat: 'Lewat', dipulangkan: 'Pulang', pending: 'Tunggu' }
              const c = colors[p.status] ?? '#4A9EFF'
              return (
                <div key={p.id} className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                  style={{ background: '#F9FAFB' }}>
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: c }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-white truncate">{p.peminjam}</div>
                    <div className="text-xs truncate" style={{ color: '#6B7280' }}>{p.barang} • Pulang: {p.tarikh_pulang}</div>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: c + '22', color: c }}>
                    {labels[p.status] ?? 'Dipinjam'}
                  </span>
                </div>
              )
            })}
            {peminjaman.length === 0 && (
              <div className="text-center py-6 text-xs" style={{ color: '#9CA3AF' }}>Tiada rekod peminjaman</div>
            )}
          </div>
        </div>
      </div>

      {/* ── 3 SISTEM CARDS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {[
          {
            label: 'Tempahan Bilik Khas', icon: '🏫', route: '/tempahan',
            gradient: 'linear-gradient(135deg, #0ea5e9, #06b6d4)',
            stats: [
              { num: tempahan.length, label: 'Jumlah' },
              { num: pendingTempahan, label: 'Pending' },
              { num: todayTempahan,   label: 'Hari Ini' },
            ],
          },
          {
            label: 'Peminjaman Barang ICT', icon: '💻', route: '/ict',
            gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            stats: [
              { num: barang.length, label: 'Jenis' },
              { num: dipinjamICT,   label: 'Dipinjam' },
              { num: lewatICT,      label: 'Lewat' },
            ],
          },
          {
            label: 'Pengurusan ID DELIMA', icon: '🌺', route: '/delima',
            gradient: 'linear-gradient(135deg, #f43f5e, #ec4899)',
            stats: [
              { num: guru.length,       label: 'Guru' },
              { num: murid.length,      label: 'Murid' },
              { num: guruAktif + muridAktif, label: 'Aktif' },
            ],
          },
        ].map((s, i) => (
          <div key={i} onClick={() => navigate(s.route)}
            className="rounded-2xl overflow-hidden cursor-pointer transition-all hover:scale-[1.01]"
            style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <div className="p-5" style={{ background: s.gradient }}>
              <div className="flex items-start justify-between">
                <span className="text-3xl">{s.icon}</span>
                <span className="text-xs font-bold bg-white/20 text-white px-2.5 py-1 rounded-full">Buka →</span>
              </div>
              <div className="mt-3 text-base font-bold text-white leading-tight">{s.label}</div>
            </div>
            <div className="grid grid-cols-3 divide-x px-1 py-3"
              style={{ borderTop: '1px solid var(--border)', borderColor: 'rgba(255,255,255,0.06)' }}>
              {s.stats.map((st, j) => (
                <div key={j} className="text-center px-2">
                  <div className="text-xl font-black" style={{ fontFamily: 'Manrope, sans-serif', color: '#111827' }}>{st.num}</div>
                  <div className="text-xs mt-0.5" style={{ color: '#6B7280' }}>{st.label}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── CHARTS ROW 1: Trend Tempahan + Trend Peminjaman ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        <div className="rounded-2xl p-5"
          style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-semibold" style={{ color: '#111827' }}>Trend Tempahan Bilik</div>
              <div className="text-xs mt-0.5" style={{ color: '#6B7280' }}>6 bulan lepas</div>
            </div>
            <span className="text-xl">🏫</span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={tempahanTrend}>
              <defs>
                <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4A9EFF" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#4A9EFF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: '#6B7280', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="count" stroke="#4A9EFF" strokeWidth={2}
                fill="url(#blueGrad)" dot={{ fill: '#4A9EFF', r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl p-5"
          style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-semibold" style={{ color: '#111827' }}>Trend Peminjaman ICT</div>
              <div className="text-xs mt-0.5" style={{ color: '#6B7280' }}>6 bulan lepas</div>
            </div>
            <span className="text-xl">💻</span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={peminjamanTrend}>
              <defs>
                <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9B59B6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#9B59B6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: '#6B7280', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="count" stroke="#9B59B6" strokeWidth={2}
                fill="url(#purpleGrad)" dot={{ fill: '#9B59B6', r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── CHARTS ROW 2: Bar Inventori + Donut DELIMA ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        <div className="lg:col-span-2 rounded-2xl p-5"
          style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-semibold" style={{ color: '#111827' }}>Status Inventori ICT</div>
              <div className="text-xs mt-0.5" style={{ color: '#6B7280' }}>Tersedia vs Dipinjam</div>
            </div>
            <div className="flex items-center gap-3 text-xs" style={{ color: '#6B7280' }}>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#4A9EFF] inline-block" />Tersedia</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#F5A623] inline-block" />Dipinjam</span>
            </div>
          </div>
          {ictBarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={ictBarData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: '#6B7280', fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="tersedia" fill="#4A9EFF" radius={[4, 4, 0, 0]} />
                <Bar dataKey="dipinjam" fill="#F5A623" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-40 text-xs" style={{ color: '#9CA3AF' }}>
              Tiada data inventori
            </div>
          )}
        </div>

        <div className="rounded-2xl p-5"
          style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div className="mb-4">
            <div className="text-sm font-semibold" style={{ color: '#111827' }}>Pengguna DELIMA</div>
            <div className="text-xs mt-0.5" style={{ color: '#6B7280' }}>Taburan status</div>
          </div>
          {delimaDonut.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={130}>
                <PieChart>
                  <Pie data={delimaDonut} cx="50%" cy="50%" innerRadius={38} outerRadius={58}
                    dataKey="value" paddingAngle={3}>
                    {delimaDonut.map((_, i) => (
                      <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {delimaDonut.map((d, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5" style={{ color: '#6B7280' }}>
                      <span className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                      {d.name}
                    </span>
                    <span className="font-bold text-white">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-40 text-xs" style={{ color: '#9CA3AF' }}>
              Tiada data DELIMA
            </div>
          )}
        </div>
      </div>

    </Layout>
  )
}
