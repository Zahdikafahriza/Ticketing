import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import TicketFilters from '@/components/TicketFilters';

export const dynamic = 'force-dynamic';

const PER_PAGE = 15;

export default async function TicketsPage({ searchParams }) {
  const q = searchParams.q?.trim() || '';
  const status = searchParams.status || '';
  const prioritas = searchParams.prioritas || '';
  const siteId = searchParams.site_id || '';
  const page = Math.max(1, Number(searchParams.page) || 1);

  const where = {
    AND: [
      q
        ? {
            OR: [
              { kodeTiket: { contains: q } },
              { judul: { contains: q } },
              { pelanggan: { contains: q } },
              { lokasi: { contains: q } },
            ],
          }
        : {},
      status ? { status } : {},
      prioritas ? { prioritas } : {},
      siteId ? { siteId: Number(siteId) } : {},
    ],
  };

  const [tickets, total, sites] = await Promise.all([
    prisma.ticket.findMany({
      where,
      include: { pelangganRel: true, site: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    prisma.ticket.count({ where }),
    prisma.site.findMany({ orderBy: { nama: 'asc' } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  function buildQuery(params) {
    const sp = new URLSearchParams({ q, status, prioritas, site_id: siteId, ...params });
    for (const [k, v] of [...sp.entries()]) if (!v) sp.delete(k);
    return `/tickets?${sp.toString()}`;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Tiket Gangguan</h2>
          <p className="text-sm text-slate-500">Pantau dan kelola tiket gangguan pelanggan.</p>
        </div>
        <Link
          href="/tickets/new"
          className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg shadow-lg shadow-brand-600/20 transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Buat Tiket
        </Link>
      </div>

      <TicketFilters sites={sites} />

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="text-left font-medium px-5 py-3">Kode Tiket</th>
                <th className="text-left font-medium px-5 py-3">Judul</th>
                <th className="text-left font-medium px-5 py-3">Pelanggan</th>
                <th className="text-left font-medium px-5 py-3">Prioritas</th>
                <th className="text-left font-medium px-5 py-3">Status</th>
                <th className="text-left font-medium px-5 py-3">Dibuat</th>
                <th className="text-right font-medium px-5 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tickets.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-10 text-center text-slate-400">Tidak ada tiket.</td></tr>
              )}
              {tickets.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-mono text-xs text-slate-600">{t.kodeTiket}</td>
                  <td className="px-5 py-3 text-slate-800">{t.judul}</td>
                  <td className="px-5 py-3 text-slate-600">{t.pelanggan || t.pelangganRel?.nama || '-'}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${t.prioritas === 'urgent' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>
                      {t.prioritas === 'urgent' ? 'Urgent' : 'Normal'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${t.status === 'open' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {t.status === 'open' ? 'Open' : 'Closed'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-500">
                    {new Intl.DateTimeFormat('id-ID', { dateStyle: 'short', timeStyle: 'short' }).format(t.createdAt)}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link href={`/tickets/${t.id}`} className="text-brand-600 hover:text-brand-700 font-medium">Lihat / Ubah</Link>
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
