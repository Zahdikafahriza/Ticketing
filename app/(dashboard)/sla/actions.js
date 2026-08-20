'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

export async function updateSlaPolicy(id, formData) {
  await prisma.slaPolicy.update({
    where: { id: Number(id) },
    data: {
      targetResponseMinutes: Number(formData.get('target_response_minutes')),
      targetResolutionMinutes: Number(formData.get('target_resolution_minutes')),
    },
  });

  revalidatePath('/sla');
}
