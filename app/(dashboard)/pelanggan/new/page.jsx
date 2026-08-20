import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { createPelanggan } from '../actions';
import PelangganForm from '@/components/PelangganForm';

export const dynamic = 'force-dynamic';

export default async function NewPelangganPage({ searchParams }) {
  const sites = await prisma.site.findMany({ orderBy: { nama: 'asc' } });

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-5">
        <Link href="/pelanggan" className="text-sm text-slate-500 hover:text-slate-700">&larr; Kembali ke Data Pelanggan</Link>
        <h2 className="text-xl font-bold text-slate-900 mt-2">Tambah Pelanggan Baru</h2>
      </div>
      <PelangganForm action={createPelanggan} sites={sites} errorMessage={searchParams.error} />
    </div>
  );
}
