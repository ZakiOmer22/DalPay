// src/components/AdminTopbar.tsx
import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  LogOut, Bell, Search, ChevronRight, X, Clock, Menu,
} from "lucide-react";
import { clearTokens, request } from "@/services/api";
import toast from "react-hot-toast";

// Fixed light design tokens – dark mode removed
const C = {
  bg: "#ffffff",
  border: "#e5eae8",
  text: "#0f172a",
  muted: "#475569",
  faint: "#64748b",
  accent: "#2563eb",
  accentBg: "#2563eb10",
  accentText: "#2563eb",
  kbdBg: "#e2e8f0",
  kbdColor: "#475569",
  dateBg: "#f8fafc",
  dateBorder: "#e2e8f0",
  searchBg: "#f8fafc",
  searchBorder: "#e2e8f0",
  searchText: "#0f172a",
  bellBg: "#f8fafc",
  bellActiveBg: "#ffffff",
  bellActiveText: "#2563eb",
  dropdownShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
  unreadBg: "#f0f9ff",
  readBg: "#ffffff",
  itemBorder: "#f1f5f9",
  footerBg: "#f8fafc",
  footerBorder: "#e2e8f0",
  logoutBg: "#f8fafc",
  logoutBorder: "#e2e8f0",
  logoutColor: "#64748b",
  breadcrumbMuted: "#64748b",
  breadcrumbText: "#0f172a",
  dateText: "#475569",
  buttonText: "#475569",
};

const PAGE_META: Record<string, { title: string; description: string }> = {
  "/admin/dashboard": { title: "Dashboard", description: "System overview & key metrics" },
  "/admin/taxpayers": { title: "Taxpayers", description: "Manage taxpayer accounts" },
  "/admin/assessments": { title: "Assessments", description: "Create & review tax assessments" },
  "/admin/payments": { title: "Payments", description: "All payment transactions" },
  "/admin/reports": { title: "Reports", description: "Generate tax reports" },
  "/admin/audit-logs": { title: "Audit Logs", description: "Security & activity logs" },
  "/admin/reconciliation": { title: "Reconciliation", description: "Daily reconciliation" },
  "/admin/notifications": { title: "Notifications", description: "Send system notifications" },
  "/admin/system-health": { title: "System Health", description: "Monitor server & database" },
  "/admin/backup": { title: "Backup & Restore", description: "Database backups" },
  "/admin/storage": { title: "Storage", description: "File storage management" },
  "/admin/settings": { title: "Settings", description: "System configuration" },
};

const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};

