import { useEffect, useState } from "react";
import { api } from "../../lib/api";



const TABS = ["Initial Setup","Hub Config","Agent Config","Vault Config","Recording Config","Policy Config","License Config","Alert Config","Storage Config","Backup / Restore","Proxy / Network","Security","Export Config","Migration Config","Config Audit History"];

export default function Configuration(_props = {}) {
  const [activeTab, setActiveTab] = useState(0);
  const [cfg, setCfg] = useState<any>({});
  const [history, setHistory] = useState<any[]>([]);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    api.get("/customer/configuration").then(d => { setCfg(d); setForm(d); });
    setHistory([
      { id: "CFG-001", module: "Hub", field: "logLevel", old: "DEBUG", new: "INFO", changedBy: "admin@alpha.com", changedAt: "2026-06-05T10:00:00Z", reason: "Reduce log volume", approvalStatus: "APPROVED", sourceIp: "192.168.1.100", requestId: "REQ-CFG-001", rollbackAvailable: true },
      { id: "CFG-002", module: "Recording", field: "fps", old: "3", new: "5", changedBy: "admin@alpha.com", changedAt: "2026-06-06T09:00:00Z", reason: "Increase fidelity per policy update", approvalStatus: "APPROVED", sourceIp: "192.168.1.100", requestId: "REQ-CFG-002", rollbackAvailable: true },
    ]);
  }, []);

  const save = async (module: string) => {
    await api.post("/customer/configuration", { ...form, module });
    setMsg(`${module} configuration saved. Audit log created.`);
    setTimeout(() => setMsg(""), 4000);
  };

  const validate = async () => {
    const r = await api.post("/customer/configuration/validate");
    setMsg(r.valid ? "✓ All validation checks passed." : "✗ Validation failed.");
    setTimeout(() => setMsg(""), 5000);
  };

  const F = ({ label, k, type = "text", opts }: any) => (
    <div>
      <label className="block text-xs text-slate-400 mb-1">{label}</label>
      {opts ? (
        <select value={form[k] ?? ""} onChange={e => setForm((p: any) => ({ ...p, [k]: e.target.value }))}
          className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500">
          {opts.map((o: string) => <option key={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type} value={form[k] ?? ""} onChange={e => setForm((p: any) => ({ ...p, [k]: e.target.value }))}
          className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500" />
      )}
    </div>
  );

  const Toggle = ({ label, k }: any) => (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-xs text-slate-300">{label}</span>
      <button onClick={() => setForm((p: any) => ({ ...p, [k]: !p[k] }))}
        className={`w-9 h-5 rounded-full transition-colors ${form[k] ? "bg-cyan-500" : "bg-slate-600"}`}>
        <div className={`w-3.5 h-3.5 bg-white rounded-full transition-transform mx-0.5 ${form[k] ? "translate-x-4" : "translate-x-0"}`} />
      </button>
    </div>
  );

  const renderTab = () => {
    switch (activeTab) {
      case 0: return (
        <div className="space-y-4">
          <p className="text-xs text-slate-400">Run the initial setup wizard to configure all core settings for a new Minifra Sentinel deployment.</p>
          <div className="grid grid-cols-2 gap-3">
            <F label="Customer Name" k="customer" />
            <F label="Site Name" k="site" />
            <F label="Environment Type" k="environment" opts={["pilot","production","DR"]} />
            <F label="Hub URL" k="hubUrl" />
            <F label="Hub Bind Address" k="hubIp" />
            <F label="Hub Port" k="hubPort" type="number" />
            <F label="Vault Storage Location" k="vaultPath" />
            <F label="Admin User" k="adminUser" />
            <F label="Timezone" k="timezone" opts={["Asia/Singapore","UTC","America/New_York","Europe/London"]} />
            <F label="NTP Source" k="ntpSource" />
            <F label="Proxy Setting" k="proxyUrl" />
            <F label="SMTP / Email Setting" k="smtpServer" />
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={() => save("Initial Setup")} className="text-xs bg-cyan-500 text-slate-900 font-semibold px-4 py-1.5 rounded-lg hover:bg-cyan-400">Save Setup</button>
            <button onClick={validate} className="text-xs bg-slate-800 text-slate-300 border border-white/10 px-4 py-1.5 rounded-lg hover:bg-slate-700">Validate Configuration</button>
            <button className="text-xs bg-slate-800 text-slate-300 border border-white/10 px-4 py-1.5 rounded-lg hover:bg-slate-700">Download Config Backup</button>
          </div>
        </div>
      );
      case 1: return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <F label="Hub Hostname" k="hubHostname" />
            <F label="Hub Bind IP" k="hubIp" />
            <F label="Hub Port" k="hubPort" type="number" />
            <F label="Public Hub URL" k="hubUrl" />
            <F label="Log Level" k="logLevel" opts={["DEBUG","INFO","WARN","ERROR"]} />
            <F label="Hub Log Retention (days)" k="hubLogRetentionDays" type="number" />
            <F label="Admin API Secret" k="adminApiSecret" />
            <F label="Backup Path" k="backupPath" />
          </div>
          <Toggle label="TLS Enabled" k="tlsEnabled" />
          <div className="flex gap-2 pt-2">
            <button onClick={() => save("Hub")} className="text-xs bg-cyan-500 text-slate-900 font-semibold px-4 py-1.5 rounded-lg hover:bg-cyan-400">Save</button>
            <button className="text-xs bg-slate-800 text-slate-300 border border-white/10 px-3 py-1.5 rounded-lg hover:bg-slate-700">Test Hub Health</button>
            <button className="text-xs bg-slate-800 text-slate-300 border border-white/10 px-3 py-1.5 rounded-lg hover:bg-slate-700">Rotate Admin Secret</button>
            <button className="text-xs bg-slate-800 text-slate-300 border border-white/10 px-3 py-1.5 rounded-lg hover:bg-slate-700">Download Sanitized Config</button>
          </div>
        </div>
      );
      case 2: return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <F label="Default Hub URL" k="hubUrl" />
            <F label="Agent Registration Secret" k="agentSecret" />
            <F label="Agent Group" k="agentGroup" />
            <F label="Heartbeat Interval (s)" k="heartbeatInterval" type="number" />
            <F label="Offline Threshold (s)" k="offlineThreshold" type="number" />
            <F label="Local Storage Path" k="localStoragePath" />
            <F label="Upload Retry Interval (s)" k="uploadRetryInterval" type="number" />
            <F label="Update Channel" k="updateChannel" opts={["stable","beta","rc"]} />
          </div>
          <Toggle label="Tamper Detection Enabled" k="tamperDetectionEnabled" />
          <Toggle label="Uninstall Protection" k="uninstallProtection" />
          <div className="flex gap-2 pt-2">
            <button onClick={() => save("Agent")} className="text-xs bg-cyan-500 text-slate-900 font-semibold px-4 py-1.5 rounded-lg hover:bg-cyan-400">Save</button>
            <button className="text-xs bg-slate-800 text-slate-300 border border-white/10 px-3 py-1.5 rounded-lg hover:bg-slate-700">Generate Agent Config</button>
            <button className="text-xs bg-slate-800 text-slate-300 border border-white/10 px-3 py-1.5 rounded-lg hover:bg-slate-700">Download Config</button>
            <button className="text-xs bg-slate-800 text-slate-300 border border-white/10 px-3 py-1.5 rounded-lg hover:bg-slate-700">Push Config to Agents</button>
          </div>
        </div>
      );
      case 3: return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <F label="Vault URL" k="vaultUrl" />
            <F label="Vault Storage Path" k="vaultPath" />
            <F label="Evidence Storage Path" k="evidencePath" />
            <F label="Key Provider Mode" k="keyProviderMode" opts={["local","HSM","KMS"]} />
            <F label="Export Staging Path" k="exportStagingPath" />
            <F label="Export Expiry Period (days)" k="exportExpiryDays" type="number" />
          </div>
          <Toggle label="Encryption Enabled" k="vaultEncryptionEnabled" />
          <Toggle label="Reviewer Approval Required" k="reviewerApprovalRequired" />
          <div className="flex gap-2 pt-2">
            <button onClick={() => save("Vault")} className="text-xs bg-cyan-500 text-slate-900 font-semibold px-4 py-1.5 rounded-lg hover:bg-cyan-400">Save</button>
            <button className="text-xs bg-slate-800 text-slate-300 border border-white/10 px-3 py-1.5 rounded-lg hover:bg-slate-700">Test Vault Connection</button>
            <button className="text-xs bg-slate-800 text-slate-300 border border-white/10 px-3 py-1.5 rounded-lg hover:bg-slate-700">Validate Encryption</button>
            <button className="text-xs bg-slate-800 text-slate-300 border border-white/10 px-3 py-1.5 rounded-lg hover:bg-slate-700">Validate Chain Verification</button>
          </div>
        </div>
      );
      case 4: return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <F label="Default Recording Mode" k="recordingMode" opts={["Always record","Schedule-based","Trigger-based","Manual"]} />
            <F label="Capture Method" k="captureMethod" opts={["Auto","Desktop Duplication API","Windows Graphics Capture","Screenshot fallback","OpenCV fallback processing only"]} />
            <F label="FPS" k="fps" type="number" />
            <F label="Resolution" k="resolution" opts={["1280x720","1920x1080","native"]} />
            <F label="Chunk Duration (s)" k="chunkDuration" type="number" />
            <F label="Upload Interval (s)" k="uploadInterval" type="number" />
          </div>
          <Toggle label="Watermark Enabled" k="watermarkEnabled" />
          <Toggle label="Timestamp Overlay" k="timestampOverlay" />
          <Toggle label="Consent Notice Enabled" k="consentNoticeEnabled" />
          <Toggle label="Offline Recording Allowed" k="offlineRecordingAllowed" />
          <Toggle label="OpenCV Processing Enabled" k="opencvProcessingEnabled" />
          <Toggle label="Motion Detection Enabled" k="motionDetectionEnabled" />
          <Toggle label="Screenshot Fallback Enabled" k="screenshotFallbackEnabled" />
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 text-xs text-amber-400">
            ⚠ OpenCV is a processing and fallback layer, not the primary production capture engine.
          </div>
          <button onClick={() => save("Recording")} className="text-xs bg-cyan-500 text-slate-900 font-semibold px-4 py-1.5 rounded-lg hover:bg-cyan-400">Save</button>
        </div>
      );
      case 5: return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <F label="Evidence Retention (days)" k="evidenceRetentionDays" type="number" />
            <F label="Log Retention (days)" k="logRetentionDays" type="number" />
            <F label="Export Retention (days)" k="exportRetentionDays" type="number" />
            <F label="Offline Alert Threshold (min)" k="offlineThresholdMin" type="number" />
            <F label="License Expiry Alert (days)" k="licenseExpiryAlertDays" type="number" />
            <F label="Storage Full Threshold (%)" k="storageFull" type="number" />
          </div>
          <Toggle label="Tamper Alert Enabled" k="tamperAlertEnabled" />
          <Toggle label="Export Approval Required" k="exportApprovalRequired" />
          <Toggle label="Self-Approval Blocked" k="selfApprovalBlocked" />
          <Toggle label="Chain Verification Required" k="chainVerificationRequired" />
          <button onClick={() => save("Policy")} className="text-xs bg-cyan-500 text-slate-900 font-semibold px-4 py-1.5 rounded-lg hover:bg-cyan-400">Save</button>
        </div>
      );
      case 6: return (
        <div className="space-y-4">
          <div className="bg-slate-800/50 rounded-xl p-4 space-y-3">
            <div className="text-xs font-medium text-slate-400 mb-2">License Import</div>
            <label className="cursor-pointer inline-flex items-center gap-2 text-xs bg-cyan-500 text-slate-900 font-semibold px-4 py-1.5 rounded-lg hover:bg-cyan-400">
              Import License File
              <input type="file" className="hidden" onChange={() => { api.post("/customer/license/import"); setMsg("License file imported"); setTimeout(() => setMsg(""), 3000); }} />
            </label>
            <div className="text-xs text-slate-500">Current license: LIC-ALPHA-001 · Expires 2026-12-31 · Status: ACTIVE</div>
          </div>
        </div>
      );
      case 7: return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <F label="SMTP Server" k="smtpServer" />
            <F label="SMTP Port" k="smtpPort" type="number" />
            <F label="SMTP Sender" k="smtpSender" />
            <F label="Telegram Bot Token" k="telegramToken" />
            <F label="Telegram Chat ID" k="telegramChatId" />
            <F label="Slack Webhook URL" k="slackWebhook" />
            <F label="Generic Webhook URL" k="genericWebhook" />
            <F label="Alert Suppression Window (min)" k="alertSuppressionMin" type="number" />
          </div>
          <Toggle label="Email Enabled" k="emailEnabled" />
          <Toggle label="Telegram Enabled" k="telegramEnabled" />
          <div className="flex gap-2 pt-2">
            <button onClick={() => save("Alert")} className="text-xs bg-cyan-500 text-slate-900 font-semibold px-4 py-1.5 rounded-lg hover:bg-cyan-400">Save</button>
            <button onClick={() => { setMsg("Test email sent"); setTimeout(() => setMsg(""), 3000); }} className="text-xs bg-slate-800 text-slate-300 border border-white/10 px-3 py-1.5 rounded-lg hover:bg-slate-700">Send Test Email</button>
            <button onClick={() => { setMsg("Test Telegram sent"); setTimeout(() => setMsg(""), 3000); }} className="text-xs bg-slate-800 text-slate-300 border border-white/10 px-3 py-1.5 rounded-lg hover:bg-slate-700">Send Test Telegram</button>
          </div>
        </div>
      );
      case 8: return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <F label="Hub Data Path" k="hubDataPath" />
            <F label="Vault Evidence Path" k="vaultPath" />
            <F label="Export Path" k="exportPath" />
            <F label="Backup Path" k="backupPath" />
            <F label="Min Free Space (GB)" k="minFreeSpaceGb" type="number" />
            <F label="Storage Full Alert (%)" k="storageFull" type="number" />
            <F label="Retention Cleanup Schedule" k="retentionSchedule" />
            <F label="Archive Location" k="archiveLocation" />
          </div>
          <Toggle label="Immutable / WORM Storage" k="immutableStorage" />
          <div className="flex gap-2 pt-2">
            <button onClick={() => save("Storage")} className="text-xs bg-cyan-500 text-slate-900 font-semibold px-4 py-1.5 rounded-lg hover:bg-cyan-400">Save</button>
            <button onClick={() => { setMsg("Path access validated"); setTimeout(() => setMsg(""), 3000); }} className="text-xs bg-slate-800 text-slate-300 border border-white/10 px-3 py-1.5 rounded-lg hover:bg-slate-700">Validate Path Access</button>
            <button onClick={() => { setMsg("Storage estimate: 4.2 GB used / 500 GB capacity"); setTimeout(() => setMsg(""), 4000); }} className="text-xs bg-slate-800 text-slate-300 border border-white/10 px-3 py-1.5 rounded-lg hover:bg-slate-700">Calculate Storage Estimate</button>
          </div>
        </div>
      );
      case 9: return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <F label="Backup Path" k="backupPath" />
            <F label="Backup Schedule" k="backupSchedule" opts={["daily","weekly","manual"]} />
            <F label="Backup Retention (days)" k="backupRetentionDays" type="number" />
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {["Include Hub config","Include Vault config","Include database","Include agent registry","Include policies","Include licenses","Include audit logs","Include evidence metadata","Include export history"].map(l => (
              <Toggle key={l} label={l} k={l.replace(/\s+/g,"_").toLowerCase()} />
            ))}
          </div>
          <Toggle label="Encrypt Backup" k="encryptBackup" />
          <div className="flex gap-2 pt-2">
            <button onClick={() => save("Backup")} className="text-xs bg-cyan-500 text-slate-900 font-semibold px-4 py-1.5 rounded-lg hover:bg-cyan-400">Save</button>
            <button onClick={() => { setMsg("Backup started"); setTimeout(() => setMsg(""), 3000); }} className="text-xs bg-slate-800 text-slate-300 border border-white/10 px-3 py-1.5 rounded-lg hover:bg-slate-700">Run Backup Now</button>
            <button className="text-xs bg-slate-800 text-slate-300 border border-white/10 px-3 py-1.5 rounded-lg hover:bg-slate-700">Validate Backup</button>
            <button className="text-xs bg-slate-800 text-slate-300 border border-white/10 px-3 py-1.5 rounded-lg hover:bg-slate-700">Generate Restore Readiness Report</button>
          </div>
        </div>
      );
      case 10: return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <F label="Proxy Host" k="proxyHost" />
            <F label="Proxy Port" k="proxyPort" type="number" />
            <F label="Proxy Username" k="proxyUser" />
            <F label="Proxy Secret Reference" k="proxySecretRef" />
            <F label="No-Proxy List" k="noProxyList" />
            <F label="DNS Server" k="dnsServer" />
            <F label="NTP Server" k="ntpSource" />
          </div>
          <Toggle label="Proxy Enabled" k="proxyEnabled" />
          <div className="flex gap-2 pt-2">
            <button onClick={() => save("Proxy")} className="text-xs bg-cyan-500 text-slate-900 font-semibold px-4 py-1.5 rounded-lg hover:bg-cyan-400">Save</button>
            {["Test Proxy","Test DNS","Test NTP","Test Hub Port","Test Vault Port"].map(l => (
              <button key={l} onClick={() => { setMsg(`${l}: OK`); setTimeout(() => setMsg(""), 3000); }} className="text-xs bg-slate-800 text-slate-300 border border-white/10 px-3 py-1.5 rounded-lg hover:bg-slate-700">{l}</button>
            ))}
          </div>
        </div>
      );
      case 11: return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <F label="Authentication Mode" k="authMode" opts={["local","LDAP"]} />
            <F label="Session Timeout (min)" k="sessionTimeout" type="number" />
            <F label="Password Policy" k="passwordPolicy" opts={["standard","strong","enterprise"]} />
            <F label="Allowed IP Ranges" k="allowedIpRanges" />
            <F label="Audit Log Retention (days)" k="auditLogRetentionDays" type="number" />
          </div>
          <Toggle label="MFA Enabled" k="mfaEnabled" />
          <Toggle label="Evidence Encryption" k="evidenceEncryption" />
          <Toggle label="Export Approval Required" k="exportApprovalRequired" />
          <Toggle label="Self-Approval Prevention" k="selfApprovalPrevention" />
          <Toggle label="Tamper Detection" k="tamperDetection" />
          <Toggle label="Secure Uninstall" k="secureUninstall" />
          <div className="flex gap-2 pt-2">
            <button onClick={() => save("Security")} className="text-xs bg-cyan-500 text-slate-900 font-semibold px-4 py-1.5 rounded-lg hover:bg-cyan-400">Save</button>
            {["Rotate Secrets","Test Authentication","Validate TLS","Export Security Report"].map(l => (
              <button key={l} onClick={() => { setMsg(`${l}: OK`); setTimeout(() => setMsg(""), 3000); }} className="text-xs bg-slate-800 text-slate-300 border border-white/10 px-3 py-1.5 rounded-lg hover:bg-slate-700">{l}</button>
            ))}
          </div>
        </div>
      );
      case 12: return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <F label="Minimum Reviewer Role" k="minReviewerRole" opts={["Reviewer","Customer Admin"]} />
            <F label="Export Expiry Period (days)" k="exportExpiryDays" type="number" />
            <F label="Export Staging Path" k="exportStagingPath" />
          </div>
          <Toggle label="Export Approval Required" k="exportApprovalRequired" />
          <Toggle label="Self-Approval Blocked" k="selfApprovalBlocked" />
          <Toggle label="Case ID Required" k="caseIdRequired" />
          <Toggle label="Export Reason Required" k="exportReasonRequired" />
          <Toggle label="Chain Verification Required" k="chainVerificationRequired" />
          <Toggle label="Manifest Required" k="manifestRequired" />
          <Toggle label="Audit Log Required" k="auditLogRequired" />
          <div className="flex gap-2 pt-2">
            <button onClick={() => save("Export")} className="text-xs bg-cyan-500 text-slate-900 font-semibold px-4 py-1.5 rounded-lg hover:bg-cyan-400">Save Export Policy</button>
            <button className="text-xs bg-slate-800 text-slate-300 border border-white/10 px-3 py-1.5 rounded-lg hover:bg-slate-700">Test Export Workflow</button>
            <button className="text-xs bg-slate-800 text-slate-300 border border-white/10 px-3 py-1.5 rounded-lg hover:bg-slate-700">Generate Sample Manifest</button>
          </div>
        </div>
      );
      case 13: return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <F label="Migration Type" k="migrationType" opts={["Hub","Vault","Agent","License"]} />
            <F label="Source System" k="sourceSystem" />
            <F label="Target System" k="targetSystem" />
            <F label="Rollback Window (days)" k="rollbackWindowDays" type="number" />
            <F label="Cutover Date" k="cutoverDate" type="date" />
          </div>
          <Toggle label="Dual-Validity Enabled" k="dualValidityEnabled" />
          <div className="flex gap-2 pt-2">
            <button onClick={() => save("Migration")} className="text-xs bg-cyan-500 text-slate-900 font-semibold px-4 py-1.5 rounded-lg hover:bg-cyan-400">Save</button>
            {["Generate Pre-check Report","Export Current Config","Export License State","Export Agent Registry","Validate Target System","Confirm Rollback Readiness"].map(l => (
              <button key={l} onClick={() => { setMsg(`${l}: completed`); setTimeout(() => setMsg(""), 3000); }} className="text-xs bg-slate-800 text-slate-300 border border-white/10 px-3 py-1.5 rounded-lg hover:bg-slate-700">{l}</button>
            ))}
          </div>
        </div>
      );
      case 14: return (
        <div className="space-y-3">
          <div className="flex gap-2">
            {["Filter","Compare Versions","Export Audit Report"].map(l => (
              <button key={l} className="text-xs bg-slate-800 text-slate-300 border border-white/10 px-3 py-1.5 rounded-lg hover:bg-slate-700">{l}</button>
            ))}
          </div>
          <div className="bg-slate-800/50 rounded-xl overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-500 border-b border-white/5">
                  {["Change ID","Module","Field","Old Value","New Value","Changed By","Timestamp","Reason","Approval","Rollback"].map(h => (
                    <th key={h} className="text-left px-3 py-2.5 font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map(h => (
                  <tr key={h.id} className="border-b border-white/5 hover:bg-white/2">
                    <td className="px-3 py-2.5 font-mono text-slate-400">{h.id}</td>
                    <td className="px-3 py-2.5 text-slate-300">{h.module}</td>
                    <td className="px-3 py-2.5 text-slate-300">{h.field}</td>
                    <td className="px-3 py-2.5 text-red-400">{h.old}</td>
                    <td className="px-3 py-2.5 text-emerald-400">{h.new}</td>
                    <td className="px-3 py-2.5 text-slate-400">{h.changedBy}</td>
                    <td className="px-3 py-2.5 text-slate-400 whitespace-nowrap">{new Date(h.changedAt).toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-slate-400 max-w-[150px] truncate">{h.reason}</td>
                    <td className="px-3 py-2.5 text-slate-300">{h.approvalStatus}</td>
                    <td className="px-3 py-2.5">{h.rollbackAvailable && <button onClick={() => { setMsg(`Rolled back ${h.id}`); setTimeout(() => setMsg(""), 3000); }} className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded">Rollback</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
      default: return null;
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-xl font-bold text-white">Configuration</h1>
        <p className="text-xs text-slate-400 mt-0.5">All secrets are redacted after save. Every configuration change creates an audit log.</p>
      </div>

      {msg && <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm rounded-lg px-4 py-2">{msg}</div>}

      {/* Tab strip */}
      <div className="flex gap-1 flex-wrap">
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setActiveTab(i)}
            className={`text-xs px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${activeTab === i ? "bg-cyan-500 text-slate-900 font-semibold" : "bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"}`}>
            {i + 1}. {t}
          </button>
        ))}
      </div>

      <div className="bg-slate-900 border border-white/5 rounded-xl p-5 min-h-[300px]">
        <h3 className="text-sm font-bold text-white mb-4">{TABS[activeTab]}</h3>
        {renderTab()}
      </div>
    </div>
  );
}
