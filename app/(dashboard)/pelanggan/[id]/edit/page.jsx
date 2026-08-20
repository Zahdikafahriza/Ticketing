import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { updatePelanggan } from '../../actions';
import PelangganForm from '@/components/PelangganForm';

export const dynamic = 'force-dynamic';

export default async function EditPelangganPage({ params, searchParams }) {
  const [pelanggan, sites] = await Promise.all([
    prisma.pelanggan.findUnique({ where: { id: Number(params.id) } }),
    prisma.site.findMany({ orderBy: { nama: 'asc' } }),
  ]);

  if (!pelanggan) notFound();

  const updateWithId = updatePelanggan.bind(null, params.id);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-5">
        <Link href="/pelanggan" className="text-sm text-slate-500 hover:text-slate-700">&larr; Kembali ke Data Pelanggan</Link>
        <h2 className="text-xl font-bold text-slate-900 mt-2">Ubah Data: {pelanggan.nama}</h2>
      </div>
      <PelangganForm action={updateWithId} sites={sites} pelanggan={pelanggan} errorMessage={searchParams.error} />
    </div>
  );
}
