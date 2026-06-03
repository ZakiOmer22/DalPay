// src/components/layout/Employee/EmployeeSidebar.tsx
import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  X,
  Banknote,
  AlertTriangle,
  ArrowLeft,
  FileSearch,
  Headphones,
  ShieldCheck,
  UserCircle,
  History, // 🚀 FIX: Explicitly import History icon from lucide-react
} from "lucide-react";

const APP_NAME = "DalPay";

// 🚀 FIX: Add explicit interface types so TypeScript accepts optional 'end' properties across array items
interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<any>;
  end?: boolean;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    label: "Core Operations",
    items: [
      { path: "/employee/dashboard", label: "Operations Dashboard", icon: LayoutDashboard, end: true },
      { path: "/employee/counter-payment", label: "Walk-in Desk (POS)", icon: Banknote },
      { path: "/employee/risk-validation", label: "Risk & Validation", icon: AlertTriangle },
      { path: "/employee/eaudits", label: "Digital Audits", icon: FileSearch },
      { path: "/employee/exceptions", label: "Exception Handling", icon: ShieldCheck },
    ],
  },
  {
    label: "Taxpayer Services",
    items: [
      { path: "/employee/assistance-queue", label: "Support Desk", icon: Headphones },
      { path: "/employee/session-history", label: "Interaction History", icon: History },
    ],
  },
  {
    label: "Account",
    items: [
      { path: "/profile", label: "Officer Profile", icon: UserCircle },
      { path: "/", label: "Public Website", icon: ArrowLeft },
    ],
  },
];

export default function EmployeeSidebar({
  sidebarOpen,
  toggleSidebar,
  isMobile,
}: {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  isMobile: boolean;
}) {
  const bg = "#0a0f1a";
  const border = "rgba(255,255,255,0.05)";
  const text = "rgba(255,255,255,0.55)";
  const activeText = "#ffffff";
  const activeBg = "rgba(34, 197, 94, 0.15)";
  const activeBorder = "#22c55e";
  const hoverBg = "rgba(255,255,255,0.07)";
  const hoverColor = "rgba(255,255,255,0.85)";
  const sectionLabel = "rgba(255,255,255,0.2)";
  const divider = "rgba(255,255,255,0.05)";
  const logoBg = "rgba(34, 197, 94, 0.25)";
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
          gap: 12,
          padding: sidebarOpen ? "14px 14px" : "14px 8px",
          justifyContent: sidebarOpen ? "flex-start" : "center",
          borderBottom: `1px solid ${border}`,
          flexShrink: 0,
          minHeight: 64,
          background: "rgba(34, 197, 94, 0.08)",
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            background: logoBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid rgba(34, 197, 94, 0.3)",
            boxShadow: "0 0 12px rgba(34, 197, 94, 0.15)",
            flexShrink: 0,
          }}
        >
          <img src="/icon.png" alt="Logo" style={{ width: 32, height: 32 }} />
        </div>
        {sidebarOpen && (
          <div style={{ minWidth: 0, flex: 1 }}>
            <p
              style={{
                fontWeight: 700,
                fontSize: 14,
                color: "#22c55e",
                letterSpacing: "-.01em",
                lineHeight: 1.25,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {APP_NAME}
            </p>
            <p style={{ fontSize: 11, color: "rgba(34, 197, 94, 0.6)", lineHeight: 1.3, fontWeight: 500 }}>
              Office Assistant
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "6px 0", marginTop: sidebarOpen ? 6 : 0 }}>
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

      {/* Footer Toggle Button */}
      <div style={{ borderTop: `1px solid ${border}`, padding: "8px 8px 10px", flexShrink: 0 }}>
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
          {sidebarOpen ? "Collapse" : "»"}
        </button>
      </div>
    </aside>
  );
}
