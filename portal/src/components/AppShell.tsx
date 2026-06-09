import { Link, useLocation } from "wouter";
import { useRole, type CustomerRole } from "../lib/role-context";
import {
  LayoutDashboard, Cpu, Video, Bell, FileText, Settings, BadgeCheck,
  HardDrive, ArrowRightLeft, Archive, Download, Link2, ClipboardList,
  HeartPulse, Package, UserCog, ShieldCheck, Menu, X, BookOpen
} from "lucide-react";
import { useState } from "react";

const NAV = [
  { label: "Dashboard",         path: "/dashboard",         icon: LayoutDashboard },
  { label: "Agents",            path: "/agents",            icon: Cpu },
  { label: "Recordings",        path: "/recordings",        icon: Video },
  { label: "Alerts",            path: "/alerts",            icon: Bell },
  { label: "Policies",          path: "/policies",          icon: FileText },
  { label: "Configuration",     path: "/configuration",     icon: Settings },
  { label: "License",           path: "/license",           icon: BadgeCheck },
  { label: "Hardware Binding",  path: "/hardware-binding",  icon: HardDrive },
  { label: "License Migration", path: "/license-migration", icon: ArrowRightLeft },
  { label: "Vault / Evidence",  path: "/vault",             icon: Archive },
  { label: "Export Requests",   path: "/exports",           icon: Download },
  { label: "Chain of Custody",  path: "/chain-of-custody",  icon: Link2 },
  { label: "Audit Logs",        path: "/audit",             icon: ClipboardList },
  { label: "Health Check",      path: "/health",            icon: HeartPulse },
  { label: "Packages",          path: "/packages",          icon: Package },
  { label: "Admin / RBAC",      path: "/rbac",              icon: UserCog },
  { label: "Knowledge Base",    path: "/knowledge-base",    icon: BookOpen },
];

function NavItem({ label, path, icon: Icon }: { label: string; path: string; icon: any }) {
  const [location] = useLocation();
  const active = location === path || location.startsWith(path + "/");
  return (
    <Link href={path}>
      <div className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm cursor-pointer transition-colors ${active ? "bg-cyan-500/15 text-cyan-400 font-medium" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"}`}>
        <Icon size={15} className="shrink-0" />
        <span className="truncate">{label}</span>
      </div>
    </Link>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { role, setRole } = useRole();
  const [open, setOpen] = useState(true);
  const roles: CustomerRole[] = ["Customer Admin", "Operator", "Reviewer", "Auditor", "Support Engineer"];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      <aside className={`${open ? "w-56" : "w-0 overflow-hidden"} flex-none flex flex-col border-r border-white/5 bg-slate-900 transition-all duration-200`}>
        <div className="px-4 py-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <ShieldCheck size={20} className="text-cyan-400" />
            <div>
              <div className="text-sm font-bold text-white">MINIFRA</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest">Sentinel · Customer Portal</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
          {NAV.map(item => <NavItem key={item.path} {...item} />)}
        </nav>
        <div className="px-3 py-3 border-t border-white/5 text-[10px] text-slate-600 text-center">
          Minifra Sentinel v3.0.1
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-slate-900/50 backdrop-blur-sm shrink-0">
          <button onClick={() => setOpen(v => !v)} className="text-slate-400 hover:text-white transition-colors">
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
          <div className="flex-1" />
          <span className="text-xs text-slate-500">Role:</span>
          <select value={role} onChange={e => setRole(e.target.value as CustomerRole)}
            className="text-xs bg-slate-800 border border-white/10 rounded px-2 py-1 text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500">
            {roles.map(r => <option key={r}>{r}</option>)}
          </select>
          <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            Customer Portal
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
