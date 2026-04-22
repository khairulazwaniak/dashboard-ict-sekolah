"use client";
import { useState } from "react";

// ═══════════════════════════════════════════════
//  SHARED DATA (ringkasan dari 3 sistem)
// ═══════════════════════════════════════════════
const DATA = {
  // Sistem 1 - Tempahan Bilik
  tempahan: {
    totalBilik: 8,
    pending: 3,
    hariIni: 2,
    mingguIni: 11,
    terkini: [
      { id: 1, guru: "Cikgu Aishah Noor",  bilik: "Makmal Sains 1",     tarikh: "2025-01-20", masa: "08:00–09:00", status: "approved" },
      { id: 2, guru: "Cikgu Hafiz Rahman", bilik: "Makmal Komputer 1",  tarikh: "2025-01-20", masa: "10:00–11:00", status: "approved" },
      { id: 3, guru: "Cikgu Nurul Ain",    bilik: "Bilik STEM",         tarikh: "2025-01-21", masa: "14:00–16:00", status: "pending"  },
      { id: 4, guru: "Cikgu Roslan Daud",  bilik: "Makmal Sains 2",     tarikh: "2025-01-22", masa: "09:00–10:30", status: "pending"  },
    ],
  },

  // Sistem 2 - Peminjaman ICT
  ict: {
    totalBarang: 6,
    dipinjam: 3,
    lewat: 1,
    stokRendah: 2,
    terkini: [
      { id: 1, peminjam: "Cikgu Hafiz",   barang: "Projektor Epson", tarikh_pulang: "2025-01-21", status: "dipinjam"    },
      { id: 2, peminjam: "Cikgu Nurul",   barang: "iPad Gen 9 (x3)", tarikh_pulang: "2025-01-22", status: "dipinjam"    },
      { id: 3, peminjam: "Cikgu Fatimah", barang: "Mikrofon Wireless",tarikh_pulang: "2025-01-21", status: "lewat"       },
      { id: 4, peminjam: "Cikgu Aishah",  barang: "Laptop Acer",     tarikh_pulang: "2025-01-20", status: "dipulangkan" },
    ],
  },

  // Sistem 3 - DELIMA
  delima: {
    jumlahGuru: 5,
    jumlahMurid: 6,
    guruCapaiSasaran: 2,
    muridPerluPerhatian: 1,
    aktivitiMinggu: 6,
    progressGuru: [
      { nama: "Cikgu Aishah",  telah: 18, sasaran: 20 },
      { nama: "Cikgu Hafiz",   telah: 22, sasaran: 20 },
      { nama: "Cikgu Nurul",   telah: 14, sasaran: 20 },
      { nama: "Cikgu Roslan",  telah: 20, sasaran: 20 },
      { nama: "Cikgu Fatimah", telah: 9,  sasaran: 20 },
    ],
  },
};

// ═══════════════════════════════════════════════
//  STATUS HELPERS
// ═══════════════════════════════════════════════
const TEMPAHAN_STATUS = {
  approved: { dot: "bg-emerald-400", badge: "bg-emerald-100 text-emerald-700", label: "Lulus" },
  pending:  { dot: "bg-amber-400",   badge: "bg-amber-100 text-amber-700",     label: "Tunggu" },
  rejected: { dot: "bg-red-400",     badge: "bg-red-100 text-red-700",         label: "Tolak" },
};
const ICT_STATUS = {
  dipinjam:    { dot: "bg-blue-400",    badge: "bg-blue-100 text-blue-700",     label: "Dipinjam" },
  lewat:       { dot: "bg-red-400",     badge: "bg-red-100 text-red-700",       label: "Lewat" },
  dipulangkan: { dot: "bg-emerald-400", badge: "bg-emerald-100 text-emerald-700",label: "Pulang" },
};

