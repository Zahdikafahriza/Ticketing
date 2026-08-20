import { prisma } from '@/lib/prisma';
import { saveSite, deleteSite } from './actions';
import SitesManager from '@/components/SitesManager';

export const dynamic = 'force-dynamic';

export default async function SitesPage() {
  const sites = await prisma.site.findMany({
    orderBy: { nama: 'asc' },
    include: { _count: { select: { pelanggan: true } } },
  });

  return <SitesManager sites={sites} saveSite={saveSite} deleteSite={deleteSite} />;
}
