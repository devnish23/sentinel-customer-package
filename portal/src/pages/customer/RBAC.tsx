import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { StatusBadge } from "../../components/StatusBadge";
import { useRole } from "../../lib/role-context";
import { UserCog, Plus } from "lucide-react";



const ROLE_PERMS: Record<string, string[]> = {
  "Customer Admin": ["All permissions"],
  "Operator": ["View agents", "View recordings", "Acknowledge alerts", "Request export", "View vault"],
  "Reviewer": ["View all", "Approve exports", "Approve policies"],
  "Auditor": ["View all (read-only)", "Export audit logs"],
  "Support Engineer": ["View agents", "View health", "Generate support bundle"],
};

export default function RBAC(_props = {}) {
  const { customerRole } = useRole();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({ name: "", email: "", role: "Operator" });

  const refresh = () => api.get("/customer/rbac").then(setUsers).finally(() => setLoading(false));
  useEffect(() => { refresh(); }, []);

  async function createUser() {
    await api.post("/customer/rbac/users", form);
    setMsg("User created"); setShowForm(false); refresh();
    setTimeout(() => setMsg(""), 3000);
  }

  async function disableUser(id: string) {
    await api.post(`/customer/rbac/users/${id}/disable`);
    setMsg("User disabled"); refresh();
    setTimeout(() => setMsg(""), 3000);
  }

  if (loading) return <div className="p-8 text-slate-500 text-sm">Loading…</div>;

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Admin / RBAC</h1>
          <p className="text-sm text-slate-400 mt-0.5">User management and role-based access control</p>
        </div>
        {customerRole === "Customer Admin" && (
          <button onClick={() => setShowForm(v => !v)} className="flex items-center gap-1.5 text-xs bg-cyan-500 text-slate-900 font-semibold px-3 py-1.5 rounded-lg hover:bg-cyan-400">
            <Plus size={13} />Create User
          </button>
        )}
      </div>

      {msg && <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm rounded-lg px-4 py-2">{msg}</div>}

      {/* Role permission matrix */}
      <div className="bg-slate-900 border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3"><UserCog size={14} className="text-cyan-400" /><span className="text-sm font-bold text-white">Role Permission Matrix</span></div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {Object.entries(ROLE_PERMS).map(([role, perms]) => (
            <div key={role} className="bg-slate-800/50 rounded-lg p-3">
              <div className="text-xs font-medium text-cyan-400 mb-2">{role}</div>
              <ul className="space-y-1">
                {perms.map(p => <li key={p} className="text-xs text-slate-400 flex items-start gap-1"><span className="text-emerald-500 mt-0.5">·</span>{p}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {showForm && customerRole === "Customer Admin" && (
        <div className="bg-slate-900 border border-cyan-500/20 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-white">New User</h3>
          <div className="grid grid-cols-3 gap-3">
            {[["name","Full Name"],["email","Email"]].map(([k,label]) => (
              <div key={k}>
                <label className="block text-xs text-slate-400 mb-1">{label}</label>
                <input value={(form as any)[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500" />
              </div>
            ))}
            <div>
              <label className="block text-xs text-slate-400 mb-1">Role</label>
              <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500">
                {Object.keys(ROLE_PERMS).map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={createUser} className="text-sm bg-cyan-500 text-slate-900 font-semibold px-4 py-1.5 rounded-lg hover:bg-cyan-400">Create User</button>
            <button onClick={() => setShowForm(false)} className="text-sm bg-slate-800 text-slate-300 px-4 py-1.5 rounded-lg hover:bg-slate-700">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-slate-900 border border-white/5 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-slate-500 border-b border-white/5">
              {["User ID","Name","Email","Role","Status","Last Login","Actions"].map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b border-white/5 hover:bg-white/2">
                <td className="px-4 py-3 font-mono text-xs text-slate-400">{u.id}</td>
                <td className="px-4 py-3 text-white font-medium">{u.name}</td>
                <td className="px-4 py-3 text-xs text-slate-400">{u.email}</td>
                <td className="px-4 py-3 text-xs text-slate-300">{u.role}</td>
                <td className="px-4 py-3"><StatusBadge status={u.status} /></td>
                <td className="px-4 py-3 text-xs text-slate-400">{u.lastLogin ? new Date(u.lastLogin).toLocaleString() : "—"}</td>
                <td className="px-4 py-3">
                  {customerRole === "Customer Admin" && u.status === "ACTIVE" && (
                    <div className="flex gap-1.5">
                      <button className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded hover:bg-slate-600">Reset Password</button>
                      <button onClick={() => disableUser(u.id)} className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded hover:bg-red-500/30">Disable</button>
                    </div>
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
