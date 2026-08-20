import { prisma } from '@/lib/prisma';

/**
 * Klasifikasi keluhan berdasarkan kata kunci di judul/kategori tiket.
 * Kalau kategori sudah diisi manual oleh admin, itu yang dipakai duluan;
 * kalau kosong, coba tebak dari kata kunci di judul.
 */
const ATURAN_KLASIFIKASI = [
  { label: 'LOS (Mati Total)', regex: /\blos\b|mati total|tidak ada koneksi|no ?connection|down total/i },
  { label: 'Lemot / Lambat', regex: /lemot|lambat|slow|pelan/i },
  { label: 'Putus-putus', regex: /putus[- ]?putus|intermittent|kadang|hilang timbul/i },
  { label: 'Billing', regex: /billing|bayar|invoice|tagihan|pembayaran/i },
  { label: 'Perangkat', regex: /wifi|router|ont|modem|perangkat|redaman/i },
];

export function klasifikasiKeluhan(judul, kategori) {
  const teks = `${kategori || ''} ${judul || ''}`;
  for (const aturan of ATURAN_KLASIFIKASI) {
    if (aturan.regex.test(teks)) return aturan.label;
  }
  return 'Lainnya';
}

/**
 * Laporan 1: Rekap & klasifikasi keluhan pelanggan.
 * Goals: mengetahui masalah yang paling sering terjadi dan area prioritas.
 */
export async function getKlasifikasiKeluhan({ dari, sampai } = {}) {
  const where = {};
  if (dari || sampai) {
    where.createdAt = {};
    if (dari) where.createdAt.gte = dari;
    if (sampai) where.createdAt.lt = sampai;
  }

  const tickets = await prisma.ticket.findMany({
    where,
    select: { id: true, judul: true, kategori: true, site: { select: { nama: true } }, prioritas: true, status: true },
  });

  const perKategori = {};
  const perArea = {};

  for (const t of tickets) {
    const label = klasifikasiKeluhan(t.judul, t.kategori);
    perKategori[label] = (perKategori[label] || 0) + 1;

    const area = t.site?.nama || 'Tanpa Site';
    perArea[area] = (perArea[area] || 0) + 1;
  }

  const total = tickets.length;
  const kategoriRows = Object.entries(perKategori)
    .map(([label, jumlah]) => ({ label, jumlah, persen: total ? Math.round((jumlah / total) * 100) : 0 }))
    .sort((a, b) => b.jumlah - a.jumlah);

  const areaRows = Object.entries(perArea)
    .map(([label, jumlah]) => ({ label, jumlah, persen: total ? Math.round((jumlah / total) * 100) : 0 }))
    .sort((a, b) => b.jumlah - a.jumlah);

  return { total, kategoriRows, areaRows };
}

/**
 * Laporan 2: Analisis penyebab gangguan terbanyak per area, dalam rentang minggu tertentu.
 * Goals: menentukan tindakan pencegahan per area.
 */
export async function getAnalisisPenyebab({ dari, sampai }) {
  const tickets = await prisma.ticket.findMany({
    where: {
      createdAt: { gte: dari, lt: sampai },
      penyebab: { not: null },
    },
    select: { penyebab: true, site: { select: { nama: true } } },
  });

  const grouped = {};
  for (const t of tickets) {
    const area = t.site?.nama || 'Tanpa Site';
    const penyebab = (t.penyebab || '').trim();
    if (!penyebab) continue;
    grouped[area] = grouped[area] || {};
    grouped[area][penyebab] = (grouped[area][penyebab] || 0) + 1;
  }

  const rows = [];
  for (const [area, penyebabMap] of Object.entries(grouped)) {
    for (const [penyebab, jumlah] of Object.entries(penyebabMap)) {
      rows.push({ area, penyebab, jumlah });
    }
  }
  rows.sort((a, b) => b.jumlah - a.jumlah);

  return { rows, totalTiketDenganPenyebab: tickets.length };
}

/**
 * Laporan 3: Monitoring penyelesaian tiket & waktu penanganan (SLA).
 * Goals: mengurangi tiket yang terlambat ditangani.
 */
