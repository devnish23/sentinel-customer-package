import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { StatusBadge } from "../../components/StatusBadge";
import { Package, Download } from "lucide-react";



export default function Packages(_props = {}) {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get("/customer/packages").then(setPackages).finally(() => setLoading(false)); }, []);

  if (loading) return <div className="p-8 text-slate-500 text-sm">Loading…</div>;

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white">Packages &amp; Downloads</h1>
        <p className="text-sm text-slate-400 mt-0.5">Installer packages and tools for your deployment</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {packages.map(p => (
          <div key={p.id} className="bg-slate-900 border border-white/5 rounded-xl p-4 hover:border-cyan-500/20 transition-colors">
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 bg-cyan-500/10 rounded-lg mt-0.5"><Package size={16} className="text-cyan-400" /></div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-white text-sm truncate">{p.name}</div>
                <div className="text-xs text-slate-500">{p.type}</div>
              </div>
              <StatusBadge status={p.status} />
            </div>
            <div className="space-y-1 text-xs text-slate-400 mb-3">
              <div className="flex justify-between"><span className="text-slate-500">Version</span><span className="text-white">{p.version}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Release Date</span><span>{p.releaseDate}</span></div>
              <div className="flex justify-between gap-2"><span className="text-slate-500">Checksum</span><span className="font-mono text-[10px] truncate">{p.checksum}</span></div>
            </div>
            <button className="w-full flex items-center justify-center gap-1.5 text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-3 py-1.5 rounded-lg hover:bg-cyan-500/20 transition-colors">
              <Download size={12} />Download
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
