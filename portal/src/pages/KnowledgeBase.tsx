import { useState } from "react";
import { BookOpen, Search, ChevronDown, ChevronRight, ExternalLink } from "lucide-react";

const ARTICLES = [
  {
    id: "kb-001", category: "Installation & Setup",
    title: "Minifra Sentinel Hub — Installation Guide (Windows Server)",
    tags: ["hub", "install", "windows"],
    content: `Prerequisites
- Windows Server 2019 / 2022 (or Windows 10/11 Pro)
- .NET 6.0 Runtime or later
- 4 GB RAM minimum (8 GB recommended)
- 50 GB free disk space for Hub + Vault
- Ports 8080 (Hub API), 8443 (TLS) must be open

Step 1 — Run the installer
  Double-click MinifraHub-Setup-3.0.1.exe and follow the wizard.
  Default install path: C:\\Program Files\\Minifra\\Hub

Step 2 — Configure the Hub
  Open C:\\ProgramData\\Minifra\\Hub\\config.json and set:
    "bindAddress": "0.0.0.0",
    "port": 8080,
    "vaultPath": "C:\\\\minifra\\\\vault",
    "tlsEnabled": true

Step 3 — Start the service
  The installer registers MinifraHub as a Windows Service.
  Start it: net start MinifraHub
  Or from Services (services.msc): right-click → Start

Step 4 — Verify Hub health
  Browse to http://localhost:8080/health
  Expected response: { "status": "HEALTHY" }

Troubleshooting
  If Hub fails to start, check C:\\ProgramData\\Minifra\\Hub\\logs\\hub.log
  Ensure port 8080 is not in use: netstat -ano | findstr :8080`
  },
  {
    id: "kb-002", category: "Installation & Setup",
    title: "Minifra Sentinel Agent — Deployment Guide",
    tags: ["agent", "install", "deploy"],
    content: `Prerequisites
- Windows 10 / 11 / Server 2019+
- 2 GB RAM minimum
- 20 GB local storage for recordings
- Hub must be running and reachable

Step 1 — Run the agent installer
  Execute MinifraAgent-Setup-3.0.1.exe as Administrator.
  During install, enter the Hub URL when prompted:
    Example: https://192.168.1.10:8080

Step 2 — Generate hardware binding
  After install, open the Customer Portal → Hardware Binding
  Click "Generate Machine ID" — copy the hash shown.
  Submit it to your Minifra contact to bind the license to this machine.

Step 3 — Import the license
  Go to Customer Portal → License Management
  Click "Import License File" and upload the .lic file provided.
  If offline, click "Activate Offline" and follow the challenge/response steps.

Step 4 — Verify agent connection
  In the Customer Portal → Agents, the new agent should appear within 60 seconds.
  Status should show ONLINE.

Silent / MSI deployment (enterprise)
  MinifraAgent-Setup-3.0.1.exe /S /HUB_URL=https://192.168.1.10:8080 /SILENT`
  },
  {
    id: "kb-003", category: "License Management",
    title: "Activating a License Offline (Air-Gapped Environments)",
    tags: ["license", "offline", "airgap", "activation"],
    content: `Use this procedure when the Sentinel Hub has no internet access.

Step 1 — Generate the Machine ID
  Customer Portal → Hardware Binding → "Generate Machine ID"
  This produces a hardware fingerprint tied to the Hub machine.

Step 2 — Get the offline activation code
  Email the Machine ID + your License ID to licensing@minifra.com
  Or log in to the Minifra Vendor Portal → License Management to generate offline codes.
  You will receive an activation blob (base64 encoded string).

Step 3 — Apply the activation
  Customer Portal → License Management → "Activate Offline"
  Paste the activation blob and click Apply.
  The license status will change to ACTIVE.

Step 4 — Verify
  Refresh the License page — Status: ACTIVE, Days Remaining should update.

Notes
  - Offline licenses are typically issued for 1 year.
  - Hardware re-binding is required if you migrate to new hardware.
  - Contact support@minifra.com for emergency offline activations.`
  },
  {
    id: "kb-004", category: "Agents & Recording",
    title: "Agent Offline — Troubleshooting Checklist",
    tags: ["agent", "offline", "troubleshooting", "heartbeat"],
    content: `Symptom: Agent shows OFFLINE in the Customer Portal despite the machine being on.

Check 1 — Hub reachability from agent machine
  On the agent machine, run: curl http://<HUB_IP>:8080/health
  If it fails: check firewall rules on both Hub and agent machines.
  Ports required: TCP 8080 (or 8443 if TLS).

Check 2 — Agent service running
  services.msc → MinifraAgent → Status should be "Running"
  Or: sc query MinifraAgent
  If stopped: net start MinifraAgent

Check 3 — Agent logs
  Location: C:\\ProgramData\\Minifra\\Agent\\logs\\agent.log
  Look for: "Connection refused", "Certificate error", "Authentication failed"

Check 4 — TLS certificate issues
  If Hub uses a self-signed cert, the agent config must have:
    "tlsSkipVerify": true   (dev/pilot only — NOT for production)
  For production, install the Hub CA cert in Windows Trusted Root store.

Check 5 — Agent clock skew
  Agent and Hub must be within 5 minutes of each other (NTP).
  Run: w32tm /query /status on the agent machine.

Check 6 — Proxy blocking traffic
  If the network uses a proxy: Customer Portal → Configuration → Proxy/Network
  Add the Hub IP to the No-Proxy list on each agent.

Still offline after all checks?
  Collect a Support Bundle: Customer Portal → Packages → "Support Bundle Tool"
  Submit the bundle to support@minifra.com with ticket reference.`
  },
  {
    id: "kb-005", category: "Agents & Recording",
    title: "Recording Engine — Capture Methods Explained",
    tags: ["recording", "dxgi", "opencv", "capture", "engine"],
    content: `Minifra Sentinel uses a layered capture architecture on Windows.

Primary: Windows Desktop Duplication API (DXGI)
  - Hardware-accelerated, lowest CPU usage
  - Captures all windows including DRM-protected video
  - Requires: GPU with DXGI support, Windows 8+
  - Config: captureMethod = "Desktop Duplication API"

Fallback 1: Windows Graphics Capture API (WGC)
  - Software-based, works on all GPUs
  - Slightly higher CPU, slightly lower fidelity
  - Automatically used if DXGI is unavailable
  - Config: captureMethod = "Windows Graphics Capture"

Fallback 2: MSS Screenshot Loop
  - Pure software, works everywhere
  - Highest CPU usage, lowest latency
  - Used in Citrix/RDP/VM environments where GPU APIs are blocked

OpenCV — NOT a capture engine
  OpenCV is used ONLY for post-processing (compression, motion detection,
  watermarking). It does NOT capture the screen.
  Warning: Do not set captureMethod = "OpenCV" — this is not a valid mode.

Recommended settings (Customer Portal → Configuration → Recording Config)
  FPS: 5 (default) — increase to 10 for compliance recording
  Resolution: 1280x720 (recommended), 1920x1080 (compliance/legal)
  Chunk Duration: 30s (default)
  Capture Method: Auto (let Sentinel choose the best available)`
  },
  {
    id: "kb-006", category: "Agents & Recording",
    title: "K7 / Antivirus Blocking Minifra Agent",
    tags: ["antivirus", "K7", "exclusion", "false-positive"],
    content: `Some antivirus products flag Minifra Agent because it uses screen recording APIs.

Confirmed affected products: K7 Total Security, K7 Ultimate Security, Malwarebytes (heuristic), some Trend Micro policies.

Exclusion paths to add in your AV console:
  C:\\Program Files\\Minifra\\
  C:\\ProgramData\\Minifra\\
  C:\\minifra\\  (if vault is here)

Processes to whitelist:
  minifra-agent.exe
  minifra-hub.exe
  minifra-vault.exe

For K7 specifically:
  K7 Security → Settings → Exclusions → Add Folder
  Add all three paths above.
  Restart K7 and then: net start MinifraAgent

Group Policy / Defender exclusions (enterprise):
  Use GPO: Computer Configuration → Windows Settings →
  Administrative Templates → Windows Defender → Exclusions
  Add Process Exclusions for minifra-agent.exe and minifra-hub.exe

Verify fix:
  After adding exclusions, check K7 quarantine for any blocked files.
  Restore quarantined files, then restart the agent service.`
  },
  {
    id: "kb-007", category: "Export & Evidence",
    title: "Export Workflow — End-to-End Guide",
    tags: ["export", "evidence", "approval", "chain-of-custody"],
    content: `Exporting evidence from Minifra Sentinel requires a two-person approval workflow.

Step 1 — Create export request (Operator role)
  Customer Portal → Export Requests → New Export
  Fill in: Case ID, reason, date range, agent(s) to export.
  Submit. Status becomes PENDING.

Step 2 — Reviewer approves (Reviewer role — different user)
  The Reviewer receives an email notification (if SMTP is configured).
  Customer Portal → Export Requests → select the pending request → Approve.
  IMPORTANT: The same user who requested cannot approve (self-approval blocked).

Step 3 — Download the export package
  Once APPROVED, the Download button activates.
  The package contains: video chunks (.mp4), manifest.json, chain-of-custody.json
  Each chunk is SHA-256 hashed; the manifest includes the full hash chain.

Step 4 — Verify chain of custody
  Customer Portal → Chain of Custody → select export → Verify
  This re-checks all chunk hashes against the manifest.
  Status VALID = tamper-free evidence.

Step 5 — Audit trail
  Every action is logged: Customer Portal → Audit Logs
  Filter by module "Export" to see the full paper trail.

Notes
  - Export packages expire after the configured retention period (default 90 days).
  - Downloads are logged (download count visible in Export Requests).
  - For legal submissions, always include the chain-of-custody.json and the manifest.`
  },
  {
    id: "kb-008", category: "License Management",
    title: "Hardware Binding — Migrating to a New Server",
    tags: ["hardware", "binding", "migration", "re-bind"],
    content: `When you replace or re-image the Hub server, the hardware binding must be updated.

Before you migrate (on old Hub)
  1. Export current config: Customer Portal → Configuration → Download Config Backup
  2. Note the existing License ID and binding hash (Customer Portal → License)
  3. Export the vault if needed: Customer Portal → Vault → Export Evidence

On the new Hub machine
  1. Install Minifra Hub using the Hub Installer from Customer Portal → Packages
  2. Open Customer Portal → Hardware Binding → Generate Machine ID
  3. Copy the new Machine ID (binding hash)

Request re-binding
  Email new Machine ID + License ID to licensing@minifra.com
  Subject: "Hardware Re-bind Request — [Your Company Name]"
  Include: old Machine ID, new Machine ID, reason for migration.
  SLA: 1 business day for re-bind approval.

Apply the new license
  Once issued, import the updated .lic file: License Management → Import License File
  Old Hub: the license becomes invalid automatically.

Common mistakes
  - Don't run the new Hub before getting the re-bind approved — it causes license conflicts.
  - Dual-validity window (default 7 days): both old and new Hub work during the window.
    Set this in Customer Portal → Configuration → Migration Config.`
  },
  {
    id: "kb-009", category: "Troubleshooting",
    title: "Hub Fails to Start After Windows Reboot",
    tags: ["hub", "startup", "reboot", "service", "windows"],
    content: `Symptom: MinifraHub service fails to start after a Windows reboot, requires manual restart.

Cause 1 — Service start order (most common)
  Hub depends on the network stack and (if configured) SQL Server / PostgreSQL.
  Fix: Set service startup delay.
  sc config MinifraHub start= delayed-auto

Cause 2 — Vault path not available at boot
  If vault is on a mapped network drive, it may not be mounted when Hub starts.
  Fix 1: Use UNC paths (\\\\server\\share) instead of mapped drives in Hub config.
  Fix 2: Add a startup dependency on the network provider.

Cause 3 — TLS certificate not accessible to SYSTEM account
  Hub service runs as SYSTEM by default. If the cert is in the user store, it won't load.
  Fix: Move the cert to the Local Machine certificate store (not Current User).
  certlm.msc → Personal → Certificates → import the Hub cert here.

Cause 4 — Log file rotation failure
  If the log directory is full, Hub cannot write and aborts startup.
  Fix: Clear C:\\ProgramData\\Minifra\\Hub\\logs\\ and set log retention in config.

To test fix:
  net stop MinifraHub && net start MinifraHub
  Then reboot and confirm: sc query MinifraHub (should show RUNNING).`
  },
  {
    id: "kb-010", category: "Troubleshooting",
    title: "Port / Firewall Configuration for Minifra Sentinel",
    tags: ["port", "firewall", "network", "connectivity"],
    content: `Required ports for a standard Minifra Sentinel deployment:

Hub (inbound — allow these on the Hub machine's firewall)
  TCP 8080   — Hub API (HTTP, used by agents and Customer Portal)
  TCP 8443   — Hub API (HTTPS/TLS, recommended for production)
  TCP 5432   — PostgreSQL (only if Hub DB is remote; usually localhost only)

Agent (outbound — agents call Hub; usually no inbound rule needed)
  TCP 8080 or 8443 → Hub IP

Customer Portal (if self-hosted)
  TCP 80    — HTTP (redirect to HTTPS)
  TCP 443   — HTTPS (if serving with nginx/IIS)

Windows Firewall rules (run as Administrator on Hub machine)
  netsh advfirewall firewall add rule name="Minifra Hub API" ^
    protocol=TCP dir=in localport=8080 action=allow
  netsh advfirewall firewall add rule name="Minifra Hub TLS" ^
    protocol=TCP dir=in localport=8443 action=allow

Cloud / network firewall (AWS Security Group / Azure NSG example)
  Type: Custom TCP, Port: 8443, Source: Agent IP ranges
  Type: Custom TCP, Port: 443, Source: Portal users IP ranges

Proxy environments
  Configure proxy in Customer Portal → Configuration → Proxy/Network
  Add Hub IP to no-proxy/bypass list so agents talk to Hub directly.`
  },
  {
    id: "kb-011", category: "Upgrade & Rollback",
    title: "Upgrading Minifra Sentinel to v3.0.1",
    tags: ["upgrade", "update", "migration", "version"],
    content: `Supported upgrade paths: 2.8.x → 3.0.x, 2.9.x → 3.0.x

Pre-upgrade checklist
  [ ] Back up Hub config: Customer Portal → Configuration → Download Config Backup
  [ ] Back up Vault: ensure evidence is backed up to secondary location
  [ ] Note current license ID and hardware binding hash
  [ ] Schedule a maintenance window (Hub will restart)
  [ ] Notify end users that recording will pause for ~10 minutes

Step 1 — Download the upgrade package
  Customer Portal → Packages → "Unified Setup (Hub + Agent) v3.0.1"
  Verify checksum against the value shown in the portal.

Step 2 — Upgrade Hub
  Run MinifraHub-Setup-3.0.1.exe /UPGRADE on the Hub machine.
  The installer will stop the service, upgrade, and restart it.
  Total downtime: ~5 minutes.

Step 3 — Verify Hub
  Browse to http://localhost:8080/health → expect { "version": "3.0.1", "status": "HEALTHY" }
  Check Customer Portal → Health Check → Run All Checks.

Step 4 — Upgrade Agents
  Option A: Push from portal — Customer Portal → Agents → select agents → Push Update
  Option B: Manual — run MinifraAgent-Setup-3.0.1.exe /UPGRADE /S on each agent
  Option C: GPO/SCCM silent deployment

Post-upgrade
  Verify all agents reconnect (allow 5 minutes for heartbeats).
  Check audit log: upgrade events should appear in Audit Logs.
  Check license: run License → Validate License.

Rollback
  Customer Portal → Packages → "Rollback Package v3.0.0"
  Run rollback installer — it restores the previous version and config.
  Rollback window: 7 days from upgrade.`
  },
  {
    id: "kb-012", category: "Security & Compliance",
    title: "Tamper Detection — What Triggers an Alert",
    tags: ["tamper", "security", "alert", "integrity"],
    content: `Minifra Sentinel monitors agents for signs of tampering or interference.

Tamper events that trigger a SUSPECTED status:
  1. Agent binary hash mismatch — the minifra-agent.exe file has been modified.
  2. Service stopped unexpectedly — service was killed without using the Hub API.
  3. Config file modified outside the Hub — config.json was edited directly on disk.
  4. Recording chunk hash mismatch — a stored chunk's SHA-256 does not match the manifest.
  5. Clock manipulation — system clock jumped by more than the allowed threshold.
  6. Uninstall attempt blocked — uninstall protection kicked in.

What to do when an agent shows SUSPECTED
  1. Do NOT dismiss without investigation.
  2. Customer Portal → Alerts → review the tamper alert details.
  3. Collect a support bundle from the affected agent.
  4. Check agent logs at C:\\ProgramData\\Minifra\\Agent\\logs\\
  5. Escalate to your Security team if hash mismatch is confirmed.
  6. Contact support@minifra.com with the support bundle for forensic analysis.

False positives
  Tamper alerts can be caused by:
  - Antivirus scanning/modifying the binary (solution: add exclusions — see KB-006)
  - Windows Update replacing runtime DLLs
  - Legitimate config push from Hub (this should NOT trigger tamper — if it does, open a support case)

Clearing a false positive
  After investigation: Customer Portal → Alerts → Acknowledge → Close
  The audit log records who cleared the alert and when.`
  },
  {
    id: "kb-013", category: "Security & Compliance",
    title: "Setting Up Two-Person Export Approval (4-Eyes Control)",
    tags: ["export", "approval", "4-eyes", "compliance", "rbac"],
    content: `Minifra Sentinel enforces dual-control for evidence exports. Here's how to configure it.

Required roles
  - Operator: can REQUEST exports but cannot approve their own
  - Reviewer: can APPROVE exports (cannot approve their own requests)
  - Customer Admin: can configure export policy

Enable export approval (if not already on)
  Customer Portal → Configuration → Export Config
  Toggle: Export Approval Required = ON
  Toggle: Self-Approval Blocked = ON
  Save Export Policy.

Create user accounts with correct roles
  Customer Portal → Admin / RBAC → Add User
  Add at least:
    - 2 × Operator (requesters)
    - 2 × Reviewer (approvers — different people from Operators)
  Principle: no single person should hold both Operator and Reviewer roles.

Test the workflow
  1. Log in as Operator → create export request.
  2. Log in as Reviewer → approve the request.
  3. Attempt to approve as the same Operator → system should reject with error:
     "Self-approval not allowed."

Audit trail
  Every approval action is immutable in Customer Portal → Audit Logs.
  Filter: Module = "Export"
  Fields: requestedBy, approvedBy, timestamp, result.

For compliance (ISO 27001, SOC 2, GDPR)
  The audit log export is available as CSV from the Audit Logs page.
  Chain-of-custody JSON is included in every export package.`
  },
  {
    id: "kb-014", category: "Support",
    title: "Collecting and Submitting a Support Bundle",
    tags: ["support", "bundle", "diagnostics", "logs"],
    content: `A support bundle contains all logs, config (sanitized), and diagnostics needed for L2/L3 support.

How to collect a support bundle

Method 1 — Customer Portal (recommended)
  Customer Portal → Packages → "Support Bundle Tool"
  Download and run the tool. It collects:
    - Hub logs (last 7 days)
    - Agent logs from all online agents (last 7 days)
    - Sanitized config (passwords/keys redacted)
    - System info (Windows version, hardware, network)
    - Health check results
    - Recent audit log (last 500 entries)
  Output: MinifraSupport-<timestamp>.zip

Method 2 — Manual (when Portal is unreachable)
  Run on the Hub machine (as Administrator):
    cd "C:\\Program Files\\Minifra\\Hub\\tools"
    .\\collect-support-bundle.bat
  Output in: C:\\ProgramData\\Minifra\\SupportBundles\\

Submitting the bundle
  Email: support@minifra.com
  Subject: "Support Bundle — [Company Name] — [Brief description]"
  Attach the .zip file (max 50 MB; upload to provided link if larger).
  Include: your license ID, Hub version, description of issue.

What NOT to include
  - Do NOT include raw evidence/recording files — these are sensitive.
  - Do NOT send license activation blobs via email — use the secure portal.
  - The bundle tool automatically redacts API keys and passwords.`
  },
];

