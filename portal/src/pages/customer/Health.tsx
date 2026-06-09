import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { StatusBadge } from "../../components/StatusBadge";
import { HeartPulse, RefreshCw } from "lucide-react";



export default function Health(_props = {}) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  const load = () => api.get("/customer/health").then(setData).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  async function runCheck() {
    setRunning(true);
    const r = await api.post("/customer/health/run");
    setData(r);
    setRunning(false);
  }

  if (loading) return <div className="p-8 text-slate-500 text-sm">Loading…</div>;

  const healthy = data?.services?.filter((s: any) => s.status === "HEALTHY") ?? [];
  const warn = data?.services?.filter((s: any) => s.status === "WARNING") ?? [];
  const down = data?.services?.filter((s: any) => s.status === "DOWN") ?? [];

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Health Check</h1>
          <p className="text-sm text-slate-400 mt-0.5">Last run: {data?.lastRun ? new Date(data.lastRun).toLocaleString() : "—"}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={runCheck} disabled={running} className="flex items-center gap-1.5 text-xs bg-cyan-500 text-slate-900 font-semibold px-3 py-1.5 rounded-lg hover:bg-cyan-400 disabled:opacity-50">
            <RefreshCw size={13} className={running ? "animate-spin" : ""} />{running ? "Running…" : "Run Health Check"}
          </button>
          <button className="text-xs bg-slate-800 text-slate-300 border border-white/10 px-3 py-1.5 rounded-lg hover:bg-slate-700">Download Report</button>
          <button className="text-xs bg-slate-800 text-slate-300 border border-white/10 px-3 py-1.5 rounded-lg hover:bg-slate-700">Generate Support Bundle</button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[["Healthy", healthy.length, "text-emerald-400"], ["Warning", warn.length, "text-yellow-400"], ["Down", down.length, "text-red-400"]].map(([label, count, color]) => (
          <div key={String(label)} className="bg-slate-900 border border-white/5 rounded-xl p-4 text-center">
            <div className={`text-3xl font-bold ${color}`}>{count}</div>
            <div className="text-xs text-slate-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {data?.services?.map((s: any) => (
          <div key={s.name} className={`bg-slate-900 border rounded-xl p-4 ${s.status === "HEALTHY" ? "border-emerald-500/10" : s.status === "WARNING" ? "border-yellow-500/20" : "border-red-500/20"}`}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <HeartPulse size={14} className={s.status === "HEALTHY" ? "text-emerald-400" : s.status === "WARNING" ? "text-yellow-400" : "text-red-400"} />
                <span className="text-sm font-medium text-white">{s.name}</span>
              </div>
              <StatusBadge status={s.status} />
            </div>
            {s.latencyMs != null && <div className="text-xs text-slate-500">Latency: {s.latencyMs}ms</div>}
            {s.note && <div className="text-xs text-yellow-400 mt-1">{s.note}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
