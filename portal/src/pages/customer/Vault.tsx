import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { StatusBadge } from "../../components/StatusBadge";
import { Archive, Search } from "lucide-react";
import { Link } from "wouter";



export default function Vault(_props = {}) {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => { api.get("/customer/vault").then(setEntries).finally(() => setLoading(false)); }, []);

  const filtered = entries.filter(e =>
    e.hostname.toLowerCase().includes(search.toLowerCase()) ||
    e.id.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="p-8 text-slate-500 text-sm">Loading…</div>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Vault / Evidence</h1>
          <p className="text-sm text-slate-400 mt-0.5">{entries.length} evidence sessions stored</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-800 border border-white/10 rounded-lg px-3 py-1.5">
          <Search size={13} className="text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" className="bg-transparent text-sm text-white focus:outline-none w-40 placeholder:text-slate-600" />
        </div>
      </div>

      <div className="bg-slate-900 border border-white/5 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-slate-500 border-b border-white/5">
              {["Evidence ID","Session ID","Agent","Hostname","Start Time","End Time","Files","Size","Chain Status","Vault Status","Retention Expiry","Actions"].map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(e => (
              <tr key={e.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-slate-400">{e.id}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-400">{e.sessionId}</td>
                <td className="px-4 py-3 text-xs text-slate-400">{e.agentId}</td>
                <td className="px-4 py-3 text-white">{e.hostname}</td>
                <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">{new Date(e.startTime).toLocaleString()}</td>
                <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">{new Date(e.endTime).toLocaleString()}</td>
                <td className="px-4 py-3 text-xs text-slate-400">{e.fileCount}</td>
                <td className="px-4 py-3 text-xs text-slate-400">{e.size}</td>
                <td className="px-4 py-3"><StatusBadge status={e.chainStatus} /></td>
                <td className="px-4 py-3"><StatusBadge status={e.vaultStatus} /></td>
                <td className="px-4 py-3 text-xs text-slate-400">{e.retentionExpiry}</td>
                <td className="px-4 py-3">
                  <Link href={`${base}/customer/exports`}>
                    <button className="text-[10px] bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded hover:bg-cyan-500/30">Request Export</button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-slate-900/50 border border-white/5 rounded-xl p-4 text-xs text-slate-400">
        <div className="font-medium text-slate-300 mb-1 flex items-center gap-1.5"><Archive size={13} className="text-cyan-400" />Vault Health</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[["Total Evidence","3 sessions"],["Total Files","1,348 chunks"],["Total Size","22.1 GB"],["Chain Status","2 VALID · 1 HASH_MISMATCH"]].map(([k,v]) => (
            <div key={k} className="bg-slate-800/50 rounded p-2"><div className="text-slate-500">{k}</div><div className="text-white">{v}</div></div>
          ))}
        </div>
      </div>
    </div>
  );
}
