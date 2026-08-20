'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

export async function saveTeknisi(formData) {
  const id = formData.get('id');
  const data = {
    nama: formData.get('nama')?.toString().trim(),
    alias: formData.get('alias')?.toString().trim().toLowerCase(),
    noHp: formData.get('no_hp')?.toString().trim() || null,
    aktif: formData.get('aktif') === '1',
  };

  if (id) {
    await prisma.teknisi.update({ where: { id: Number(id) }, data });
  } else {
    await prisma.teknisi.create({ data });
  }

  revalidatePath('/teknisi');
}

export async function deleteTeknisi(id) {
  await prisma.teknisi.delete({ where: { id: Number(id) } });
  revalidatePath('/teknisi');
}
