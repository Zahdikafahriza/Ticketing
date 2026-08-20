import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getSettings } from '@/lib/settings';
import Sparkline from '@/components/Sparkline';
import TrendChart from '@/components/TrendChart';
import DonutChart from '@/components/DonutChart';
import ProgressBar from '@/components/ProgressBar';

export const dynamic = 'force-dynamic';

const HARI_LABEL = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

function awalHari(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

async function getTren7Hari() {
  const hariIni = awalHari(new Date());
  const rentang = [];
  for (let i = 6; i >= 0; i--) {
    const mulai = new Date(hariIni);
    mulai.setDate(mulai.getDate() - i);
    const akhir = new Date(mulai);
    akhir.setDate(akhir.getDate() + 1);
    rentang.push({ mulai, akhir, label: HARI_LABEL[mulai.getDay()] });
  }

  const tiketPerHari = await Promise.all(
    rentang.map((r) => prisma.ticket.count({ where: { createdAt: { gte: r.mulai, lt: r.akhir } } }))
  );
  const pelangganPerHari = await Promise.all(
    rentang.map((r) => prisma.pelanggan.count({ where: { createdAt: { gte: r.mulai, lt: r.akhir } } }))
  );

  return {
    tiketTrend: rentang.map((r, i) => ({ label: r.label, value: tiketPerHari[i] })),
    pelangganSparkline: pelangganPerHari,
    tiketSparkline: tiketPerHari,
  };
}

async function getStats() {
  const [tiketOpen, tiketClosed, tiketOpenUrgent, totalPelanggan, tiketBelumAssign] = await Promise.all([
    prisma.ticket.count({ where: { status: 'open' } }),
    prisma.ticket.count({ where: { status: 'closed' } }),
    prisma.ticket.count({ where: { status: 'open', prioritas: 'urgent' } }),
    prisma.pelanggan.count(),
    prisma.ticket.count({ where: { status: 'open', OR: [{ assignedTo: null }, { assignedTo: '' }] } }),
  ]);

  const [totalTiket, totalUrgent, closedUrgent, pernahDiAssign] = await Promise.all([
    prisma.ticket.count(),
    prisma.ticket.count({ where: { prioritas: 'urgent' } }),
    prisma.ticket.count({ where: { prioritas: 'urgent', status: 'closed' } }),
    prisma.ticket.count({ where: { firstAssignedAt: { not: null } } }),
  ]);

  const ticketOpenList = await prisma.ticket.findMany({
    where: { status: 'open' },
    include: { pelangganRel: true, site: true },
    orderBy: [{ prioritas: 'desc' }, { createdAt: 'asc' }],
    take: 6,
  });

  const pelangganTerbaru = await prisma.pelanggan.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  const aktivitasTerbaru = await prisma.activityLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  const { tiketTrend, pelangganSparkline, tiketSparkline } = await getTren7Hari();
  const settings = await getSettings();
  const integrasiAktif = Boolean(settings?.n8nWebhookUrl || (settings?.telegramBotToken && settings?.telegramChatId));

  return {
    tiketOpen, tiketClosed, tiketOpenUrgent, totalPelanggan, tiketBelumAssign,
    totalTiket, totalUrgent, closedUrgent, pernahDiAssign,
    ticketOpenList, pelangganTerbaru, aktivitasTerbaru,
    tiketTrend, pelangganSparkline, tiketSparkline,
    integrasiAktif,
  };
}

const AKSI_LABEL = {
  ticket_created: 'membuat tiket',
  ticket_assigned: 'assign teknisi untuk',
  ticket_closed: 'menutup tiket',
  created: 'membuat tiket',
  assigned: 'mengubah teknisi tiket',
  status_updated: 'mengubah status tiket',
  updated: 'memperbarui tiket',
};

function waktuRelatif(date) {
  const detik = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (detik < 60) return 'Baru saja';
  const menit = Math.floor(detik / 60);
  if (menit < 60) return `${menit} menit lalu`;
  const jam = Math.floor(menit / 60);
  if (jam < 24) return `${jam} jam lalu`;
  const hari = Math.floor(jam / 24);
  return `${hari} hari lalu`;
}

export default async function DashboardPage() {
  const s = await getStats();

  const cards = [
    {
      label: 'Tiket Open',
      value: s.tiketOpen,
      href: '/tickets?status=open',
      color: 'bg-brand-50 text-brand-600',
      sparkColor: 'text-brand-500',
      sparkData: s.tiketSparkline,
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    },
    {
      label: 'Tiket Urgent (Open)',
      value: s.tiketOpenUrgent,
      href: '/tickets?status=open&prioritas=urgent',
      color: 'bg-rose-50 text-rose-600',
      sparkColor: 'text-rose-500',
      sparkData: s.tiketSparkline.map((v) => Math.round(v * 0.4)),
      icon: 'M12 9v2m0 4h.01M4.93 4.93l14.14 14.14M12 3a9 9 0 100 18 9 9 0 000-18z',
    },
    {
      label: 'Belum Di-assign',
      value: s.tiketBelumAssign,
      href: '/laporan/sla',
      color: 'bg-amber-50 text-amber-600',
      sparkColor: 'text-amber-500',
      sparkData: s.tiketSparkline.map((v) => Math.round(v * 0.6)),
      icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    {
      label: 'Total Pelanggan',
      value: s.totalPelanggan,
      href: '/pelanggan',
      color: 'bg-emerald-50 text-emerald-600',
      sparkColor: 'text-emerald-500',
      sparkData: s.pelangganSparkline,
      icon: 'M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-4 4 4 0 004 4zm6 0a4 4 0 10-4-4',
    },
  ];

  const persenAssign = s.totalTiket > 0 ? Math.round((s.pernahDiAssign / s.totalTiket) * 100) : 0;
  const persenSelesai = s.totalTiket > 0 ? Math.round((s.tiketClosed / s.totalTiket) * 100) : 0;
  const persenUrgentTertangani = s.totalUrgent > 0 ? Math.round((s.closedUrgent / s.totalUrgent) * 100) : 0;

  const bantuanLinks = [
    { label: 'Pengaturan Integrasi', desc: 'Atur webhook n8n & Telegram', href: '/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z' },
    { label: 'Kebijakan SLA', desc: 'Target respon & penyelesaian', href: '/sla', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'Buat Tiket Baru', desc: 'Laporkan gangguan pelanggan', href: '/tickets/new', icon: 'M12 4v16m8-8H4' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Selamat datang 👋</h1>
          <p className="text-sm text-slate-500 mt-0.5">Kelola tiket gangguan, data pelanggan, dan teknisi dalam satu tempat.</p>
        </div>

        {!s.integrasiAktif && (
          <Link
            href="/settings"
            className="flex items-center gap-4 bg-gradient-to-r from-brand-600 to-indigo-600 text-white rounded-2xl px-5 py-3.5 shadow-lg shadow-brand-600/20 hover:shadow-xl transition group"
          >
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold">Notifikasi belum diatur</p>
              <p className="text-xs text-white/70">Atur webhook n8n / Telegram di Pengaturan</p>
            </div>
            <svg className="w-4 h-4 ml-2 flex-shrink-0 group-hover:translate-x-0.5 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </div>

      {/* Stat cards + sparkline - semua bisa diklik ke halaman detailnya */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-brand-200 transition block"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-500">{c.label}</span>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${c.color}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={c.icon} />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-2">{c.value}</p>
            <Sparkline data={c.sparkData} colorClass={c.sparkColor} height={36} />
          </Link>
        ))}
      </div>

      {/* Laporan & Analisis - 4 laporan sesuai kebutuhan manajemen */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-900">Laporan &amp; Analisis</h2>
          <Link href="/laporan" className="text-sm text-brand-600 hover:text-brand-700 font-medium">Lihat semua &rarr;</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { no: 1, href: '/laporan/klasifikasi', title: 'Rekap & Klasifikasi Keluhan', goal: 'Masalah tersering & area prioritas', color: 'bg-brand-50 text-brand-600' },
            { no: 2, href: '/laporan/penyebab', title: 'Analisis Penyebab per Area', goal: 'Tindakan pencegahan per area', color: 'bg-amber-50 text-amber-600' },
            { no: 3, href: '/laporan/sla', title: 'Monitoring SLA', goal: 'Kurangi tiket terlambat', color: 'bg-rose-50 text-rose-600' },
            { no: 4, href: '/laporan/bulanan', title: 'Laporan Bulanan', goal: 'Dasar evaluasi manajemen', color: 'bg-emerald-50 text-emerald-600' },
          ].map((r) => (
            <Link
              key={r.href}
              href={r.href}
              className="border border-slate-200 rounded-xl p-4 hover:border-brand-300 hover:shadow-sm transition group"
            >
              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold mb-2 ${r.color}`}>{r.no}</span>
              <p className="text-sm font-semibold text-slate-800 group-hover:text-brand-600 transition">{r.title}</p>
              <p className="text-xs text-slate-400 mt-1">{r.goal}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Chart tren + status donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="font-semibold text-slate-900">Tren Tiket Masuk</h2>
              <p className="text-xs text-slate-400">7 hari terakhir</p>
            </div>
          </div>
          <TrendChart data={s.tiketTrend} height={240} />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h2 className="font-semibold text-slate-900 mb-4">Status Tiket</h2>
          <div className="flex items-center justify-center py-2">
            <DonutChart
              segments={[
                { value: s.tiketOpen, color: '#f59e0b' },
                { value: s.tiketClosed, color: '#10b981' },
              ]}
              centerLabel={s.totalTiket}
              centerSub="total tiket"
            />
          </div>
          <div className="space-y-2 mt-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Open
              </span>
              <span className="font-medium text-slate-800">{s.tiketOpen}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Closed
              </span>
              <span className="font-medium text-slate-800">{s.tiketClosed}</span>
            </div>
          </div>
          <Link href="/laporan/klasifikasi" className="block text-center text-sm font-medium text-brand-600 hover:text-brand-700 mt-4 pt-3 border-t border-slate-100">
            Lihat detail klasifikasi &rarr;
          </Link>
        </div>
      </div>

      {/* Progress metrik + tiket open list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Tiket Open Terbaru</h2>
            <Link href="/tickets" className="text-sm text-brand-600 hover:text-brand-700 font-medium">
              Lihat semua &rarr;
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="text-left font-medium px-5 py-3">Kode</th>
                  <th className="text-left font-medium px-5 py-3">Pelanggan</th>
                  <th className="text-left font-medium px-5 py-3">Prioritas</th>
                  <th className="text-left font-medium px-5 py-3">Assigned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {s.ticketOpenList.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-slate-400">Tidak ada tiket open 🎉</td>
                  </tr>
                )}
                {s.ticketOpenList.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <Link href={`/tickets/${t.id}`} className="text-brand-600 font-medium hover:underline">
                        {t.kodeTiket}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-slate-700">{t.pelanggan || t.pelangganRel?.nama || '-'}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${t.prioritas === 'urgent' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>
                        {t.prioritas === 'urgent' ? 'Urgent' : 'Normal'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-500">{t.assignedTo || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h2 className="font-semibold text-slate-900 mb-4">Ringkasan Kinerja</h2>
          <div className="space-y-4">
            <ProgressBar label="Tiket sudah di-assign" percent={persenAssign} colorClass="bg-brand-500" />
            <ProgressBar label="Tiket selesai (closed)" percent={persenSelesai} colorClass="bg-emerald-500" />
            <ProgressBar label="Urgent tertangani" percent={persenUrgentTertangani} colorClass="bg-rose-500" />
          </div>
          <Link href="/laporan/sla" className="block text-center text-sm font-medium text-brand-600 hover:text-brand-700 mt-4 pt-3 border-t border-slate-100">
            Lihat detail SLA &rarr;
          </Link>
        </div>
      </div>

      {/* 3 kolom: pelanggan terbaru / aktivitas / bantuan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Pelanggan Terbaru</h2>
            <Link href="/pelanggan" className="text-sm text-brand-600 hover:text-brand-700 font-medium">Lihat semua</Link>
          </div>
          <ul className="divide-y divide-slate-100">
            {s.pelangganTerbaru.length === 0 && (
              <li className="px-5 py-6 text-center text-slate-400 text-sm">Belum ada data.</li>
            )}
            {s.pelangganTerbaru.map((p) => (
              <li key={p.id} className="px-5 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-800 truncate">{p.nama}</p>
                  <p className="text-xs text-slate-400">{waktuRelatif(p.createdAt)}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Aktivitas Terbaru</h2>
          </div>
          <ul className="divide-y divide-slate-100">
            {s.aktivitasTerbaru.length === 0 && (
              <li className="px-5 py-6 text-center text-slate-400 text-sm">Belum ada aktivitas.</li>
            )}
            {s.aktivitasTerbaru.map((a) => {
              const meta = a.metadata || {};
              return (
                <li key={a.id} className="px-5 py-3 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-700">
                      <span className="font-medium">{a.actorName || 'Seseorang'}</span>{' '}
                      {AKSI_LABEL[a.action] || a.action}{' '}
                      {meta.kode_tiket && <span className="font-medium text-brand-600">{meta.kode_tiket}</span>}
                    </p>
                    <p className="text-xs text-slate-400">{waktuRelatif(a.createdAt)}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Akses Cepat</h2>
          </div>
          <ul className="divide-y divide-slate-100">
            {bantuanLinks.map((b) => (
              <li key={b.href}>
                <Link href={b.href} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition group">
                  <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={b.icon} />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-800">{b.label}</p>
                    <p className="text-xs text-slate-400 truncate">{b.desc}</p>
                  </div>
                  <svg className="w-4 h-4 text-slate-300 group-hover:text-slate-500 flex-shrink-0 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
