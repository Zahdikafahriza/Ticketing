import Link from 'next/link';
import { getKlasifikasiKeluhan, getAnalisisPenyebab, getMonitoringSLA, getLaporanBulanan } from '@/lib/laporan';

export const dynamic = 'force-dynamic';

function awalMingguIni() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  const hari = d.getDay(); // 0 = Minggu
  const selisih = hari === 0 ? 6 : hari - 1; // mulai Senin
  d.setDate(d.getDate() - selisih);
  return d;
}

export default async function LaporanHubPage() {
  const mingguMulai = awalMingguIni();
  const mingguSelesai = new Date(mingguMulai);
  mingguSelesai.setDate(mingguSelesai.getDate() + 7);

  const now = new Date();

  const [klasifikasi, penyebab, sla, bulanan] = await Promise.all([
    getKlasifikasiKeluhan({}),
    getAnalisisPenyebab({ dari: mingguMulai, sampai: mingguSelesai }),
    getMonitoringSLA(),
    getLaporanBulanan(now.getFullYear(), now.getMonth() + 1),
  ]);

  const topKeluhan = klasifikasi.kategoriRows[0];
  const topPenyebab = penyebab.rows[0];

  const laporanCards = [
    {
      href: '/laporan/klasifikasi',
      no: 1,
      title: 'Rekap & Klasifikasi Keluhan',
      goal: 'Mengetahui masalah yang paling sering terjadi dan area prioritas',
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2',
      color: 'bg-brand-50 text-brand-600',
      stat: topKeluhan ? `${topKeluhan.label} · ${topKeluhan.jumlah} tiket (${topKeluhan.persen}%)` : 'Belum ada data',
      statLabel: 'Keluhan paling sering',
    },
    {
      href: '/laporan/penyebab',
      no: 2,
      title: 'Analisis Penyebab per Area',
      goal: 'Menentukan tindakan pencegahan per area (data minggu ini)',
      icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19h-4v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
      color: 'bg-amber-50 text-amber-600',
      stat: topPenyebab ? `${topPenyebab.penyebab} · ${topPenyebab.area} (${topPenyebab.jumlah}x)` : 'Belum ada data minggu ini',
      statLabel: 'Penyebab terbanyak minggu ini',
    },
    {
      href: '/laporan/sla',
      no: 3,
      title: 'Monitoring SLA',
      goal: 'Mengurangi tiket yang terlambat ditangani',
      icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      color: 'bg-rose-50 text-rose-600',
      stat: `${sla.totalOverdue} tiket overdue · Compliance ${sla.persenCompliance}%`,
      statLabel: 'Status SLA saat ini',
    },
    {
      href: '/laporan/bulanan',
      no: 4,
      title: 'Laporan Bulanan',
      goal: 'Dasar evaluasi manajemen',
      icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
      color: 'bg-emerald-50 text-emerald-600',
      stat: `${bulanan.total} tiket bulan ini · SLA ${bulanan.persenSlaCompliance}%`,
      statLabel: `Ringkasan ${now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Laporan &amp; Analisis</h1>
        <p className="text-sm text-slate-500 mt-0.5">Klik salah satu kartu untuk lihat detail lengkap.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {laporanCards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md hover:border-brand-200 transition group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${c.color}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={c.icon} />
                </svg>
              </div>
              <span className="text-xs font-semibold text-slate-300">#{c.no}</span>
            </div>
            <h2 className="font-semibold text-slate-900 group-hover:text-brand-600 transition">{c.title}</h2>
            <p className="text-xs text-slate-500 mt-1 mb-4">{c.goal}</p>
            <div className="bg-slate-50 rounded-xl px-4 py-3">
              <p className="text-[11px] text-slate-400 uppercase tracking-wide">{c.statLabel}</p>
              <p className="text-sm font-semibold text-slate-800 mt-0.5">{c.stat}</p>
            </div>
            <div className="flex items-center gap-1 text-sm font-medium text-brand-600 mt-4 group-hover:gap-2 transition-all">
              Lihat detail lengkap
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
