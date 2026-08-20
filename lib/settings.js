import { prisma } from '@/lib/prisma';

/**
 * Ambil setting integrasi (n8n webhook, Telegram bot) dari database.
 * Kalau belum pernah diisi, otomatis buat baris kosong (id=1).
 *
 * Kalau tabel `settings` belum ada (skema baru belum di-push ke database),
 * fungsi ini TIDAK melempar error mentah Prisma — supaya halaman Settings
 * tetap bisa dibuka dan menampilkan instruksi yang jelas ke pengguna.
 */
export async function getSettings() {
  try {
    return await prisma.setting.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1 },
    });
  } catch (err) {
    console.error('Gagal ambil Settings dari database:', err.message);
    return {
      id: 1,
      n8nWebhookUrl: '',
      telegramBotToken: '',
      telegramChatId: '',
      _tabelBelumAda: true,
    };
  }
}

export async function saveSettings(data) {
  return prisma.setting.upsert({
    where: { id: 1 },
    update: data,
    create: { id: 1, ...data },
  });
}
