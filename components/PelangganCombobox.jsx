'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Combobox pencarian pelanggan — ketik nama/kode, muncul daftar tersaring
 * langsung (client-side, tanpa round-trip server karena datanya sudah ada
 * di browser). Klik salah satu untuk pilih, otomatis isi hidden input
 * `pelanggan_id` supaya tetap kompatibel dengan Server Action yang sudah ada.
 */
export default function PelangganCombobox({ pelangganList, name = 'pelanggan_id', resetKey }) {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Kalau parent memberi resetKey baru (misalnya karena site berubah),
  // kosongkan pilihan supaya tidak salah kirim id pelanggan dari site lain.
  useEffect(() => {
    setQuery('');
    setSelectedId('');
  }, [resetKey]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const term = query.trim().toLowerCase();
  const filtered = term
    ? pelangganList.filter(
        (p) => p.nama.toLowerCase().includes(term) || p.kode.toLowerCase().includes(term)
      )
    : pelangganList;

  function pilih(p) {
    setSelectedId(String(p.id));
    setQuery(`${p.nama} (${p.kode})`);
    setOpen(false);
  }

  function bersihkan() {
    setSelectedId('');
    setQuery('');
    setOpen(true);
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <input type="hidden" name={name} value={selectedId} />
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedId('');
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Ketik nama atau kode pelanggan..."
          className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 pr-9 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={bersihkan}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            aria-label="Bersihkan"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {open && (
        <div className="absolute z-30 mt-1 w-full max-h-56 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
          {filtered.length === 0 && (
            <p className="px-3.5 py-2.5 text-sm text-slate-400">Tidak ada pelanggan yang cocok.</p>
          )}
          {filtered.slice(0, 50).map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => pilih(p)}
              className="w-full text-left px-3.5 py-2 text-sm hover:bg-brand-50 transition"
            >
              <span className="font-medium text-slate-800">{p.nama}</span>{' '}
              <span className="text-slate-400 text-xs">({p.kode})</span>
            </button>
          ))}
          {filtered.length > 50 && (
            <p className="px-3.5 py-2 text-xs text-slate-400 border-t border-slate-100">
              Menampilkan 50 dari {filtered.length} hasil — ketik lebih spesifik untuk mempersempit.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
