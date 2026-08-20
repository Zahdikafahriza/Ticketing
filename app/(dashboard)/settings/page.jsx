import { getSettings } from '@/lib/settings';
import { updateSettings } from './actions';

export const dynamic = 'force-dynamic';

export default async function SettingsPage({ searchParams }) {
  const settings = await getSettings();

  if (settings._tabelBelumAda) {
    return (
      <div className="max-w-2xl mx-auto space-y-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Pengaturan Integrasi</h2>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-sm text-amber-800 space-y-3">
          <p className="font-semibold">⚠️ Tabel <code className="bg-amber-100 px-1 rounded">settings</code> belum ada di database.</p>
          <p>Halaman ini butuh tabel baru yang belum di-push ke database Anda. Jalankan salah satu perintah ini lalu refresh halaman:</p>
          <pre className="bg-slate-900 text-slate-100 rounded-lg p-3 text-xs overflow-x-auto">npx prisma generate{'\n'}npx prisma db push</pre>
          <p>Kalau pakai Docker: <code className="bg-amber-100 px-1 rounded">docker compose exec app npx prisma db push</code></p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Pengaturan Integrasi</h2>
        <p className="text-sm text-slate-500">
          Kredensial n8n &amp; Telegram disimpan di database, bisa diubah kapan saja lewat halaman ini
          tanpa perlu edit file atau restart aplikasi.
        </p>
      </div>

      {searchParams.success && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 text-sm font-medium">
          {searchParams.success}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <form action={updateSettings} className="space-y-6">
          <div>
            <h3 className="font-semibold text-slate-900 mb-1">🔗 Webhook n8n</h3>
            <p className="text-xs text-slate-500 mb-3">
              Event tiket (dibuat/di-assign/ditutup) dikirim ke URL ini. Kosongkan kalau tidak dipakai.
            </p>
            <label className="block text-sm font-medium text-slate-700 mb-1">Webhook URL</label>
            <input
              type="url"
              name="n8n_webhook_url"
              defaultValue={settings.n8nWebhookUrl || ''}
              placeholder="https://n8n-anda.com/webhook/tiket-events"
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
            />
          </div>

          <div className="pt-5 border-t border-slate-100">
            <h3 className="font-semibold text-slate-900 mb-1">📩 Telegram Bot (opsional, kirim langsung)</h3>
            <p className="text-xs text-slate-500 mb-3">
              Kalau diisi, notifikasi juga dikirim langsung ke Telegram tanpa lewat n8n. Bisa diisi salah satu saja atau keduanya.
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Bot Token</label>
                <input
                  type="text"
                  name="telegram_bot_token"
                  defaultValue={settings.telegramBotToken || ''}
                  placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm font-mono focus:ring-2 focus:ring-brand-500 outline-none"
                />
                <p className="text-xs text-slate-400 mt-1">Dapatkan dari @BotFather di Telegram.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Chat ID Grup</label>
                <input
                  type="text"
                  name="telegram_chat_id"
                  defaultValue={settings.telegramChatId || ''}
                  placeholder="-1234567890"
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm font-mono focus:ring-2 focus:ring-brand-500 outline-none"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Tambahkan bot ke grup, kirim pesan apapun, lalu buka{' '}
                  <code className="bg-slate-100 px-1 rounded">https://api.telegram.org/bot&lt;TOKEN&gt;/getUpdates</code>{' '}
                  untuk lihat <code className="bg-slate-100 px-1 rounded">chat.id</code>-nya (biasanya angka negatif).
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg shadow-lg shadow-brand-600/20 transition"
            >
              Simpan Pengaturan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
