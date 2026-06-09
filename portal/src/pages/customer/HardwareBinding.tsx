import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { StatusBadge } from "../../components/StatusBadge";
import { HardDrive, Plus } from "lucide-react";



export default function HardwareBinding(_props = {}) {
  const [bindings, setBindings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generated, setGenerated] = useState<any>(null);
  const [msg, setMsg] = useState("");

  useEffect(() => { api.get("/customer/hardware-binding").then(setBindings).finally(() => setLoading(false)); }, []);

  async function generate() {
    const r = await api.post("/customer/hardware-binding/generate");
    setGenerated(r);
    setMsg("Hardware binding generated — submit to vendor for activation");
    setTimeout(() => setMsg(""), 5000);
  }

  if (loading) return <div className="p-8 text-slate-500 text-sm">Loading…</div>;

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Hardware Binding</h1>
          <p className="text-sm text-slate-400 mt-0.5">Hardware fingerprint for license binding</p>
        </div>
        <button onClick={generate} className="flex items-center gap-1.5 text-xs bg-cyan-500 text-slate-900 font-semibold px-3 py-1.5 rounded-lg hover:bg-cyan-400">
          <Plus size={13} />Generate Binding Request
        </button>
      </div>

      {msg && <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm rounded-lg px-4 py-2">{msg}</div>}

      <div className="bg-slate-800/50 border border-white/5 rounded-lg px-4 py-3 text-xs text-slate-400">
        <strong className="text-slate-200">Note:</strong> Sensitive hardware identifiers (CPU, disk, MAC) are shown as SHA-256 hashes only. Raw identifiers are never transmitted.
      </div>

      {generated && (
        <div className="bg-slate-900 border border-cyan-500/20 rounded-xl p-5">
          <h3 className="text-sm font-bold text-white mb-3">Generated Binding</h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            {[["Machine ID", generated.machineId], ["Hostname", generated.hostname], ["Binding Hash", generated.bindingHash], ["Status", generated.status]].map(([k, v]) => (
              <div key={k} className="bg-slate-800/50 rounded p-2.5"><div className="text-slate-500 mb-0.5">{k}</div><div className="text-white font-medium break-all">{v}</div></div>
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <button className="text-xs bg-cyan-500 text-slate-900 font-semibold px-3 py-1.5 rounded-lg hover:bg-cyan-400">Download Binding File</button>
            <button className="text-xs bg-slate-800 text-slate-300 border border-white/10 px-3 py-1.5 rounded-lg hover:bg-slate-700">Submit to Vendor</button>
          </div>
        </div>
      )}

      <div className="bg-slate-900 border border-white/5 rounded-xl overflow-x-auto">
        <div className="px-4 py-3 border-b border-white/5 text-sm font-bold text-white">Registered Bindings</div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-slate-500 border-b border-white/5">
              {["Binding ID","Machine ID","Hostname","OS","CPU Hash","Disk Hash","MAC Hash","Install ID","Version","Timestamp","Status"].map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bindings.map(b => (
              <tr key={b.id} className="border-b border-white/5 hover:bg-white/2">
                <td className="px-4 py-3 font-mono text-xs text-slate-400">{b.id}</td>
                <td className="px-4 py-3 text-xs text-slate-400 font-mono">{b.machineId}</td>
                <td className="px-4 py-3 text-white">{b.hostname}</td>
                <td className="px-4 py-3 text-xs text-slate-400 max-w-[120px] truncate">{b.os}</td>
                <td className="px-4 py-3 text-xs font-mono text-slate-500 max-w-[100px] truncate">{b.cpuHash}</td>
                <td className="px-4 py-3 text-xs font-mono text-slate-500 max-w-[100px] truncate">{b.diskHash}</td>
                <td className="px-4 py-3 text-xs font-mono text-slate-500 max-w-[100px] truncate">{b.macHash}</td>
                <td className="px-4 py-3 text-xs text-slate-400">{b.installId}</td>
                <td className="px-4 py-3 text-xs text-slate-400">{b.productVersion}</td>
                <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">{new Date(b.timestamp).toLocaleDateString()}</td>
                <td className="px-4 py-3"><StatusBadge status={b.bindingStatus} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