export async function getMonitoringSLA() {
  const slaPolicies = await prisma.slaPolicy.findMany();
  const slaMap = Object.fromEntries(slaPolicies.map((s) => [s.prioritas, s]));

  const [closedTickets, openTickets] = await Promise.all([
    prisma.ticket.findMany({
      where: { status: 'closed', resolvedAt: { not: null } },
      select: { id: true, kodeTiket: true, judul: true, prioritas: true, createdAt: true, firstAssignedAt: true, resolvedAt: true },
      orderBy: { resolvedAt: 'desc' },
      take: 500,
    }),
    prisma.ticket.findMany({
      where: { status: 'open' },
      include: { pelangganRel: true, site: true },
    }),
  ]);

  // Rata-rata waktu respon & penyelesaian (menit) dari tiket yang sudah closed
  let totalRespon = 0, countRespon = 0;
  let totalResolusi = 0, countResolusi = 0;

  for (const t of closedTickets) {
    if (t.firstAssignedAt) {
      totalRespon += (new Date(t.firstAssignedAt) - new Date(t.createdAt)) / 60000;
      countRespon++;
    }
    if (t.resolvedAt) {
      totalResolusi += (new Date(t.resolvedAt) - new Date(t.createdAt)) / 60000;
      countResolusi++;
    }
  }

  const rataResponMenit = countRespon ? Math.round(totalRespon / countRespon) : null;
  const rataResolusiMenit = countResolusi ? Math.round(totalResolusi / countResolusi) : null;

  // Tiket open yang sudah lewat SLA (overdue)
  const now = Date.now();
  const overdue = openTickets.filter((t) => {
    const policy = slaMap[t.prioritas];
    if (!policy) return false;
    const umurMenit = (now - new Date(t.createdAt).getTime()) / 60000;
    if (!t.firstAssignedAt && umurMenit > policy.targetResponseMinutes) return true;
    if (umurMenit > policy.targetResolutionMinutes) return true;
    return false;
  });

  // Compliance: dari tiket closed, berapa persen yang selesai SEBELUM target SLA
  let sesuaiSla = 0;
  for (const t of closedTickets) {
    const policy = slaMap[t.prioritas];
    if (!policy || !t.resolvedAt) continue;
    const menit = (new Date(t.resolvedAt) - new Date(t.createdAt)) / 60000;
    if (menit <= policy.targetResolutionMinutes) sesuaiSla++;
  }
  const persenCompliance = closedTickets.length ? Math.round((sesuaiSla / closedTickets.length) * 100) : 0;

  return {
    rataResponMenit,
    rataResolusiMenit,
    overdue: overdue.slice(0, 20),
    totalOverdue: overdue.length,
    persenCompliance,
    totalClosedDihitung: closedTickets.length,
  };
}

/**
 * Laporan 4: Laporan bulanan - jumlah tiket, jenis gangguan, area terbanyak, SLA.
 * Goals: menjadi dasar evaluasi manajemen.
 */
export async function getLaporanBulanan(tahun, bulan) {
  const dari = new Date(tahun, bulan - 1, 1);
  const sampai = new Date(tahun, bulan, 1);

  const tickets = await prisma.ticket.findMany({
    where: { createdAt: { gte: dari, lt: sampai } },
    select: {
      id: true, judul: true, kategori: true, prioritas: true, status: true,
      createdAt: true, resolvedAt: true, firstAssignedAt: true,
      site: { select: { nama: true } },
    },
  });

  const slaPolicies = await prisma.slaPolicy.findMany();
  const slaMap = Object.fromEntries(slaPolicies.map((s) => [s.prioritas, s]));

  const perKategori = {};
  const perArea = {};
  let closedCount = 0;
  let sesuaiSla = 0;

  for (const t of tickets) {
    const label = klasifikasiKeluhan(t.judul, t.kategori);
    perKategori[label] = (perKategori[label] || 0) + 1;

    const area = t.site?.nama || 'Tanpa Site';
    perArea[area] = (perArea[area] || 0) + 1;

    if (t.status === 'closed' && t.resolvedAt) {
      closedCount++;
      const policy = slaMap[t.prioritas];
      if (policy) {
        const menit = (new Date(t.resolvedAt) - new Date(t.createdAt)) / 60000;
        if (menit <= policy.targetResolutionMinutes) sesuaiSla++;
      }
    }
  }

  const kategoriRows = Object.entries(perKategori).map(([label, jumlah]) => ({ label, jumlah })).sort((a, b) => b.jumlah - a.jumlah);
  const areaRows = Object.entries(perArea).map(([label, jumlah]) => ({ label, jumlah })).sort((a, b) => b.jumlah - a.jumlah);

  return {
    dari, sampai,
    total: tickets.length,
    closedCount,
    openCount: tickets.length - closedCount,
    urgentCount: tickets.filter((t) => t.prioritas === 'urgent').length,
    persenSlaCompliance: closedCount ? Math.round((sesuaiSla / closedCount) * 100) : 0,
    kategoriRows,
    areaRows,
  };
}
