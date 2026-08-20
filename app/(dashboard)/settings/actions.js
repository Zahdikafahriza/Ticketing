'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { saveSettings } from '@/lib/settings';

export async function updateSettings(formData) {
  await saveSettings({
    n8nWebhookUrl: formData.get('n8n_webhook_url')?.toString().trim() || null,
    telegramBotToken: formData.get('telegram_bot_token')?.toString().trim() || null,
    telegramChatId: formData.get('telegram_chat_id')?.toString().trim() || null,
  });

  revalidatePath('/settings');
  redirect('/settings?success=Pengaturan integrasi berhasil disimpan.');
}
