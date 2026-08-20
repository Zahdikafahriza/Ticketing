'use client';

import CrudModal, { useModal } from '@/components/CrudModal';
import DeleteButton from '@/components/DeleteButton';

const fields = [
  { name: 'nama', label: 'Nama', required: true },
  { name: 'alias', label: 'Alias (huruf kecil, untuk pencocokan otomatis)', required: true },
  { name: 'no_hp', label: 'No. HP' },
  { name: 'aktif', label: '', type: 'checkbox', checkboxLabel: 'Aktif' },
];

export default function TeknisiManager({ teknisi, saveTeknisi, deleteTeknisi }) {
  const modal = useModal();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Teknisi</h2>
          <p className="text-sm text-slate-500">Kelola data teknisi lapangan.</p>
        </div>
        <button
          onClick={modal.openCreate}
          className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg shadow-lg shadow-brand-600/20 transition"
        >
          + Tambah Teknisi
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="text-left font-medium px-5 py-3">Nama</th>
              <th className="text-left font-medium px-5 py-3">Alias</th>
              <th className="text-left font-medium px-5 py-3">No. HP</th>
              <th className="text-left font-medium px-5 py-3">Status</th>
              <th className="text-right font-medium px-5 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {teknisi.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-400">Belum ada teknisi.</td></tr>
            )}
            {teknisi.map((tk) => (
              <tr key={tk.id} className="hover:bg-slate-50">
                <td className="px-5 py-3 font-medium text-slate-800">{tk.nama}</td>
                <td className="px-5 py-3 text-slate-600">{tk.alias}</td>
                <td className="px-5 py-3 text-slate-600">{tk.noHp || '-'}</td>
                <td className="px-5 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tk.aktif ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                    {tk.aktif ? 'Aktif' : 'Nonaktif'}
                  </span>
                </td>
                <td className="px-5 py-3 text-right space-x-2">
                  <button onClick={() => modal.openEdit({ ...tk, no_hp: tk.noHp })} className="text-brand-600 hover:text-brand-700 font-medium">Ubah</button>
                  <DeleteButton action={deleteTeknisi.bind(null, tk.id)} confirmText={`Hapus teknisi ${tk.nama}?`} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal.open && (
        <CrudModal
          action={saveTeknisi}
          fields={fields}
          editing={modal.editing}
          onClose={modal.close}
          title={modal.editing ? 'Ubah Teknisi' : 'Tambah Teknisi'}
        />
      )}
    </div>
  );
}
