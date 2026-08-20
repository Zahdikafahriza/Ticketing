'use client';

import { useState } from 'react';

/**
 * Modal form generik untuk create/edit data sederhana (Sites, Teknisi).
 * `fields` menerima array {name, label, type, placeholder} untuk dirender otomatis.
 */
export default function CrudModal({ action, fields, editing, onClose, title }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
        <h3 className="font-semibold text-lg text-slate-900 mb-4">{title}</h3>
        <form action={action} onSubmit={() => setTimeout(onClose, 50)} className="space-y-4">
          {editing?.id && <input type="hidden" name="id" value={editing.id} />}
          {fields.map((f) => (
            <div key={f.name}>
              <label className="block text-sm font-medium text-slate-700 mb-1">{f.label}</label>
              {f.type === 'checkbox' ? (
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    name={f.name}
                    value="1"
                    defaultChecked={editing ? editing[f.name] : true}
                    className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  {f.checkboxLabel || 'Aktif'}
                </label>
              ) : f.type === 'textarea' ? (
                <textarea
                  name={f.name}
                  rows={3}
                  defaultValue={editing?.[f.name] || ''}
                  placeholder={f.placeholder}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                />
              ) : (
                <input
                  type={f.type || 'text'}
                  name={f.name}
                  required={f.required}
                  defaultValue={editing?.[f.name] || ''}
                  placeholder={f.placeholder}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                />
              )}
            </div>
          ))}
          <div className="flex items-center gap-3 pt-2">
            <button type="submit" className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition">
              Simpan
            </button>
            <button type="button" onClick={onClose} className="text-sm text-slate-500 hover:text-slate-700 font-medium">
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function useModal() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  return {
    open,
    editing,
    openCreate: () => { setEditing(null); setOpen(true); },
    openEdit: (data) => { setEditing(data); setOpen(true); },
    close: () => setOpen(false),
  };
}
