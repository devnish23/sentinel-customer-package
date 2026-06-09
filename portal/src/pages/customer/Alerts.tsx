import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { StatusBadge } from "../../components/StatusBadge";
import { Bell } from "lucide-react";



const ALERT_TYPES = ["Agent offline","Agent recovered","Recording stopped unexpectedly","Service stopped","Service disabled","File deletion attempt","Log deletion attempt","Config tamper","License tamper","Hardware mismatch","Vault unavailable","Storage full","Export generated","Export downloaded","Policy changed","Admin login failure","Unauthorized API access","High-risk incident"];

export default function Alerts(_props = {}) {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const refresh = () => api.get("/customer/alerts").then(setAlerts).finally(() => setLoading(false));
  useEffect(() => { refresh(); }, []);

  async function action(id: string, act: string, body?: any) {
    await api.post(`/customer/alerts/${id}/${act}`, body);
    setMsg(`Alert ${id}: ${act} recorded`);
    refresh();
    setTimeout(() => setMsg(""), 3000);
  }

  if (loading) return <div className="p-8 text-slate-500 text-sm">Loading…</div>;

  const open = alerts.filter(a => !["RESOLVED","CLOSED"].includes(a.status));
  const resolved = alerts.filter(a => ["RESOLVED","CLOSED"].includes(a.status));

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Alerts &amp; Incidents</h1>
          <p className="text-sm text-slate-400 mt-0.5">{open.length} open · {resolved.length} resolved</p>
        </div>
        <div className="ml-auto flex gap-2 text-xs text-slate-400">
          {["HIGH","MED","LOW"].map(s => <span key={s} className="flex items-center gap-1"><StatusBadge status={s} />{alerts.filter(a => a.severity === s).length}</span>)}
        </div>
      </div>

      {msg && <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm rounded-lg px-4 py-2">{msg}</div>}

      {/* Alert types reference */}
      <details className="bg-slate-900/50 border border-white/5 rounded-lg">
        <summary className="px-4 py-2.5 text-xs text-slate-400 cursor-pointer">Alert types reference ({ALERT_TYPES.length} types)</summary>
        <div className="px-4 py-2 pb-3 flex flex-wrap gap-1.5">
          {ALERT_TYPES.map(t => <span key={t} className="text-[10px] bg-slate-800 text-slate-400 rounded px-2 py-0.5">{t}</span>)}
        </div>
      </details>

      <div className="bg-slate-900 border border-white/5 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-slate-500 border-b border-white/5">
              {["Alert ID","Severity","Type","Agent","Message","Status","Created","Assigned To","Actions"].map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {alerts.map(a => (
              <tr key={a.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-slate-400">{a.id}</td>
                <td className="px-4 py-3"><StatusBadge status={a.severity} /></td>
                <td className="px-4 py-3 text-xs text-slate-300 max-w-[120px] truncate">{a.type}</td>
                <td className="px-4 py-3 text-xs text-slate-300">{a.hostname}</td>
                <td className="px-4 py-3 text-xs text-slate-400 max-w-[200px] truncate">{a.message}</td>
                <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">{new Date(a.createdAt).toLocaleString()}</td>
                <td className="px-4 py-3 text-xs text-slate-400">{a.assignedTo ?? "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    {a.status === "OPEN" && (
                      <>
                        <button onClick={() => action(a.id, "acknowledge")} className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded hover:bg-blue-500/30 transition-colors">Acknowledge</button>
                        <button onClick={() => action(a.id, "assign", { assignedTo: "admin@alpha.com" })} className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded hover:bg-slate-600 transition-colors">Assign</button>
                      </>
                    )}
                    {!["RESOLVED","CLOSED"].includes(a.status) && (
                      <button onClick={() => action(a.id, "close")} className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded hover:bg-slate-600 transition-colors">Close</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