// ═══════════════════════════════════════════════
//  SISTEM CARDS (link ke sistem penuh)
// ═══════════════════════════════════════════════
const SISTEM = [
  {
    id: "tempahan",
    label: "Tempahan Bilik Khas",
    icon: "🏫",
    desc: "Makmal, Bilik STEM & Bilik Sumber",
    gradient: "from-sky-600 to-cyan-500",
    soft: "bg-sky-50",
    accent: "text-sky-700",
    border: "border-sky-200",
    stats: [
      { num: DATA.tempahan.totalBilik, label: "Bilik" },
      { num: DATA.tempahan.pending,    label: "Menunggu" },
      { num: DATA.tempahan.hariIni,    label: "Hari Ini" },
    ],
  },
  {
    id: "ict",
    label: "Peminjaman Barang ICT",
    icon: "💻",
    desc: "Laptop, Projektor, Tablet & lebih",
    gradient: "from-indigo-600 to-violet-500",
    soft: "bg-indigo-50",
    accent: "text-indigo-700",
    border: "border-indigo-200",
    stats: [
      { num: DATA.ict.totalBarang, label: "Jenis" },
      { num: DATA.ict.dipinjam,    label: "Dipinjam" },
      { num: DATA.ict.lewat,       label: "Lewat" },
    ],
  },
  {
    id: "delima",
    label: "Pengurusan DELIMA",
    icon: "🌺",
    desc: "Pembangunan & Pemantauan Prestasi",
    gradient: "from-rose-600 to-pink-500",
    soft: "bg-rose-50",
    accent: "text-rose-700",
    border: "border-rose-200",
    stats: [
      { num: DATA.delima.jumlahGuru,          label: "Guru" },
      { num: DATA.delima.jumlahMurid,         label: "Murid" },
      { num: DATA.delima.aktivitiMinggu,      label: "Aktiviti" },
    ],
  },
];

