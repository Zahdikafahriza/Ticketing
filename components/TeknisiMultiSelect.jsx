'use client';

import { useState } from 'react';

/**
 * Multi-select teknisi via checkbox. Setiap checkbox punya name yang sama
 * (default "assigned_to") supaya saat form di-submit, browser mengirim
 * banyak value sekaligus — di server tinggal formData.getAll('assigned_to')
 * lalu di-gabung dengan koma (persis format data lama Anda, mis. "Riki, Hanang").
 */
export default function TeknisiMultiSelect({ teknisiList, defaultSelected = [], name = 'assigned_to' }) {
  const [selected, setSelected] = useState(new Set(defaultSelected));

  const semuaTerpilih = teknisiList.length > 0 && teknisiList.every((tk) => selected.has(tk.nama));

  function toggle(nama) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(nama)) next.delete(nama);
      else next.add(nama);
      return next;
    });
  }

  function toggleSemua() {
    setSelected(semuaTerpilih ? new Set() : new Set(teknisiList.map((tk) => tk.nama)));
  }

  return (
    <div className="border border-slate-300 rounded-lg divide-y divide-slate-100 max-h-48 overflow-y-auto">
      <label className="flex items-center gap-2 px-3.5 py-2.5 text-sm font-medium bg-slate-50 cursor-pointer">
        <input
          type="checkbox"
          checked={semuaTerpilih}
          onChange={toggleSemua}
          className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
        />
        Pilih Semua Teknisi
      </label>
      {teknisiList.length === 0 && (
        <p className="px-3.5 py-3 text-sm text-slate-400">Belum ada teknisi aktif.</p>
      )}
      {teknisiList.map((tk) => (
        <label key={tk.id} className="flex items-center gap-2 px-3.5 py-2 text-sm cursor-pointer hover:bg-slate-50">
          <input
            type="checkbox"
            name={name}
            value={tk.nama}
            checked={selected.has(tk.nama)}
            onChange={() => toggle(tk.nama)}
            className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
          {tk.nama}
        </label>
      ))}
    </div>
  );
}
