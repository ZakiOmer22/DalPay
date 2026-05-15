// src/pages/admin/SettingsPage.tsx
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Settings, Shield, Bell, Database,
  Save, RefreshCw, Check,
} from "lucide-react";
import { request } from "@/services/api";
import toast from "react-hot-toast";

// ── Design tokens ────────────────────────────────────────────
const C = {
  border: "#e5eae8", bg: "#ffffff", bgPage: "#f0f2f1", bgMuted: "#f7f9f8",
  text: "#111816", muted: "#7a918b", faint: "#a0b4ae",
  teal: "#0d9e75", tealBg: "#e8f7f2", tealText: "#0a7d5d",
  amber: "#f59e0b", amberBg: "#fffbeb", amberText: "#92400e",
  red: "#e53e3e", redBg: "#fff5f5", redText: "#c53030",
  blue: "#3b82f6", blueBg: "#eff6ff", blueText: "#1d4ed8",
  purple: "#8b5cf6", purpleBg: "#f5f3ff", purpleText: "#5b21b6",
};

// ── API helpers ──────────────────────────────────────────────
const settingsApi = {
  getSettings: () => request("/settings"),
  updateSettings: (data: any) => request("/settings", { method: "PUT", body: JSON.stringify(data) }),
  testEmail: (email: string) => request("/settings/test-email", { method: "POST", body: JSON.stringify({ email }) }),
  backupDatabase: () => request("/settings/backup", { method: "POST" }),
};

// ── Sub-component: Section Card ──────────────────────────────
function SectionCard({ title, icon: Icon, children, onSave, saving }: any) {
  return (
    <div style={{
      background: C.bg,
      border: `1px solid ${C.border}`,
      borderRadius: 12,
      marginBottom: 16,
    }}>
      <div style={{
        padding: "14px 16px",
        borderBottom: `1px solid ${C.border}`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Icon size={16} color={C.teal} />
          <h2 style={{ fontSize: 14, fontWeight: 600, color: C.text, margin: 0 }}>{title}</h2>
        </div>
        {onSave && (
          <button
            onClick={onSave}
            disabled={saving}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 14px",
              borderRadius: 8,
              background: C.teal,
              border: "none",
              color: "white",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? <RefreshCw size={13} className="spin" /> : <Save size={13} />}
            Save
          </button>
        )}
      </div>
      <div style={{ padding: "14px 16px" }}>
        {children}
      </div>
    </div>
  );
}

function InputField({ label, value, onChange, type = "text", placeholder, disabled }: any) {
  return (
    <div style={{ marginBottom: 10 }}>
      <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 4, fontWeight: 500 }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          width: "100%",
          padding: "8px 12px",
          borderRadius: 8,
          border: `1px solid ${C.border}`,
          fontSize: 13,
          outline: "none",
          fontFamily: "inherit",
          background: disabled ? C.bgMuted : C.bg,
          color: C.text,
        }}
      />
    </div>
  );
}

