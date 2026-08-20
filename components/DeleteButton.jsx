'use client';

import { useState } from 'react';
import Swal from 'sweetalert2';

export default function DeleteButton({ action, confirmText = 'Hapus data ini?', label = 'Hapus' }) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    const result = await Swal.fire({
      title: 'Yakin?',
      text: confirmText,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, hapus',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#94a3b8',
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    setLoading(true);
    try {
      // `action` adalah Server Action yang sudah di-bind (mis. deletePelanggan.bind(null, id)).
      // Server Action bisa dipanggil langsung sebagai fungsi async biasa dari client component,
      // tidak wajib lewat <form action={...}>.
      await action();
    } catch (err) {
      // redirect() dari Server Action memicu error khusus (NEXT_REDIRECT) yang normal —
      // bukan kegagalan sungguhan, jadi jangan tampilkan sebagai error ke user.
      if (!String(err?.message).includes('NEXT_REDIRECT')) {
        setLoading(false);
        Swal.fire({
          title: 'Gagal',
          text: 'Terjadi kesalahan saat menghapus data. Coba lagi.',
          icon: 'error',
          confirmButtonColor: '#4f46e5',
        });
      }
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="text-rose-500 hover:text-rose-700 font-medium disabled:opacity-50"
    >
      {loading ? 'Menghapus...' : label}
    </button>
  );
}
