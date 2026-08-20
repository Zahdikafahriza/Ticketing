import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';
import { getSettings } from '@/lib/settings';

function formatTanggalJamWIB(date) {
  const d = new Date(date);
  const wib = new Date(d.getTime() + 7 * 60 * 60 * 1000);
  const pad = (n) => String(n).padStart(2, '0');
  return {
    tanggal: `${pad(wib.getUTCDate())}/${pad(wib.getUTCMonth() + 1)}/${wib.getUTCFullYear()}`,
    jam: `${pad(wib.getUTCHours())}:${pad(wib.getUTCMinutes())}`,
  };
}

function buildPayload(event, eventId, ticket, actorName) {
  const { tanggal, jam } = formatTanggalJamWIB(ticket.createdAt);

  return {
    event, // ticket_created | ticket_assigned | ticket_closed
    event_id: eventId,
    source: 'web',
    actor_name: actorName || 'Admin',
    timestamp: new Date().toISOString(),
    kode_tiket: ticket.kodeTiket,
    kode_pelanggan: ticket.pelangganRel?.kode ?? null,
    judul: ticket.judul,
    deskripsi: ticket.deskripsi,
    pelanggan: ticket.pelanggan || ticket.pelangganRel?.nama || '-',
    no_hp: ticket.pelangganRel?.noHp ?? null,
    lokasi: ticket.site?.nama || ticket.lokasi,
    alamat: ticket.alamat,
    kategori: ticket.kategori,
    prioritas: ticket.prioritas,
    status: ticket.status,
    assigned_to: ticket.assignedTo,
    penyebab: ticket.penyebab,
    tindakan: ticket.tindakan,
    catatan: ticket.catatan,
    jam_selesai: ticket.jamSelesai,
    cc: ticket.cc,
    noc: ticket.noc,
    tanggal,
    jam,
  };
}

/**
 * Bangun teks pesan Telegram PERSIS sesuai template yang diminta:
 * 🚨 Tiket Baru / ✅ TIKET CLOSED, lengkap dengan checklist status,
 * baris visit, dan baris CC.
 */
function buildTelegramText(event, ticket) {
  const { tanggal, jam } = formatTanggalJamWIB(ticket.createdAt);
  const isClosed = event === 'ticket_closed' || ticket.status === 'closed';
  const isAssigned = event === 'ticket_assigned';

  let judulNotif = '🚨 <b>Tiket Baru</b>';
  if (isClosed) judulNotif = '✅ <b>TIKET CLOSED</b>';
  else if (isAssigned) judulNotif = '👨\u200d🔧 <b>Tiket Di-assign</b>';

  const namaPelanggan = ticket.pelanggan || ticket.pelangganRel?.nama || '-';
  const assignedTo = ticket.assignedTo || '-';
  const statusOpenCheck = ticket.status === 'open' ? '☑️' : '☐';
  const statusClosedCheck = ticket.status === 'closed' ? '☑️' : '☐';

  let ringkasan;
  if (isClosed) {
    ringkasan = `Gangguan ${ticket.judul} untuk ${namaPelanggan} sudah tertangani oleh ${assignedTo}.`;
  } else if (assignedTo !== '-') {
    ringkasan = `Tiket ${ticket.judul} untuk ${namaPelanggan} sudah ditugaskan ke ${assignedTo}.`;
  } else {
    ringkasan = `Tiket ${ticket.judul} untuk ${namaPelanggan} sudah dibuat dan menunggu penanganan.`;
  }

  let baris = [
    judulNotif,
    '',
    '🎫 TIKET GANGGUAN',
    '',
    `Kode Tiket : ${ticket.kodeTiket}`,
    '',
    'Pelanggan',
    `Nama         : ${namaPelanggan}`,
    `ID           : ${ticket.pelangganRel?.kode || '-'}`,
    `No. HP       : ${ticket.pelangganRel?.noHp || '-'}`,
    `Alamat       : ${ticket.alamat || ticket.pelangganRel?.alamat || '-'}`,
    `Site         : ${ticket.site?.nama || ticket.lokasi || '-'}`,
    '',
    `Tanggal      : ${tanggal}`,
    `Jam          : ${jam}`,
    '',
    'Keluhan',
    ticket.judul || '-',
    '',
    'Status',
    '',
    `${statusOpenCheck} Open`,
    `${statusClosedCheck} Selesai`,
    '',
    'Hasil Penanganan',
    `Tindakan     : ${ticket.tindakan || '-'}`,
    `Penyebab     : ${ticket.penyebab || '-'}`,
    '',
    `Teknisi      : ${assignedTo}`,
    `Jam Selesai  : ${ticket.jamSelesai || '-'}`,
    `Catatan      : ${ticket.catatan || '-'}`,
    '',
    `💡 ${ringkasan}`,
  ];

  // Baris visit hanya muncul kalau status open DAN sudah ada teknisi
  if (ticket.status === 'open' && assignedTo !== '-') {
    baris.push('', `Mohon dibantu cek ke lokasi (visit) ya mas ${assignedTo} 🙏.`);
  }

  baris.push('', `CC           : ${ticket.cc || '-'}`);

  // Baris NOC HANYA muncul di notifikasi closed — saat create/assign, NOC belum relevan
  if (isClosed) {
    baris.push(`NOC          : ${ticket.noc || '-'}`);
  }

  return baris.join('\n');
}

async function kirimTelegram(botToken, chatId, text) {
  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.error('Gagal kirim Telegram:', response.status, await response.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error('Exception saat kirim Telegram:', err.message);
    return false;
  }
}

async function kirimN8n(webhookUrl, payload) {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.error('Gagal kirim ke n8n:', response.status, await response.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error('Exception saat kirim ke n8n:', err.message);
    return false;
  }
}

/**
 * Kirim event tiket ke integrasi yang AKTIF (diisi lewat halaman Settings di web):
 * - Kalau N8N Webhook URL diisi → kirim payload JSON ke n8n (n8n bisa teruskan ke Telegram/dsb)
 * - Kalau Telegram Bot Token + Chat ID diisi → kirim langsung ke Telegram dengan format
 *   pesan yang identik dengan template workflow n8n (create/assign/closed)
 * Keduanya bisa aktif bersamaan, salah satu saja, atau tidak sama sekali.
 */
export async function kirimEventTiket(event, ticket, actorName) {
  const eventId = randomUUID();
  const payload = buildPayload(event, eventId, ticket, actorName);

  const settings = await getSettings();

  await prisma.activityLog.create({
    data: {
      loggableType: 'Ticket',
      loggableId: ticket.id,
      action: event,
      source: 'web',
      actorType: 'user',
      actorName: actorName || 'Admin',
      metadata: payload,
      n8nEventId: eventId,
    },
  });

  const hasil = { n8n: null, telegram: null };

  if (settings.n8nWebhookUrl) {
    hasil.n8n = await kirimN8n(settings.n8nWebhookUrl, payload);
  } else {
    console.warn(`Event '${event}' tidak dikirim ke n8n: webhook URL belum diisi di Settings.`);
  }

  if (settings.telegramBotToken && settings.telegramChatId) {
    hasil.telegram = await kirimTelegram(
      settings.telegramBotToken,
      settings.telegramChatId,
      buildTelegramText(event, ticket)
    );
  }

  return hasil;
}
