import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Users, FileText, CreditCard,
  Shield, Bell, Settings, ChevronLeft, BarChart3,
  RefreshCw, ArrowBigLeft, X,
  BookOpen,
  AlertCircle,
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
    label: "Cases",
    items: [
      { path: "/admin/disputes", label: "Disputes", icon: AlertCircle },
      { path: "/admin/documents", label: "Documents", icon: FileText },
      { path: "/admin/fraud", label: "Fraud Analysis", icon: Shield },
    ],
  },
  {
    label: "Finance",
    items: [
      { path: "/admin/ledger", label: "Ledger", icon: BookOpen },
    ],
  },
  {
    label: "System",
    items: [
      { path: "/admin/notifications", label: "Notifications", icon: Bell },
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
  isMobile,
}: {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  isMobile: boolean;
}) {
  // Fixed dark admin sidebar colors (original design)
  const bg = "#0a0f1a";
  const border = "rgba(255,255,255,0.05)";
  const text = "rgba(255,255,255,0.55)";
  const activeText = "#ffffff";
  const activeBg = "rgba(59,130,246,0.15)";
  const activeBorder = "#3b82f6";
  const hoverBg = "rgba(255,255,255,0.07)";
  const hoverColor = "rgba(255,255,255,0.85)";
  const sectionLabel = "rgba(255,255,255,0.2)";
  const divider = "rgba(255,255,255,0.05)";
  const logoBg = "rgba(255,255,255,0.1)";
  const footerText = "rgba(255,255,255,0.18)";
  const toggleColor = "rgba(255,255,255,0.25)";
  const toggleHoverBg = "rgba(255,255,255,0.07)";
  const toggleHoverColor = "rgba(255,255,255,0.65)";

  const sidebarStyle: React.CSSProperties = {
    width: sidebarOpen ? 256 : 68,
    transition: "width 0.25s cubic-bezier(.4,0,.2,1)",
    position: "fixed",
    left: 0,
    top: 0,
    height: "100%",
    background: bg,
    zIndex: 40,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    borderRight: `1px solid ${border}`,
  };

  if (isMobile) {
    sidebarStyle.boxShadow = "2px 0 15px rgba(0,0,0,0.3)";
    sidebarStyle.position = "fixed";
    sidebarStyle.zIndex = 40;
  }

  return (
    <aside style={sidebarStyle}>
      {/* Mobile close button */}
      {isMobile && (
        <button
          onClick={toggleSidebar}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            background: "none",
            border: "none",
            cursor: "pointer",
            color: text,
            padding: 4,
            borderRadius: 6,
          }}
        >
          <X size={18} />
        </button>
      )}

      {/* Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: sidebarOpen ? "16px 14px" : "16px 0",
          justifyContent: sidebarOpen ? "flex-start" : "center",
          borderBottom: `1px solid ${border}`,
          flexShrink: 0,
          minHeight: 60,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 9,
            background: logoBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img src="/icon.png" alt="Logo" style={{ width: 32, height: 32 }} />
        </div>
        {sidebarOpen && (
          <div style={{ minWidth: 0 }}>
            <p
              style={{
                fontWeight: 700,
                fontSize: 13,
                color: "#ffffff",
                letterSpacing: "-.01em",
                lineHeight: 1.25,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
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
              <p
                style={{
                  fontSize: 9.5,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: sectionLabel,
                  padding: "12px 16px 3px",
                }}
              >
                {section.label}
              </p>
            ) : (
              <div style={{ height: 1, background: divider, margin: "6px 12px" }} />
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
                  color: isActive ? activeText : text,
                  background: isActive ? activeBg : "transparent",
                  borderLeft: isActive && sidebarOpen ? `2px solid ${activeBorder}` : "2px solid transparent",
                  textDecoration: "none",
                  transition: "background 0.12s, color 0.12s",
                  position: "relative",
                })}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.getAttribute("aria-current")) {
                    e.currentTarget.style.background = hoverBg;
                    e.currentTarget.style.color = hoverColor;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.currentTarget.getAttribute("aria-current")) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = text;
                  }
                }}
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={15}
                      strokeWidth={isActive ? 2.2 : 1.8}
                      style={{ flexShrink: 0, color: isActive ? activeBorder : "inherit" }}
                    />
                    {sidebarOpen && (
                      <span
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          flex: 1,
                        }}
                      >
                        {label}
                      </span>
                    )}
                    {!sidebarOpen && isActive && (
                      <span
                        style={{
                          position: "absolute",
                          right: 4,
                          top: "50%",
                          transform: "translateY(-50%)",
                          width: 4,
                          height: 4,
                          borderRadius: "50%",
                          background: activeBorder,
                        }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ borderTop: `1px solid ${border}`, padding: "8px 8px 10px", flexShrink: 0 }}>
        {sidebarOpen && (
          <p
            style={{
              textAlign: "center",
              fontSize: 12,
              color: footerText,
              marginBottom: 6,
              letterSpacing: "0.03em",
            }}
          >
            DalPay Government
          </p>
        )}
        <button
          onClick={toggleSidebar}
          title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            padding: "6px 8px",
            borderRadius: 7,
            background: "none",
            border: "none",
            cursor: "pointer",
            color: toggleColor,
            fontSize: 11.5,
            fontFamily: "inherit",
            transition: "all 0.12s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = toggleHoverBg;
            e.currentTarget.style.color = toggleHoverColor;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "none";
            e.currentTarget.style.color = toggleColor;
          }}
        >
          <ChevronLeft
            size={13}
            style={{
              transform: sidebarOpen ? "rotate(0deg)" : "rotate(180deg)",
              transition: "transform 0.25s cubic-bezier(.4,0,.2,1)",
              flexShrink: 0,
            }}
          />
          {sidebarOpen && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}