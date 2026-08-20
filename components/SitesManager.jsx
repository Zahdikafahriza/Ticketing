'use client';

import CrudModal, { useModal } from '@/components/CrudModal';
import DeleteButton from '@/components/DeleteButton';

const fields = [
  { name: 'kode', label: 'Kode', required: true },
  { name: 'nama', label: 'Nama', required: true },
  { name: 'area', label: 'Area' },
  { name: 'alamat', label: 'Alamat' },
];

export default function SitesManager({ sites, saveSite, deleteSite }) {
  const modal = useModal();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Site / Lokasi</h2>
          <p className="text-sm text-slate-500">Kelola lokasi/cluster jaringan.</p>
        </div>
        <button
          onClick={modal.openCreate}
          className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg shadow-lg shadow-brand-600/20 transition"
        >
          + Tambah Site
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="text-left font-medium px-5 py-3">Kode</th>
              <th className="text-left font-medium px-5 py-3">Nama</th>
              <th className="text-left font-medium px-5 py-3">Area</th>
              <th className="text-left font-medium px-5 py-3">Jml. Pelanggan</th>
              <th className="text-right font-medium px-5 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sites.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-400">Belum ada site.</td></tr>
            )}
            {sites.map((site) => (
              <tr key={site.id} className="hover:bg-slate-50">
                <td className="px-5 py-3 font-mono text-xs">{site.kode}</td>
                <td className="px-5 py-3 font-medium text-slate-800">{site.nama}</td>
                <td className="px-5 py-3 text-slate-600">{site.area || '-'}</td>
                <td className="px-5 py-3 text-slate-600">{site._count?.pelanggan ?? 0}</td>
                <td className="px-5 py-3 text-right space-x-2">
                  <button onClick={() => modal.openEdit(site)} className="text-brand-600 hover:text-brand-700 font-medium">Ubah</button>
                  <DeleteButton action={deleteSite.bind(null, site.id)} confirmText={`Hapus site ${site.nama}?`} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal.open && (
        <CrudModal
          action={saveSite}
          fields={fields}
          editing={modal.editing}
          onClose={modal.close}
          title={modal.editing ? 'Ubah Site' : 'Tambah Site'}
        />
      )}
    </div>
  );
}
