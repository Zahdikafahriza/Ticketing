'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

export async function saveSite(formData) {
  const id = formData.get('id');
  const data = {
    kode: formData.get('kode')?.toString().trim(),
    nama: formData.get('nama')?.toString().trim(),
    area: formData.get('area')?.toString().trim() || null,
    alamat: formData.get('alamat')?.toString().trim() || null,
  };

  if (id) {
    await prisma.site.update({ where: { id: Number(id) }, data });
  } else {
    await prisma.site.create({ data });
  }

  revalidatePath('/sites');
}

export async function deleteSite(id) {
  await prisma.site.delete({ where: { id: Number(id) } });
  revalidatePath('/sites');
}
