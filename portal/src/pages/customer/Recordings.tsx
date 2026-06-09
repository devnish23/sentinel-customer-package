import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { StatusBadge } from "../../components/StatusBadge";
import { Video, ChevronRight } from "lucide-react";



export default function Recordings(_props = {}) {
  const [recs, setRecs] = useState<any[]>([]);
  const [chunks, setChunks] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get("/customer/recordings").then(setRecs).finally(() => setLoading(false)); }, []);

  async function viewChunks(id: string) {
    setSelectedId(id);
    const c = await api.get(`/customer/recordings/${id}/chunks`);
    setChunks(c);
  }

  if (loading) return <div className="p-8 text-slate-500 text-sm">Loading…</div>;

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-xl font-bold text-white">Recording Sessions</h1>
        <p className="text-sm text-slate-400 mt-0.5">{recs.length} sessions</p>
      </div>

      {/* Recording engine note */}
      <div className="bg-slate-800/50 border border-amber-500/20 rounded-lg px-4 py-2.5 text-xs text-slate-400">
        <span className="text-amber-400 font-semibold">Recording Pipeline: </span>
        Desktop Duplication API → Windows Graphics Capture → MSS Screenshot Fallback →
        <span className="text-amber-400"> OpenCV processing layer</span> → Encoder → MP4 chunk → SHA-256 hash → Hash chain → Vault upload
      </div>

      <div className="bg-slate-900 border border-white/5 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-slate-500 border-b border-white/5">
              {["Session ID", "Agent", "Start Time", "End Time", "Duration", "Status", "Chunks", "Hash Chain", "Vault", "Capture Method", ""].map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recs.map(r => (
              <tr key={r.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-slate-400">{r.id}</td>
                <td className="px-4 py-3 text-white">{r.hostname}</td>
                <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">{new Date(r.startTime).toLocaleString()}</td>
                <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">{r.endTime ? new Date(r.endTime).toLocaleString() : "—"}</td>
                <td className="px-4 py-3 text-xs text-slate-400">{r.duration}</td>
                <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                <td className="px-4 py-3 text-xs text-slate-400">{r.chunkCount}</td>
                <td className="px-4 py-3"><StatusBadge status={r.evidenceHashStatus} /></td>
                <td className="px-4 py-3"><StatusBadge status={r.vaultStatus} /></td>
                <td className="px-4 py-3 text-xs text-slate-400">{r.captureMethod}</td>
                <td className="px-4 py-3">
                  <button onClick={() => viewChunks(r.id)} className="text-xs text-cyan-400 hover:underline flex items-center gap-0.5">
                    Chunks <ChevronRight size={11} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedId && chunks.length > 0 && (
        <div className="bg-slate-900 border border-cyan-500/20 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2"><Video size={14} className="text-cyan-400" />Chunks for {selectedId}</h2>
            <button onClick={() => { setSelectedId(null); setChunks([]); }} className="text-xs text-slate-500 hover:text-white">✕</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-500 border-b border-white/5">
                  {["Chunk ID", "File", "Size", "SHA-256 Hash", "Prev Hash", "Method", "Chain"].map(h => <th key={h} className="text-left px-3 py-2 font-medium">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {chunks.map(c => (
                  <tr key={c.chunkId} className="border-b border-white/5">
                    <td className="px-3 py-2 font-mono text-slate-400">{c.chunkId}</td>
                    <td className="px-3 py-2 text-slate-300">{c.fileName}</td>
                    <td className="px-3 py-2 text-slate-400">{(c.fileSize / 1e6).toFixed(1)} MB</td>
                    <td className="px-3 py-2 font-mono text-slate-500 max-w-[120px] truncate">{c.sha256Hash}</td>
                    <td className="px-3 py-2 font-mono text-slate-500 max-w-[120px] truncate">{c.previousHash}</td>
                    <td className="px-3 py-2 text-slate-400">{c.captureMethod}</td>
                    <td className="px-3 py-2"><StatusBadge status={c.chainStatus} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
