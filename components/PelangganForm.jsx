import Link from 'next/link';

export default function PelangganForm({ action, sites, pelanggan, errorMessage }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      {errorMessage && (
        <div className="mb-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 text-sm">
          {errorMessage}
        </div>
      )}

      <form action={action} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Kode Pelanggan <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="kode"
              required
              defaultValue={pelanggan?.kode || ''}
              placeholder="Contoh: 11210020"
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nama Pelanggan <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="nama"
              required
              defaultValue={pelanggan?.nama || ''}
              placeholder="Nama lengkap pelanggan"
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">No. HP</label>
            <input
              type="text"
              name="no_hp"
              defaultValue={pelanggan?.noHp || ''}
              placeholder="62812xxxxxxx"
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Site / Lokasi</label>
            <select
              name="site_id"
              defaultValue={pelanggan?.siteId || ''}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
            >
              <option value="">- Pilih Site -</option>
              {sites.map((s) => (
                <option key={s.id} value={s.id}>{s.nama}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Alamat</label>
            <textarea
              name="alamat"
              rows={3}
              defaultValue={pelanggan?.alamat || ''}
              placeholder="Alamat lengkap pelanggan"
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Status Layanan <span className="text-rose-500">*</span>
            </label>
            <select
              name="status_layanan"
              required
              defaultValue={pelanggan?.statusLayanan || 'aktif'}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
            >
              <option value="aktif">Aktif</option>
              <option value="isolir">Isolir</option>
              <option value="nonaktif">Nonaktif</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6 pt-5 border-t border-slate-100">
          <button
            type="submit"
            className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg shadow-lg shadow-brand-600/20 transition"
          >
            Simpan
          </button>
          <Link href="/pelanggan" className="text-sm text-slate-500 hover:text-slate-700 font-medium">Batal</Link>
        </div>
      </form>
    </div>
  );
}
