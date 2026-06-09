import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { StatusBadge } from "../../components/StatusBadge";
import { BadgeCheck, Upload, Shield } from "lucide-react";



export default function License(_props = {}) {
  const [lic, setLic] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => { api.get("/customer/license").then(setLic).finally(() => setLoading(false)); }, []);

  const act = async (endpoint: string, label: string) => {
    await api.post(endpoint);
    setMsg(`${label} completed`);
    setTimeout(() => setMsg(""), 3000);
  };

  if (loading) return <div className="p-8 text-slate-500 text-sm">Loading…</div>;
  if (!lic) return <div className="p-8 text-red-400 text-sm">No license data</div>;

  const daysLeft = Math.round((new Date(lic.expiryDate).getTime() - Date.now()) / 86400000);

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white">License Management</h1>
        <p className="text-sm text-slate-400 mt-0.5">Current license status for Alpha Manufacturing</p>
      </div>

      {msg && <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm rounded-lg px-4 py-2">{msg}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-slate-900 border border-white/5 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <BadgeCheck size={18} className="text-cyan-400" />
            <span className="font-bold text-white">Current License</span>
            <StatusBadge status={lic.status} />
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            {[
              ["License ID", lic.id], ["Customer ID", lic.customerId], ["Site ID", lic.siteId],
              ["Product Edition", lic.productEdition], ["Agent Limit", `${lic.activatedAgents} / ${lic.agentLimit}`],
              ["Hub Limit", lic.hubLimit], ["Vault Limit", lic.vaultLimit],
              ["Start Date", lic.startDate], ["Expiry Date", lic.expiryDate],
              ["Grace Period", `${lic.gracePeriod} days`], ["Days Remaining", daysLeft],
              ["Hardware Binding", lic.hardwareBindingHash],
            ].map(([k, v]) => (
              <div key={k} className="bg-slate-800/50 rounded-lg p-2.5">
                <div className="text-slate-500 mb-0.5">{k}</div>
                <div className="text-white font-medium break-all">{String(v)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-white/5 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Shield size={14} className="text-cyan-400" />
            <span className="text-sm font-bold text-white">Feature Entitlement</span>
          </div>
          {lic.features?.map((f: string) => (
            <div key={f} className="flex items-center gap-2 text-xs text-slate-300">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
              {f}
            </div>
          ))}

          <div className="pt-3 border-t border-white/5 text-xs text-slate-500">
            <div className="font-medium text-slate-400 mb-2">Days remaining</div>
            <div className="text-2xl font-bold text-white">{daysLeft}</div>
            <div className="w-full h-1.5 bg-slate-700 rounded-full mt-2">
              <div className={`h-1.5 rounded-full transition-all ${daysLeft < 30 ? "bg-red-500" : daysLeft < 90 ? "bg-yellow-500" : "bg-emerald-500"}`}
                style={{ width: `${Math.min(100, (daysLeft / 365) * 100)}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-slate-900 border border-white/5 rounded-xl p-5">
        <div className="text-sm font-bold text-white mb-3">Actions</div>
        <div className="flex flex-wrap gap-2">
          <label className="cursor-pointer">
            <span className="flex items-center gap-1.5 text-xs bg-cyan-500 text-slate-900 font-semibold px-3 py-1.5 rounded-lg hover:bg-cyan-400 transition-colors">
              <Upload size={12} />Import License File
            </span>
            <input type="file" className="hidden" onChange={() => act("/customer/license/import", "License imported")} />
          </label>
          <button onClick={() => act("/customer/license/activate-offline", "Offline activation")} className="text-xs bg-slate-800 text-slate-300 border border-white/10 px-3 py-1.5 rounded-lg hover:bg-slate-700 transition-colors">Activate Offline</button>
          <button onClick={() => act("/customer/license/import", "License validated")} className="text-xs bg-slate-800 text-slate-300 border border-white/10 px-3 py-1.5 rounded-lg hover:bg-slate-700 transition-colors">Validate License</button>
          <button className="text-xs bg-slate-800 text-slate-300 border border-white/10 px-3 py-1.5 rounded-lg hover:bg-slate-700 transition-colors">Download Status Report</button>
          <button className="text-xs bg-slate-800 text-slate-300 border border-white/10 px-3 py-1.5 rounded-lg hover:bg-slate-700 transition-colors">Request Renewal</button>
        </div>
      </div>

      {/* Activation history */}
      <div className="bg-slate-900 border border-white/5 rounded-xl p-5">
        <div className="text-sm font-bold text-white mb-3">Activation History</div>
        <div className="space-y-2">
          {lic.activationHistory?.map((h: any, i: number) => (
            <div key={i} className="flex gap-3 text-xs">
              <span className="text-slate-500 whitespace-nowrap">{new Date(h.timestamp).toLocaleString()}</span>
              <span className="text-slate-300">{h.event}</span>
              <span className="text-slate-500 ml-auto">{h.by}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
