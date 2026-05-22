// src/pages/admin/SessionsPage.tsx
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Shield, Monitor, Smartphone, Globe, RefreshCw, XCircle, Search, Filter, ChevronDown, Activity, Users, Wifi, WifiOff } from "lucide-react";
import { request } from "@/services/api";
import toast from "react-hot-toast";

const C = {
  border: "#e5eae8",
  bg: "#ffffff", 
  bgPage: "#f0f2f1", 
  bgMuted: "#f7f9f8",
  text: "#111816", 
  muted: "#7a918b", 
  faint: "#a0b4ae",
  teal: "#0d9e75", 
  tealBg: "#e8f7f2", 
  tealText: "#0a7d5d",
  tealBorder: "#0d9e75", // ADDED THIS
  amber: "#f59e0b", 
  amberBg: "#fffbeb", 
  amberText: "#92400e",
  red: "#e53e3e", 
  redBg: "#fff5f5", 
  redText: "#c53030",
  blue: "#3b82f6", 
  blueBg: "#eff6ff", 
  blueText: "#1d4ed8",
  purple: "#8b5cf6", 
  purpleBg: "#f5f3ff", 
  purpleText: "#5b21b6",
};

interface Session {
  id: string;
  user_id: string;
  ip: string;
  user_agent: string;
  is_revoked: boolean;
  created_at: string;
  full_name: string;
  email: string;
}

const sessionsApi = {
  getAll: () => request("/admin/sessions"),
  revoke: (id: string) => request(`/admin/sessions/${id}/revoke`, { method: "POST" }),
};

function getDeviceIcon(ua: string) {
  if (!ua) return <Monitor size={14} />;
  if (ua.includes("Postman") || ua.includes("curl")) return <Globe size={14} />;
  if (ua.includes("Mobile")) return <Smartphone size={14} />;
  return <Monitor size={14} />;
}

function getDeviceType(ua: string) {
  if (!ua) return "Unknown";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Postman")) return "Postman";
  if (ua.includes("curl")) return "cURL";
  if (ua.includes("Safari")) return "Safari";
  return "Other";
}

function getOS(ua: string) {
  if (ua.includes("Windows")) return "Windows";
  if (ua.includes("Mac")) return "macOS";
  if (ua.includes("Linux")) return "Linux";
  if (ua.includes("Android")) return "Android";
  if (ua.includes("iOS") || ua.includes("iPhone")) return "iOS";
  return "Unknown";
}

