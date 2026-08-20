import { prisma } from '@/lib/prisma';
import { updateSlaPolicy } from './actions';

export const dynamic = 'force-dynamic';

export default async function SlaPage() {
  const policies = await prisma.slaPolicy.findMany({ orderBy: { prioritas: 'desc' } });

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Kebijakan SLA</h2>
        <p className="text-sm text-slate-500">Atur target waktu respon dan penyelesaian tiket per prioritas.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {policies.map((policy) => {
          const updateWithId = updateSlaPolicy.bind(null, policy.id);
          return (
            <div key={policy.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-3 ${policy.prioritas === 'urgent' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>
                {policy.prioritas === 'urgent' ? 'Urgent' : 'Normal'}
              </span>
              <form action={updateWithId} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Target Respon (menit)</label>
                  <input
                    type="number"
                    name="target_response_minutes"
                    defaultValue={policy.targetResponseMinutes}
                    min={1}
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Target Penyelesaian (menit)</label>
                  <input
                    type="number"
                    name="target_resolution_minutes"
                    defaultValue={policy.targetResolutionMinutes}
                    min={1}
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
                <button type="submit" className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition">
                  Simpan
                </button>
              </form>
            </div>
          );
        })}
      </div>
    </div>
  );
}
