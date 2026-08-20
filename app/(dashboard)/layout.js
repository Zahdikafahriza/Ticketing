import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import AppShell from '@/components/AppShell';
import Flash from '@/components/Flash';

async function getNotifCount() {
  try {
    return await prisma.ticket.count({
      where: {
        status: 'open',
        OR: [{ prioritas: 'urgent' }, { assignedTo: null }, { assignedTo: '' }],
      },
    });
  } catch (err) {
    return 0;
  }
}

export default async function DashboardLayout({ children }) {
  const session = await getServerSession(authOptions);
  const user = session?.user;
  const notifCount = await getNotifCount();

  return (
    <AppShell user={user} notifCount={notifCount}>
      <Suspense fallback={null}>
        <Flash />
      </Suspense>
      {children}
    </AppShell>
  );
}