function getRelativeTime(date: string) {
  const now = new Date();
  const then = new Date(date);
  const diff = now.getTime() - then.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return then.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export default function SessionsPage() {
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "revoked">("all");
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-sessions"],
    queryFn: sessionsApi.getAll,
    staleTime: 15000,
  });

  const sessions = (data?.data as Session[]) || [];

  const activeSessions = sessions.filter(s => !s.is_revoked).length;
  const revokedSessions = sessions.filter(s => s.is_revoked).length;

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = searchTerm === "" || 
      session.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.ip.includes(searchTerm);
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && !session.is_revoked) ||
      (statusFilter === "revoked" && session.is_revoked);
    
    return matchesSearch && matchesStatus;
  });

  const revokeMutation = useMutation({
    mutationFn: (id: string) => sessionsApi.revoke(id),
    onSuccess: () => {
      toast.success("Session revoked successfully");
      setRevokingId(null);
      refetch();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to revoke session");
      setRevokingId(null);
    },
  });

  const handleRevoke = (id: string) => {
    if (window.confirm("Are you sure you want to revoke this session? The user will be logged out.")) {
      setRevokingId(id);
      revokeMutation.mutate(id);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  if (isError) return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <div style={{ color: C.red, fontSize: 48, marginBottom: 16 }}>⚠️</div>
      <h2 style={{ color: C.red, margin: "0 0 8px" }}>Failed to load sessions</h2>
      <p style={{ color: C.faint }}>Please check your connection and try again</p>
      <button 
        onClick={() => refetch()}
        style={{ marginTop: 16, padding: "8px 24px", borderRadius: 8, background: C.red, color: "white", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}
      >
        Retry
      </button>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, padding: "0 0 40px" }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .session-row{animation:fadeIn 0.3s ease-out}
        .stat-card{transition:all 0.2s ease}
        .stat-card:hover{transform:translateY(-2px);box-shadow:0 4px 12px rgba(0,0,0,0.1)}
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: C.tealBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Shield size={20} color={C.teal} />
            </div>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: C.text, margin: 0 }}>Active Sessions</h1>
              <p style={{ fontSize: 13, color: C.faint, marginTop: 4 }}>Monitor and manage user sessions</p>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => refetch()}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, background: C.bgMuted, border: `1px solid ${C.border}`, color: C.text, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
          >
            <RefreshCw size={13} /> Refresh
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, background: showFilters ? C.tealBg : C.bgMuted, border: `1px solid ${showFilters ? C.teal : C.border}`, color: showFilters ? C.teal : C.text, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
          >
            <Filter size={13} /> Filters
            <ChevronDown size={13} style={{ transform: showFilters ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
        <div className="stat-card" style={{ padding: 20, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: C.tealBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Activity size={18} color={C.teal} />
            </div>
            <div>
              <p style={{ fontSize: 11, color: C.faint, margin: 0, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em" }}>Total Sessions</p>
              <p style={{ fontSize: 24, fontWeight: 700, color: C.text, margin: "4px 0 0" }}>{sessions.length}</p>
            </div>
          </div>
        </div>
        <div className="stat-card" style={{ padding: 20, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: C.tealBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Wifi size={18} color={C.teal} />
            </div>
            <div>
              <p style={{ fontSize: 11, color: C.faint, margin: 0, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em" }}>Active Now</p>
              <p style={{ fontSize: 24, fontWeight: 700, color: C.teal, margin: "4px 0 0" }}>{activeSessions}</p>
            </div>
          </div>
        </div>
        <div className="stat-card" style={{ padding: 20, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: C.redBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <WifiOff size={18} color={C.red} />
            </div>
            <div>
              <p style={{ fontSize: 11, color: C.faint, margin: 0, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em" }}>Revoked</p>
              <p style={{ fontSize: 24, fontWeight: 700, color: C.red, margin: "4px 0 0" }}>{revokedSessions}</p>
            </div>
          </div>
        </div>
        <div className="stat-card" style={{ padding: 20, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: C.blueBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Users size={18} color={C.blue} />
            </div>
            <div>
              <p style={{ fontSize: 11, color: C.faint, margin: 0, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em" }}>Unique Users</p>
              <p style={{ fontSize: 24, fontWeight: 700, color: C.blue, margin: "4px 0 0" }}>{new Set(sessions.map(s => s.user_id)).size}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      {showFilters && (
        <div style={{ display: "flex", gap: 12, padding: 16, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.faint }} />
            <input
              type="text"
              placeholder="Search by name, email, or IP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: "100%", padding: "8px 12px 8px 36px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.bgPage, color: C.text, fontSize: 13, fontFamily: "inherit", outline: "none" }}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.bgPage, color: C.text, fontSize: 13, fontFamily: "inherit", cursor: "pointer", outline: "none" }}
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="revoked">Revoked Only</option>
          </select>
        </div>
      )}

      {/* Sessions Table */}
      <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
        {isLoading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 0", gap: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid #e2e8f0", borderTopColor: C.teal, animation: "spin 0.7s linear infinite" }} />
            <p style={{ fontSize: 13, color: C.faint }}>Loading sessions...</p>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: C.bgMuted, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Shield size={32} color={C.border} />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: C.text, margin: "0 0 8px" }}>No sessions found</h3>
            <p style={{ fontSize: 13, color: C.faint, margin: 0 }}>
              {searchTerm ? "Try adjusting your search or filters" : "No active sessions at the moment"}
            </p>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 100px 120px 180px 80px", gap: 8, padding: "12px 20px", borderBottom: `1px solid ${C.border}`, background: C.bgMuted }}>
              {["User", "Device", "IP", "Status", "Last Active", "Action"].map(h => (
                <span key={h} style={{ fontSize: 10, fontWeight: 700, color: C.faint, letterSpacing: ".06em", textTransform: "uppercase" }}>{h}</span>
              ))}
            </div>
            
            {/* Table Rows */}
            {filteredSessions.map((session, index) => (
              <div
                key={session.id}
                className="session-row"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 100px 120px 180px 80px",
                  gap: 8,
                  padding: "14px 20px",
                  borderBottom: index < filteredSessions.length - 1 ? `1px solid ${C.border}` : "none",
                  alignItems: "center",
                  transition: "background 0.15s ease",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = C.bgMuted)}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                {/* User */}
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: C.text, margin: 0 }}>{session.full_name}</p>
                  <p style={{ fontSize: 11, color: C.faint, margin: "2px 0 0" }}>{session.email}</p>
                </div>

                {/* Device */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ 
                    width: 32, height: 32, borderRadius: 8, 
                    background: session.is_revoked ? C.bgMuted : C.tealBg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    opacity: session.is_revoked ? 0.5 : 1
                  }}>
                    {getDeviceIcon(session.user_agent)}
                  </div>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 500, color: C.text, margin: 0 }}>{getDeviceType(session.user_agent)}</p>
                    <p style={{ fontSize: 10, color: C.faint, margin: "1px 0 0" }}>{getOS(session.user_agent)}</p>
                  </div>
                </div>

                {/* IP */}
                <div>
                  <code style={{ 
                    fontSize: 11, 
                    background: C.bgPage, 
                    padding: "2px 6px", 
                    borderRadius: 4,
                    color: C.muted,
                    fontFamily: "monospace"
                  }}>
                    {session.ip === "::1" ? "localhost" : session.ip}
                  </code>
                </div>

                {/* Status */}
                <div>
                  <span style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 11, 
                    fontWeight: 600, 
                    padding: "4px 10px", 
                    borderRadius: 100,
                    background: session.is_revoked ? C.redBg : C.tealBg,
                    color: session.is_revoked ? C.redText : C.tealText,
                    border: `1px solid ${session.is_revoked ? C.redBg : C.tealBorder}`,
                  }}>
                    <span style={{ 
                      width: 6, height: 6, 
                      borderRadius: "50%", 
                      background: session.is_revoked ? C.red : C.teal,
                      display: "inline-block"
                    }} />
                    {session.is_revoked ? "Revoked" : "Active"}
                  </span>
                </div>

                {/* Last Active */}
                <div>
                  <span style={{ fontSize: 12, color: C.text, fontWeight: 500 }}>{getRelativeTime(session.created_at)}</span>
                  <p style={{ fontSize: 10, color: C.faint, margin: "2px 0 0" }}>{formatDate(session.created_at)}</p>
                </div>

                {/* Action */}
                <div>
                  <button
                    onClick={() => handleRevoke(session.id)}
                    disabled={session.is_revoked || revokingId === session.id}
                    title={session.is_revoked ? "Already revoked" : "Revoke this session"}
                    style={{
                      display: "flex", 
                      alignItems: "center", 
                      gap: 4, 
                      padding: "6px 12px", 
                      borderRadius: 6,
                      border: `1px solid ${C.border}`, 
                      background: session.is_revoked ? C.bgMuted : C.redBg, 
                      color: session.is_revoked ? C.faint : C.redText,
                      fontSize: 11, 
                      fontWeight: 600, 
                      cursor: session.is_revoked ? "not-allowed" : "pointer",
                      opacity: session.is_revoked ? 0.5 : 1, 
                      fontFamily: "inherit",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {revokingId === session.id ? (
                      <>
                        <RefreshCw size={12} style={{ animation: "spin 0.7s linear infinite" }} />
                        Revoking...
                      </>
                    ) : (
                      <>
                        <XCircle size={12} />
                        Revoke
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}