import Link from 'next/link';
import { getKlasifikasiKeluhan } from '@/lib/laporan';

export const dynamic = 'force-dynamic';

export default async function LaporanKlasifikasiPage() {
  const { total, kategoriRows, areaRows } = await getKlasifikasiKeluhan({});

  const maxKategori = Math.max(...kategoriRows.map((k) => k.jumlah), 1);
  const maxArea = Math.max(...areaRows.map((a) => a.jumlah), 1);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <Link href="/laporan" className="text-sm text-slate-500 hover:text-slate-700">&larr; Kembali ke Laporan</Link>
        <h1 className="text-xl font-bold text-slate-900 mt-2">1. Rekap &amp; Klasifikasi Keluhan Pelanggan</h1>
        <p className="text-sm text-slate-500 mt-1">
          <span className="font-medium">Goal:</span> Mengetahui masalah yang paling sering terjadi dan area prioritas.
          Total {total} tiket tercatat sepanjang masa.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h2 className="font-semibold text-slate-900 mb-4">Klasifikasi Jenis Gangguan</h2>
          <div className="space-y-3">
            {kategoriRows.length === 0 && <p className="text-sm text-slate-400">Belum ada data.</p>}
            {kategoriRows.map((k) => (
              <Link
                key={k.label}
                href={`/tickets?q=${encodeURIComponent(k.label.split(' ')[0])}`}
                className="block group"
              >
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-700 group-hover:text-brand-600 font-medium transition">{k.label}</span>
                  <span className="text-slate-500">{k.jumlah} tiket ({k.persen}%)</span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-brand-500 group-hover:bg-brand-600 transition-all"
                    style={{ width: `${(k.jumlah / maxKategori) * 100}%` }}
                  />
                </div>
              </Link>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-4">💡 Klik salah satu kategori untuk lihat daftar tiketnya.</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h2 className="font-semibold text-slate-900 mb-4">Area / Site dengan Tiket Terbanyak</h2>
          <div className="space-y-3">
            {areaRows.length === 0 && <p className="text-sm text-slate-400">Belum ada data.</p>}
            {areaRows.map((a) => (
              <div key={a.label}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-700 font-medium">{a.label}</span>
                  <span className="text-slate-500">{a.jumlah} tiket ({a.persen}%)</span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-amber-500" style={{ width: `${(a.jumlah / maxArea) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-4">💡 Ini adalah area prioritas untuk ditindaklanjuti.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Tabel Lengkap Klasifikasi</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="text-left font-medium px-5 py-3">Jenis Gangguan</th>
                <th className="text-right font-medium px-5 py-3">Jumlah Tiket</th>
                <th className="text-right font-medium px-5 py-3">Persentase</th>
                <th className="text-right font-medium px-5 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {kategoriRows.map((k) => (
                <tr key={k.label} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-slate-800">{k.label}</td>
                  <td className="px-5 py-3 text-right text-slate-600">{k.jumlah}</td>
                  <td className="px-5 py-3 text-right text-slate-600">{k.persen}%</td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`/tickets?q=${encodeURIComponent(k.label.split(' ')[0])}`}
                      className="text-brand-600 hover:text-brand-700 font-medium"
                    >
                      Lihat tiket
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
