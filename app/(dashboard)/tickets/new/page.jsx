import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { createTicket } from '../actions';
import TicketCreateForm from '@/components/TicketCreateForm';

export const dynamic = 'force-dynamic';

export default async function NewTicketPage({ searchParams }) {
  const [pelangganList, sites, teknisiList] = await Promise.all([
    prisma.pelanggan.findMany({ orderBy: { nama: 'asc' } }),
    prisma.site.findMany({ orderBy: { nama: 'asc' } }),
    // select spesifik (bukan semua kolom) supaya field telegram_user_id yang
    // bertipe BigInt tidak ikut terkirim — BigInt tidak bisa di-serialize
    // dari Server Component ke Client Component (TicketCreateForm).
    prisma.teknisi.findMany({
      where: { aktif: true },
      orderBy: { nama: 'asc' },
      select: { id: true, nama: true },
    }),
  ]);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-5">
        <Link href="/tickets" className="text-sm text-slate-500 hover:text-slate-700">&larr; Kembali ke Tiket</Link>
        <h2 className="text-xl font-bold text-slate-900 mt-2">Buat Tiket Gangguan Baru</h2>
        <p className="text-sm text-slate-500 mt-1">
          Pilih site dulu supaya daftar pelanggan otomatis terfilter, lalu bisa assign lebih dari satu teknisi sekaligus.
        </p>
      </div>

      <TicketCreateForm
        action={createTicket}
        sites={sites}
        pelangganList={pelangganList}
        teknisiList={teknisiList}
        errorMessage={searchParams.error}
      />
    </div>
  );
}
