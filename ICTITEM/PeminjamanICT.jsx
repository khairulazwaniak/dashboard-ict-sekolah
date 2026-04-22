import { useState } from "react";

const initialItems = [
  { id: 1, nama: "Laptop Acer", kod: "ICT-LP-001", kategori: "Laptop", kuantiti: 5, tersedia: 3 },
  { id: 2, nama: "Projektor Epson", kod: "ICT-PJ-001", kategori: "Projektor", kuantiti: 4, tersedia: 2 },
  { id: 3, nama: "iPad Gen 9", kod: "ICT-TB-001", kategori: "Tablet", kuantiti: 10, tersedia: 7 },
  { id: 4, nama: "Kamera DSLR Canon", kod: "ICT-KM-001", kategori: "Kamera", kuantiti: 2, tersedia: 2 },
  { id: 5, nama: "Speaker Bluetooth", kod: "ICT-SP-001", kategori: "Audio", kuantiti: 6, tersedia: 4 },
  { id: 6, nama: "Mikrofon Wireless", kod: "ICT-MK-001", kategori: "Audio", kuantiti: 3, tersedia: 1 },
];

const initialPeminjaman = [
  { id: 1, peminjam: "Cikgu Aishah", jawatan: "Guru Sains", barang: "Laptop Acer", kod: "ICT-LP-001", kuantiti: 1, tarikh_pinjam: "2025-01-18", tarikh_pulang: "2025-01-20", status: "dipulangkan", catatan: "" },
  { id: 2, peminjam: "Cikgu Hafiz", jawatan: "Guru IT", barang: "Projektor Epson", kod: "ICT-PJ-001", kuantiti: 1, tarikh_pinjam: "2025-01-19", tarikh_pulang: "2025-01-21", status: "dipinjam", catatan: "Untuk taklimat ibu bapa" },
  { id: 3, peminjam: "Cikgu Nurul", jawatan: "Guru Matematik", barang: "iPad Gen 9", kod: "ICT-TB-001", kuantiti: 3, tarikh_pinjam: "2025-01-20", tarikh_pulang: "2025-01-22", status: "dipinjam", catatan: "Kelas digital" },
  { id: 4, peminjam: "Cikgu Roslan", jawatan: "Guru Fizik", barang: "Kamera DSLR Canon", kod: "ICT-KM-001", kuantiti: 1, tarikh_pinjam: "2025-01-15", tarikh_pulang: "2025-01-16", status: "dipulangkan", catatan: "" },
  { id: 5, peminjam: "Cikgu Fatimah", jawatan: "Guru BM", barang: "Mikrofon Wireless", kod: "ICT-MK-001", kuantiti: 2, tarikh_pinjam: "2025-01-20", tarikh_pulang: "2025-01-21", status: "lewat", catatan: "Drama sekolah" },
];

const KATEGORI_ICON = {
  Laptop: "💻", Projektor: "📽️", Tablet: "📱",
  Kamera: "📷", Audio: "🎙️", Lain: "📦",
};

const STATUS_STYLE = {
  dipinjam:    { bg: "bg-blue-100",   text: "text-blue-700",   label: "Dipinjam" },
  dipulangkan: { bg: "bg-green-100",  text: "text-green-700",  label: "Dipulangkan" },
  lewat:       { bg: "bg-red-100",    text: "text-red-700",    label: "Lewat" },
  pending:     { bg: "bg-yellow-100", text: "text-yellow-700", label: "Menunggu" },
};

