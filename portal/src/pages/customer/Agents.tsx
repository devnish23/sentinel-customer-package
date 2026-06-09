import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { StatusBadge } from "../../components/StatusBadge";
import { RefreshCw, Send, ChevronRight } from "lucide-react";



export default function Agents(_props = {}) {
  const [agents, setAgents] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => { api.get("/customer/agents").then(setAgents).finally(() => setLoading(false)); }, []);

  async function pushConfig(id: string) {
    await api.post(`/customer/agents/${id}/push-config`);
    setMsg(`Config pushed to ${id}`);
    setTimeout(() => setMsg(""), 3000);
  }

  async function openDetail(id: string) {
    const d = await api.get(`/customer/agents/${id}`);
    setSelected(d);
  }

  if (loading) return <div className="p-8 text-slate-500 text-sm">Loading agents…</div>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Agents</h1>
          <p className="text-sm text-slate-400 mt-0.5">{agents.length} registered agents</p>
        </div>
        <button onClick={() => api.get("/customer/agents").then(setAgents)} className="flex items-center gap-1.5 text-xs bg-slate-800 border border-white/10 px-3 py-1.5 rounded-lg text-slate-300 hover:text-white">
          <RefreshCw size={13} />Refresh
        </button>
      </div>

      {msg && <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm rounded-lg px-4 py-2">{msg}</div>}

      <div className="bg-slate-900 border border-white/5 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-slate-500 border-b border-white/5">
              {["Agent ID", "Hostname", "IP", "OS", "Version", "Status", "Recording", "Tamper", "Policy", "Last Heartbeat", ""].map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {agents.map(a => (
              <tr key={a.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-slate-400">{a.id}</td>
                <td className="px-4 py-3 text-white font-medium">{a.hostname}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-400">{a.ip}</td>
                <td className="px-4 py-3 text-xs text-slate-400 max-w-[120px] truncate">{a.os}</td>
                <td className="px-4 py-3 text-xs font-mono text-slate-400">{a.version}</td>
                <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                <td className="px-4 py-3"><StatusBadge status={a.recordingStatus} /></td>
                <td className="px-4 py-3"><StatusBadge status={a.tamperStatus} /></td>
                <td className="px-4 py-3 text-xs text-slate-400">{a.assignedPolicy}</td>
                <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">{new Date(a.lastHeartbeat).toLocaleTimeString()}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => pushConfig(a.id)} title="Push Config" className="p-1 text-slate-500 hover:text-cyan-400 transition-colors"><Send size={13} /></button>
                    <button onClick={() => openDetail(a.id)} className="p-1 text-slate-500 hover:text-white transition-colors"><ChevronRight size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="bg-slate-900 border border-cyan-500/20 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-white text-base">{selected.hostname} — Detail</h2>
            <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-white text-xs">✕ Close</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs mb-4">
            {[["Agent ID", selected.id], ["IP", selected.ip], ["OS", selected.os], ["Version", selected.version], ["Department", selected.department], ["Policy", selected.assignedPolicy], ["Local Storage", `${selected.localStorageUsedGb} / ${selected.localStorageCapacityGb} GB`], ["Tamper", selected.tamperStatus]].map(([k, v]) => (
              <div key={k} className="bg-slate-800/50 rounded-lg p-3">
                <div className="text-slate-500 mb-1">{k}</div>
                <div className="text-white font-medium">{v}</div>
              </div>
            ))}
          </div>
          <div className="text-xs text-slate-500 mb-1 font-medium">Recent Logs</div>
          <div className="bg-slate-800/50 rounded-lg p-3 font-mono text-xs text-slate-300 space-y-1">
            {selected.logs?.map((l: string, i: number) => <div key={i}>{l}</div>)}
          </div>
        </div>
      )}
    </div>
  );
}
