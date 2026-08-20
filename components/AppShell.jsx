'use client';

import { useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';

export default function AppShell({ user, notifCount = 0, children }) {
  const [open, setOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar open={open} onClose={() => setOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center gap-3 px-4 lg:px-8 sticky top-0 z-20">
          <button
            onClick={() => setOpen(true)}
            className="lg:hidden text-slate-500 hover:text-slate-700 -ml-1 p-1.5 rounded-lg hover:bg-slate-100 flex-shrink-0"
            aria-label="Buka menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Status Online - mirip referensi, dihilangkan di layar sangat kecil */}
          <div className="hidden sm:flex items-center gap-1.5 text-sm text-slate-500">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            Online
          </div>

          <div className="flex items-center gap-2 sm:gap-3 ml-auto min-w-0">
            {/* Bell notifikasi - jumlahnya = tiket urgent/belum-assign yang masih open */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen((v) => !v)}
                className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition"
                aria-label="Notifikasi"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {notifCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                    {notifCount > 99 ? '99+' : notifCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)} />
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-slate-200 shadow-xl z-20 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-semibold text-slate-800">Notifikasi</p>
                    </div>
                    <div className="p-4 text-sm text-slate-600">
                      {notifCount > 0 ? (
                        <p>
                          Ada <span className="font-semibold text-rose-600">{notifCount}</span> tiket urgent
                          atau belum di-assign yang butuh perhatian.
                        </p>
                      ) : (
                        <p className="text-slate-400">Tidak ada tiket yang butuh perhatian saat ini 🎉</p>
                      )}
                    </div>
                    <Link
                      href="/tickets?status=open"
                      onClick={() => setNotifOpen(false)}
                      className="block text-center text-sm font-medium text-brand-600 hover:text-brand-700 px-4 py-3 border-t border-slate-100"
                    >
                      Lihat semua tiket open
                    </Link>
                  </div>
                </>
              )}
            </div>

            <div className="hidden sm:flex flex-col text-right min-w-0">
              <span className="text-sm font-medium text-slate-800 truncate">{user?.name ?? 'Admin'}</span>
              <span className="text-xs text-slate-400 truncate">{user?.email ?? ''}</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-semibold flex-shrink-0">
              {(user?.name ?? 'A').charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 p-3 sm:p-4 lg:p-8 min-w-0 overflow-x-hidden">
          <div className="max-w-7xl mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
