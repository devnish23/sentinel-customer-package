interface Props { status: string; size?: "sm" | "md" }

const MAP: Record<string, string> = {
  ONLINE:"bg-emerald-500/20 text-emerald-400 border-emerald-500/30",OFFLINE:"bg-red-500/20 text-red-400 border-red-500/30",
  WARNING:"bg-yellow-500/20 text-yellow-400 border-yellow-500/30",RECORDING:"bg-blue-500/20 text-blue-400 border-blue-500/30",
  STOPPED:"bg-slate-500/20 text-slate-400 border-slate-500/30",PAUSED:"bg-orange-500/20 text-orange-400 border-orange-500/30",
  ACTIVE:"bg-emerald-500/20 text-emerald-400 border-emerald-500/30",INACTIVE:"bg-slate-500/20 text-slate-400 border-slate-500/30",
  EXPIRED:"bg-red-500/20 text-red-400 border-red-500/30",EXPIRING:"bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  OPEN:"bg-red-500/20 text-red-400 border-red-500/30",RESOLVED:"bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  INVESTIGATING:"bg-yellow-500/20 text-yellow-400 border-yellow-500/30",CLOSED:"bg-slate-500/20 text-slate-400 border-slate-500/30",
  PENDING:"bg-yellow-500/20 text-yellow-400 border-yellow-500/30",APPROVED:"bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  REJECTED:"bg-red-500/20 text-red-400 border-red-500/30",ACKNOWLEDGED:"bg-blue-500/20 text-blue-400 border-blue-500/30",
  DRAFT:"bg-slate-500/20 text-slate-400 border-slate-500/30",COMPLETED:"bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  FAILED:"bg-red-500/20 text-red-400 border-red-500/30",VALID:"bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  HIGH:"bg-red-500/20 text-red-400 border-red-500/30",MED:"bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  LOW:"bg-emerald-500/20 text-emerald-400 border-emerald-500/30",CRITICAL:"bg-red-600/20 text-red-300 border-red-600/30",
  HEALTHY:"bg-emerald-500/20 text-emerald-400 border-emerald-500/30",CLEAN:"bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  SUSPECTED:"bg-red-500/20 text-red-400 border-red-500/30",IN_PROGRESS:"bg-blue-500/20 text-blue-400 border-blue-500/30",
  AVAILABLE:"bg-emerald-500/20 text-emerald-400 border-emerald-500/30",UPLOADING:"bg-blue-500/20 text-blue-400 border-blue-500/30",
  STORED:"bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};

export function StatusBadge({ status, size = "sm" }: Props) {
  const cls = MAP[status?.toUpperCase()] ?? "bg-slate-500/20 text-slate-400 border-slate-500/30";
  const sz = size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-2.5 py-1";
  return <span className={`inline-flex items-center rounded border font-medium ${cls} ${sz}`}>{status}</span>;
}