// ═══════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [notif, setNotif] = useState(true);

  const alerts = [
    DATA.tempahan.pending > 0 && {
      icon: "🏫", color: "border-l-amber-400 bg-amber-50",
      title: `${DATA.tempahan.pending} Tempahan Menunggu Kelulusan`,
      desc: "Semak dan luluskan permohonan bilik khas.",
      sistem: "tempahan", badge: "amber",
    },
    DATA.ict.lewat > 0 && {
      icon: "⚠️", color: "border-l-red-400 bg-red-50",
      title: `${DATA.ict.lewat} Barang ICT Lewat Dipulangkan`,
      desc: "Hubungi peminjam untuk pulangkan barang segera.",
      sistem: "ict", badge: "red",
    },
    DATA.delima.muridPerluPerhatian > 0 && {
      icon: "🎓", color: "border-l-rose-400 bg-rose-50",
      title: `${DATA.delima.muridPerluPerhatian} Murid Perlu Perhatian`,
      desc: "Rekodkan intervensi dan bimbingan segera.",
      sistem: "delima", badge: "rose",
    },
  ].filter(Boolean);

  const TABS = [
    { id: "overview",  label: "Gambaran" },
    { id: "tempahan",  label: "Bilik" },
    { id: "ict",       label: "ICT" },
    { id: "delima",    label: "DELIMA" },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans">

      {/* ── SIDEBAR (desktop) ── */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-gray-900 border-r border-gray-800 flex-col z-50">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-lg">🏛️</div>
            <div>
              <div className="text-sm font-bold text-white leading-tight">ADMIN PANEL</div>
              <div className="text-xs text-gray-400">Sekolah Kebangsaan</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {[
            { id: "overview", icon: "⬡", label: "Gambaran Keseluruhan" },
            { id: "tempahan", icon: "🏫", label: "Tempahan Bilik" },
            { id: "ict",      icon: "💻", label: "Peminjaman ICT" },
            { id: "delima",   icon: "🌺", label: "DELIMA" },
          ].map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left
                ${activeTab === item.id
                  ? "bg-white/10 text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/5"}`}>
              <span className="text-base">{item.icon}</span>
              {item.label}
              {item.id === "tempahan" && DATA.tempahan.pending > 0 &&
                <span className="ml-auto text-xs bg-amber-500 text-white px-1.5 py-0.5 rounded-full">{DATA.tempahan.pending}</span>}
              {item.id === "ict" && DATA.ict.lewat > 0 &&
                <span className="ml-auto text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full">{DATA.ict.lewat}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center text-sm">👤</div>
            <div>
              <div className="text-xs font-semibold text-white">Pentadbir</div>
              <div className="text-xs text-gray-500">admin@sekolah.edu.my</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="lg:ml-64 flex flex-col min-h-screen">

        {/* TOP BAR */}
        <header className="sticky top-0 z-40 bg-gray-950/80 backdrop-blur border-b border-gray-800 px-4 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <div className="text-lg font-bold text-white">
              {activeTab === "overview" && "Gambaran Keseluruhan"}
              {activeTab === "tempahan" && "🏫 Tempahan Bilik Khas"}
              {activeTab === "ict"      && "💻 Peminjaman Barang ICT"}
              {activeTab === "delima"   && "🌺 Pengurusan DELIMA"}
            </div>
            <div className="text-xs text-gray-400 mt-0.5">
              {new Date().toLocaleDateString("ms-MY", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Notif bell */}
            <button onClick={() => setNotif(n => !n)}
              className="relative w-9 h-9 bg-gray-800 rounded-xl flex items-center justify-center text-lg hover:bg-gray-700 transition-colors">
              🔔
              {alerts.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center font-bold">
                  {alerts.length}
                </span>
              )}
            </button>
            <div className="w-9 h-9 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-xl flex items-center justify-center text-sm font-bold">A</div>
          </div>
        </header>

        {/* MOBILE NAV */}
        <div className="lg:hidden px-4 pt-4 pb-1">
          <div className="flex gap-1.5 bg-gray-900 rounded-2xl p-1.5 overflow-x-auto scrollbar-hide">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all
                  ${activeTab === t.id ? "bg-white text-gray-900" : "text-gray-400"}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <main className="flex-1 px-4 lg:px-8 py-6 space-y-6 max-w-6xl mx-auto w-full">

          {/* ══════ OVERVIEW ══════ */}
          {activeTab === "overview" && (
            <>
              {/* Alerts */}
              {alerts.length > 0 && notif && (
                <div className="space-y-2.5">
                  {alerts.map((a, i) => (
                    <div key={i} className={`border-l-4 rounded-r-2xl p-4 flex items-start gap-3 ${a.color}`}>
                      <span className="text-xl mt-0.5">{a.icon}</span>
                      <div className="flex-1">
                        <div className="text-sm font-bold text-gray-800">{a.title}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{a.desc}</div>
                      </div>
                      <button onClick={() => setActiveTab(a.sistem)}
                        className="text-xs font-bold text-gray-600 border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-white/50 transition-colors flex-shrink-0">
                        Urus →
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Mega Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { num: DATA.tempahan.totalBilik + DATA.ict.totalBarang, label: "Jumlah Aset", icon: "📊", color: "from-sky-500 to-cyan-400" },
                  { num: DATA.tempahan.pending + DATA.ict.lewat,           label: "Perlu Tindakan", icon: "⚡", color: "from-amber-500 to-orange-400" },
                  { num: DATA.delima.jumlahGuru + DATA.delima.jumlahMurid, label: "Pengguna DELIMA", icon: "👥", color: "from-rose-500 to-pink-400" },
                  { num: DATA.delima.guruCapaiSasaran,                     label: "Guru Capai Sasaran", icon: "🏆", color: "from-emerald-500 to-teal-400" },
                ].map((s, i) => (
                  <div key={i} className="bg-gray-900 rounded-2xl p-5 border border-gray-800 relative overflow-hidden group hover:border-gray-600 transition-colors">
                    <div className={`absolute inset-0 bg-gradient-to-br ${s.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
                    <div className="text-2xl mb-2">{s.icon}</div>
                    <div className="text-3xl font-black text-white">{s.num}</div>
                    <div className="text-xs text-gray-400 mt-1 font-medium">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* 3 Sistem Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {SISTEM.map(s => (
                  <div key={s.id}
                    className="bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden hover:border-gray-600 transition-all group cursor-pointer"
                    onClick={() => setActiveTab(s.id)}>
                    {/* Card Header */}
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
                    {/* Card Stats */}
                    <div className="p-4 grid grid-cols-3 divide-x divide-gray-800">
                      {s.stats.map((st, i) => (
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
                    onMore={() => setActiveTab("tempahan")} />
                  <div className="space-y-2.5 mt-4">
                    {DATA.tempahan.terkini.map(t => {
                      const s = TEMPAHAN_STATUS[t.status];
                      return (
                        <div key={t.id} className="flex items-center gap-3 bg-gray-800/50 rounded-xl p-3">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-white truncate">{t.guru}</div>
                            <div className="text-xs text-gray-500 truncate">{t.bilik} • {t.masa}</div>
                          </div>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${s.badge}`}>{s.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ICT terkini */}
                <div className="bg-gray-900 border border-gray-800 rounded-3xl p-5">
                  <SectionHeader icon="💻" title="Peminjaman ICT Terkini" color="text-indigo-400"
                    onMore={() => setActiveTab("ict")} />
                  <div className="space-y-2.5 mt-4">
                    {DATA.ict.terkini.map(t => {
                      const s = ICT_STATUS[t.status];
                      return (
                        <div key={t.id} className="flex items-center gap-3 bg-gray-800/50 rounded-xl p-3">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-white truncate">{t.peminjam}</div>
                            <div className="text-xs text-gray-500 truncate">{t.barang} • Pulang: {t.tarikh_pulang}</div>
                          </div>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${s.badge}`}>{s.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* DELIMA Progress */}
              <div className="bg-gray-900 border border-gray-800 rounded-3xl p-5">
                <SectionHeader icon="🌺" title="Progress CPD DELIMA Guru" color="text-rose-400"
                  onMore={() => setActiveTab("delima")} />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                  {DATA.delima.progressGuru.map((g, i) => {
                    const pct = Math.min(Math.round((g.telah / g.sasaran) * 100), 100);
                    const color = g.telah >= g.sasaran ? "bg-emerald-500" : pct >= 60 ? "bg-amber-400" : "bg-red-400";
                    return (
                      <div key={i}>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-gray-300 font-medium">{g.nama}</span>
                          <span className={`font-bold ${g.telah >= g.sasaran ? "text-emerald-400" : "text-gray-400"}`}>
                            {g.telah}/{g.sasaran} jam {g.telah >= g.sasaran ? "✅" : ""}
                          </span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2">
                          <div className={`h-2 rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* ══════ TEMPAHAN TAB ══════ */}
          {activeTab === "tempahan" && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { num: DATA.tempahan.totalBilik, label: "Jumlah Bilik",  icon: "🏫", color: "text-sky-400" },
                  { num: DATA.tempahan.pending,    label: "Menunggu Lulus", icon: "⏳", color: "text-amber-400" },
                  { num: DATA.tempahan.hariIni,    label: "Tempahan Hari Ini", icon: "📅", color: "text-emerald-400" },
                  { num: DATA.tempahan.mingguIni,  label: "Minggu Ini",     icon: "📊", color: "text-violet-400" },
                ].map((s, i) => (
                  <StatCard key={i} {...s} />
                ))}
              </div>

              {/* Pending kelulusan */}
              <div className="bg-gray-900 border border-gray-800 rounded-3xl p-5">
                <SectionHeader icon="⏳" title="Menunggu Kelulusan" color="text-amber-400" />
                <div className="space-y-3 mt-4">
                  {DATA.tempahan.terkini.filter(t => t.status === "pending").map(t => (
                    <div key={t.id} className="bg-gray-800 rounded-2xl p-4 flex items-start gap-4">
                      <div className="w-10 h-10 bg-sky-900/50 rounded-xl flex items-center justify-center text-xl flex-shrink-0">🏫</div>
                      <div className="flex-1">
                        <div className="text-sm font-bold text-white">{t.guru}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{t.bilik} • {t.tarikh} • {t.masa}</div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold hover:bg-emerald-500/30 transition-colors">✅ Lulus</button>
                        <button className="px-3 py-1.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-bold hover:bg-red-500/30 transition-colors">❌ Tolak</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Semua tempahan */}
              <div className="bg-gray-900 border border-gray-800 rounded-3xl p-5">
                <SectionHeader icon="📋" title="Semua Tempahan" color="text-sky-400" />
                <div className="space-y-2.5 mt-4">
                  {DATA.tempahan.terkini.map(t => {
                    const s = TEMPAHAN_STATUS[t.status];
                    return (
                      <div key={t.id} className="flex items-center gap-3 bg-gray-800/50 rounded-xl p-3.5">
                        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${s.dot}`} />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-white">{t.guru}</div>
                          <div className="text-xs text-gray-500">{t.bilik} • {t.tarikh} • {t.masa}</div>
                        </div>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${s.badge}`}>{s.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* ══════ ICT TAB ══════ */}
          {activeTab === "ict" && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { num: DATA.ict.totalBarang, label: "Jenis Barang",    icon: "📦", color: "text-indigo-400" },
                  { num: DATA.ict.dipinjam,    label: "Sedang Dipinjam", icon: "📤", color: "text-blue-400" },
                  { num: DATA.ict.lewat,       label: "Lewat Pulang",    icon: "⚠️", color: "text-red-400" },
                  { num: DATA.ict.stokRendah,  label: "Stok Rendah",     icon: "📉", color: "text-amber-400" },
                ].map((s, i) => (
                  <StatCard key={i} {...s} />
                ))}
              </div>

              {/* Lewat alert */}
              {DATA.ict.lewat > 0 && (
                <div className="bg-red-950/40 border border-red-800/50 rounded-2xl p-4 flex gap-3 items-start">
                  <span className="text-2xl">🚨</span>
                  <div>
                    <div className="text-sm font-bold text-red-300">{DATA.ict.lewat} Barang Lewat Dipulangkan</div>
                    <div className="text-xs text-red-400/70 mt-1">Sila hubungi peminjam dan rekodkan tindakan susulan.</div>
                  </div>
                </div>
              )}

              {/* Senarai peminjaman */}
              <div className="bg-gray-900 border border-gray-800 rounded-3xl p-5">
                <SectionHeader icon="📋" title="Rekod Peminjaman Semasa" color="text-indigo-400" />
                <div className="space-y-3 mt-4">
                  {DATA.ict.terkini.map(t => {
                    const s = ICT_STATUS[t.status];
                    return (
                      <div key={t.id} className="bg-gray-800 rounded-2xl p-4 flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-900/50 rounded-xl flex items-center justify-center text-xl flex-shrink-0">💻</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-white">{t.peminjam}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{t.barang} • Pulang: {t.tarikh_pulang}</div>
                        </div>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${s.badge}`}>{s.label}</span>
                        {(t.status === "dipinjam" || t.status === "lewat") && (
                          <button className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold hover:bg-emerald-500/30 transition-colors flex-shrink-0">
                            Pulang ✓
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* ══════ DELIMA TAB ══════ */}
          {activeTab === "delima" && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { num: DATA.delima.jumlahGuru,          label: "Jumlah Guru",       icon: "👨‍🏫", color: "text-rose-400" },
                  { num: DATA.delima.jumlahMurid,         label: "Jumlah Murid",      icon: "🎓",  color: "text-pink-400" },
                  { num: DATA.delima.aktivitiMinggu,      label: "Aktiviti Minggu Ini",icon: "📋", color: "text-purple-400" },
                  { num: DATA.delima.guruCapaiSasaran,    label: "Capai Sasaran CPD", icon: "🏆",  color: "text-emerald-400" },
                  { num: DATA.delima.muridPerluPerhatian, label: "Murid Perlu Perhatian",icon: "🚨",color: "text-red-400" },
                  { num: DATA.delima.jumlahGuru - DATA.delima.guruCapaiSasaran, label: "Guru Belum Capai", icon: "⏳", color: "text-amber-400" },
                ].map((s, i) => (
                  <StatCard key={i} {...s} />
                ))}
              </div>

              {/* Perlu perhatian */}
              {DATA.delima.muridPerluPerhatian > 0 && (
                <div className="bg-red-950/40 border border-red-800/50 rounded-2xl p-4 flex gap-3 items-start">
                  <span className="text-2xl">🚨</span>
                  <div>
                    <div className="text-sm font-bold text-red-300">{DATA.delima.muridPerluPerhatian} Murid Perlu Perhatian Segera</div>
                    <div className="text-xs text-red-400/70 mt-1">Rekodkan intervensi dan program bimbingan.</div>
                  </div>
                </div>
              )}

              {/* Progress CPD lengkap */}
              <div className="bg-gray-900 border border-gray-800 rounded-3xl p-5">
                <SectionHeader icon="📈" title="Progress CPD Guru (Jam DELIMA)" color="text-rose-400" />
                <div className="space-y-4 mt-5">
                  {DATA.delima.progressGuru.map((g, i) => {
                    const pct = Math.min(Math.round((g.telah / g.sasaran) * 100), 100);
                    const color = g.telah >= g.sasaran ? "bg-emerald-500" : pct >= 60 ? "bg-amber-400" : "bg-red-400";
                    const textColor = g.telah >= g.sasaran ? "text-emerald-400" : pct >= 60 ? "text-amber-400" : "text-red-400";
                    return (
                      <div key={i} className="bg-gray-800/50 rounded-2xl p-4">
                        <div className="flex justify-between items-center mb-2.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 bg-rose-900/50 rounded-lg flex items-center justify-center text-sm">👨‍🏫</div>
                            <span className="text-sm font-semibold text-white">{g.nama}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-black ${textColor}`}>{pct}%</span>
                            {g.telah >= g.sasaran && <span className="text-emerald-400">✅</span>}
                          </div>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2.5">
                          <div className={`h-2.5 rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
                        </div>
                        <div className="flex justify-between mt-1.5">
                          <span className="text-xs text-gray-500">Telah: {g.telah} jam</span>
                          <span className="text-xs text-gray-500">Sasaran: {g.sasaran} jam</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

        </main>
      </div>
    </div>
  );
}

// ── SUB-KOMPONEN ──────────────────────────────────────────
function StatCard({ num, label, icon, color }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 hover:border-gray-600 transition-colors">
      <div className="text-2xl mb-2">{icon}</div>
      <div className={`text-3xl font-black ${color}`}>{num}</div>
      <div className="text-xs text-gray-400 mt-1 font-medium">{label}</div>
    </div>
  );
}

function SectionHeader({ icon, title, color, onMore }) {
  return (
    <div className="flex items-center justify-between">
      <div className={`flex items-center gap-2 text-sm font-bold ${color}`}>
        <span>{icon}</span>
        <span>{title}</span>
      </div>
      {onMore && (
        <button onClick={onMore} className="text-xs text-gray-500 hover:text-gray-300 transition-colors font-medium">
          Lihat semua →
        </button>
      )}
    </div>
  );
}
