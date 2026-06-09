import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { StatusBadge } from "../../components/StatusBadge";
import { Plus } from "lucide-react";



export default function Policies(_props = {}) {
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({ name: "", type: "Recording", fps: 5, resolution: "1280x720", chunkDuration: 30, captureMethod: "Auto" });

  const refresh = () => api.get("/customer/policies").then(setPolicies).finally(() => setLoading(false));
  useEffect(() => { refresh(); }, []);

  async function createPolicy() {
    await api.post("/customer/policies", form);
    setMsg("Policy created"); setShowForm(false); refresh();
    setTimeout(() => setMsg(""), 3000);
  }

  async function approvePolicy(id: string) {
    await api.post(`/customer/policies/${id}/approve`);
    setMsg(`Policy ${id} approved`); refresh();
    setTimeout(() => setMsg(""), 3000);
  }

  async function assignPolicy(id: string) {
    await api.post(`/customer/policies/${id}/assign`);
    setMsg(`Policy ${id} assigned`); refresh();
    setTimeout(() => setMsg(""), 3000);
  }

  if (loading) return <div className="p-8 text-slate-500 text-sm">Loading…</div>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Policies</h1>
          <p className="text-sm text-slate-400 mt-0.5">{policies.length} policies</p>
        </div>
        <button onClick={() => setShowForm(v => !v)} className="flex items-center gap-1.5 text-xs bg-cyan-500 text-slate-900 font-semibold px-3 py-1.5 rounded-lg hover:bg-cyan-400 transition-colors">
          <Plus size={13} />Create Policy
        </button>
      </div>

      {msg && <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm rounded-lg px-4 py-2">{msg}</div>}

      {showForm && (
        <div className="bg-slate-900 border border-cyan-500/20 rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-white text-sm">New Policy</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            {[["name","Policy Name","text"],["fps","FPS","number"],["chunkDuration","Chunk Duration (s)","number"]].map(([k,label,type]) => (
              <div key={k}>
                <label className="block text-xs text-slate-400 mb-1">{label}</label>
                <input type={type} value={(form as any)[k]} onChange={e => setForm(p => ({ ...p, [k]: type === "number" ? +e.target.value : e.target.value }))}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500" />
              </div>
            ))}
            <div>
              <label className="block text-xs text-slate-400 mb-1">Type</label>
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500">
                {["Recording","Scheduled","Trigger-based","Manual"].map(v => <option key={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Capture Method</label>
              <select value={form.captureMethod} onChange={e => setForm(p => ({ ...p, captureMethod: e.target.value }))} className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500">
                {["Auto","Desktop Duplication API","Windows Graphics Capture","Screenshot fallback","OpenCV fallback processing only"].map(v => <option key={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Resolution</label>
              <select value={form.resolution} onChange={e => setForm(p => ({ ...p, resolution: e.target.value }))} className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500">
                {["1280x720","1920x1080","native"].map(v => <option key={v}>{v}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={createPolicy} className="text-sm bg-cyan-500 text-slate-900 font-semibold px-4 py-1.5 rounded-lg hover:bg-cyan-400 transition-colors">Save Policy</button>
            <button onClick={() => setShowForm(false)} className="text-sm bg-slate-800 text-slate-300 px-4 py-1.5 rounded-lg hover:bg-slate-700 transition-colors">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-slate-900 border border-white/5 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-slate-500 border-b border-white/5">
              {["Policy ID","Name","Version","Type","Agents","Status","Last Modified","Modified By","Approval","Actions"].map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {policies.map(p => (
              <tr key={p.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-slate-400">{p.id}</td>
                <td className="px-4 py-3 text-white font-medium">{p.name}</td>
                <td className="px-4 py-3 text-xs text-slate-400">v{p.version}</td>
                <td className="px-4 py-3 text-xs text-slate-400">{p.type}</td>
                <td className="px-4 py-3 text-xs text-slate-400">{p.assignedAgents}</td>
                <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">{new Date(p.lastModified).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-xs text-slate-400">{p.modifiedBy}</td>
                <td className="px-4 py-3"><StatusBadge status={p.approvalStatus} /></td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    {p.approvalStatus === "PENDING" && (
                      <button onClick={() => approvePolicy(p.id)} className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded hover:bg-emerald-500/30">Approve</button>
                    )}
                    {p.status === "ACTIVE" && (
                      <button onClick={() => assignPolicy(p.id)} className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded hover:bg-blue-500/30">Assign</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Policy summary for selected */}
      {policies.filter(p => p.fps).map(p => (
        <div key={p.id} className="hidden" />
      ))}
      <div className="bg-slate-900/50 border border-white/5 rounded-xl p-4 text-xs text-slate-400 space-y-1">
        <div className="font-medium text-slate-300 mb-2">Recording Policy Parameters (POL-001 Standard)</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[["FPS","5"],["Resolution","1280×720"],["Chunk Duration","30s"],["Upload Interval","60s"],["Capture Method","Auto"],["Watermark","Disabled"],["Consent Notice","Enabled"],["Offline Recording","Allowed"]].map(([k,v]) => (
            <div key={k} className="bg-slate-800/50 rounded p-2"><div className="text-slate-500">{k}</div><div className="text-white">{v}</div></div>
          ))}
        </div>
      </div>
    </div>
  );
}
