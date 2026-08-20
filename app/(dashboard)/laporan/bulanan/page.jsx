import Link from 'next/link';
import { getLaporanBulanan } from '@/lib/laporan';
import PrintButton from '@/components/PrintButton';

export const dynamic = 'force-dynamic';

const NAMA_BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

export default async function LaporanBulananPage({ searchParams }) {
  const now = new Date();
  const tahun = Number(searchParams.tahun) || now.getFullYear();
  const bulan = Number(searchParams.bulan) || now.getMonth() + 1;

  const data = await getLaporanBulanan(tahun, bulan);

  const tahunOptions = Array.from({ length: 3 }, (_, i) => now.getFullYear() - i);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4 print:hidden">
        <div>
          <Link href="/laporan" className="text-sm text-slate-500 hover:text-slate-700">&larr; Kembali ke Laporan</Link>
          <h1 className="text-xl font-bold text-slate-900 mt-2">4. Laporan Bulanan</h1>
          <p className="text-sm text-slate-500 mt-1">
            <span className="font-medium">Goal:</span> Menjadi dasar evaluasi manajemen.
          </p>
        </div>
        <PrintButton />
      </div>

      <form method="GET" className="flex items-center gap-3 print:hidden">
        <select name="bulan" defaultValue={bulan} className="rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none">
          {NAMA_BULAN.map((nama, i) => (
            <option key={i} value={i + 1}>{nama}</option>
          ))}
        </select>
        <select name="tahun" defaultValue={tahun} className="rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none">
          {tahunOptions.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <button className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition">Tampilkan</button>
      </form>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 print:shadow-none print:border-0">
        <div className="text-center mb-6 pb-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Laporan Bulanan Tiket Gangguan</h2>
          <p className="text-slate-500">{NAMA_BULAN[bulan - 1]} {tahun}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">{data.total}</p>
            <p className="text-xs text-slate-500 mt-1">Total Tiket</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-600">{data.closedCount}</p>
            <p className="text-xs text-slate-500 mt-1">Selesai (Closed)</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-600">{data.openCount}</p>
            <p className="text-xs text-slate-500 mt-1">Masih Open</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-rose-600">{data.urgentCount}</p>
            <p className="text-xs text-slate-500 mt-1">Urgent</p>
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl p-4 mb-6 text-center">
          <p className="text-sm text-slate-600">Kepatuhan SLA Bulan Ini</p>
          <p className={`text-3xl font-bold mt-1 ${data.persenSlaCompliance >= 80 ? 'text-emerald-600' : data.persenSlaCompliance >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
            {data.persenSlaCompliance}%
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Jenis Gangguan</h3>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-slate-100">
                {data.kategoriRows.length === 0 && (
                  <tr><td className="py-3 text-slate-400">Tidak ada data.</td></tr>
                )}
                {data.kategoriRows.map((k) => (
                  <tr key={k.label}>
                    <td className="py-2 text-slate-700">{k.label}</td>
                    <td className="py-2 text-right font-medium text-slate-800">{k.jumlah}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Area Terbanyak</h3>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-slate-100">
                {data.areaRows.length === 0 && (
                  <tr><td className="py-3 text-slate-400">Tidak ada data.</td></tr>
                )}
                {data.areaRows.map((a) => (
                  <tr key={a.label}>
                    <td className="py-2 text-slate-700">{a.label}</td>
                    <td className="py-2 text-right font-medium text-slate-800">{a.jumlah}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-xs text-slate-400 text-center mt-8 pt-4 border-t border-slate-100">
          Laporan dibuat otomatis oleh sistem pada {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
        </p>
      </div>
    </div>
  );
}
