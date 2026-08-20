'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import TeknisiMultiSelect from '@/components/TeknisiMultiSelect';
import PelangganCombobox from '@/components/PelangganCombobox';

export default function TicketCreateForm({ action, sites, pelangganList, teknisiList, errorMessage }) {
  const [selectedSiteId, setSelectedSiteId] = useState('');

  const pelangganTerfilter = useMemo(() => {
    if (!selectedSiteId) return pelangganList;
    return pelangganList.filter((p) => String(p.siteId) === selectedSiteId);
  }, [selectedSiteId, pelangganList]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      {errorMessage && (
        <div className="mb-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 text-sm">
          {errorMessage}
        </div>
      )}

      <form action={action} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Judul Tiket <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="judul"
            required
            placeholder="Contoh: Internet mati total"
            className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              1. Pilih Site / Lokasi dulu
            </label>
            <select
              name="site_id"
              value={selectedSiteId}
              onChange={(e) => setSelectedSiteId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
            >
              <option value="">- Pilih Site (opsional) -</option>
              {sites.map((s) => (
                <option key={s.id} value={s.id}>{s.nama}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              2. Pelanggan {selectedSiteId && <span className="text-brand-600 font-normal">(sudah difilter per site)</span>}
            </label>
            <PelangganCombobox pelangganList={pelangganTerfilter} resetKey={selectedSiteId} />
            {pelangganTerfilter.length === 0 && (
              <p className="text-xs text-rose-500 mt-1">Tidak ada pelanggan terdaftar di site ini.</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Alamat / Lokasi Detail</label>
          <input
            type="text"
            name="alamat"
            placeholder="Kosongkan untuk otomatis ambil dari data pelanggan"
            className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi Gangguan</label>
          <textarea
            name="deskripsi"
            rows={3}
            placeholder="Jelaskan detail keluhan/gangguan..."
            className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
            <input
              type="text"
              name="kategori"
              placeholder="Contoh: Jaringan"
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Prioritas <span className="text-rose-500">*</span>
            </label>
            <select name="prioritas" required defaultValue="normal" className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none">
              <option value="normal">Normal</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            CC / Customer Service <span className="text-slate-400 font-normal">(yang membuat tiket ini)</span>
          </label>
          <input
            type="text"
            name="cc"
            placeholder="Contoh: Eca"
            className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Assign Teknisi <span className="text-slate-400 font-normal">(bisa pilih lebih dari satu, atau semua)</span>
          </label>
          <TeknisiMultiSelect teknisiList={teknisiList} />
        </div>

        <div className="rounded-lg bg-brand-50 border border-brand-100 px-4 py-3 text-sm text-brand-700">
          🔗 Event tiket ini otomatis dikirim ke integrasi yang aktif (n8n/Telegram) saat disimpan — atur di halaman{' '}
          <Link href="/settings" className="underline font-medium">Pengaturan</Link>.
        </div>

        <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
          <button
            type="submit"
            className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg shadow-lg shadow-brand-600/20 transition"
          >
            Simpan Tiket
          </button>
          <Link href="/tickets" className="text-sm text-slate-500 hover:text-slate-700 font-medium">Batal</Link>
        </div>
      </form>
    </div>
  );
}
