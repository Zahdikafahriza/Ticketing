import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { updateTicket, deleteTicket } from '../actions';
import DeleteButton from '@/components/DeleteButton';
import TeknisiMultiSelect from '@/components/TeknisiMultiSelect';

export const dynamic = 'force-dynamic';

export default async function TicketDetailPage({ params, searchParams }) {
  const [ticket, teknisiList] = await Promise.all([
    prisma.ticket.findUnique({
      where: { id: Number(params.id) },
      include: { pelangganRel: true, site: true },
    }),
    // select spesifik supaya field telegram_user_id (BigInt) tidak ikut
    // terkirim ke TeknisiMultiSelect (Client Component) — BigInt tidak bisa
    // di-serialize lewat props Server -> Client Component.
    prisma.teknisi.findMany({
      where: { aktif: true },
      orderBy: { nama: 'asc' },
      select: { id: true, nama: true },
    }),
  ]);

  if (!ticket) notFound();

  // Pecah string "Riki, Hanang" jadi array supaya checkbox yang cocok otomatis tercentang
  const assignedSaatIni = (ticket.assignedTo || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const updateWithId = updateTicket.bind(null, params.id);
  const deleteWithId = deleteTicket.bind(null, params.id);

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/tickets" className="text-sm text-slate-500 hover:text-slate-700">&larr; Kembali ke Tiket</Link>
          <h2 className="text-xl font-bold text-slate-900 mt-2">{ticket.kodeTiket} — {ticket.judul}</h2>
        </div>
        <DeleteButton action={deleteWithId} confirmText="Hapus tiket ini?" label="Hapus Tiket" />
      </div>

      {searchParams.success && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 text-sm font-medium">
          {searchParams.success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-2 text-sm">
          <h3 className="font-semibold text-slate-900 mb-2">Info Pelanggan</h3>
          <p><span className="text-slate-500">Nama:</span> <span className="font-medium">{ticket.pelanggan || ticket.pelangganRel?.nama || '-'}</span></p>
          <p><span className="text-slate-500">Site:</span> {ticket.site?.nama || ticket.lokasi || '-'}</p>
          <p><span className="text-slate-500">Alamat:</span> {ticket.alamat || ticket.pelangganRel?.alamat || '-'}</p>
          <p><span className="text-slate-500">No. HP:</span> {ticket.pelangganRel?.noHp || '-'}</p>
          <p><span className="text-slate-500">Pelapor:</span> {ticket.pelaporNama || '-'}</p>
          <p><span className="text-slate-500">Kategori:</span> {ticket.kategori || '-'}</p>
          <p><span className="text-slate-500">CC (Customer Service):</span> {ticket.cc || '-'}</p>
          <p><span className="text-slate-500">NOC (yang menutup):</span> {ticket.noc || '-'}</p>
          <p><span className="text-slate-500">Dibuat:</span> {new Intl.DateTimeFormat('id-ID', { dateStyle: 'short', timeStyle: 'short' }).format(ticket.createdAt)}</p>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Tindak Lanjut Tiket</h3>
          <form action={updateWithId} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select name="status" defaultValue={ticket.status} className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none">
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Prioritas</label>
                <select name="prioritas" defaultValue={ticket.prioritas} className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none">
                  <option value="normal">Normal</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Assigned To (teknisi) <span className="text-slate-400 font-normal">(bisa pilih lebih dari satu)</span>
              </label>
              <TeknisiMultiSelect teknisiList={teknisiList} defaultSelected={assignedSaatIni} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Penyebab</label>
              <input
                type="text"
                name="penyebab"
                defaultValue={ticket.penyebab || ''}
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tindakan</label>
              <textarea
                name="tindakan"
                rows={3}
                defaultValue={ticket.tindakan || ''}
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Catatan</label>
              <textarea
                name="catatan"
                rows={2}
                defaultValue={ticket.catatan || ''}
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  CC / Customer Service
                </label>
                <input
                  type="text"
                  name="cc"
                  defaultValue={ticket.cc || ''}
                  placeholder="Contoh: Eca"
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  NOC <span className="text-slate-400 font-normal">(isi kalau menutup tiket)</span>
                </label>
                <input
                  type="text"
                  name="noc"
                  defaultValue={ticket.noc || ''}
                  placeholder="Nama NOC yang menutup tiket"
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>
            </div>
            <button
              type="submit"
              className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg shadow-lg shadow-brand-600/20 transition"
            >
              Simpan Perubahan
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
