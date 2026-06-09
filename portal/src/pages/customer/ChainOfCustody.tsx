import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { StatusBadge } from "../../components/StatusBadge";
import { Link2, ShieldCheck } from "lucide-react";



export default function ChainOfCustody(_props = {}) {
  const [data, setData] = useState<any>(null);
  const [exportId, setExportId] = useState("EXP-001");
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<any>(null);

  const load = (id: string) => {
    setLoading(true);
    api.get(`/customer/chain-of-custody/${id}`).then(setData).finally(() => setLoading(false));
  };

  useEffect(() => { load(exportId); }, []);

  async function verify() {
    setVerifying(true);
    const r = await api.post(`/customer/chain-of-custody/${exportId}/verify`);
    setVerifyResult(r);
    setVerifying(false);
  }

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white">Chain of Custody</h1>
        <p className="text-sm text-slate-400 mt-0.5">Hash chain verification for export evidence packages</p>
      </div>

      <div className="bg-slate-800/50 border border-cyan-500/10 rounded-lg px-4 py-3 text-xs text-slate-400">
        <strong className="text-slate-200">What is chain verification?</strong> Hash chaining proves whether evidence or log sequence has been changed or broken. It does NOT recover deleted files by itself. Recovery requires off-machine forwarding, backup, or immutable storage.
      </div>

      {/* Export selector */}
      <div className="flex items-center gap-3">
        <input value={exportId} onChange={e => setExportId(e.target.value)} placeholder="Export ID (e.g. EXP-001)"
          className="bg-slate-800 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 w-52" />
        <button onClick={() => load(exportId)} className="text-xs bg-slate-800 border border-white/10 text-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-700">Load</button>
        <button onClick={verify} disabled={verifying} className="flex items-center gap-1.5 text-xs bg-cyan-500 text-slate-900 font-semibold px-3 py-1.5 rounded-lg hover:bg-cyan-400 disabled:opacity-50">
          <ShieldCheck size={13} />{verifying ? "Verifying…" : "Verify Chain"}
        </button>
      </div>

      {verifyResult && (
        <div className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm ${verifyResult.verified ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400" : "bg-red-500/10 border border-red-500/30 text-red-400"}`}>
          <ShieldCheck size={16} />
          {verifyResult.message} — Verified at {new Date(verifyResult.verifiedAt).toLocaleTimeString()}
        </div>
      )}

      {loading ? <div className="text-slate-500 text-sm">Loading…</div> : data && (
        <>
          {/* Summary */}
          <div className="bg-slate-900 border border-white/5 rounded-xl p-5 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            {[
              ["Export ID", data.exportId],
              ["Case ID", data.caseId],
              ["Overall Chain Status", data.overallChainStatus],
              ["Policy Version at Export", `v${data.policyVersionAtExport}`],
              ["License State at Export", data.licenseStateAtExport],
              ["Evidence Files", data.evidenceFiles?.length],
            ].map(([k, v]) => (
              <div key={k} className="bg-slate-800/50 rounded-lg p-3">
                <div className="text-slate-500 mb-0.5">{k}</div>
                {k === "Overall Chain Status" ? <StatusBadge status={String(v)} /> : <div className="text-white font-medium">{String(v)}</div>}
              </div>
            ))}
          </div>

          {/* Visual chain */}
          <div className="bg-slate-900 border border-white/5 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Link2 size={14} className="text-cyan-400" />
              <span className="text-sm font-bold text-white">Hash Chain Visualization</span>
            </div>
            <div className="space-y-2">
              {data.evidenceFiles?.map((chunk: any, i: number) => (
                <div key={chunk.chunkId} className="flex items-stretch gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full mt-1.5 ${chunk.chainStatus === "VALID" ? "bg-emerald-400" : "bg-red-400"}`} />
                    {i < data.evidenceFiles.length - 1 && <div className="w-0.5 flex-1 bg-slate-700 mt-1" />}
                  </div>
                  <div className="flex-1 bg-slate-800/50 rounded-lg p-3 text-xs mb-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-white">{chunk.fileName}</span>
                      <StatusBadge status={chunk.chainStatus} size="sm" />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-slate-400">
                      <div><span className="text-slate-500">Chunk: </span>{chunk.chunkId}</div>
                      <div><span className="text-slate-500">Size: </span>{(chunk.fileSize / 1e6).toFixed(1)} MB</div>
                      <div className="col-span-2"><span className="text-slate-500">SHA-256: </span><span className="font-mono break-all">{chunk.sha256Hash}</span></div>
                      <div className="col-span-2"><span className="text-slate-500">Prev Hash: </span><span className="font-mono break-all">{chunk.previousHash}</span></div>
                      <div><span className="text-slate-500">Method: </span>{chunk.captureMethod}</div>
                      <div><span className="text-slate-500">Time: </span>{new Date(chunk.createdTime).toLocaleTimeString()}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {["Download Manifest","Download Verification Report","Generate Reviewer README"].map(a => (
              <button key={a} className="text-xs bg-slate-800 text-slate-300 border border-white/10 px-3 py-1.5 rounded-lg hover:bg-slate-700">{a}</button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
