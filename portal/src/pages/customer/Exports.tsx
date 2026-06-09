import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { StatusBadge } from "../../components/StatusBadge";
import { useRole } from "../../lib/role-context";
import { Plus, AlertTriangle } from "lucide-react";



export default function Exports(_props = {}) {
  const { customerRole } = useRole();
  const [exports, setExports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState<"ok"|"err">("ok");
  const [form, setForm] = useState({ caseId: "", agentId: "AGT-001", sessionId: "REC-001", reason: "" });

  const refresh = () => api.get("/customer/exports").then(setExports).finally(() => setLoading(false));
  useEffect(() => { refresh(); }, []);

  const showMsg = (m: string, t: "ok"|"err" = "ok") => { setMsg(m); setMsgType(t); setTimeout(() => setMsg(""), 5000); };

  async function createExport() {
    const e = await api.post("/customer/exports", { ...form, customerId: "CUST-ALPHA", siteId: "SITE-SG-001" });
    showMsg(`Export request ${e.id} submitted — awaiting approval`);
    setShowForm(false); refresh();
  }

  async function approveExport(id: string) {
    try {
      await api.post(`/customer/exports/${id}/approve`, { user: customerRole === "Reviewer" ? "reviewer@alpha.com" : "admin@alpha.com" });
      showMsg(`Export ${id} approved`);
      refresh();
    } catch (err: any) {
      showMsg(err.message, "err");
    }
  }

  async function rejectExport(id: string) {
    await api.post(`/customer/exports/${id}/reject`);
    showMsg(`Export ${id} rejected`); refresh();
  }

  if (loading) return <div className="p-8 text-slate-500 text-sm">Loading…</div>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Export Requests</h1>
          <p className="text-sm text-slate-400 mt-0.5">{exports.filter(e => e.status === "PENDING").length} pending approval</p>
        </div>
        {["Customer Admin","Operator"].includes(customerRole) && (
          <button onClick={() => setShowForm(v => !v)} className="flex items-center gap-1.5 text-xs bg-cyan-500 text-slate-900 font-semibold px-3 py-1.5 rounded-lg hover:bg-cyan-400">
            <Plus size={13} />Request Export
          </button>
        )}
      </div>

      {msg && (
        <div className={`flex items-start gap-2 text-sm rounded-lg px-4 py-2 ${msgType === "err" ? "bg-red-500/10 border border-red-500/30 text-red-400" : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"}`}>
          {msgType === "err" && <AlertTriangle size={15} className="shrink-0 mt-0.5" />}
          {msg}
        </div>
      )}

      {/* Self-approval notice */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-2.5 text-xs text-amber-400 flex items-center gap-2">
        <AlertTriangle size={13} />
        Self-approval is blocked. The user who requested an export cannot approve it. A separate Reviewer or Customer Admin must approve.
      </div>

      {showForm && (
        <div className="bg-slate-900 border border-cyan-500/20 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-white">New Export Request</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[["caseId","Case ID"],["agentId","Agent ID"],["sessionId","Session ID"]].map(([k,label]) => (
              <div key={k}>
                <label className="block text-xs text-slate-400 mb-1">{label}</label>
                <input value={(form as any)[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500" />
              </div>
            ))}
            <div className="col-span-2">
              <label className="block text-xs text-slate-400 mb-1">Export Reason</label>
              <textarea value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} rows={2}
                className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={createExport} className="text-sm bg-cyan-500 text-slate-900 font-semibold px-4 py-1.5 rounded-lg hover:bg-cyan-400">Submit Request</button>
            <button onClick={() => setShowForm(false)} className="text-sm bg-slate-800 text-slate-300 px-4 py-1.5 rounded-lg hover:bg-slate-700">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-slate-900 border border-white/5 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-slate-500 border-b border-white/5">
              {["Export ID","Case ID","Agent","Session","Requested By","Approved By","Status","Reason","Created","Downloads","Expiry","Actions"].map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {exports.map(e => (
              <tr key={e.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-slate-400">{e.id}</td>
                <td className="px-4 py-3 text-xs text-slate-300">{e.caseId}</td>
                <td className="px-4 py-3 text-xs text-slate-400">{e.agentId}</td>
                <td className="px-4 py-3 text-xs text-slate-400">{e.sessionId}</td>
                <td className="px-4 py-3 text-xs text-slate-400">{e.requestedBy}</td>
                <td className="px-4 py-3 text-xs text-slate-400">{e.approvedBy ?? "—"}</td>
                <td className="px-4 py-3"><StatusBadge status={e.status} /></td>
                <td className="px-4 py-3 text-xs text-slate-400 max-w-[140px] truncate">{e.reason}</td>
                <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">{new Date(e.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-xs text-slate-400">{e.downloadCount}</td>
                <td className="px-4 py-3 text-xs text-slate-400">{e.expiry ?? "—"}</td>
                <td className="px-4 py-3">
                  {e.status === "PENDING" && ["Customer Admin","Reviewer"].includes(customerRole) && (
                    <div className="flex gap-1.5">
                      <button onClick={() => approveExport(e.id)} className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded hover:bg-emerald-500/30">Approve</button>
                      <button onClick={() => rejectExport(e.id)} className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded hover:bg-red-500/30">Reject</button>
                    </div>
                  )}
                  {e.status === "APPROVED" && (
                    <button className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded hover:bg-blue-500/30">Download</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
