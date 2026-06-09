import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { StatusBadge } from "../../components/StatusBadge";
import { ArrowRightLeft, Plus } from "lucide-react";



const STATUSES = ["REQUESTED","UNDER_REVIEW","APPROVED","DUAL_VALIDITY_ACTIVE","ROLLED_BACK","CUTOVER_CONFIRMED","SOURCE_DEACTIVATED","COMPLETED","REJECTED","EXPIRED"];

export default function LicenseMigration(_props = {}) {
  const [migrations, setMigrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({ sourceHostname: "", targetHostname: "" });

  const refresh = () => api.get("/customer/license-migration").then(setMigrations).finally(() => setLoading(false));
  useEffect(() => { refresh(); }, []);

  async function createMigration() {
    const m = await api.post("/customer/license-migration", form);
    setMsg(`Migration request ${m.id} submitted`);
    setShowForm(false); refresh();
    setTimeout(() => setMsg(""), 4000);
  }

  if (loading) return <div className="p-8 text-slate-500 text-sm">Loading…</div>;

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">License Migration</h1>
          <p className="text-sm text-slate-400 mt-0.5">Request hardware migration with dual-validity window</p>
        </div>
        <button onClick={() => setShowForm(v => !v)} className="flex items-center gap-1.5 text-xs bg-cyan-500 text-slate-900 font-semibold px-3 py-1.5 rounded-lg hover:bg-cyan-400">
          <Plus size={13} />Create Migration Request
        </button>
      </div>

      {msg && <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm rounded-lg px-4 py-2">{msg}</div>}

      {/* Status flow */}
      <div className="bg-slate-900/50 border border-white/5 rounded-xl p-4">
        <div className="text-xs text-slate-500 mb-2">Migration lifecycle</div>
        <div className="flex flex-wrap gap-1.5">
          {STATUSES.map((s, i) => (
            <span key={s} className="flex items-center gap-1">
              <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">{s}</span>
              {i < STATUSES.length - 1 && <span className="text-slate-600 text-xs">→</span>}
            </span>
          ))}
        </div>
      </div>

      {showForm && (
        <div className="bg-slate-900 border border-cyan-500/20 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-white">New Migration Request</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[["sourceHostname","Source Hostname"],["targetHostname","Target Hostname"]].map(([k,label]) => (
              <div key={k}>
                <label className="block text-xs text-slate-400 mb-1">{label}</label>
                <input value={(form as any)[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500" />
              </div>
            ))}
          </div>
          <div className="text-xs text-slate-400 bg-slate-800/50 rounded-lg p-3">
            You will need to upload the source and target hardware binding files. After approval, both systems remain valid during the rollback window. Submit your binding files to the vendor team.
          </div>
          <div className="flex gap-2">
            <button onClick={createMigration} className="text-sm bg-cyan-500 text-slate-900 font-semibold px-4 py-1.5 rounded-lg hover:bg-cyan-400">Submit Request</button>
            <button onClick={() => setShowForm(false)} className="text-sm bg-slate-800 text-slate-300 px-4 py-1.5 rounded-lg hover:bg-slate-700">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-slate-900 border border-white/5 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-slate-500 border-b border-white/5">
              {["Migration ID","Source","Target","Source Hash","Target Hash","Rollback Window","Dual Validity","Final Cutover","Status"].map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {migrations.map(m => (
              <tr key={m.id} className="border-b border-white/5 hover:bg-white/2">
                <td className="px-4 py-3 font-mono text-xs text-slate-400">{m.id}</td>
                <td className="px-4 py-3 text-xs text-slate-300">{m.sourceHostname}</td>
                <td className="px-4 py-3 text-xs text-slate-300">{m.targetHostname}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-500 max-w-[110px] truncate">{m.sourceBindingHash}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-500 max-w-[110px] truncate">{m.targetBindingHash}</td>
                <td className="px-4 py-3 text-xs text-slate-400">{m.rollbackWindowStart} → {m.rollbackWindowEnd}</td>
                <td className="px-4 py-3"><StatusBadge status={m.dualValidityStatus} /></td>
                <td className="px-4 py-3"><StatusBadge status={m.finalCutoverStatus} /></td>
                <td className="px-4 py-3"><StatusBadge status={m.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
