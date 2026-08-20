'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function PelangganFilters({ sites }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [q, setQ] = useState(searchParams.get('q') || '');
  const debounceRef = useRef(null);

  const siteId = searchParams.get('site_id') || '';
  const statusLayanan = searchParams.get('status_layanan') || '';

  function pushParams(next) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    params.delete('page'); // reset ke halaman 1 setiap filter berubah
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  // Live search: tunggu 400ms setelah user berhenti mengetik sebelum filter jalan,
  // supaya tidak nge-fetch di setiap ketikan huruf.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      pushParams({ q });
    }, 400);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const adaFilter = q || siteId || statusLayanan;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari nama, kode, no HP, alamat... (otomatis, tanpa Enter)"
          className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
        />
        {isPending && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-brand-300 border-t-brand-600 rounded-full animate-spin" />
          </div>
        )}
      </div>
      <select
        value={siteId}
        onChange={(e) => pushParams({ site_id: e.target.value })}
        className="rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
      >
        <option value="">Semua Site</option>
        {sites.map((s) => (
          <option key={s.id} value={s.id}>{s.nama}</option>
        ))}
      </select>
      <select
        value={statusLayanan}
        onChange={(e) => pushParams({ status_layanan: e.target.value })}
        className="rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
      >
        <option value="">Semua Status</option>
        <option value="aktif">Aktif</option>
        <option value="isolir">Isolir</option>
        <option value="nonaktif">Nonaktif</option>
      </select>
      {adaFilter && (
        <Link href={pathname} className="text-sm text-slate-500 hover:text-slate-700 px-3 py-2.5 whitespace-nowrap">
          Reset
        </Link>
      )}
    </div>
  );
}
