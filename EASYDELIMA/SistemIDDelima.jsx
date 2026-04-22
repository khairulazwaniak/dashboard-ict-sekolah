import { useState } from "react";

// ── DATA AWAL ──────────────────────────────────────────────
const initialGuru = [
  { id: 1, nama: "Cikgu Aishah Noor",   noPekerja: "G10234", idDelima: "AIR2024001", email: "aishah@moe.edu.my",  noTel: "0123456789", subjek: "Sains",     gred: "DG44", status: "aktif",   lastLogin: "2025-01-20", password: "••••••••" },
  { id: 2, nama: "Cikgu Hafiz Rahman",  noPekerja: "G10235", idDelima: "AIR2024002", email: "hafiz@moe.edu.my",   noTel: "0134567890", subjek: "Teknologi", gred: "DG48", status: "aktif",   lastLogin: "2025-01-19", password: "••••••••" },
  { id: 3, nama: "Cikgu Nurul Ain",     noPekerja: "G10236", idDelima: "AIR2024003", email: "nurul@moe.edu.my",   noTel: "0145678901", subjek: "Matematik", gred: "DG44", status: "aktif",   lastLogin: "2025-01-18", password: "••••••••" },
  { id: 4, nama: "Cikgu Roslan Daud",   noPekerja: "G10237", idDelima: "AIR2024004", email: "roslan@moe.edu.my",  noTel: "0156789012", subjek: "Fizik",     gred: "DG52", status: "aktif",   lastLogin: "2025-01-17", password: "••••••••" },
  { id: 5, nama: "Cikgu Fatimah Zain",  noPekerja: "G10238", idDelima: "AIR2024005", email: "fatimah@moe.edu.my", noTel: "0167890123", subjek: "BM",        gred: "DG41", status: "tidak_aktif", lastLogin: "2024-12-01", password: "••••••••" },
];

const initialMurid = [
  { id: 1, nama: "Ahmad Faris",    noKad: "120510-14-1234", idDelima: "MR2024001", email: "faris@murid.edu.my",    kelas: "6 Amanah",    jantina: "L", status: "aktif",           lastLogin: "2025-01-20", password: "••••••••" },
  { id: 2, nama: "Nurul Hidayah",  noKad: "120615-10-5678", idDelima: "MR2024002", email: "hidayah@murid.edu.my",  kelas: "6 Amanah",    jantina: "P", status: "aktif",           lastLogin: "2025-01-20", password: "••••••••" },
  { id: 3, nama: "Muhammad Irfan", noKad: "130220-14-2345", idDelima: "MR2024003", email: "irfan@murid.edu.my",    kelas: "5 Bestari",   jantina: "L", status: "aktif",           lastLogin: "2025-01-19", password: "••••••••" },
  { id: 4, nama: "Siti Aisyah",    noKad: "130405-10-6789", idDelima: "MR2024004", email: "aisyah@murid.edu.my",   kelas: "5 Bestari",   jantina: "P", status: "aktif",           lastLogin: "2025-01-20", password: "••••••••" },
  { id: 5, nama: "Darwisyah",      noKad: "140710-14-3456", idDelima: "MR2024005", email: "darwisyah@murid.edu.my",kelas: "4 Cemerlang", jantina: "P", status: "kunci",           lastLogin: "2025-01-10", password: "••••••••" },
  { id: 6, nama: "Haziq Aiman",    noKad: "140812-14-7890", idDelima: "MR2024006", email: "haziq@murid.edu.my",    kelas: "4 Cemerlang", jantina: "L", status: "tukar_sekolah",   lastLogin: "2025-01-05", password: "••••••••" },
];

const STATUS_GURU = {
  aktif:       { bg: "bg-emerald-100", text: "text-emerald-700", label: "Aktif" },
  tidak_aktif: { bg: "bg-slate-100",   text: "text-slate-500",   label: "Tidak Aktif" },
  cuti:        { bg: "bg-yellow-100",  text: "text-yellow-700",  label: "Cuti" },
};

