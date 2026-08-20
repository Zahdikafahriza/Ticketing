'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

function ambilData(formData) {
  const siteId = formData.get('site_id');
  return {
    siteId: siteId ? Number(siteId) : null,
    kode: formData.get('kode')?.toString().trim(),
    nama: formData.get('nama')?.toString().trim(),
    noHp: formData.get('no_hp')?.toString().trim() || null,
    alamat: formData.get('alamat')?.toString().trim() || null,
    statusLayanan: formData.get('status_layanan'),
  };
}

export async function createPelanggan(formData) {
  const data = ambilData(formData);

  if (!data.kode || !data.nama) {
    redirect('/pelanggan/new?error=Kode dan nama wajib diisi.');
  }

  const existing = await prisma.pelanggan.findUnique({ where: { kode: data.kode } });
  if (existing) {
    redirect(`/pelanggan/new?error=Kode ${data.kode} sudah dipakai pelanggan lain.`);
  }

  const pelanggan = await prisma.pelanggan.create({ data });

  revalidatePath('/pelanggan');
  redirect(`/pelanggan?success=Pelanggan '${pelanggan.nama}' berhasil ditambahkan.`);
}

export async function updatePelanggan(id, formData) {
  const data = ambilData(formData);

  if (!data.kode || !data.nama) {
    redirect(`/pelanggan/${id}/edit?error=Kode dan nama wajib diisi.`);
  }

  const existing = await prisma.pelanggan.findFirst({
    where: { kode: data.kode, NOT: { id: Number(id) } },
  });
  if (existing) {
    redirect(`/pelanggan/${id}/edit?error=Kode ${data.kode} sudah dipakai pelanggan lain.`);
  }

  const pelanggan = await prisma.pelanggan.update({ where: { id: Number(id) }, data });

  revalidatePath('/pelanggan');
  redirect(`/pelanggan?success=Data pelanggan '${pelanggan.nama}' berhasil diperbarui.`);
}

export async function deletePelanggan(id) {
  const pelanggan = await prisma.pelanggan.findUnique({ where: { id: Number(id) } });
  await prisma.pelanggan.delete({ where: { id: Number(id) } });

  revalidatePath('/pelanggan');
  redirect(`/pelanggan?success=Pelanggan '${pelanggan?.nama ?? ''}' berhasil dihapus.`);
}
