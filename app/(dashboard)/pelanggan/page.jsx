import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { deletePelanggan } from './actions';
import DeleteButton from '@/components/DeleteButton';
import PelangganFilters from '@/components/PelangganFilters';

export const dynamic = 'force-dynamic';

const PER_PAGE = 15;

export default async function PelangganPage({ searchParams }) {
  const q = searchParams.q?.trim() || '';
  const siteId = searchParams.site_id || '';
  const statusLayanan = searchParams.status_layanan || '';
  const page = Math.max(1, Number(searchParams.page) || 1);

  const where = {
    AND: [
      q
        ? {
            OR: [
              { nama: { contains: q } },
              { kode: { contains: q } },
              { noHp: { contains: q } },
              { alamat: { contains: q } },
            ],
          }
        : {},
      siteId ? { siteId: Number(siteId) } : {},
      statusLayanan ? { statusLayanan } : {},
    ],
  };

  const [pelanggan, total, sites] = await Promise.all([
    prisma.pelanggan.findMany({
      where,
      include: { site: true },
      orderBy: { nama: 'asc' },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    prisma.pelanggan.count({ where }),
    prisma.site.findMany({ orderBy: { nama: 'asc' } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  const badgeColor = {
    aktif: 'bg-emerald-100 text-emerald-700',
    isolir: 'bg-amber-100 text-amber-700',
    nonaktif: 'bg-slate-200 text-slate-600',
  };

  function buildQuery(params) {
    const sp = new URLSearchParams({ q, site_id: siteId, status_layanan: statusLayanan, ...params });
    for (const [k, v] of [...sp.entries()]) if (!v) sp.delete(k);
    return `/pelanggan?${sp.toString()}`;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Data Pelanggan</h2>
          <p className="text-sm text-slate-500">Kelola data pelanggan: tambah, ubah, dan hapus.</p>
        </div>
        <Link
          href="/pelanggan/new"
          className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg shadow-lg shadow-brand-600/20 transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Tambah Pelanggan
        </Link>
      </div>

      <PelangganFilters sites={sites} />

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="text-left font-medium px-5 py-3">Kode</th>
                <th className="text-left font-medium px-5 py-3">Nama</th>
                <th className="text-left font-medium px-5 py-3">No. HP</th>
                <th className="text-left font-medium px-5 py-3">Site</th>
                <th className="text-left font-medium px-5 py-3">Status</th>
                <th className="text-right font-medium px-5 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pelanggan.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-400">Belum ada data pelanggan.</td></tr>
              )}
              {pelanggan.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-mono text-xs text-slate-600">{p.kode}</td>
                  <td className="px-5 py-3 font-medium text-slate-800">{p.nama}</td>
                  <td className="px-5 py-3 text-slate-600">{p.noHp || '-'}</td>
                  <td className="px-5 py-3 text-slate-600">{p.site?.nama || '-'}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badgeColor[p.statusLayanan]}`}>
                      {p.statusLayanan.charAt(0).toUpperCase() + p.statusLayanan.slice(1)}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right space-x-2 whitespace-nowrap">
                    <Link href={`/pelanggan/${p.id}/edit`} className="text-brand-600 hover:text-brand-700 font-medium">Ubah</Link>
                    <DeleteButton action={deletePelanggan.bind(null, p.id)} confirmText={`Hapus pelanggan ${p.nama}?`} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between text-sm">
            <span className="text-slate-500">Halaman {page} dari {totalPages} ({total} data)</span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link href={buildQuery({ page: page - 1 })} className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50">Sebelumnya</Link>
              )}
              {page < totalPages && (
                <Link href={buildQuery({ page: page + 1 })} className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50">Selanjutnya</Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