const STATUS_MURID = {
  aktif:         { bg: "bg-emerald-100", text: "text-emerald-700", label: "Aktif" },
  kunci:         { bg: "bg-red-100",     text: "text-red-700",     label: "Dikunci" },
  tukar_sekolah: { bg: "bg-slate-100",   text: "text-slate-500",   label: "Tukar Sekolah" },
  tidak_aktif:   { bg: "bg-yellow-100",  text: "text-yellow-700",  label: "Tidak Aktif" },
};

// ── HELPER ────────────────────────────────────────────────
const generatePassword = () => {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#";
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
};

// ── KOMPONEN UTAMA ────────────────────────────────────────
export default function SistemIDDelima() {
  const [tab, setTab] = useState("dashboard");
  const [subTab, setSubTab] = useState("guru");
  const [guru, setGuru] = useState(initialGuru);
  const [murid, setMurid] = useState(initialMurid);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [carian, setCarian] = useState("");
  const [nextGuruId, setNextGuruId] = useState(6);
  const [nextMuridId, setNextMuridId] = useState(7);

  // Form tambah baru
  const [formGuru, setFormGuru] = useState({ nama: "", noPekerja: "", email: "", noTel: "", subjek: "", gred: "DG41" });
  const [formMurid, setFormMurid] = useState({ nama: "", noKad: "", email: "", kelas: "", jantina: "L" });

  // State tukar password dalam modal
  const [pwForm, setPwForm] = useState({ baru: "", sahkan: "", show: false });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  // ── STATS ──
  const stats = {
    guruAktif:   guru.filter(g => g.status === "aktif").length,
    muridAktif:  murid.filter(m => m.status === "aktif").length,
    dikunci:     murid.filter(m => m.status === "kunci").length,
    tidakAktif:  [...guru, ...murid].filter(x => x.status === "tidak_aktif").length,
  };

  // ── ACTIONS ──
  const tukarPassword = (jenis, id, pwBaru) => {
    if (jenis === "guru") setGuru(p => p.map(g => g.id === id ? { ...g, password: "••••••••" } : g));
    else setMurid(p => p.map(m => m.id === id ? { ...m, password: "••••••••" } : m));
    showToast(`✅ Password berjaya ditukar! Password baru: ${pwBaru}`);
    setModal(null);
    setPwForm({ baru: "", sahkan: "", show: false });
  };

  const resetPassword = (jenis, id) => {
    const pw = generatePassword();
    tukarPassword(jenis, id, pw);
    showToast(`🔑 Password reset! Password baru: ${pw}`);
  };

  const toggleStatus = (jenis, id, statusBaru) => {
    if (jenis === "guru") setGuru(p => p.map(g => g.id === id ? { ...g, status: statusBaru } : g));
    else setMurid(p => p.map(m => m.id === id ? { ...m, status: statusBaru } : m));
    setModal(null);
    showToast("✅ Status berjaya dikemaskini!");
  };

  const tambahGuru = () => {
    if (!formGuru.nama || !formGuru.noPekerja || !formGuru.email) {
      showToast("Sila lengkapkan maklumat wajib!", "error"); return;
    }
    const id = `AIR2024${String(nextGuruId).padStart(3, "0")}`;
    setGuru(p => [...p, {
      ...formGuru, id: nextGuruId, idDelima: id,
      status: "aktif", lastLogin: "—", password: "••••••••",
    }]);
    setNextGuruId(n => n + 1);
    setFormGuru({ nama: "", noPekerja: "", email: "", noTel: "", subjek: "", gred: "DG41" });
    showToast("✅ ID DELIMA guru berjaya didaftarkan!");
    setTab("senarai");
  };

  const tambahMurid = () => {
    if (!formMurid.nama || !formMurid.noKad || !formMurid.kelas) {
      showToast("Sila lengkapkan maklumat wajib!", "error"); return;
    }
    const id = `MR2024${String(nextMuridId).padStart(3, "0")}`;
    setMurid(p => [...p, {
      ...formMurid, id: nextMuridId, idDelima: id,
      email: formMurid.email || `${formMurid.noKad.replace(/-/g, "")}@murid.edu.my`,
      status: "aktif", lastLogin: "—", password: "••••••••",
    }]);
    setNextMuridId(n => n + 1);
    setFormMurid({ nama: "", noKad: "", email: "", kelas: "", jantina: "L" });
    showToast("✅ ID DELIMA murid berjaya didaftarkan!");
    setTab("senarai");
  };

  const filteredGuru = guru.filter(g =>
    g.nama.toLowerCase().includes(carian.toLowerCase()) ||
    g.idDelima.toLowerCase().includes(carian.toLowerCase()) ||
    g.noPekerja.toLowerCase().includes(carian.toLowerCase())
  );

  const filteredMurid = murid.filter(m =>
    m.nama.toLowerCase().includes(carian.toLowerCase()) ||
    m.idDelima.toLowerCase().includes(carian.toLowerCase()) ||
    m.kelas.toLowerCase().includes(carian.toLowerCase())
  );

  const TABS = [
    { id: "dashboard", label: "🏠 Utama" },
    { id: "daftar",    label: "➕ Daftar" },
    { id: "senarai",   label: "👥 Senarai" },
    { id: "log",       label: "📜 Log" },
  ];

  return (
    <div className="min-h-screen bg-violet-50/50 font-sans">

      {/* TOAST */}
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-full text-sm font-semibold text-white shadow-xl transition-all max-w-xs text-center
          ${toast.type === "error" ? "bg-red-500" : "bg-violet-600"}`}>
          {toast.msg}
        </div>
      )}

      {/* HEADER */}
      <div className="bg-gradient-to-br from-violet-700 to-purple-500 text-white px-4 pt-5 pb-14 relative overflow-hidden">
        <div className="absolute -bottom-8 left-0 right-0 h-14 bg-violet-50/50 rounded-t-[50%]" />
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">🔐</div>
            <div>
              <div className="text-xs font-bold tracking-wide">PENGURUSAN ID</div>
              <div className="text-xs opacity-70">Sistem DELIMA</div>
            </div>
          </div>
          <div className="bg-white/20 text-xs font-semibold px-3 py-2 rounded-full">⚙️ Admin</div>
        </div>
        <div className="text-2xl font-extrabold">ID & Kata Laluan <span className="text-yellow-300">DELIMA</span></div>
        <div className="text-xs opacity-75 mt-1">Pengurusan akaun guru & murid</div>
      </div>

      {/* NAV */}
      <div className="sticky top-0 z-40 bg-violet-50/90 backdrop-blur px-4 pt-3 pb-1">
        <div className="flex gap-1.5 bg-white rounded-2xl p-1.5 shadow-md">
          {TABS.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setCarian(""); }}
              className={`flex-1 py-2 px-1 rounded-xl text-xs font-bold transition-all
                ${tab === t.id ? "bg-violet-600 text-white shadow-md" : "text-slate-400"}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pb-10 max-w-lg mx-auto">

        {/* ===== DASHBOARD ===== */}
        {tab === "dashboard" && (
          <div className="mt-4 space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { num: stats.guruAktif,   label: "Guru Aktif",       color: "text-violet-600", bg: "bg-violet-50",  icon: "👨‍🏫" },
                { num: stats.muridAktif,  label: "Murid Aktif",      color: "text-purple-600", bg: "bg-purple-50",  icon: "🎓" },
                { num: stats.dikunci,     label: "Akaun Dikunci",    color: "text-red-500",    bg: "bg-red-50",     icon: "🔒" },
                { num: stats.tidakAktif,  label: "Tidak Aktif",      color: "text-slate-500",  bg: "bg-slate-100",  icon: "⭕" },
              ].map((s, i) => (
                <div key={i} className={`${s.bg} rounded-2xl p-4 flex items-center gap-3`}>
                  <div className="text-2xl">{s.icon}</div>
                  <div>
                    <div className={`text-2xl font-extrabold ${s.color}`}>{s.num}</div>
                    <div className="text-xs text-slate-500 font-medium">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Alert akaun dikunci */}
            {stats.dikunci > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3 items-start">
                <div className="text-2xl">🔒</div>
                <div>
                  <div className="text-sm font-bold text-red-700">{stats.dikunci} Akaun Dikunci</div>
                  <div className="text-xs text-red-500 mt-1">Terdapat akaun murid yang perlu dibuka kunci.</div>
                  <button onClick={() => { setTab("senarai"); setSubTab("murid"); }}
                    className="mt-2 text-xs font-bold text-red-600 underline">Urus sekarang →</button>
                </div>
              </div>
            )}

            {/* Senarai ID Guru */}
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <div className="text-sm font-bold text-violet-700 mb-3 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-violet-50 rounded-lg flex items-center justify-center">👨‍🏫</span>
                  ID DELIMA Guru
                </span>
                <span className="text-xs text-violet-400 cursor-pointer" onClick={() => { setTab("senarai"); setSubTab("guru"); }}>Semua →</span>
              </div>
              {guru.slice(0, 4).map(g => (
                <IDRow key={g.id} nama={g.nama} id={g.idDelima} status={g.status} statusMap={STATUS_GURU}
                  sub={g.subjek} onClick={() => openModal("guru", g)} />
              ))}
            </div>

            {/* Senarai ID Murid */}
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <div className="text-sm font-bold text-violet-700 mb-3 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-violet-50 rounded-lg flex items-center justify-center">🎓</span>
                  ID DELIMA Murid
                </span>
                <span className="text-xs text-violet-400 cursor-pointer" onClick={() => { setTab("senarai"); setSubTab("murid"); }}>Semua →</span>
              </div>
              {murid.slice(0, 4).map(m => (
                <IDRow key={m.id} nama={m.nama} id={m.idDelima} status={m.status} statusMap={STATUS_MURID}
                  sub={m.kelas} onClick={() => openModal("murid", m)} />
              ))}
            </div>
          </div>
        )}

        {/* ===== DAFTAR ===== */}
        {tab === "daftar" && (
          <div className="mt-4">
            {/* Toggle Guru / Murid */}
            <div className="flex gap-2 bg-white rounded-2xl p-1.5 shadow-sm mb-4">
              {["guru", "murid"].map(s => (
                <button key={s} onClick={() => setSubTab(s)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all
                    ${subTab === s ? "bg-violet-600 text-white" : "text-slate-400"}`}>
                  {s === "guru" ? "👨‍🏫 Daftar Guru" : "🎓 Daftar Murid"}
                </button>
              ))}
            </div>

            {subTab === "guru" ? (
              <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
                <div className="text-sm font-bold text-violet-700 flex items-center gap-2">
                  <span className="w-7 h-7 bg-violet-50 rounded-lg flex items-center justify-center">📝</span>
                  Daftar ID DELIMA Guru Baru
                </div>
                <FormField label="Nama Penuh *">
                  <input value={formGuru.nama} onChange={e => setFormGuru(f => ({ ...f, nama: e.target.value }))}
                    placeholder="Nama penuh guru"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-slate-50 focus:outline-none focus:border-violet-400" />
                </FormField>
                <FormField label="No. Pekerja *">
                  <input value={formGuru.noPekerja} onChange={e => setFormGuru(f => ({ ...f, noPekerja: e.target.value }))}
                    placeholder="Contoh: G10239"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-slate-50 focus:outline-none focus:border-violet-400" />
                </FormField>
                <FormField label="E-mel *">
                  <input type="email" value={formGuru.email} onChange={e => setFormGuru(f => ({ ...f, email: e.target.value }))}
                    placeholder="nama@moe.edu.my"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-slate-50 focus:outline-none focus:border-violet-400" />
                </FormField>
                <FormField label="No. Telefon">
                  <input value={formGuru.noTel} onChange={e => setFormGuru(f => ({ ...f, noTel: e.target.value }))}
                    placeholder="01x-xxxxxxx"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-slate-50 focus:outline-none focus:border-violet-400" />
                </FormField>
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Subjek">
                    <input value={formGuru.subjek} onChange={e => setFormGuru(f => ({ ...f, subjek: e.target.value }))}
                      placeholder="Contoh: Sains"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-slate-50 focus:outline-none focus:border-violet-400" />
                  </FormField>
                  <FormField label="Gred">
                    <select value={formGuru.gred} onChange={e => setFormGuru(f => ({ ...f, gred: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-slate-50 focus:outline-none focus:border-violet-400">
                      {["DG29","DG32","DG34","DG38","DG41","DG44","DG48","DG52","DG54"].map(g => <option key={g}>{g}</option>)}
                    </select>
                  </FormField>
                </div>
                <div className="bg-violet-50 rounded-xl p-3 text-xs text-violet-600">
                  <div className="font-bold mb-1">ℹ️ ID DELIMA akan dijana automatik</div>
                  <div>Format: AIR2024XXX • Password sementara akan dihantar ke e-mel</div>
                </div>
                <button onClick={tambahGuru}
                  className="w-full bg-gradient-to-r from-violet-700 to-purple-500 text-white py-3.5 rounded-2xl text-sm font-bold shadow-lg active:scale-95 transition-transform">
                  🔐 Jana ID DELIMA Guru
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
                <div className="text-sm font-bold text-violet-700 flex items-center gap-2">
                  <span className="w-7 h-7 bg-violet-50 rounded-lg flex items-center justify-center">📝</span>
                  Daftar ID DELIMA Murid Baru
                </div>
                <FormField label="Nama Penuh *">
                  <input value={formMurid.nama} onChange={e => setFormMurid(f => ({ ...f, nama: e.target.value }))}
                    placeholder="Nama penuh murid"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-slate-50 focus:outline-none focus:border-violet-400" />
                </FormField>
                <FormField label="No. Kad Pengenalan *">
                  <input value={formMurid.noKad} onChange={e => setFormMurid(f => ({ ...f, noKad: e.target.value }))}
                    placeholder="xxxxxx-xx-xxxx"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-slate-50 focus:outline-none focus:border-violet-400" />
                </FormField>
                <FormField label="E-mel (jika ada)">
                  <input type="email" value={formMurid.email} onChange={e => setFormMurid(f => ({ ...f, email: e.target.value }))}
                    placeholder="email@murid.edu.my"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-slate-50 focus:outline-none focus:border-violet-400" />
                </FormField>
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Kelas *">
                    <input value={formMurid.kelas} onChange={e => setFormMurid(f => ({ ...f, kelas: e.target.value }))}
                      placeholder="Contoh: 6 Amanah"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-slate-50 focus:outline-none focus:border-violet-400" />
                  </FormField>
                  <FormField label="Jantina">
                    <select value={formMurid.jantina} onChange={e => setFormMurid(f => ({ ...f, jantina: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-slate-50 focus:outline-none focus:border-violet-400">
                      <option value="L">Lelaki</option>
                      <option value="P">Perempuan</option>
                    </select>
                  </FormField>
                </div>
                <div className="bg-violet-50 rounded-xl p-3 text-xs text-violet-600">
                  <div className="font-bold mb-1">ℹ️ ID DELIMA akan dijana automatik</div>
                  <div>Format: MR2024XXX • Default password: No. Kad (tanpa '-')</div>
                </div>
                <button onClick={tambahMurid}
                  className="w-full bg-gradient-to-r from-violet-700 to-purple-500 text-white py-3.5 rounded-2xl text-sm font-bold shadow-lg active:scale-95 transition-transform">
                  🔐 Jana ID DELIMA Murid
                </button>
              </div>
            )}
          </div>
        )}

        {/* ===== SENARAI ===== */}
        {tab === "senarai" && (
          <div className="mt-4">
            <div className="flex gap-2 bg-white rounded-2xl p-1.5 shadow-sm mb-3">
              {["guru", "murid"].map(s => (
                <button key={s} onClick={() => { setSubTab(s); setCarian(""); }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all
                    ${subTab === s ? "bg-violet-600 text-white" : "text-slate-400"}`}>
                  {s === "guru" ? `👨‍🏫 Guru (${guru.length})` : `🎓 Murid (${murid.length})`}
                </button>
              ))}
            </div>

            <div className="relative mb-3">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
              <input value={carian} onChange={e => setCarian(e.target.value)}
                placeholder={subTab === "guru" ? "Cari nama, ID, no. pekerja..." : "Cari nama, ID, kelas..."}
                className="w-full border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm bg-white focus:outline-none focus:border-violet-400" />
            </div>

            {subTab === "guru"
              ? filteredGuru.map(g => (
                <div key={g.id} className="bg-white rounded-2xl shadow-sm p-4 mb-2.5 cursor-pointer active:bg-violet-50 transition-colors"
                  onClick={() => openModal("guru", g)}>
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-violet-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">👨‍🏫</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-slate-700">{g.nama}</div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">{g.idDelima}</div>
                      <div className="text-xs text-slate-400">{g.subjek} • {g.gred} • {g.noPekerja}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <StatusBadge status={g.status} map={STATUS_GURU} />
                      <div className="text-xs text-slate-300">Login: {g.lastLogin}</div>
                    </div>
                  </div>
                </div>
              ))
              : filteredMurid.map(m => (
                <div key={m.id} className="bg-white rounded-2xl shadow-sm p-4 mb-2.5 cursor-pointer active:bg-violet-50 transition-colors"
                  onClick={() => openModal("murid", m)}>
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${m.jantina === "P" ? "bg-pink-100" : "bg-blue-100"}`}>
                      {m.jantina === "P" ? "👧" : "👦"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-slate-700">{m.nama}</div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">{m.idDelima}</div>
                      <div className="text-xs text-slate-400">{m.kelas} • {m.noKad}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <StatusBadge status={m.status} map={STATUS_MURID} />
                      <div className="text-xs text-slate-300">Login: {m.lastLogin}</div>
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        )}

        {/* ===== LOG AKTIVITI ===== */}
        {tab === "log" && (
          <div className="mt-4 space-y-2.5">
            <div className="text-xs font-bold text-slate-400 mb-3">Rekod aktiviti pengurusan akaun terkini</div>
            {[
              { masa: "Hari ini, 09:15", tindakan: "Reset password", pengguna: "Cikgu Aishah Noor", oleh: "Admin", icon: "🔑", color: "bg-yellow-50 border-yellow-200" },
              { masa: "Hari ini, 08:42", tindakan: "Daftar ID baru", pengguna: "Haziq Aiman", oleh: "Admin", icon: "➕", color: "bg-emerald-50 border-emerald-200" },
              { masa: "Semalam, 16:30", tindakan: "Kunci akaun", pengguna: "Darwisyah", oleh: "Admin", icon: "🔒", color: "bg-red-50 border-red-200" },
              { masa: "Semalam, 14:10", tindakan: "Tukar password", pengguna: "Cikgu Hafiz Rahman", oleh: "Cikgu Hafiz", icon: "🔐", color: "bg-violet-50 border-violet-200" },
              { masa: "20 Jan, 11:00", tindakan: "Aktifkan semula", pengguna: "Cikgu Fatimah Zain", oleh: "Admin", icon: "✅", color: "bg-blue-50 border-blue-200" },
              { masa: "19 Jan, 09:25", tindakan: "Tukar e-mel", pengguna: "Ahmad Faris", oleh: "Admin", icon: "✉️", color: "bg-slate-50 border-slate-200" },
              { masa: "18 Jan, 15:45", tindakan: "Jana ID baru", pengguna: "Siti Aisyah", oleh: "Admin", icon: "🆔", color: "bg-purple-50 border-purple-200" },
            ].map((log, i) => (
              <div key={i} className={`rounded-2xl border p-4 flex items-start gap-3 ${log.color}`}>
                <div className="text-xl mt-0.5">{log.icon}</div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-slate-700">{log.tindakan}</div>
                  <div className="text-xs text-slate-500 mt-0.5">Pengguna: <span className="font-semibold">{log.pengguna}</span></div>
                  <div className="text-xs text-slate-400">Oleh: {log.oleh} • {log.masa}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===== MODAL ===== */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center"
          onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="bg-white rounded-t-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-5" />

            {modal.jenis === "guru" && (() => {
              const g = modal.data;
              const s = STATUS_GURU[g.status] || STATUS_GURU.aktif;
              return (
                <>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-14 h-14 bg-violet-100 rounded-2xl flex items-center justify-center text-3xl">👨‍🏫</div>
                    <div>
                      <div className="text-base font-extrabold text-violet-700">{g.nama}</div>
                      <div className="font-mono text-xs text-slate-400 mt-0.5">{g.idDelima}</div>
                    </div>
                  </div>

                  {[["No. Pekerja", g.noPekerja], ["E-mel", g.email], ["No. Tel", g.noTel || "—"],
                    ["Subjek", g.subjek], ["Gred", g.gred], ["Login Terakhir", g.lastLogin]].map(([k, v]) => (
                    <div key={k} className="flex justify-between py-2 border-b border-slate-50">
                      <span className="text-xs text-slate-400">{k}</span>
                      <span className="text-xs font-bold text-slate-700">{v}</span>
                    </div>
                  ))}

                  <div className="flex justify-between py-2 border-b border-slate-50">
                    <span className="text-xs text-slate-400">Status</span>
                    <StatusBadge status={g.status} map={STATUS_GURU} />
                  </div>

                  {/* Tukar Password */}
                  <PasswordSection
                    pwForm={pwForm} setPwForm={setPwForm}
                    onTukar={() => {
                      if (!pwForm.baru || pwForm.baru !== pwForm.sahkan) {
                        showToast("Password tidak sepadan!", "error"); return;
                      }
                      if (pwForm.baru.length < 8) {
                        showToast("Password minimum 8 aksara!", "error"); return;
                      }
                      tukarPassword("guru", g.id, pwForm.baru);
                    }}
                    onReset={() => resetPassword("guru", g.id)}
                  />

                  {/* Tukar Status */}
                  <div className="mt-4">
                    <div className="text-xs font-bold text-slate-500 mb-2">Urus Status Akaun</div>
                    <div className="flex gap-2 flex-wrap">
                      {g.status !== "aktif" && (
                        <button onClick={() => toggleStatus("guru", g.id, "aktif")}
                          className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold">✅ Aktifkan</button>
                      )}
                      {g.status !== "tidak_aktif" && (
                        <button onClick={() => toggleStatus("guru", g.id, "tidak_aktif")}
                          className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold">⭕ Nyahaktif</button>
                      )}
                      {g.status !== "cuti" && (
                        <button onClick={() => toggleStatus("guru", g.id, "cuti")}
                          className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-xl text-xs font-bold">🌴 Cuti</button>
                      )}
                    </div>
                  </div>

                  <button onClick={closeModal} className="w-full mt-5 border border-slate-200 text-slate-400 py-3 rounded-2xl text-sm font-bold">Tutup</button>
                </>
              );
            })()}

            {modal.jenis === "murid" && (() => {
              const m = modal.data;
              return (
                <>
                  <div className="flex items-center gap-3 mb-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl ${m.jantina === "P" ? "bg-pink-100" : "bg-blue-100"}`}>
                      {m.jantina === "P" ? "👧" : "👦"}
                    </div>
                    <div>
                      <div className="text-base font-extrabold text-violet-700">{m.nama}</div>
                      <div className="font-mono text-xs text-slate-400 mt-0.5">{m.idDelima}</div>
                    </div>
                  </div>

                  {[["No. Kad", m.noKad], ["E-mel", m.email], ["Kelas", m.kelas],
                    ["Jantina", m.jantina === "L" ? "Lelaki" : "Perempuan"], ["Login Terakhir", m.lastLogin]].map(([k, v]) => (
                    <div key={k} className="flex justify-between py-2 border-b border-slate-50">
                      <span className="text-xs text-slate-400">{k}</span>
                      <span className="text-xs font-bold text-slate-700">{v}</span>
                    </div>
                  ))}

                  <div className="flex justify-between py-2 border-b border-slate-50">
                    <span className="text-xs text-slate-400">Status</span>
                    <StatusBadge status={m.status} map={STATUS_MURID} />
                  </div>

                  {/* Tukar Password */}
                  <PasswordSection
                    pwForm={pwForm} setPwForm={setPwForm}
                    onTukar={() => {
                      if (!pwForm.baru || pwForm.baru !== pwForm.sahkan) {
                        showToast("Password tidak sepadan!", "error"); return;
                      }
                      if (pwForm.baru.length < 6) {
                        showToast("Password minimum 6 aksara!", "error"); return;
                      }
                      tukarPassword("murid", m.id, pwForm.baru);
                    }}
                    onReset={() => resetPassword("murid", m.id)}
                  />

                  {/* Urus Status */}
                  <div className="mt-4">
                    <div className="text-xs font-bold text-slate-500 mb-2">Urus Status Akaun</div>
                    <div className="flex gap-2 flex-wrap">
                      {m.status !== "aktif" && (
                        <button onClick={() => toggleStatus("murid", m.id, "aktif")}
                          className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold">✅ Aktifkan</button>
                      )}
                      {m.status !== "kunci" && (
                        <button onClick={() => toggleStatus("murid", m.id, "kunci")}
                          className="px-4 py-2 bg-red-100 text-red-600 rounded-xl text-xs font-bold">🔒 Kunci</button>
                      )}
                      {m.status !== "tukar_sekolah" && (
                        <button onClick={() => toggleStatus("murid", m.id, "tukar_sekolah")}
                          className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold">🏫 Tukar Sekolah</button>
                      )}
                    </div>
                  </div>

                  <button onClick={closeModal} className="w-full mt-5 border border-slate-200 text-slate-400 py-3 rounded-2xl text-sm font-bold">Tutup</button>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );

  function openModal(jenis, data) {
    setPwForm({ baru: "", sahkan: "", show: false });
    setModal({ jenis, data });
  }

  function closeModal() {
    setModal(null);
    setPwForm({ baru: "", sahkan: "", show: false });
  }
}

// ── SUB-KOMPONEN ──────────────────────────────────────────
function PasswordSection({ pwForm, setPwForm, onTukar, onReset }) {
  return (
    <div className="mt-4 bg-violet-50 rounded-2xl p-4">
      <div className="text-xs font-bold text-violet-700 mb-3 flex items-center gap-2">🔐 Pengurusan Kata Laluan</div>
      <div className="space-y-2.5 mb-3">
        <div>
          <label className="block text-xs text-slate-500 mb-1">Password Baru</label>
          <div className="relative">
            <input type={pwForm.show ? "text" : "password"} value={pwForm.baru}
              onChange={e => setPwForm(f => ({ ...f, baru: e.target.value }))}
              placeholder="Masukkan password baru"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-sm bg-white focus:outline-none focus:border-violet-400" />
            <button onClick={() => setPwForm(f => ({ ...f, show: !f.show }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              {pwForm.show ? "🙈" : "👁️"}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Sahkan Password</label>
          <input type={pwForm.show ? "text" : "password"} value={pwForm.sahkan}
            onChange={e => setPwForm(f => ({ ...f, sahkan: e.target.value }))}
            placeholder="Ulang password baru"
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-violet-400" />
        </div>
        {pwForm.baru && pwForm.sahkan && (
          <div className={`text-xs font-semibold ${pwForm.baru === pwForm.sahkan ? "text-emerald-600" : "text-red-500"}`}>
            {pwForm.baru === pwForm.sahkan ? "✅ Password sepadan" : "❌ Password tidak sepadan"}
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <button onClick={onTukar}
          className="flex-1 bg-violet-600 text-white py-2.5 rounded-xl text-xs font-bold active:scale-95 transition-transform">
          💾 Simpan Password
        </button>
        <button onClick={onReset}
          className="px-4 bg-white border border-slate-200 text-slate-500 py-2.5 rounded-xl text-xs font-bold active:scale-95 transition-transform">
          🔑 Reset
        </button>
      </div>
    </div>
  );
}

function IDRow({ nama, id, status, statusMap, sub, onClick }) {
  return (
    <div onClick={onClick} className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0 cursor-pointer active:bg-violet-50 rounded-xl px-1 -mx-1 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="text-xs font-bold text-slate-700 truncate">{nama}</div>
        <div className="text-xs font-mono text-slate-400">{id} • {sub}</div>
      </div>
      <StatusBadge status={status} map={statusMap} />
    </div>
  );
}

function StatusBadge({ status, map }) {
  const s = map[status] || { bg: "bg-slate-100", text: "text-slate-500", label: status };
  return <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${s.bg} ${s.text}`}>{s.label}</span>;
}

function FormField({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-violet-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