export default function PeminjamanICT() {
  const [tab, setTab] = useState("dashboard");
  const [items, setItems] = useState(initialItems);
  const [peminjaman, setPeminjaman] = useState(initialPeminjaman);
  const [filterStatus, setFilterStatus] = useState("semua");
  const [modal, setModal] = useState(null); // null | { type, data }
  const [toast, setToast] = useState(null);
  const [nextId, setNextId] = useState(6);

  // Form state
  const [form, setForm] = useState({
    peminjam: "", jawatan: "", barang: "", kod: "",
    kuantiti: 1, tarikh_pinjam: new Date().toISOString().slice(0, 10),
    tarikh_pulang: "", catatan: "",
  });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const stats = {
    totalBarang: items.length,
    sedangDipinjam: peminjaman.filter(p => p.status === "dipinjam").length,
    lewat: peminjaman.filter(p => p.status === "lewat").length,
    dipulangkan: peminjaman.filter(p => p.status === "dipulangkan").length,
  };

  const filteredPeminjaman = filterStatus === "semua"
    ? peminjaman
    : peminjaman.filter(p => p.status === filterStatus);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (name === "barang") {
      const item = items.find(i => i.nama === value);
      setForm(f => ({ ...f, barang: value, kod: item?.kod || "" }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const submitPeminjaman = () => {
    if (!form.peminjam || !form.barang || !form.tarikh_pinjam || !form.tarikh_pulang) {
      showToast("Sila lengkapkan semua maklumat!", "error"); return;
    }
    const item = items.find(i => i.nama === form.barang);
    if (!item || item.tersedia < form.kuantiti) {
      showToast("Stok tidak mencukupi!", "error"); return;
    }
    setPeminjaman(p => [...p, { ...form, id: nextId, kuantiti: parseInt(form.kuantiti), status: "dipinjam" }]);
    setItems(prev => prev.map(i => i.nama === form.barang ? { ...i, tersedia: i.tersedia - parseInt(form.kuantiti) } : i));
    setNextId(n => n + 1);
    setForm({ peminjam: "", jawatan: "", barang: "", kod: "", kuantiti: 1, tarikh_pinjam: new Date().toISOString().slice(0, 10), tarikh_pulang: "", catatan: "" });
    showToast("✅ Rekod peminjaman berjaya disimpan!");
    setTab("senarai");
  };

  const pulangBarang = (id) => {
    const rec = peminjaman.find(p => p.id === id);
    setPeminjaman(p => p.map(x => x.id === id ? { ...x, status: "dipulangkan" } : x));
    setItems(prev => prev.map(i => i.nama === rec.barang ? { ...i, tersedia: i.tersedia + rec.kuantiti } : i));
    setModal(null);
    showToast("✅ Barang berjaya dipulangkan!", "success");
  };

  const TABS = [
    { id: "dashboard", label: "🏠 Utama" },
    { id: "pinjam",    label: "➕ Pinjam" },
    { id: "senarai",   label: "📋 Senarai" },
    { id: "inventori", label: "📦 Inventori" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* TOAST */}
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-full text-sm font-semibold text-white shadow-lg transition-all
          ${toast.type === "error" ? "bg-red-500" : "bg-emerald-500"}`}>
          {toast.msg}
        </div>
      )}

      {/* HEADER */}
      <div className="bg-gradient-to-br from-indigo-700 to-indigo-500 text-white px-4 pt-5 pb-14 relative overflow-hidden">
        <div className="absolute -bottom-8 left-0 right-0 h-14 bg-slate-50 rounded-t-[50%]" />
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">💻</div>
            <div>
              <div className="text-xs font-bold tracking-wide">SISTEM PEMINJAMAN</div>
              <div className="text-xs opacity-70">Barang-barang ICT</div>
            </div>
          </div>
          <div className="bg-white/20 text-xs font-semibold px-3 py-2 rounded-full">👤 Admin</div>
        </div>
        <div className="text-2xl font-extrabold">Rekod <span className="text-yellow-300">Peminjaman ICT</span></div>
        <div className="text-xs opacity-75 mt-1">Pengurusan aset digital sekolah</div>
      </div>

      {/* NAV */}
      <div className="sticky top-0 z-40 bg-slate-50 px-4 pt-3 pb-1">
        <div className="flex gap-2 bg-white rounded-2xl p-1.5 shadow-md overflow-x-auto scrollbar-hide">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 min-w-[72px] py-2 px-2 rounded-xl text-xs font-bold transition-all
                ${tab === t.id ? "bg-indigo-700 text-white shadow-md" : "text-slate-400"}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pb-10 max-w-lg mx-auto">

        {/* ===== DASHBOARD ===== */}
        {tab === "dashboard" && (
          <div className="mt-4 space-y-4 animate-fadeIn">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { num: stats.totalBarang,     label: "Jenis Barang",  color: "text-indigo-600", bg: "bg-indigo-50" },
                { num: stats.sedangDipinjam,  label: "Sedang Dipinjam", color: "text-blue-600",   bg: "bg-blue-50" },
                { num: stats.lewat,           label: "Lewat Pulang", color: "text-red-500",    bg: "bg-red-50" },
                { num: stats.dipulangkan,     label: "Dipulangkan",  color: "text-emerald-600",bg: "bg-emerald-50" },
              ].map((s, i) => (
                <div key={i} className={`${s.bg} rounded-2xl p-4`}>
                  <div className={`text-3xl font-extrabold ${s.color}`}>{s.num}</div>
                  <div className="text-xs text-slate-500 font-medium mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Lewat Alert */}
            {stats.lewat > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3 items-start">
                <div className="text-2xl">⚠️</div>
                <div>
                  <div className="text-sm font-bold text-red-700">{stats.lewat} Peminjaman Lewat!</div>
                  <div className="text-xs text-red-500 mt-1">Sila hubungi peminjam untuk pulangkan barang segera.</div>
                </div>
              </div>
            )}

            {/* Inventori Ringkas */}
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <div className="text-sm font-bold text-indigo-700 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-indigo-50 rounded-lg flex items-center justify-center text-sm">📦</span>
                Status Inventori
              </div>
              <div className="space-y-3">
                {items.map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                      {KATEGORI_ICON[item.kategori] || "📦"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-700 truncate">{item.nama}</div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5">
                        <div className={`h-1.5 rounded-full ${item.tersedia === 0 ? "bg-red-400" : item.tersedia < item.kuantiti / 2 ? "bg-yellow-400" : "bg-emerald-400"}`}
                          style={{ width: `${(item.tersedia / item.kuantiti) * 100}%` }} />
                      </div>
                    </div>
                    <div className="text-xs font-bold text-slate-500 flex-shrink-0">
                      {item.tersedia}/{item.kuantiti}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Terkini */}
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <div className="text-sm font-bold text-indigo-700 mb-3 flex items-center justify-between">
                <span className="flex items-center gap-2"><span className="w-6 h-6 bg-indigo-50 rounded-lg flex items-center justify-center">📋</span>Terkini</span>
                <span className="text-xs text-indigo-400 cursor-pointer" onClick={() => setTab("senarai")}>Lihat semua →</span>
              </div>
              {[...peminjaman].reverse().slice(0, 3).map(p => (
                <PeminjamanItem key={p.id} p={p} onClick={() => setModal({ type: "detail", data: p })} />
              ))}
            </div>
          </div>
        )}

        {/* ===== FORM PINJAM ===== */}
        {tab === "pinjam" && (
          <div className="mt-4 bg-white rounded-2xl shadow-sm p-5 space-y-4 animate-fadeIn">
            <div className="text-sm font-bold text-indigo-700 flex items-center gap-2">
              <span className="w-7 h-7 bg-indigo-50 rounded-lg flex items-center justify-center">📝</span>
              Borang Peminjaman Baru
            </div>

            {[
              { label: "Nama Peminjam", name: "peminjam", type: "text", placeholder: "Nama penuh" },
              { label: "Jawatan", name: "jawatan", type: "text", placeholder: "Contoh: Guru Sains" },
            ].map(f => (
              <FormField key={f.name} label={f.label}>
                <input name={f.name} type={f.type} value={form[f.name]} onChange={handleFormChange}
                  placeholder={f.placeholder}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-slate-50 focus:outline-none focus:border-indigo-400" />
              </FormField>
            ))}

            <FormField label="Pilih Barang">
              <select name="barang" value={form.barang} onChange={handleFormChange}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-slate-50 focus:outline-none focus:border-indigo-400">
                <option value="">-- Pilih Barang --</option>
                {items.filter(i => i.tersedia > 0).map(i => (
                  <option key={i.id} value={i.nama}>{i.nama} (Tersedia: {i.tersedia})</option>
                ))}
              </select>
            </FormField>

            {form.kod && (
              <div className="bg-indigo-50 rounded-xl px-4 py-2.5 text-xs text-indigo-600 font-semibold">
                Kod Aset: {form.kod}
              </div>
            )}

            <FormField label="Kuantiti">
              <input name="kuantiti" type="number" min="1" value={form.kuantiti} onChange={handleFormChange}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-slate-50 focus:outline-none focus:border-indigo-400" />
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Tarikh Pinjam">
                <input name="tarikh_pinjam" type="date" value={form.tarikh_pinjam} onChange={handleFormChange}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-slate-50 focus:outline-none focus:border-indigo-400" />
              </FormField>
              <FormField label="Tarikh Pulang">
                <input name="tarikh_pulang" type="date" value={form.tarikh_pulang} onChange={handleFormChange}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-slate-50 focus:outline-none focus:border-indigo-400" />
              </FormField>
            </div>

            <FormField label="Catatan">
              <textarea name="catatan" value={form.catatan} onChange={handleFormChange}
                placeholder="Tujuan peminjaman..."
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-slate-50 focus:outline-none focus:border-indigo-400 resize-none h-20" />
            </FormField>

            <button onClick={submitPeminjaman}
              className="w-full bg-gradient-to-r from-indigo-700 to-indigo-500 text-white py-3.5 rounded-2xl text-sm font-bold shadow-lg active:scale-95 transition-transform">
              💾 Simpan Rekod Peminjaman
            </button>
          </div>
        )}

        {/* ===== SENARAI ===== */}
        {tab === "senarai" && (
          <div className="mt-4 animate-fadeIn">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-3">
              {["semua", "dipinjam", "lewat", "dipulangkan"].map(s => (
                <button key={s} onClick={() => setFilterStatus(s)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold border whitespace-nowrap transition-all
                    ${filterStatus === s ? "bg-indigo-700 text-white border-indigo-700" : "bg-white text-slate-400 border-slate-200"}`}>
                  {s === "semua" ? "Semua" : STATUS_STYLE[s]?.label}
                </button>
              ))}
            </div>
            {filteredPeminjaman.length === 0
              ? <EmptyState msg="Tiada rekod ditemui" />
              : [...filteredPeminjaman].reverse().map(p => (
                <PeminjamanItem key={p.id} p={p} onClick={() => setModal({ type: "detail", data: p })} />
              ))
            }
          </div>
        )}

        {/* ===== INVENTORI ===== */}
        {tab === "inventori" && (
          <div className="mt-4 space-y-3 animate-fadeIn">
            {items.map(item => (
              <div key={item.id} className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-4"
                onClick={() => setModal({ type: "item", data: item })}>
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                  {KATEGORI_ICON[item.kategori] || "📦"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-slate-700">{item.nama}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{item.kod} • {item.kategori}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 bg-slate-100 rounded-full h-2">
                      <div className={`h-2 rounded-full ${item.tersedia === 0 ? "bg-red-400" : item.tersedia < item.kuantiti / 2 ? "bg-yellow-400" : "bg-emerald-400"}`}
                        style={{ width: `${(item.tersedia / item.kuantiti) * 100}%` }} />
                    </div>
                    <span className="text-xs font-bold text-slate-500">{item.tersedia}/{item.kuantiti}</span>
                  </div>
                </div>
                <div className={`text-xs font-bold px-2.5 py-1 rounded-full ${item.tersedia === 0 ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"}`}>
                  {item.tersedia === 0 ? "Habis" : "Ada"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===== MODAL ===== */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center" onClick={(e) => e.target === e.currentTarget && setModal(null)}>
          <div className="bg-white rounded-t-3xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-6 animate-slideUp">
            <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-5" />

            {modal.type === "detail" && (() => {
              const p = modal.data;
              const live = peminjaman.find(x => x.id === p.id);
              const s = STATUS_STYLE[live?.status] || STATUS_STYLE.dipinjam;
              return (
                <>
                  <div className="text-base font-extrabold text-indigo-700 mb-4">Detail Peminjaman #{p.id}</div>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${s.bg} ${s.text} mb-4`}>{s.label}</div>
                  {[
                    ["Peminjam", p.peminjam], ["Jawatan", p.jawatan], ["Barang", p.barang],
                    ["Kod Aset", p.kod], ["Kuantiti", p.kuantiti + " unit"],
                    ["Tarikh Pinjam", p.tarikh_pinjam], ["Tarikh Pulang", p.tarikh_pulang],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between py-2 border-b border-slate-50">
                      <span className="text-xs text-slate-400 font-medium">{k}</span>
                      <span className="text-xs font-bold text-slate-700">{v}</span>
                    </div>
                  ))}
                  {p.catatan && <div className="mt-3 text-xs bg-slate-50 rounded-xl p-3 text-slate-600">{p.catatan}</div>}
                  {live?.status === "dipinjam" || live?.status === "lewat" ? (
                    <button onClick={() => pulangBarang(p.id)}
                      className="w-full mt-4 bg-emerald-500 text-white py-3 rounded-2xl text-sm font-bold">
                      ✅ Tandakan Dipulangkan
                    </button>
                  ) : null}
                  <button onClick={() => setModal(null)} className="w-full mt-2 border border-slate-200 text-slate-400 py-3 rounded-2xl text-sm font-bold">Tutup</button>
                </>
              );
            })()}

            {modal.type === "item" && (() => {
              const item = modal.data;
              const rekodBarang = peminjaman.filter(p => p.barang === item.nama && p.status !== "dipulangkan");
              return (
                <>
                  <div className="text-base font-extrabold text-indigo-700 mb-1">{item.nama}</div>
                  <div className="text-xs text-slate-400 mb-4">{item.kod}</div>
                  {[["Kategori", item.kategori], ["Jumlah", item.kuantiti + " unit"], ["Tersedia", item.tersedia + " unit"]].map(([k, v]) => (
                    <div key={k} className="flex justify-between py-2 border-b border-slate-50">
                      <span className="text-xs text-slate-400">{k}</span>
                      <span className="text-xs font-bold text-slate-700">{v}</span>
                    </div>
                  ))}
                  {rekodBarang.length > 0 && (
                    <div className="mt-4">
                      <div className="text-xs font-bold text-slate-600 mb-2">Sedang Dipinjam Oleh:</div>
                      {rekodBarang.map(r => (
                        <div key={r.id} className="bg-slate-50 rounded-xl px-3 py-2 text-xs mb-2">
                          <span className="font-bold">{r.peminjam}</span> — {r.kuantiti} unit • Pulang: {r.tarikh_pulang}
                        </div>
                      ))}
                    </div>
                  )}
                  <button onClick={() => setModal(null)} className="w-full mt-4 border border-slate-200 text-slate-400 py-3 rounded-2xl text-sm font-bold">Tutup</button>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

function PeminjamanItem({ p, onClick }) {
  const s = STATUS_STYLE[p.status] || STATUS_STYLE.dipinjam;
  const icon = KATEGORI_ICON;
  return (
    <div onClick={onClick} className="flex items-start gap-3 p-3.5 bg-white rounded-2xl mb-2.5 shadow-sm border border-slate-50 cursor-pointer active:bg-slate-50 transition-colors">
      <div className="w-11 h-11 bg-slate-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
        {Object.entries(icon).find(([k]) => p.barang.toLowerCase().includes(k.toLowerCase()))?.[1] || "📦"}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-bold text-slate-700">{p.peminjam}</div>
        <div className="text-xs text-slate-400 mt-0.5 truncate">{p.barang} • {p.kuantiti} unit</div>
        <div className="text-xs text-slate-400">📅 {p.tarikh_pinjam} → {p.tarikh_pulang}</div>
      </div>
      <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${s.bg} ${s.text}`}>{s.label}</span>
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-indigo-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function EmptyState({ msg }) {
  return (
    <div className="text-center py-12 text-slate-400">
      <div className="text-5xl mb-3">📭</div>
      <div className="text-sm">{msg}</div>
    </div>
  );
}