export default function AdminTopbar({
  onMenuClick,
}: {
  onMenuClick?: () => void;
}) {
  const loc = useLocation();
  const navigate = useNavigate();

  // ── User ──────────────────────────────────────────────────────────
  const storedUser = localStorage.getItem("dalpay_user");
  const user = storedUser
    ? JSON.parse(storedUser)
    : { fullName: "Admin", role: "admin" };

  const initials = user?.fullName
    ?.split(" ")
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() ?? "A";

  // ── Notifications (fetch last 5) ─────────────────────────────────
  const [showNotifications, setShowNotifications] = useState(false);
  const { data: notifData } = useQuery({
    queryKey: ["topbar-notifications"],
    queryFn: () => request<{ notifications: any[] }>("/notification/admin/all?limit=5"),
    staleTime: 30000,
  });
  const notifications = notifData?.data?.notifications ?? [];
  const unreadCount = notifications.filter((n: any) => !n.read).length;

  // ── Search ────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const notificationRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const meta = PAGE_META[loc.pathname] ?? { title: "Dashboard", description: "" };
  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const handleLogout = () => {
    clearTokens();
    localStorage.removeItem("dalpay_user");
    navigate("/login");
    toast.success("Signed out successfully");
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      console.log("Admin search:", searchQuery);
      setShowSearch(false);
      setSearchQuery("");
      toast.success(`Searching for "${searchQuery}"`);
    }
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node) &&
        bellRef.current &&
        !bellRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearch(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcut for search (⌘K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowSearch(true);
      }
      if (e.key === "Escape" && showSearch) {
        setShowSearch(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showSearch]);

  useEffect(() => {
    if (showSearch && searchInputRef.current) searchInputRef.current.focus();
  }, [showSearch]);

  return (
    <header
      className="topbar"
      style={{
        height: 64,
        background: C.bg,
        borderBottom: `1px solid ${C.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        flexShrink: 0,
        gap: 12,
        boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
        position: "relative",
        zIndex: 100,
      }}
    >
      {/* Breadcrumb */}
      <div className="breadcrumb" style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, flex: "1 1 auto" }}>
        <span style={{ fontSize: 13, color: C.breadcrumbMuted, whiteSpace: "nowrap", fontWeight: 500 }}>
          DalPay Admin
        </span>
        <ChevronRight size={12} color="#94a3b8" strokeWidth={2} style={{ flexShrink: 0 }} />
        <span style={{ fontSize: 15, fontWeight: 600, color: C.breadcrumbText, whiteSpace: "nowrap" }}>
          {meta.title}
        </span>
        {meta.description && (
          <>
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#cbd5e1", flexShrink: 0 }} />
            <span className="breadcrumb-desc" style={{ fontSize: 13, color: C.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {meta.description}
            </span>
          </>
        )}
      </div>

      {/* Right actions */}
      <div className="actions" style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        {/* Mobile hamburger button */}
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="mobile-menu-btn"
            style={{
              width: 36, height: 36, borderRadius: 8,
              border: `1px solid ${C.border}`, background: C.bg,
              display: "none", // hidden on desktop, shown via CSS
              alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: C.buttonText, flexShrink: 0,
            }}
          >
            <Menu size={18} />
          </button>
        )}

        <span className="date-pill" style={{
          fontSize: 12, color: C.dateText, background: C.dateBg, padding: "6px 12px",
          borderRadius: 100, border: `1px solid ${C.dateBorder}`, whiteSpace: "nowrap",
          fontVariantNumeric: "tabular-nums", fontWeight: 500,
        }}>
          {today}
        </span>

        {/* Search */}
        <div ref={searchRef} style={{ position: "relative" }} className="search-container">
          {showSearch ? (
            <div style={{
              display: "flex", alignItems: "center",
              background: C.searchBg, border: `1px solid ${C.searchBorder}`,
              borderRadius: 8, padding: "4px 4px 4px 12px", width: 250,
              transition: "all 0.2s ease",
            }}>
              <Search size={14} color="#94a3b8" />
              <input ref={searchInputRef} type="text" placeholder="Search..." value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={handleSearch}
                style={{
                  border: "none", background: "transparent", padding: "6px 8px",
                  fontSize: 13, width: "100%", outline: "none", color: C.searchText,
                }}
              />
              <button onClick={() => { setShowSearch(false); setSearchQuery(""); }}
                style={{ background: "transparent", border: "none", padding: "4px 8px", cursor: "pointer", color: "#94a3b8", borderRadius: 6, display: "flex", alignItems: "center" }}>
                <X size={14} />
              </button>
            </div>
          ) : (
            <button onClick={() => setShowSearch(true)}
              style={{
                display: "flex", alignItems: "center", gap: 6, padding: "6px 12px",
                borderRadius: 8, border: `1px solid ${C.searchBorder}`, background: C.searchBg,
                cursor: "pointer", color: C.buttonText, fontSize: 13, height: 36,
              }}>
              <Search size={14} strokeWidth={2} />
              <span className="search-text">Search</span>
              <kbd style={{ fontSize: 10, background: C.kbdBg, padding: "2px 6px", borderRadius: 4, color: C.kbdColor }}>⌘K</kbd>
            </button>
          )}
        </div>

        {/* Notifications Bell */}
        <div style={{ position: "relative" }}>
          <button ref={bellRef} onClick={() => setShowNotifications(!showNotifications)}
            style={{
              width: 36, height: 36, borderRadius: 8, border: `1px solid ${C.border}`,
              background: showNotifications ? C.bellActiveBg : C.bellBg,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", position: "relative",
              color: showNotifications ? C.bellActiveText : C.buttonText,
              flexShrink: 0,
            }}>
            <Bell size={16} strokeWidth={1.8} />
            {unreadCount > 0 && (
              <span style={{
                position: "absolute", top: 5, right: 5, width: 8, height: 8,
                borderRadius: "50%", background: "#ef4444", border: "2px solid #fff",
              }} />
            )}
          </button>

          {/* Notifications dropdown */}
          {showNotifications && (
            <div ref={notificationRef}
              className="notif-dropdown"
              style={{
                position: "absolute", top: "calc(100% + 8px)", right: 0,
                width: 380, maxWidth: "90vw", background: C.bg, borderRadius: 12,
                border: `1px solid ${C.border}`, boxShadow: C.dropdownShadow,
                zIndex: 1000, overflow: "hidden", animation: "slideDown 0.2s ease-out",
              }}>
              <div style={{
                padding: "14px 18px", borderBottom: `1px solid ${C.border}`,
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: C.footerBg,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Bell size={16} color={C.accent} />
                  <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Notifications</span>
                  {unreadCount > 0 && (
                    <span style={{ background: C.accent, color: "white", fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 100 }}>
                      {unreadCount} new
                    </span>
                  )}
                </div>
              </div>

              <div style={{ maxHeight: 400, overflowY: "auto" }}>
                {notifications.length > 0 ? (
                  notifications.map((n: any) => (
                    <div key={n.id} style={{
                      padding: "14px 18px", borderBottom: `1px solid ${C.itemBorder}`,
                      background: n.read ? C.readBg : C.unreadBg,
                    }}>
                      <div style={{ display: "flex", gap: 12 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: 8,
                          background: C.accentBg, display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <Bell size={16} color={C.accent} />
                        </div>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{n.title}</p>
                          <p style={{ fontSize: 12, color: C.muted }}>{n.message}</p>
                          <span style={{ fontSize: 11, color: C.faint }}>
                            <Clock size={10} style={{ marginRight: 4 }} />
                            {formatRelativeTime(n.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: "40px 20px", textAlign: "center", color: C.faint }}>
                    <Bell size={32} style={{ marginBottom: 12, opacity: 0.5 }} />
                    <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 4, color: C.text }}>No notifications</p>
                    <p style={{ fontSize: 12 }}>You're all caught up!</p>
                  </div>
                )}
              </div>

              {notifications.length > 0 && (
                <div style={{
                  padding: "12px 18px", borderTop: `1px solid ${C.footerBorder}`,
                  background: C.footerBg, textAlign: "center",
                }}>
                  <button onClick={() => { setShowNotifications(false); navigate("/admin/notifications"); }}
                    style={{
                      background: "transparent", border: "none", fontSize: 12,
                      color: C.accentText, cursor: "pointer", fontWeight: 500,
                    }}>
                    View all notifications
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 28, background: C.border, flexShrink: 0 }} />

        {/* Admin user avatar + info */}
        <div className="user-info" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 600, color: "white", flexShrink: 0,
            boxShadow: "0 4px 6px -1px rgba(37,99,235,0.3)",
          }}>
            {initials}
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: C.text, lineHeight: 1.4, whiteSpace: "nowrap" }}>{user.fullName}</p>
            <p style={{ fontSize: 11, color: C.muted, textTransform: "capitalize", lineHeight: 1.4 }}>{user.role}</p>
          </div>
        </div>

        {/* Logout */}
        <button onClick={handleLogout} title="Sign out"
          style={{
            width: 36, height: 36, borderRadius: 8, border: `1px solid ${C.logoutBorder}`,
            background: C.logoutBg, display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: C.logoutColor, flexShrink: 0,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#fecaca"; e.currentTarget.style.color = "#ef4444"; e.currentTarget.style.background = "#fef2f2"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.logoutBorder; e.currentTarget.style.color = C.logoutColor; e.currentTarget.style.background = C.logoutBg; }}>
          <LogOut size={14} strokeWidth={1.8} />
        </button>
      </div>

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Show hamburger on mobile */
        @media (max-width: 768px) {
          .topbar {
            height: auto !important;
            flex-direction: column;
            padding: 12px 16px !important;
            gap: 10px;
          }
          .breadcrumb {
            flex-wrap: wrap;
          }
          .breadcrumb-desc {
            display: none;
          }
          .actions {
            flex-wrap: wrap;
            justify-content: flex-end;
            gap: 6px;
            width: 100%;
          }
          .date-pill {
            font-size: 10px !important;
            padding: 4px 10px !important;
          }
          .search-text {
            display: none;
          }
          .user-info {
            display: none !important;
          }
          .notif-dropdown {
            width: 100vw !important;
            max-width: 100vw !important;
            right: -16px !important;
          }
          .mobile-menu-btn {
            display: flex !important;
          }
        }
      `}</style>
    </header>
  );
}