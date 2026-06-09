import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { ClipboardList, Search } from "lucide-react";



export default function Audit(_props = {}) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterModule, setFilterModule] = useState("All");

  useEffect(() => { api.get("/customer/audit").then(setLogs).finally(() => setLoading(false)); }, []);

  const modules = ["All", ...Array.from(new Set(logs.map(l => l.module)))];
  const filtered = logs.filter(l =>
    (filterModule === "All" || l.module === filterModule) &&
    (search === "" || JSON.stringify(l).toLowerCase().includes(search.toLowerCase()))
  );

  const EVENTS = ["Login","Agent registration","Policy change","Config change","License import","License activation","Migration request","Export request","Export approval","Export download","Evidence access","Alert acknowledge","Secret rotation","Backup","Restore","Admin user change"];

  if (loading) return <div className="p-8 text-slate-500 text-sm">Loading…</div>;

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-xl font-bold text-white">Audit Logs</h1>
        <p className="text-sm text-slate-400 mt-0.5">{logs.length} events recorded</p>
      </div>

      <details className="bg-slate-900/50 border border-white/5 rounded-lg">
        <summary className="px-4 py-2.5 text-xs text-slate-400 cursor-pointer">Audited event types ({EVENTS.length})</summary>
        <div className="px-4 py-2 pb-3 flex flex-wrap gap-1.5">
          {EVENTS.map(e => <span key={e} className="text-[10px] bg-slate-800 text-slate-400 rounded px-2 py-0.5">{e}</span>)}
        </div>
      </details>

      <div className="flex gap-2">
        <div className="flex items-center gap-2 bg-slate-800 border border-white/10 rounded-lg px-3 py-1.5 flex-1">
          <Search size={13} className="text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search audit logs…" className="bg-transparent text-sm text-white focus:outline-none flex-1 placeholder:text-slate-600" />
        </div>
        <select value={filterModule} onChange={e => setFilterModule(e.target.value)} className="bg-slate-800 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-slate-300 focus:outline-none">
          {modules.map(m => <option key={m}>{m}</option>)}
        </select>
      </div>

      <div className="bg-slate-900 border border-white/5 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-slate-500 border-b border-white/5">
              {["Audit ID","Time","User","Role","Module","Action","Target","Result","Source IP","Request ID"].map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(l => (
              <tr key={l.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-slate-500">{l.id}</td>
                <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">{new Date(l.time).toLocaleString()}</td>
                <td className="px-4 py-3 text-xs text-slate-300">{l.user}</td>
                <td className="px-4 py-3 text-xs text-slate-400">{l.role}</td>
                <td className="px-4 py-3 text-xs text-slate-400">{l.module}</td>
                <td className="px-4 py-3 text-xs font-medium text-cyan-400">{l.action}</td>
                <td className="px-4 py-3 text-xs text-slate-400">{l.target}</td>
                <td className="px-4 py-3 text-xs text-emerald-400">{l.result}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-500">{l.sourceIp}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-500">{l.requestId}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="text-center py-8 text-slate-500 text-sm">No audit events match filter</div>}
      </div>
    </div>
  );
}
