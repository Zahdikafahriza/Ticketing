import Link from 'next/link';
import { getMonitoringSLA } from '@/lib/laporan';

export const dynamic = 'force-dynamic';

function formatMenit(menit) {
  if (menit == null) return '-';
  if (menit < 60) return `${menit} menit`;
  const jam = Math.floor(menit / 60);
  const sisaMenit = menit % 60;
  return `${jam} jam ${sisaMenit} menit`;
}

function umurTiket(createdAt) {
  const menit = Math.round((Date.now() - new Date(createdAt).getTime()) / 60000);
  return formatMenit(menit);
}

export default async function LaporanSlaPage() {
  const { rataResponMenit, rataResolusiMenit, overdue, totalOverdue, persenCompliance, totalClosedDihitung } =
    await getMonitoringSLA();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <Link href="/laporan" className="text-sm text-slate-500 hover:text-slate-700">&larr; Kembali ke Laporan</Link>
        <h1 className="text-xl font-bold text-slate-900 mt-2">3. Monitoring Penyelesaian Tiket &amp; SLA</h1>
        <p className="text-sm text-slate-500 mt-1">
          <span className="font-medium">Goal:</span> Mengurangi tiket yang terlambat ditangani.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <p className="text-sm text-slate-500">Rata-rata Waktu Respon</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{formatMenit(rataResponMenit)}</p>
          <p className="text-xs text-slate-400 mt-1">dari tiket dibuat sampai di-assign teknisi</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <p className="text-sm text-slate-500">Rata-rata Waktu Penyelesaian</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{formatMenit(rataResolusiMenit)}</p>
          <p className="text-xs text-slate-400 mt-1">dari tiket dibuat sampai closed</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <p className="text-sm text-slate-500">Kepatuhan SLA</p>
          <p className={`text-2xl font-bold mt-1 ${persenCompliance >= 80 ? 'text-emerald-600' : persenCompliance >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
            {persenCompliance}%
          </p>
          <p className="text-xs text-slate-400 mt-1">dari {totalClosedDihitung} tiket closed terakhir</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h2 className="font-semibold text-slate-900">
              Tiket Overdue <span className="text-rose-600">({totalOverdue})</span>
            </h2>
            <p className="text-xs text-slate-400">Tiket open yang sudah lewat target SLA-nya</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="text-left font-medium px-5 py-3">Kode Tiket</th>
                <th className="text-left font-medium px-5 py-3">Pelanggan</th>
                <th className="text-left font-medium px-5 py-3">Prioritas</th>
                <th className="text-left font-medium px-5 py-3">Teknisi</th>
                <th className="text-left font-medium px-5 py-3">Sudah Berjalan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {overdue.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-400">Tidak ada tiket overdue 🎉</td></tr>
              )}
              {overdue.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <Link href={`/tickets/${t.id}`} className="text-brand-600 font-medium hover:underline">{t.kodeTiket}</Link>
                  </td>
                  <td className="px-5 py-3 text-slate-700">{t.pelanggan || t.pelangganRel?.nama || '-'}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${t.prioritas === 'urgent' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>
                      {t.prioritas === 'urgent' ? 'Urgent' : 'Normal'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-500">{t.assignedTo || '-'}</td>
                  <td className="px-5 py-3 text-rose-600 font-medium">{umurTiket(t.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
