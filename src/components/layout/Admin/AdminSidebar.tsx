import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Users, FileText, CreditCard,
  Shield, Bell, Settings, ChevronLeft, BarChart3,
  HardDrive, Activity, Database, RefreshCw, ArrowBigLeft,
} from "lucide-react";

const APP_NAME = "DalPay Admin";

const NAV_SECTIONS = [
  {
    label: "Main",
    items: [
      { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
      { path: "/admin/taxpayers", label: "Taxpayers", icon: Users },
      { path: "/admin/assessments", label: "Assessments", icon: FileText },
      { path: "/admin/payments", label: "Payments", icon: CreditCard },
    ],
  },
  {
    label: "Reporting & Audit",
    items: [
      { path: "/admin/reports", label: "Reports", icon: BarChart3 },
      { path: "/admin/audit-logs", label: "Audit Logs", icon: Shield },
      { path: "/admin/reconciliation", label: "Reconciliation", icon: RefreshCw },
    ],
  },
  {
    label: "System",
    items: [
      { path: "/admin/notifications", label: "Notifications", icon: Bell },
      { path: "/admin/system-health", label: "System Health", icon: Activity },
      { path: "/admin/backup", label: "Backup & Restore", icon: Database },
      { path: "/admin/storage", label: "Storage", icon: HardDrive },
      { path: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
  {
    label: "Website",
    items: [
      { path: "/", label: "Back to Website", icon: ArrowBigLeft },
    ],
  },
];

export default function AdminSidebar({
  sidebarOpen,
  toggleSidebar,
}: {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}) {
  return (
    <aside
      style={{
        width: sidebarOpen ? 256 : 68,
        transition: "width 0.25s cubic-bezier(.4,0,.2,1)",
        position: "fixed",
        left: 0,
        top: 0,
        height: "100%",
        background: "#0a0f1a", // darker for admin
        zIndex: 40,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        borderRight: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: sidebarOpen ? "16px 14px" : "16px 0",
          justifyContent: sidebarOpen ? "flex-start" : "center",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          flexShrink: 0,
          minHeight: 60,
        }}
      >
        <div style={{ width: 40, height: 40, borderRadius: 9, background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <img src="/icon.png" alt="Logo" style={{ width: 32, height: 32 }} />
        </div>
        {sidebarOpen && (
          <div style={{ minWidth: 0 }}>
            <p style={{ fontWeight: 700, fontSize: 13, color: "white", letterSpacing: "-.01em", lineHeight: 1.25, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {APP_NAME}
            </p>
            <p style={{ fontSize: 10.5, color: "rgba(255,255,255,0.3)", lineHeight: 1.3 }}>
              Government Portal
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "6px 0" }}>
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            {sidebarOpen ? (
              <p style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", padding: "12px 16px 3px" }}>
                {section.label}
              </p>
            ) : (
              <div style={{ height: 1, background: "rgba(255,255,255,0.05)", margin: "6px 12px" }} />
            )}
            {section.items.map(({ path, label, icon: Icon, end }) => (
              <NavLink
                key={path}
                to={path}
                end={end ?? false}
                style={({ isActive }) => ({
                  display: "flex",
                  alignItems: "center",
                  gap: sidebarOpen ? 9 : 0,
                  justifyContent: sidebarOpen ? "flex-start" : "center",
                  padding: sidebarOpen ? "7px 10px 7px 12px" : "8px 0",
                  margin: sidebarOpen ? "1px 8px" : "1px 6px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? "#ffffff" : "rgba(255,255,255,0.55)",
                  background: isActive ? "rgba(59,130,246,0.15)" : "transparent",
                  borderLeft: isActive && sidebarOpen ? "2px solid #3b82f6" : "2px solid transparent",
                  textDecoration: "none",
                  transition: "background 0.12s, color 0.12s",
                  position: "relative",
                })}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.getAttribute("aria-current")) {
                    e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                    e.currentTarget.style.color = "rgba(255,255,255,0.85)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.currentTarget.getAttribute("aria-current")) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "rgba(255,255,255,0.55)";
                  }
                }}
              >
                {({ isActive }) => (
                  <>
                    <Icon size={15} strokeWidth={isActive ? 2.2 : 1.8} style={{ flexShrink: 0, color: isActive ? "#3b82f6" : "inherit" }} />
                    {sidebarOpen && (
                      <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flex: 1 }}>{label}</span>
                    )}
                    {!sidebarOpen && isActive && (
                      <span style={{ position: "absolute", right: 4, top: "50%", transform: "translateY(-50%)", width: 4, height: 4, borderRadius: "50%", background: "#3b82f6" }} />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "8px 8px 10px", flexShrink: 0 }}>
        {sidebarOpen && (
          <p style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.18)", marginBottom: 6, letterSpacing: "0.03em" }}>
            DalPay Government
          </p>
        )}
        <button
          onClick={toggleSidebar}
          title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            padding: "6px 8px", borderRadius: 7, background: "none", border: "none",
            cursor: "pointer", color: "rgba(255,255,255,0.25)", fontSize: 11.5, fontFamily: "inherit",
            transition: "all 0.12s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.color = "rgba(255,255,255,0.65)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "rgba(255,255,255,0.25)"; }}
        >
          <ChevronLeft size={13} style={{ transform: sidebarOpen ? "rotate(0deg)" : "rotate(180deg)", transition: "transform 0.25s cubic-bezier(.4,0,.2,1)", flexShrink: 0 }} />
          {sidebarOpen && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}