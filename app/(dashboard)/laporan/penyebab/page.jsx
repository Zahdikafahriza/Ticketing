import Link from 'next/link';
import { getAnalisisPenyebab } from '@/lib/laporan';

export const dynamic = 'force-dynamic';

function awalMinggu(offset = 0) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  const hari = d.getDay();
  const selisih = hari === 0 ? 6 : hari - 1;
  d.setDate(d.getDate() - selisih + offset * 7);
  return d;
}

function formatTanggal(d) {
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default async function LaporanPenyebabPage({ searchParams }) {
  const offset = Number(searchParams.minggu || 0);
  const mulai = awalMinggu(offset);
  const selesai = new Date(mulai);
  selesai.setDate(selesai.getDate() + 7);
  const akhirTampil = new Date(selesai);
  akhirTampil.setDate(akhirTampil.getDate() - 1);

  const { rows, totalTiketDenganPenyebab } = await getAnalisisPenyebab({ dari: mulai, sampai: selesai });

  const perArea = {};
  for (const r of rows) {
    perArea[r.area] = perArea[r.area] || [];
    perArea[r.area].push(r);
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <Link href="/laporan" className="text-sm text-slate-500 hover:text-slate-700">&larr; Kembali ke Laporan</Link>
        <h1 className="text-xl font-bold text-slate-900 mt-2">2. Analisis Penyebab Gangguan Terbanyak per Area</h1>
        <p className="text-sm text-slate-500 mt-1">
          <span className="font-medium">Goal:</span> Menentukan tindakan pencegahan per area, berdasarkan data mingguan.
        </p>
      </div>

      <div className="flex items-center justify-between bg-white rounded-2xl border border-slate-200 shadow-sm px-5 py-4">
        <div>
          <p className="text-sm font-semibold text-slate-800">
            Minggu: {formatTanggal(mulai)} — {formatTanggal(akhirTampil)}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">{totalTiketDenganPenyebab} tiket dengan penyebab tercatat</p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/laporan/penyebab?minggu=${offset - 1}`}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-sm hover:bg-slate-50"
          >
            &larr; Minggu Lalu
          </Link>
          {offset !== 0 && (
            <Link href="/laporan/penyebab" className="px-3 py-1.5 rounded-lg border border-slate-300 text-sm hover:bg-slate-50">
              Minggu Ini
            </Link>
          )}
          {offset < 0 && (
            <Link
              href={`/laporan/penyebab?minggu=${offset + 1}`}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-sm hover:bg-slate-50"
            >
              Minggu Depan &rarr;
            </Link>
          )}
        </div>
      </div>

      {Object.keys(perArea).length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center text-slate-400">
          Tidak ada tiket dengan penyebab tercatat di minggu ini.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {Object.entries(perArea).map(([area, list]) => (
            <div key={area} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
                <h2 className="font-semibold text-slate-800">{area}</h2>
              </div>
              <ul className="divide-y divide-slate-100">
                {list.map((r, i) => (
                  <li key={i} className="px-5 py-2.5 flex items-center justify-between text-sm">
                    <span className="text-slate-700">{r.penyebab}</span>
                    <span className="font-semibold text-slate-800 bg-slate-100 rounded-full px-2 py-0.5 text-xs">{r.jumlah}x</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <div className="bg-brand-50 border border-brand-100 rounded-2xl px-5 py-4 text-sm text-brand-700">
        💡 Penyebab yang paling sering muncul di satu area menunjukkan perlu tindakan pencegahan spesifik
        (misal: penggantian kabel di area rawan, atau maintenance rutin di jam tertentu).
      </div>
    </div>
  );
}