const CATEGORIES = ["All", "Installation & Setup", "License Management", "Agents & Recording", "Export & Evidence", "Troubleshooting", "Upgrade & Rollback", "Security & Compliance", "Support"];

export default function KnowledgeBase() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = ARTICLES.filter(a =>
    (category === "All" || a.category === category) &&
    (search === "" || a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.content.toLowerCase().includes(search.toLowerCase()) ||
      a.tags.some(t => t.toLowerCase().includes(search.toLowerCase())))
  );

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-xl font-bold text-white">Knowledge Base</h1>
        <p className="text-sm text-slate-400 mt-0.5">{ARTICLES.length} articles — installation guides, troubleshooting, and how-tos</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        <div className="flex items-center gap-2 bg-slate-800 border border-white/10 rounded-lg px-3 py-1.5 flex-1 min-w-[200px]">
          <Search size={13} className="text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search articles, tags…"
            className="bg-transparent text-sm text-white focus:outline-none flex-1 placeholder:text-slate-600" />
        </div>
        <select value={category} onChange={e => setCategory(e.target.value)}
          className="bg-slate-800 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-slate-300 focus:outline-none">
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      <div className="space-y-2">
        {filtered.map(a => (
          <div key={a.id} className="bg-slate-900 border border-white/5 rounded-xl overflow-hidden">
            <button
              className="w-full flex items-start gap-3 p-4 text-left hover:bg-white/2 transition-colors"
              onClick={() => setSelected(selected === a.id ? null : a.id)}>
              <div className="p-2 bg-cyan-500/10 rounded-lg mt-0.5 shrink-0">
                <BookOpen size={14} className="text-cyan-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-white text-sm">{a.title}</div>
                <div className="text-xs text-slate-500 mt-0.5 flex gap-2 flex-wrap">
                  <span className="text-cyan-400">{a.category}</span>
                  <span>·</span>
                  <span className="font-mono">{a.id}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex flex-wrap gap-1">
                  {a.tags.slice(0, 3).map(t => (
                    <span key={t} className="text-[10px] bg-slate-800 text-slate-400 rounded px-1.5 py-0.5">{t}</span>
                  ))}
                </div>
                {selected === a.id ? <ChevronDown size={14} className="text-slate-500" /> : <ChevronRight size={14} className="text-slate-500" />}
              </div>
            </button>
            {selected === a.id && (
              <div className="px-4 pb-4 border-t border-white/5">
                <pre className="mt-3 bg-slate-800/60 rounded-lg p-4 text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-mono overflow-x-auto">
                  {a.content}
                </pre>
                <div className="flex items-center gap-2 mt-2">
                  <a href={`docs/kb/articles/${a.id}.html`} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1 text-xs text-cyan-400 hover:underline">
                    <ExternalLink size={11} />Open full article
                  </a>
                </div>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-500 text-sm">No articles match your search</div>
        )}
      </div>
    </div>
  );
}
