'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function TicketFilters({ sites }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [q, setQ] = useState(searchParams.get('q') || '');
  const debounceRef = useRef(null);

  const status = searchParams.get('status') || '';
  const prioritas = searchParams.get('prioritas') || '';
  const siteId = searchParams.get('site_id') || '';

  function pushParams(next) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    params.delete('page');
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      pushParams({ q });
    }, 400);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const adaFilter = q || status || prioritas || siteId;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari kode tiket, judul, pelanggan... (otomatis, tanpa Enter)"
          className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
        />
        {isPending && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-brand-300 border-t-brand-600 rounded-full animate-spin" />
          </div>
        )}
      </div>
      <select
        value={status}
        onChange={(e) => pushParams({ status: e.target.value })}
        className="rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
      >
        <option value="">Semua Status</option>
        <option value="open">Open</option>
        <option value="closed">Closed</option>
      </select>
      <select
        value={prioritas}
        onChange={(e) => pushParams({ prioritas: e.target.value })}
        className="rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
      >
        <option value="">Semua Prioritas</option>
        <option value="normal">Normal</option>
        <option value="urgent">Urgent</option>
      </select>
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
      {adaFilter && (
        <Link href={pathname} className="text-sm text-slate-500 hover:text-slate-700 px-3 py-2.5 whitespace-nowrap">
          Reset
        </Link>
      )}
    </div>
  );
}
