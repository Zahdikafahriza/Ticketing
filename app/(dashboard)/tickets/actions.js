'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { kirimEventTiket } from '@/lib/n8n';

async function generateKodeTiket() {
  let kode;
  let sudahAda = true;

  while (sudahAda) {
    const tanggal = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(10000 + Math.random() * 90000);
    kode = `TIK-${tanggal}-${random}`;
    sudahAda = await prisma.ticket.findUnique({ where: { kodeTiket: kode } });
  }

  return kode;
}

export async function createTicket(formData) {
  const session = await getServerSession(authOptions);
  const actorName = session?.user?.name || 'Admin';

  const pelangganId = formData.get('pelanggan_id') || null;
  const siteId = formData.get('site_id') || null;
  const judul = formData.get('judul')?.toString().trim();
  const assignedList = formData.getAll('assigned_to').map((v) => v.toString().trim()).filter(Boolean);
  const assignedTo = assignedList.length ? assignedList.join(', ') : null;

  if (!judul) {
    redirect('/tickets/new?error=Judul tiket wajib diisi.');
  }

  let namaPelanggan = null;
  let alamat = formData.get('alamat')?.toString().trim() || null;
  let resolvedSiteId = siteId ? Number(siteId) : null;

  if (pelangganId) {
    const p = await prisma.pelanggan.findUnique({ where: { id: Number(pelangganId) } });
    if (p) {
      namaPelanggan = p.nama;
      alamat = alamat || p.alamat;
      resolvedSiteId = resolvedSiteId || p.siteId;
    }
  }

  const ticket = await prisma.ticket.create({
    data: {
      kodeTiket: await generateKodeTiket(),
      judul,
      deskripsi: formData.get('deskripsi')?.toString().trim() || null,
      pelangganId: pelangganId ? Number(pelangganId) : null,
      pelanggan: namaPelanggan,
      siteId: resolvedSiteId,
      alamat,
      kategori: formData.get('kategori')?.toString().trim() || null,
      prioritas: formData.get('prioritas') || 'normal',
      status: 'open',
      assignedTo,
      cc: formData.get('cc')?.toString().trim() || null,
      firstAssignedAt: assignedTo ? new Date() : null,
      source: 'web',
    },
    include: { pelangganRel: true, site: true },
  });

  // Kirim SATU notifikasi saja: "Tiket Baru". Kalau teknisi sudah dipilih
  // saat membuat tiket, informasi itu SUDAH ikut tampil di notifikasi ini
  // (baris "Teknisi" + ringkasan "sudah ditugaskan ke ..."), jadi TIDAK perlu
  // kirim event 'ticket_assigned' terpisah lagi di sini (dulu sempat begitu,
  // hasilnya malah kelihatan seperti notifikasi dobel).
  await kirimEventTiket('ticket_created', ticket, actorName);

  revalidatePath('/tickets');
  redirect(`/tickets/${ticket.id}?success=Tiket ${ticket.kodeTiket} berhasil dibuat.`);
}

export async function updateTicket(id, formData) {
  const session = await getServerSession(authOptions);
  const actorName = session?.user?.name || 'Admin';

  const ticketId = Number(id);
  const ticketSebelumnya = await prisma.ticket.findUnique({ where: { id: ticketId } });

  if (!ticketSebelumnya) {
    redirect('/tickets?error=Tiket tidak ditemukan.');
  }

  const status = formData.get('status');
  const assignedList = formData.getAll('assigned_to').map((v) => v.toString().trim()).filter(Boolean);
  const assignedTo = assignedList.length ? assignedList.join(', ') : null;

  const setSebelumnya = new Set(
    (ticketSebelumnya.assignedTo || '').split(',').map((s) => s.trim()).filter(Boolean)
  );
  const setBaru = new Set(assignedList);
  const assignedBerubah =
    setBaru.size !== setSebelumnya.size || [...setBaru].some((nama) => !setSebelumnya.has(nama));
  const assignedBaruDiisi = assignedList.length > 0 && assignedBerubah;
  const baruDitutup = status === 'closed' && ticketSebelumnya.status !== 'closed';

  const data = {
    status,
    prioritas: formData.get('prioritas'),
    assignedTo,
    tindakan: formData.get('tindakan')?.toString().trim() || null,
    penyebab: formData.get('penyebab')?.toString().trim() || null,
    catatan: formData.get('catatan')?.toString().trim() || null,
    cc: formData.get('cc')?.toString().trim() || null,
    noc: formData.get('noc')?.toString().trim() || null,
  };

  if (baruDitutup) data.resolvedAt = new Date();
  if (assignedBaruDiisi && !ticketSebelumnya.firstAssignedAt) data.firstAssignedAt = new Date();

  const ticket = await prisma.ticket.update({
    where: { id: ticketId },
    data,
    include: { pelangganRel: true, site: true },
  });

  if (assignedBaruDiisi) {
    await kirimEventTiket('ticket_assigned', ticket, actorName);
  }
  if (baruDitutup) {
    await kirimEventTiket('ticket_closed', ticket, actorName);
  }

  revalidatePath('/tickets');
  revalidatePath(`/tickets/${id}`);
  redirect(`/tickets/${id}?success=Tiket ${ticket.kodeTiket} berhasil diperbarui.`);
}

export async function deleteTicket(id) {
  const ticket = await prisma.ticket.findUnique({ where: { id: Number(id) } });
  await prisma.ticket.delete({ where: { id: Number(id) } });

  revalidatePath('/tickets');
  redirect(`/tickets?success=Tiket ${ticket?.kodeTiket ?? ''} berhasil dihapus.`);
}