function ToggleRow({ label, description, checked, onChange }: any) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
      <div>
        <span style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>{label}</span>
        {description && <p style={{ fontSize: 11, color: C.faint, margin: "2px 0 0" }}>{description}</p>}
      </div>
      <div
        onClick={() => onChange(!checked)}
        style={{
          width: 40,
          height: 22,
          borderRadius: 11,
          background: checked ? C.teal : C.border,
          position: "relative",
          cursor: "pointer",
          transition: "background 0.2s",
        }}
      >
        <div style={{
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "white",
          position: "absolute",
          top: 2,
          left: checked ? 20 : 2,
          transition: "left 0.2s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        }} />
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");

  // General settings form state
  const [systemName, setSystemName] = useState("DalPay");
  const [currency, setCurrency] = useState("SOS");
  const [timezone, setTimezone] = useState("Africa/Mogadishu");
  const [defaultLanguage, setDefaultLanguage] = useState("en");

  // Security settings
  const [minPasswordLength, setMinPasswordLength] = useState(8);
  const [sessionTimeout, setSessionTimeout] = useState(30); // minutes
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [ipWhitelisting, setIpWhitelisting] = useState(false);

  // Notification settings
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [testEmailSent, setTestEmailSent] = useState(false);

  // Backup
  const [lastBackup, setLastBackup] = useState<string | null>(null);

  // Fetch current settings
  const { data: settingsData, isLoading } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: settingsApi.getSettings,
    staleTime: 60000,
  });

  useEffect(() => {
    if (settingsData?.data) {
      const s = settingsData.data as Record<string, any>;
      if (s.systemName) setSystemName(s.systemName);
      if (s.currency) setCurrency(s.currency);
      if (s.timezone) setTimezone(s.timezone);
      if (s.defaultLanguage) setDefaultLanguage(s.defaultLanguage);
      if (s.minPasswordLength) setMinPasswordLength(s.minPasswordLength);
      if (s.sessionTimeout) setSessionTimeout(s.sessionTimeout);
      if (s.twoFactorRequired !== undefined) setTwoFactorRequired(s.twoFactorRequired);
      if (s.ipWhitelisting !== undefined) setIpWhitelisting(s.ipWhitelisting);
      if (s.emailAlerts !== undefined) setEmailAlerts(s.emailAlerts);
      if (s.smsAlerts !== undefined) setSmsAlerts(s.smsAlerts);
      if (s.adminEmail) setAdminEmail(s.adminEmail);
      if (s.lastBackup) setLastBackup(s.lastBackup);
    }
  }, [settingsData]);

  // Mutation for updating general settings
  const saveMutation = useMutation({
    mutationFn: (data: any) => settingsApi.updateSettings(data),
    onSuccess: () => toast.success("Settings saved"),
    onError: (err: any) => toast.error(err.message || "Failed to save"),
  });

  const handleSaveGeneral = () => {
    saveMutation.mutate({
      systemName,
      currency,
      timezone,
      defaultLanguage,
    });
  };

  const handleSaveSecurity = () => {
    saveMutation.mutate({
      minPasswordLength,
      sessionTimeout,
      twoFactorRequired,
      ipWhitelisting,
    });
  };

  const handleSaveNotifications = () => {
    saveMutation.mutate({
      emailAlerts,
      smsAlerts,
      adminEmail,
    });
  };

  const testEmailMutation = useMutation({
    mutationFn: () => settingsApi.testEmail(adminEmail),
    onSuccess: () => {
      setTestEmailSent(true);
      toast.success("Test email sent");
      setTimeout(() => setTestEmailSent(false), 3000);
    },
    onError: (err: any) => toast.error(err.message || "Failed to send test email"),
  });

  const backupMutation = useMutation({
    mutationFn: () => settingsApi.backupDatabase(),
    onSuccess: (data: any) => {
      toast.success("Backup started");
      if (data?.data?.timestamp) setLastBackup(data.data.timestamp);
    },
    onError: (err: any) => toast.error(err.message || "Backup failed"),
  });

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid #e2e8f0", borderTopColor: C.teal, animation: "spin 0.7s linear infinite" }} />
      </div>
    );
  }

  const tabs = [
    { id: "general", label: "General", icon: Settings },
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "backup", label: "Backup", icon: Database },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: 0 }}>Admin Settings</h1>
        <p style={{ fontSize: 13, color: C.faint, marginTop: 4 }}>Configure system-wide preferences</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, borderBottom: `1px solid ${C.border}`, paddingBottom: 8 }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 16px",
              borderRadius: 8,
              border: "none",
              background: activeTab === tab.id ? C.tealBg : "transparent",
              color: activeTab === tab.id ? C.tealText : C.muted,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "general" && (
        <SectionCard title="General Settings" icon={Settings} onSave={handleSaveGeneral} saving={saveMutation.isPending}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <InputField label="System Name" value={systemName} onChange={(e: any) => setSystemName(e.target.value)} />
            <InputField label="Currency" value={currency} onChange={(e: any) => setCurrency(e.target.value)} />
            <InputField label="Timezone" value={timezone} onChange={(e: any) => setTimezone(e.target.value)} />
            <InputField label="Default Language" value={defaultLanguage} onChange={(e: any) => setDefaultLanguage(e.target.value)} />
          </div>
        </SectionCard>
      )}

      {activeTab === "security" && (
        <SectionCard title="Security Settings" icon={Shield} onSave={handleSaveSecurity} saving={saveMutation.isPending}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <InputField
              label="Minimum Password Length"
              value={minPasswordLength}
              onChange={(e: any) => setMinPasswordLength(parseInt(e.target.value) || 8)}
              type="number"
            />
            <InputField
              label="Session Timeout (minutes)"
              value={sessionTimeout}
              onChange={(e: any) => setSessionTimeout(parseInt(e.target.value) || 30)}
              type="number"
            />
          </div>
          <ToggleRow
            label="Two-Factor Authentication"
            description="Require 2FA for all admin accounts"
            checked={twoFactorRequired}
            onChange={setTwoFactorRequired}
          />
          <ToggleRow
            label="IP Whitelisting"
            description="Restrict admin access to specific IP ranges"
            checked={ipWhitelisting}
            onChange={setIpWhitelisting}
          />
        </SectionCard>
      )}

      {activeTab === "notifications" && (
        <SectionCard title="Notification Settings" icon={Bell} onSave={handleSaveNotifications} saving={saveMutation.isPending}>
          <ToggleRow
            label="Email Alerts"
            description="Send critical alerts via email"
            checked={emailAlerts}
            onChange={setEmailAlerts}
          />
          <ToggleRow
            label="SMS Alerts"
            description="Send alerts via SMS (carrier charges may apply)"
            checked={smsAlerts}
            onChange={setSmsAlerts}
          />
          <div style={{ marginTop: 12 }}>
            <InputField
              label="Admin Email"
              value={adminEmail}
              onChange={(e: any) => setAdminEmail(e.target.value)}
              placeholder="admin@example.com"
            />
            <button
              onClick={() => testEmailMutation.mutate()}
              disabled={!adminEmail || testEmailMutation.isPending}
              style={{
                padding: "6px 14px",
                borderRadius: 8,
                background: C.blue + "15",
                border: `1px solid ${C.blue}30`,
                color: C.blue,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
                opacity: !adminEmail ? 0.5 : 1,
              }}
            >
              {testEmailSent ? <Check size={13} /> : "Send Test Email"}
            </button>
          </div>
        </SectionCard>
      )}

      {activeTab === "backup" && (
        <SectionCard title="Database Backup" icon={Database}>
          <p style={{ fontSize: 13, color: C.muted, marginBottom: 12 }}>
            Create a full backup of the database. Last backup: {lastBackup ? new Date(lastBackup).toLocaleString() : "Never"}
          </p>
          <button
            onClick={() => backupMutation.mutate()}
            disabled={backupMutation.isPending}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 18px",
              borderRadius: 8,
              background: C.amber,
              border: "none",
              color: "white",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              opacity: backupMutation.isPending ? 0.7 : 1,
            }}
          >
            {backupMutation.isPending ? <RefreshCw size={16} className="spin" /> : <Database size={16} />}
            Backup Now
          </button>
        </SectionCard>
      )}
    </div>
  );
}