import { prisma } from '@/lib/prisma';
import { saveTeknisi, deleteTeknisi } from './actions';
import TeknisiManager from '@/components/TeknisiManager';

export const dynamic = 'force-dynamic';

export default async function TeknisiPage() {
  const teknisiRaw = await prisma.teknisi.findMany({ orderBy: { nama: 'asc' } });

  // telegram_user_id bertipe BigInt di database — harus dikonversi ke string
  // dulu sebelum dikirim sebagai props ke Client Component (React tidak bisa
  // serialize BigInt secara langsung).
  const teknisi = teknisiRaw.map((tk) => ({
    ...tk,
    telegramUserId: tk.telegramUserId ? tk.telegramUserId.toString() : null,
  }));

  return <TeknisiManager teknisi={teknisi} saveTeknisi={saveTeknisi} deleteTeknisi={deleteTeknisi} />;
}
