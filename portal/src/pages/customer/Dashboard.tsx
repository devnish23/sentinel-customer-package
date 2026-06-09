import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { StatusBadge } from "../../components/StatusBadge";
import { Cpu, Video, Bell, AlertTriangle, Shield, HardDrive, Download, Activity } from "lucide-react";
import { Link } from "wouter";



function StatCard({ label, value, sub, icon: Icon, color }: any) {
  return (
    <div className="bg-slate-900 border border-white/5 rounded-xl p-4">
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs text-slate-500">{label}</span>
        <div className={`p-1.5 rounded-md ${color}`}><Icon size={14} /></div>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      {sub && <div className="text-xs text-slate-500 mt-0.5">{sub}</div>}
    </div>
  );
}

export default function CustomerDashboard(_props = {}) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/customer/dashboard").then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-slate-500 text-sm">Loading dashboard…</div>;
  if (!data) return <div className="p-8 text-red-400 text-sm">Failed to load dashboard</div>;

  const healthBad = data.health?.filter((h: any) => h.status !== "HEALTHY") ?? [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Customer Dashboard</h1>
        <p className="text-sm text-slate-400 mt-0.5">Alpha Manufacturing — Singapore DC</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Agents" value={data.totalAgents} sub={`${data.onlineAgents} online, ${data.offlineAgents} offline`} icon={Cpu} color="bg-cyan-500/10 text-cyan-400" />
        <StatCard label="Recording Active" value={data.recordingActive} sub="agents currently recording" icon={Video} color="bg-blue-500/10 text-blue-400" />
        <StatCard label="Alerts Today" value={data.alertsToday} sub={`${data.tamperEvents} tamper event(s)`} icon={Bell} color="bg-red-500/10 text-red-400" />
        <StatCard label="Pending Exports" value={data.pendingExportApprovals} sub="awaiting approval" icon={Download} color="bg-yellow-500/10 text-yellow-400" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-white/5 rounded-xl p-4 space-y-1">
          <div className="flex items-center gap-2 mb-3"><Shield size={14} className="text-cyan-400" /><span className="text-sm font-semibold text-white">License</span></div>
          <div className="flex justify-between text-xs"><span className="text-slate-500">Status</span><StatusBadge status={data.licenseStatus} /></div>
          <div className="flex justify-between text-xs"><span className="text-slate-500">Vault</span><StatusBadge status={data.vaultHealth} /></div>
          <div className="flex justify-between text-xs"><span className="text-slate-500">Storage</span><span className="text-white">{data.storageUsageGb} GB / {data.storageCapacityGb} GB</span></div>
          <div className="w-full h-1.5 bg-slate-700 rounded-full mt-2">
            <div className="h-1.5 bg-cyan-500 rounded-full" style={{ width: `${(data.storageUsageGb / data.storageCapacityGb) * 100}%` }} />
          </div>
        </div>

        <div className="bg-slate-900 border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3"><Activity size={14} className="text-cyan-400" /><span className="text-sm font-semibold text-white">Recent Activity</span></div>
          <div className="space-y-2">
            {data.recentActivity?.map((a: any, i: number) => (
              <div key={i} className="flex gap-2 text-xs">
                <span className="text-slate-500 shrink-0 font-mono">{a.time}</span>
                <span className="text-slate-300">{a.event}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3"><HardDrive size={14} className="text-cyan-400" /><span className="text-sm font-semibold text-white">System Health</span></div>
          {healthBad.length === 0 ? (
            <div className="text-emerald-400 text-sm">All services healthy</div>
          ) : (
            <div className="space-y-1.5">
              {healthBad.map((h: any) => (
                <div key={h.name} className="flex items-start gap-1.5 text-xs">
                  <AlertTriangle size={12} className="text-yellow-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-yellow-300">{h.name}</span>
                    {h.note && <div className="text-slate-500">{h.note}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
          <Link href={base + "/customer/health"}>
            <button className="mt-3 text-xs text-cyan-400 hover:underline">View full health →</button>
          </Link>
        </div>
      </div>

      {/* Recording engine info */}
      <div className="bg-slate-900/50 border border-amber-500/20 rounded-xl p-4">
        <div className="text-xs font-semibold text-amber-400 mb-1">Recording Engine Architecture</div>
        <div className="flex flex-wrap gap-4 text-xs text-slate-400">
          <span><span className="text-white font-medium">Primary:</span> Windows Desktop Duplication API / DXGI</span>
          <span>→</span>
          <span><span className="text-white font-medium">Fallback 1:</span> Windows Graphics Capture API</span>
          <span>→</span>
          <span><span className="text-white font-medium">Fallback 2:</span> MSS Screenshot Loop</span>
          <span>→</span>
          <span className="text-amber-400"><span className="text-white font-medium">OpenCV:</span> Processing &amp; fallback encoding only — NOT primary capture</span>
        </div>
        <div className="mt-1 text-xs text-slate-500">Default: 5 FPS · 1280×720 · 30s chunks · H.264 · SHA-256 chain hashing</div>
      </div>
    </div>
  );
}
