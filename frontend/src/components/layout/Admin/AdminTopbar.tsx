import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LogOut, Bell, Search, ChevronRight, X, Clock } from "lucide-react";
import { clearTokens } from "@/services/api";
import toast from "react-hot-toast";

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

export default function AdminTopbar() {
  const loc = useLocation();
  const navigate = useNavigate();

  // Get real admin user from localStorage (set during login)
  const storedUser = localStorage.getItem("dalpay_user");
  const user = storedUser
    ? JSON.parse(storedUser)
    : { fullName: "Admin", role: "admin" };

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications] = useState<Array<any>>([]);
  const [unreadCount] = useState(0);
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

  const initials = user?.fullName
    ?.split(" ")
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() ?? "A";

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
      style={{
        height: 64,
        background: "#ffffff",
        borderBottom: "1px solid #e5eae8",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        flexShrink: 0,
        gap: 16,
        boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
        position: "relative",
        zIndex: 100,
      }}
    >
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, flex: 1 }}>
        <span style={{ fontSize: 13, color: "#64748b", whiteSpace: "nowrap", fontWeight: 500 }}>
          DalPay Admin
        </span>
        <ChevronRight size={12} color="#94a3b8" strokeWidth={2} style={{ flexShrink: 0 }} />
        <span style={{ fontSize: 15, fontWeight: 600, color: "#0f172a", whiteSpace: "nowrap" }}>
          {meta.title}
        </span>
        {meta.description && (
          <>
            <span
              style={{
                width: 4,
                height: 4,
                borderRadius: "50%",
                background: "#cbd5e1",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: 13,
                color: "#64748b",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {meta.description}
            </span>
          </>
        )}
      </div>

      {/* Right actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <span
          style={{
            fontSize: 12,
            color: "#475569",
            background: "#f8fafc",
            padding: "6px 14px",
            borderRadius: 100,
            border: "1px solid #e2e8f0",
            whiteSpace: "nowrap",
            fontVariantNumeric: "tabular-nums",
            fontWeight: 500,
          }}
        >
          {today}
        </span>

        {/* Search */}
        <div ref={searchRef} style={{ position: "relative" }}>
          {showSearch ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                padding: "4px 4px 4px 12px",
                width: 280,
                transition: "all 0.2s ease",
              }}
            >
              <Search size={14} color="#94a3b8" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search taxpayers, payments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                style={{
                  border: "none",
                  background: "transparent",
                  padding: "6px 8px",
                  fontSize: 13,
                  width: "100%",
                  outline: "none",
                  color: "#0f172a",
                }}
              />
              <button
                onClick={() => {
                  setShowSearch(false);
                  setSearchQuery("");
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  padding: "4px 8px",
                  cursor: "pointer",
                  color: "#94a3b8",
                  borderRadius: 6,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowSearch(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 14px",
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                background: "#f8fafc",
                cursor: "pointer",
                color: "#475569",
                fontSize: 13,
                height: 36,
              }}
            >
              <Search size={14} strokeWidth={2} />
              <span>Search</span>
              <kbd
                style={{
                  fontSize: 10,
                  background: "#e2e8f0",
                  padding: "2px 6px",
                  borderRadius: 4,
                  color: "#475569",
                }}
              >
                ⌘K
              </kbd>
            </button>
          )}
        </div>

        {/* Notifications Bell */}
        <div style={{ position: "relative" }}>
          <button
            ref={bellRef}
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              background: showNotifications ? "#fff" : "#f8fafc",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              position: "relative",
              color: showNotifications ? "#2563eb" : "#475569",
              flexShrink: 0,
            }}
          >
            <Bell size={16} strokeWidth={1.8} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: 5,
                  right: 5,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#ef4444",
                  border: "2px solid #fff",
                }}
              />
            )}
          </button>

          {/* Notifications dropdown */}
          {showNotifications && (
            <div
              ref={notificationRef}
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                width: 380,
                background: "#fff",
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
                zIndex: 1000,
                overflow: "hidden",
                animation: "slideDown 0.2s ease-out",
              }}
            >
              <div
                style={{
                  padding: "16px 20px",
                  borderBottom: "1px solid #e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "#f8fafc",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Bell size={16} color="#2563eb" />
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <span
                      style={{
                        background: "#2563eb",
                        color: "white",
                        fontSize: 11,
                        fontWeight: 600,
                        padding: "2px 8px",
                        borderRadius: 100,
                      }}
                    >
                      {unreadCount} new
                    </span>
                  )}
                </div>
              </div>

              <div style={{ maxHeight: 400, overflowY: "auto" }}>
                {notifications.length > 0 ? (
                  notifications.map((n: any) => (
                    <div
                      key={n.id}
                      style={{
                        padding: "16px 20px",
                        borderBottom: "1px solid #f1f5f9",
                        background: n.is_read ? "#fff" : "#f0f9ff",
                      }}
                    >
                      <div style={{ display: "flex", gap: 12 }}>
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            background: "#2563eb10",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Bell size={18} color="#2563eb" />
                        </div>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
                            {n.title}
                          </p>
                          <p style={{ fontSize: 12, color: "#475569" }}>{n.message}</p>
                          <span style={{ fontSize: 11, color: "#94a3b8" }}>
                            <Clock size={10} style={{ marginRight: 4 }} />
                            {formatRelativeTime(n.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: "40px 20px", textAlign: "center", color: "#94a3b8" }}>
                    <Bell size={32} style={{ marginBottom: 12, opacity: 0.5 }} />
                    <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>
                      No notifications
                    </p>
                    <p style={{ fontSize: 12 }}>You're all caught up!</p>
                  </div>
                )}
              </div>

              {notifications.length > 0 && (
                <div
                  style={{
                    padding: "12px 20px",
                    borderTop: "1px solid #e2e8f0",
                    background: "#f8fafc",
                    textAlign: "center",
                  }}
                >
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      navigate("/admin/notifications");
                    }}
                    style={{
                      background: "transparent",
                      border: "none",
                      fontSize: 12,
                      color: "#2563eb",
                      cursor: "pointer",
                      fontWeight: 500,
                    }}
                  >
                    View all notifications
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 30, background: "#e2e8f0", flexShrink: 0 }} />

        {/* Admin user avatar + info */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 600,
              color: "white",
              flexShrink: 0,
              boxShadow: "0 4px 6px -1px rgba(37,99,235,0.3)",
            }}
          >
            {initials}
          </div>
          <div>
            <p
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#0f172a",
                lineHeight: 1.4,
                whiteSpace: "nowrap",
              }}
            >
              {user.fullName}
            </p>
            <p
              style={{
                fontSize: 11,
                color: "#64748b",
                textTransform: "capitalize",
                lineHeight: 1.4,
              }}
            >
              {user.role}
            </p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          title="Sign out"
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            border: "1px solid #e2e8f0",
            background: "#f8fafc",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#64748b",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#fecaca";
            e.currentTarget.style.color = "#ef4444";
            e.currentTarget.style.background = "#fef2f2";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#e2e8f0";
            e.currentTarget.style.color = "#64748b";
            e.currentTarget.style.background = "#f8fafc";
          }}
        >
          <LogOut size={14} strokeWidth={1.8} />
        </button>
      </div>

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </header>
  );
}