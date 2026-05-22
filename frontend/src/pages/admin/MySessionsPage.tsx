// src/pages/Profile/MySessionsPage.tsx
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
    Shield, Monitor, Smartphone, Globe, RefreshCw, XCircle,
    Tablet, Clock, MapPin, Calendar, AlertTriangle,
    WifiOff, Activity, LogOut, Zap, Info, EyeOff, Lock,
    LayoutGrid, List, X
} from "lucide-react";
import { request } from "@/services/api";
import toast from "react-hot-toast";

const C = {
    border: "#e8edeb",
    bg: "#ffffff",
    bgPage: "#f5f7f6",
    bgMuted: "#f9fbfa",
    text: "#0f172a",
    textSecondary: "#334155",
    muted: "#64748b",
    faint: "#94a3b8",
    teal: "#0891b2",
    tealLight: "#06b6d4",
    tealBg: "#ecfeff",
    tealBgHover: "#cffafe",
    tealText: "#0e7490",
    tealBorder: "#22d3ee",
    emerald: "#059669",
    emeraldBg: "#ecfdf5",
    emeraldText: "#065f46",
    amber: "#d97706",
    amberBg: "#fffbeb",
    amberText: "#92400e",
    red: "#dc2626",
    redLight: "#ef4444",
    redBg: "#fef2f2",
    redBgHover: "#fee2e2",
    redText: "#991b1b",
    blue: "#2563eb",
    blueBg: "#eff6ff",
    blueText: "#1e40af",
    purple: "#7c3aed",
    purpleBg: "#f5f3ff",
    purpleText: "#5b21b6",
    slate: "#475569",
    slateBg: "#f1f5f9",
    gradient1: "linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)",
    gradient2: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
    gradient3: "linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)",
    shadow: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
    shadowMd: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    shadowLg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
};

interface MySession {
    id: string;
    ip: string;
    user_agent: string;
    is_current: boolean;
    is_revoked: boolean;
    created_at: string;
    last_activity: string;
    location?: string;
}

// Updated API to send currentSessionId for revoke-all
const mySessionsApi = {
    getMySessions: () => request("/auth/sessions"),
    revokeSession: (id: string) => request(`/auth/sessions/${id}/revoke`, { method: "POST" }),
    revokeAllOther: (currentSessionId: string) =>
        request("/auth/sessions/revoke-all", {
            method: "POST",
            body: JSON.stringify({ currentSessionId }),
        }),
};

function getDeviceDetails(ua: string) {
    if (!ua) return { icon: <Monitor size={20} />, type: "Unknown", os: "Unknown", browser: "Unknown", color: C.slate };

    let type = "Desktop";
    let os = "Unknown";
    let browser = "Unknown";
    let icon = <Monitor size={20} />;
    let color = C.blue;

    if (ua.includes("Mobile") || ua.includes("Android")) {
        type = "Mobile";
        icon = <Smartphone size={20} />;
        color = C.purple;
    } else if (ua.includes("iPad") || ua.includes("Tablet")) {
        type = "Tablet";
        icon = <Tablet size={20} />;
        color = C.teal;
    }

    if (ua.includes("Windows")) os = "Windows";
    else if (ua.includes("Mac")) os = "macOS";
    else if (ua.includes("Linux")) os = "Linux";
    else if (ua.includes("Android")) os = "Android";
    else if (ua.includes("iOS") || ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

    if (ua.includes("Chrome") && !ua.includes("Edg")) browser = "Chrome";
    else if (ua.includes("Firefox")) browser = "Firefox";
    else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
    else if (ua.includes("Edg")) browser = "Edge";
    else if (ua.includes("Opera") || ua.includes("OPR")) browser = "Opera";
    else if (ua.includes("Postman")) {
        browser = "Postman";
        type = "API Client";
        icon = <Globe size={20} />;
        color = C.amber;
    }

    return { icon, type, os, browser, color };
}

function getRelativeTime(date: string) {
    if (!date) return "Unknown";
    const now = new Date();
    const then = new Date(date);
    const diff = now.getTime() - then.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    return then.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function formatDateTime(date: string) {
    if (!date) return "Unknown";
    return new Date(date).toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

export default function MySessionsPage() {
    const [revokingId, setRevokingId] = useState<string | null>(null);
    const [showRevokeAllConfirm, setShowRevokeAllConfirm] = useState(false);
    const [viewMode, setViewMode] = useState<"list" | "grid">("list");
    const [selectedSession, setSelectedSession] = useState<MySession | null>(null); // modal

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ["my-sessions"],
        queryFn: mySessionsApi.getMySessions,
        staleTime: 10000,
        refetchInterval: 30000,
    });

    const sessions = (data?.data as MySession[]) || [];
    const currentSession = sessions.find(s => s.is_current);
    const otherSessions = sessions.filter(s => !s.is_current);
    const activeCount = sessions.filter(s => !s.is_revoked).length;
    const revokedCount = sessions.filter(s => s.is_revoked).length;
    const otherActiveCount = otherSessions.filter(s => !s.is_revoked).length;

    const revokeMutation = useMutation({
        mutationFn: (id: string) => mySessionsApi.revokeSession(id),
        onSuccess: () => {
            toast.success("Session terminated successfully");
            setRevokingId(null);
            refetch();
        },
        onError: (err: any) => {
            toast.error(err.message || "Failed to revoke session");
            setRevokingId(null);
        },
    });

    const revokeAllMutation = useMutation({
        mutationFn: () => {
            const current = sessions.find(s => s.is_current);
            if (!current) throw new Error("Current session not found");
            return mySessionsApi.revokeAllOther(current.id);
        },
        onSuccess: (data: any) => {
            toast.success(`Revoked ${data?.data?.count || 'all'} session(s)`);
            setShowRevokeAllConfirm(false);
            refetch();
        },
        onError: (err: any) => {
            toast.error(err.message || "Failed to revoke sessions");
            setShowRevokeAllConfirm(false);
        },
    });

    const handleRevoke = (id: string) => {
        setRevokingId(id);
        revokeMutation.mutate(id);
    };

    const handleSignOutAll = () => {
        const current = sessions.find(s => s.is_current);
        if (!current) {
            toast.error("Cannot identify current session");
            return;
        }
        setShowRevokeAllConfirm(true);
    };

    if (isError) {
        return (
            <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
                <div style={{ textAlign: "center", maxWidth: 400 }}>
                    <div style={{
                        width: 80, height: 80, borderRadius: "50%",
                        background: C.redBg, display: "flex", alignItems: "center",
                        justifyContent: "center", margin: "0 auto 24px"
                    }}>
                        <AlertTriangle size={36} color={C.red} />
                    </div>
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text, margin: "0 0 8px" }}>
                        Connection Error
                    </h2>
                    <p style={{ fontSize: 14, color: C.muted, margin: "0 0 24px", lineHeight: 1.6 }}>
                        We couldn't load your session data. Please check your internet connection and try again.
                    </p>
                    <button
                        onClick={() => refetch()}
                        style={{
                            padding: "10px 24px", borderRadius: 10,
                            background: C.red, color: "white", border: "none",
                            cursor: "pointer", fontFamily: "inherit", fontWeight: 600,
                            fontSize: 14, boxShadow: C.shadowMd
                        }}
                    >
                        <RefreshCw size={14} style={{ marginRight: 8 }} />
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: "32px 40px", maxWidth: 1200, margin: "0 auto", minHeight: "100vh" }}>
            <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideIn{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:translateX(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes modalFadeIn{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}
        .fade-in{animation:fadeIn 0.4s ease-out}
        .slide-in{animation:slideIn 0.3s ease-out}
        .stat-card{transition:all 0.2s cubic-bezier(0.4, 0, 0.2, 1)}
        .stat-card:hover{transform:translateY(-4px);box-shadow:${C.shadowLg}}
        .session-card{animation:fadeIn 0.3s ease-out;transition:all 0.2s cubic-bezier(0.4, 0, 0.2, 1)}
        .session-card:hover{box-shadow:${C.shadowMd};border-color:${C.tealBorder}}
        .grid-card{animation:fadeIn 0.3s ease-out;transition:all 0.2s cubic-bezier(0.4, 0, 0.2, 1)}
        .grid-card:hover{transform:translateY(-2px);box-shadow:${C.shadowLg};border-color:${C.tealBorder}}
        .revoke-btn{transition:all 0.15s ease}
        .revoke-btn:hover:not(:disabled){background:${C.redBgHover};transform:scale(1.02)}
        .shimmer{background:linear-gradient(90deg,${C.bgMuted} 25%,${C.bg} 50%,${C.bgMuted} 75%);background-size:200% 100%;animation:shimmer 1.5s infinite}
        .modal-overlay{animation:fadeIn 0.2s ease-out}
        .modal-content{animation:modalFadeIn 0.2s ease-out}
      `}</style>

            {/* Page Header */}
            <div className="fade-in" style={{ marginBottom: 32 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
                            <div style={{
                                width: 52, height: 52, borderRadius: 16,
                                background: C.gradient1,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                boxShadow: "0 4px 12px rgba(8, 145, 178, 0.3)"
                            }}>
                                <Shield size={26} color="white" />
                            </div>
                            <div>
                                <h1 style={{ fontSize: 28, fontWeight: 700, color: C.text, margin: 0, letterSpacing: "-0.02em" }}>
                                    Device Sessions
                                </h1>
                                <p style={{ fontSize: 14, color: C.muted, margin: "4px 0 0", lineHeight: 1.5 }}>
                                    Monitor and manage where you're signed in
                                </p>
                            </div>
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        {/* View toggle */}
                        <div style={{ display: "flex", background: C.bgMuted, borderRadius: 10, padding: 3, border: `1px solid ${C.border}` }}>
                            <button
                                onClick={() => setViewMode("list")}
                                style={{
                                    padding: "6px 12px", borderRadius: 7, border: "none",
                                    background: viewMode === "list" ? C.bg : "transparent",
                                    color: viewMode === "list" ? C.text : C.faint,
                                    cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
                                    fontWeight: 600, fontSize: 12, fontFamily: "inherit",
                                    boxShadow: viewMode === "list" ? C.shadow : "none"
                                }}
                            >
                                <List size={14} /> List
                            </button>
                            <button
                                onClick={() => setViewMode("grid")}
                                style={{
                                    padding: "6px 12px", borderRadius: 7, border: "none",
                                    background: viewMode === "grid" ? C.bg : "transparent",
                                    color: viewMode === "grid" ? C.text : C.faint,
                                    cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
                                    fontWeight: 600, fontSize: 12, fontFamily: "inherit",
                                    boxShadow: viewMode === "grid" ? C.shadow : "none"
                                }}
                            >
                                <LayoutGrid size={14} /> Grid
                            </button>
                        </div>
                        <button
                            onClick={() => refetch()}
                            style={{
                                display: "flex", alignItems: "center", gap: 8,
                                padding: "10px 20px", borderRadius: 10,
                                background: C.bg, border: `1px solid ${C.border}`,
                                color: C.textSecondary, fontSize: 13, fontWeight: 600,
                                cursor: "pointer", fontFamily: "inherit",
                                boxShadow: C.shadow
                            }}
                        >
                            <RefreshCw size={15} />
                            Refresh
                        </button>
                        {otherActiveCount > 0 && (
                            <button
                                onClick={handleSignOutAll}
                                style={{
                                    display: "flex", alignItems: "center", gap: 8,
                                    padding: "10px 20px", borderRadius: 10,
                                    background: C.red, border: "none",
                                    color: "white", fontSize: 13, fontWeight: 600,
                                    cursor: "pointer", fontFamily: "inherit",
                                    boxShadow: "0 4px 12px rgba(220, 38, 38, 0.3)"
                                }}
                            >
                                <LogOut size={15} />
                                Sign Out Everywhere
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="fade-in" style={{
                display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: 20, marginBottom: 32
            }}>
                {/* Active Sessions Card */}
                <div className="stat-card" style={{
                    padding: 24, background: C.bg, border: `1px solid ${C.border}`,
                    borderRadius: 16, position: "relative", overflow: "hidden",
                    boxShadow: C.shadow
                }}>
                    <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: "50%", background: C.tealBg, opacity: 0.5 }} />
                    <div style={{ position: "relative", zIndex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 12, background: C.tealBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Activity size={20} color={C.teal} />
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: ".08em" }}>
                                Active Now
                            </span>
                        </div>
                        <div style={{ fontSize: 42, fontWeight: 800, color: C.text, marginBottom: 4, letterSpacing: "-0.03em" }}>
                            {activeCount}
                        </div>
                        <div style={{ fontSize: 13, color: C.faint }}>
                            {activeCount === 1 ? "1 active session" : `${activeCount} active sessions`}
                        </div>
                    </div>
                </div>

                {/* Current Device Card */}
                <div className="stat-card" style={{
                    padding: 24, background: C.bg, border: `1px solid ${C.emerald}`,
                    borderRadius: 16, position: "relative", overflow: "hidden",
                    boxShadow: C.shadow, borderWidth: 2
                }}>
                    <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: "50%", background: C.emeraldBg, opacity: 0.5 }} />
                    <div style={{ position: "relative", zIndex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 12, background: C.emeraldBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Zap size={20} color={C.emerald} />
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 700, color: C.emeraldText, textTransform: "uppercase", letterSpacing: ".08em" }}>
                                This Device
                            </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                            <div style={{ width: 10, height: 10, borderRadius: "50%", background: C.emerald, animation: "pulse 2s ease-in-out infinite" }} />
                            <span style={{ fontSize: 16, fontWeight: 700, color: C.emeraldText }}>Connected</span>
                        </div>
                        <div style={{ fontSize: 13, color: C.faint }}>
                            You're currently using this device
                        </div>
                    </div>
                </div>

                {/* Other Devices Card */}
                <div className="stat-card" style={{
                    padding: 24, background: C.bg, border: `1px solid ${C.border}`,
                    borderRadius: 16, position: "relative", overflow: "hidden",
                    boxShadow: C.shadow
                }}>
                    <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: "50%", background: C.blueBg, opacity: 0.5 }} />
                    <div style={{ position: "relative", zIndex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 12, background: C.blueBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Monitor size={20} color={C.blue} />
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: ".08em" }}>
                                Other Devices
                            </span>
                        </div>
                        <div style={{ fontSize: 42, fontWeight: 800, color: C.text, marginBottom: 4, letterSpacing: "-0.03em" }}>
                            {otherActiveCount}
                        </div>
                        <div style={{ fontSize: 13, color: C.faint }}>
                            {otherActiveCount === 0 ? "No other devices" : `${otherActiveCount} other device${otherActiveCount > 1 ? 's' : ''}`}
                        </div>
                    </div>
                </div>

                {/* Revoked Card */}
                <div className="stat-card" style={{
                    padding: 24, background: C.bg, border: `1px solid ${C.border}`,
                    borderRadius: 16, position: "relative", overflow: "hidden",
                    boxShadow: C.shadow, opacity: revokedCount > 0 ? 1 : 0.6
                }}>
                    <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: "50%", background: C.slateBg, opacity: 0.5 }} />
                    <div style={{ position: "relative", zIndex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 12, background: C.slateBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <WifiOff size={20} color={C.slate} />
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: ".08em" }}>
                                Revoked
                            </span>
                        </div>
                        <div style={{ fontSize: 42, fontWeight: 800, color: C.text, marginBottom: 4, letterSpacing: "-0.03em" }}>
                            {revokedCount}
                        </div>
                        <div style={{ fontSize: 13, color: C.faint }}>
                            Previously terminated sessions
                        </div>
                    </div>
                </div>
            </div>

            {/* Revoke All Warning */}
            {showRevokeAllConfirm && (
                <div className="slide-in" style={{
                    marginBottom: 24, padding: 20,
                    background: C.amberBg, border: `2px solid ${C.amber}`,
                    borderRadius: 16, display: "flex", alignItems: "center",
                    justifyContent: "space-between", flexWrap: "wrap", gap: 16,
                    boxShadow: C.shadowMd
                }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(217, 119, 6, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <AlertTriangle size={20} color={C.amber} />
                        </div>
                        <div>
                            <p style={{ fontSize: 15, fontWeight: 700, color: C.amberText, margin: "0 0 4px" }}>
                                Sign out from all other devices?
                            </p>
                            <p style={{ fontSize: 13, color: C.muted, margin: 0, lineHeight: 1.5 }}>
                                This will immediately terminate all sessions except this one. You'll need to sign in again on those devices.
                            </p>
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
                        <button
                            onClick={() => setShowRevokeAllConfirm(false)}
                            style={{
                                padding: "10px 20px", borderRadius: 10,
                                background: C.bg, color: C.textSecondary,
                                border: `1px solid ${C.border}`, fontSize: 13,
                                fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => revokeAllMutation.mutate()}
                            disabled={revokeAllMutation.isPending}
                            style={{
                                padding: "10px 20px", borderRadius: 10,
                                background: C.red, color: "white",
                                border: "none", fontSize: 13,
                                fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                                boxShadow: "0 4px 12px rgba(220, 38, 38, 0.3)",
                                opacity: revokeAllMutation.isPending ? 0.7 : 1,
                            }}
                        >
                            {revokeAllMutation.isPending ? (
                                <><RefreshCw size={13} style={{ animation: "spin 0.7s linear infinite", marginRight: 6 }} /> Signing Out...</>
                            ) : (
                                "Confirm Sign Out All"
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Loading State */}
            {isLoading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="shimmer" style={{
                            height: 100, borderRadius: 16, border: `1px solid ${C.border}`,
                            background: C.bg
                        }} />
                    ))}
                </div>
            ) : sessions.length === 0 ? (
                /* Empty State */
                <div className="fade-in" style={{
                    textAlign: "center", padding: "80px 40px",
                    background: C.bg, border: `1px solid ${C.border}`,
                    borderRadius: 20, boxShadow: C.shadow
                }}>
                    <div style={{
                        width: 100, height: 100, borderRadius: "50%",
                        background: C.tealBg, display: "flex",
                        alignItems: "center", justifyContent: "center",
                        margin: "0 auto 24px"
                    }}>
                        <EyeOff size={44} color={C.teal} />
                    </div>
                    <h3 style={{ fontSize: 20, fontWeight: 700, color: C.text, margin: "0 0 8px" }}>
                        No Sessions Found
                    </h3>
                    <p style={{ fontSize: 15, color: C.muted, margin: "0 0 24px", maxWidth: 400, marginLeft: "auto", marginRight: "auto", lineHeight: 1.6 }}>
                        We couldn't find any active sessions for your account. This might be temporary.
                    </p>
                    <button
                        onClick={() => refetch()}
                        style={{
                            padding: "10px 24px", borderRadius: 10,
                            background: C.teal, color: "white", border: "none",
                            fontSize: 14, fontWeight: 600, cursor: "pointer",
                            fontFamily: "inherit", boxShadow: "0 4px 12px rgba(8, 145, 178, 0.3)"
                        }}
                    >
                        <RefreshCw size={14} style={{ marginRight: 8 }} />
                        Check Again
                    </button>
                </div>
            ) : (
                <>
                    {/* Current Session */}
                    {currentSession && (
                        <div className="fade-in" style={{ marginBottom: 32 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                                <div style={{ width: 5, height: 24, borderRadius: 3, background: C.gradient2 }} />
                                <h2 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: 0, letterSpacing: "-0.01em" }}>
                                    Current Session
                                </h2>
                                <span style={{
                                    fontSize: 10, fontWeight: 700, padding: "3px 10px",
                                    borderRadius: 100, background: C.emeraldBg, color: C.emeraldText,
                                    textTransform: "uppercase", letterSpacing: ".06em"
                                }}>
                                    Active Now
                                </span>
                            </div>

                            <div className="session-card" style={{
                                background: `linear-gradient(135deg, ${C.emeraldBg} 0%, ${C.bg} 100%)`,
                                border: `2px solid ${C.emerald}`,
                                borderRadius: 20, padding: 28,
                                boxShadow: "0 8px 32px rgba(5, 150, 105, 0.1)"
                            }}>
                                <div style={{ display: "flex", alignItems: "flex-start", gap: 20, flexWrap: "wrap" }}>
                                    <div style={{
                                        width: 60, height: 60, borderRadius: 16,
                                        background: "white", display: "flex",
                                        alignItems: "center", justifyContent: "center",
                                        border: `2px solid ${C.emerald}`,
                                        boxShadow: "0 4px 12px rgba(5, 150, 105, 0.15)",
                                        flexShrink: 0
                                    }}>
                                        {getDeviceDetails(currentSession.user_agent).icon}
                                    </div>

                                    <div style={{ flex: 1, minWidth: 200 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                                            <h3 style={{ fontSize: 18, fontWeight: 700, color: C.text, margin: 0 }}>
                                                {getDeviceDetails(currentSession.user_agent).type}
                                            </h3>
                                            <span style={{ color: C.faint, fontWeight: 400 }}>•</span>
                                            <span style={{ fontSize: 14, fontWeight: 600, color: C.textSecondary }}>
                                                {getDeviceDetails(currentSession.user_agent).browser}
                                            </span>
                                            <span style={{
                                                fontSize: 11, fontWeight: 600, padding: "4px 12px",
                                                borderRadius: 100, background: C.emerald, color: "white",
                                            }}>
                                                You
                                            </span>
                                        </div>

                                        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                <div style={{ width: 28, height: 28, borderRadius: 8, background: C.emeraldBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                    <Monitor size={14} color={C.emerald} />
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: 10, color: C.faint, textTransform: "uppercase", letterSpacing: ".04em", fontWeight: 600 }}>OS</div>
                                                    <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{getDeviceDetails(currentSession.user_agent).os}</div>
                                                </div>
                                            </div>

                                            {currentSession.ip && (
                                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                    <div style={{ width: 28, height: 28, borderRadius: 8, background: C.emeraldBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                        <MapPin size={14} color={C.emerald} />
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: 10, color: C.faint, textTransform: "uppercase", letterSpacing: ".04em", fontWeight: 600 }}>IP Address</div>
                                                        <code style={{
                                                            fontSize: 12, background: "rgba(255,255,255,0.8)",
                                                            padding: "2px 8px", borderRadius: 6, fontWeight: 600,
                                                            color: C.textSecondary, fontFamily: "monospace"
                                                        }}>
                                                            {currentSession.ip === "::1" || currentSession.ip === "127.0.0.1" ? "localhost" : currentSession.ip}
                                                        </code>
                                                    </div>
                                                </div>
                                            )}

                                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                <div style={{ width: 28, height: 28, borderRadius: 8, background: C.emeraldBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                    <Clock size={14} color={C.emerald} />
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: 10, color: C.faint, textTransform: "uppercase", letterSpacing: ".04em", fontWeight: 600 }}>Signed In</div>
                                                    <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{formatDateTime(currentSession.created_at)}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Other Sessions */}
                    {otherSessions.length > 0 && (
                        <div className="fade-in">
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <div style={{ width: 5, height: 24, borderRadius: 3, background: C.gradient1 }} />
                                    <h2 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: 0, letterSpacing: "-0.01em" }}>
                                        Other Sessions
                                    </h2>
                                    <span style={{
                                        fontSize: 11, fontWeight: 600, padding: "3px 10px",
                                        borderRadius: 100, background: C.blueBg, color: C.blueText,
                                    }}>
                                        {otherActiveCount} active
                                    </span>
                                </div>
                            </div>

                            {/* Grid View */}
                            {viewMode === "grid" ? (
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                                    {otherSessions.map((session) => {
                                        const device = getDeviceDetails(session.user_agent);
                                        return (
                                            <div key={session.id} className="grid-card" style={{
                                                background: C.bg,
                                                border: `1px solid ${session.is_revoked ? C.border : C.border}`,
                                                borderRadius: 16,
                                                padding: 20,
                                                opacity: session.is_revoked ? 0.6 : 1,
                                                display: "flex", flexDirection: "column", gap: 16,
                                            }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                                    <div style={{
                                                        width: 44, height: 44, borderRadius: 12,
                                                        background: session.is_revoked ? C.slateBg : `${device.color}15`,
                                                        display: "flex", alignItems: "center", justifyContent: "center",
                                                        border: `2px solid ${session.is_revoked ? C.border : `${device.color}30`}`,
                                                    }}>
                                                        <span style={{ color: session.is_revoked ? C.slate : device.color }}>
                                                            {device.icon}
                                                        </span>
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>
                                                            {device.type} • {device.browser}
                                                        </div>
                                                        <div style={{ fontSize: 12, color: C.muted, display: "flex", gap: 12, marginTop: 4 }}>
                                                            <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Monitor size={11} />{device.os}</span>
                                                            {session.ip && <span style={{ display: "flex", alignItems: "center", gap: 3 }}><MapPin size={11} />{session.ip === "::1" || session.ip === "127.0.0.1" ? "localhost" : session.ip}</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                    <span style={{ fontSize: 11, color: C.faint }}>{getRelativeTime(session.created_at)}</span>
                                                    <div style={{ display: "flex", gap: 8 }}>
                                                        <button
                                                            onClick={() => setSelectedSession(session)}
                                                            style={{
                                                                padding: "6px 10px", borderRadius: 8,
                                                                background: C.bgMuted, border: "none",
                                                                color: C.muted, cursor: "pointer",
                                                                display: "flex", alignItems: "center",
                                                            }}
                                                        >
                                                            <Info size={14} />
                                                        </button>
                                                        {!session.is_revoked && (
                                                            <button
                                                                onClick={() => handleRevoke(session.id)}
                                                                disabled={revokingId === session.id}
                                                                className="revoke-btn"
                                                                style={{
                                                                    display: "flex", alignItems: "center", gap: 4,
                                                                    padding: "6px 12px", borderRadius: 8,
                                                                    border: `1px solid ${C.border}`,
                                                                    background: "white", color: C.redText,
                                                                    fontSize: 11, fontWeight: 600, cursor: "pointer",
                                                                    fontFamily: "inherit",
                                                                }}
                                                            >
                                                                {revokingId === session.id ? (
                                                                    <RefreshCw size={11} style={{ animation: "spin 0.7s linear infinite" }} />
                                                                ) : (
                                                                    <XCircle size={12} />
                                                                )}
                                                                Sign Out
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                /* List View (original design) */
                                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                                    {otherSessions.map((session) => {
                                        const device = getDeviceDetails(session.user_agent);

                                        return (
                                            <div
                                                key={session.id}
                                                className="session-card"
                                                style={{
                                                    background: C.bg,
                                                    border: `1px solid ${session.is_revoked ? C.border : C.border}`,
                                                    borderRadius: 16,
                                                    overflow: "hidden",
                                                    opacity: session.is_revoked ? 0.6 : 1,
                                                }}
                                            >
                                                <div style={{ padding: 20 }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                                                        <div style={{
                                                            width: 48, height: 48, borderRadius: 14,
                                                            background: session.is_revoked ? C.slateBg : `${device.color}15`,
                                                            display: "flex", alignItems: "center", justifyContent: "center",
                                                            flexShrink: 0,
                                                            border: `2px solid ${session.is_revoked ? C.border : `${device.color}30`}`,
                                                        }}>
                                                            <span style={{ color: session.is_revoked ? C.slate : device.color }}>
                                                                {device.icon}
                                                            </span>
                                                        </div>

                                                        <div style={{ flex: 1, minWidth: 180 }}>
                                                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                                                                <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>
                                                                    {device.type}
                                                                </span>
                                                                <span style={{ color: C.faint }}>•</span>
                                                                <span style={{ fontSize: 14, fontWeight: 500, color: C.textSecondary }}>
                                                                    {device.browser}
                                                                </span>
                                                                {session.is_revoked && (
                                                                    <span style={{
                                                                        fontSize: 10, fontWeight: 700, padding: "2px 8px",
                                                                        borderRadius: 100, background: C.redBg, color: C.redText,
                                                                        textTransform: "uppercase", letterSpacing: ".04em"
                                                                    }}>
                                                                        Revoked
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 13, color: C.muted }}>
                                                                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                                                    <Monitor size={12} />
                                                                    {device.os}
                                                                </span>
                                                                {session.ip && (
                                                                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                                                        <MapPin size={12} />
                                                                        {session.ip === "::1" || session.ip === "127.0.0.1" ? "localhost" : session.ip}
                                                                    </span>
                                                                )}
                                                                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                                                    <Calendar size={12} />
                                                                    {getRelativeTime(session.created_at)}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                                                            <button
                                                                onClick={() => setSelectedSession(session)}
                                                                style={{
                                                                    padding: "6px 10px", borderRadius: 8,
                                                                    background: C.bgMuted, border: "none",
                                                                    color: C.muted, cursor: "pointer",
                                                                    display: "flex", alignItems: "center",
                                                                }}
                                                            >
                                                                <Info size={16} />
                                                            </button>

                                                            {!session.is_revoked && (
                                                                <button
                                                                    onClick={() => handleRevoke(session.id)}
                                                                    disabled={revokingId === session.id}
                                                                    className="revoke-btn"
                                                                    style={{
                                                                        display: "flex", alignItems: "center", gap: 6,
                                                                        padding: "8px 16px", borderRadius: 10,
                                                                        border: `1px solid ${C.border}`,
                                                                        background: "white", color: C.redText,
                                                                        fontSize: 12, fontWeight: 600, cursor: "pointer",
                                                                        fontFamily: "inherit", whiteSpace: "nowrap",
                                                                    }}
                                                                >
                                                                    {revokingId === session.id ? (
                                                                        <>
                                                                            <RefreshCw size={12} style={{ animation: "spin 0.7s linear infinite" }} />
                                                                            Revoking...
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <XCircle size={13} />
                                                                            Sign Out
                                                                        </>
                                                                    )}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* All Clear State */}
                    {otherSessions.length === 0 && currentSession && (
                        <div className="fade-in" style={{
                            textAlign: "center", padding: "60px 40px",
                            background: C.bg, border: `1px solid ${C.border}`,
                            borderRadius: 20, boxShadow: C.shadow
                        }}>
                            <div style={{
                                width: 80, height: 80, borderRadius: "50%",
                                background: C.emeraldBg, display: "flex",
                                alignItems: "center", justifyContent: "center",
                                margin: "0 auto 20px"
                            }}>
                                <Lock size={36} color={C.emerald} />
                            </div>
                            <h3 style={{ fontSize: 20, fontWeight: 700, color: C.text, margin: "0 0 8px" }}>
                                All Clear! 🎉
                            </h3>
                            <p style={{ fontSize: 15, color: C.muted, margin: 0, maxWidth: 400, marginLeft: "auto", marginRight: "auto", lineHeight: 1.6 }}>
                                You're only signed in on this device. Your account is secure and no other sessions are active.
                            </p>
                        </div>
                    )}
                </>
            )}

            {/* Session Detail Modal */}
            {selectedSession && (
                <div
                    className="modal-overlay"
                    style={{
                        position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000,
                        display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
                        backdropFilter: "blur(4px)"
                    }}
                    onClick={() => setSelectedSession(null)}
                >
                    <div
                        className="modal-content"
                        style={{
                            background: C.bg, borderRadius: 20, maxWidth: 500, width: "100%",
                            padding: 28, boxShadow: C.shadowLg, position: "relative",
                            maxHeight: "90vh", overflowY: "auto"
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                            <h3 style={{ fontSize: 18, fontWeight: 700, color: C.text, margin: 0 }}>Session Details</h3>
                            <button onClick={() => setSelectedSession(null)} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted }}>
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                                <div style={{
                                    width: 56, height: 56, borderRadius: 14,
                                    background: `${getDeviceDetails(selectedSession.user_agent).color}15`,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    border: `2px solid ${getDeviceDetails(selectedSession.user_agent).color}30`
                                }}>
                                    <span style={{ color: getDeviceDetails(selectedSession.user_agent).color }}>
                                        {getDeviceDetails(selectedSession.user_agent).icon}
                                    </span>
                                </div>
                                <div>
                                    <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>
                                        {getDeviceDetails(selectedSession.user_agent).type} • {getDeviceDetails(selectedSession.user_agent).browser}
                                    </div>
                                    <div style={{ fontSize: 13, color: C.muted }}>
                                        {getDeviceDetails(selectedSession.user_agent).os}
                                    </div>
                                </div>
                            </div>

                            <div style={{ background: C.bgMuted, borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
                                {[
                                    { label: "Session ID", value: selectedSession.id, mono: true },
                                    { label: "IP Address", value: selectedSession.ip === "::1" || selectedSession.ip === "127.0.0.1" ? "localhost" : selectedSession.ip, mono: true },
                                    { label: "Created", value: formatDateTime(selectedSession.created_at) },
                                    { label: "Last Activity", value: selectedSession.last_activity ? getRelativeTime(selectedSession.last_activity) : "N/A" },
                                    { label: "Status", value: selectedSession.is_revoked ? "Revoked" : "Active", highlight: selectedSession.is_revoked ? "red" : "emerald" },
                                    { label: "User Agent", value: selectedSession.user_agent || "N/A", fullWidth: true },
                                ].map((item) => (
                                    <div key={item.label}>
                                        <div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 4 }}>
                                            {item.label}
                                        </div>
                                        {item.highlight ? (
                                            <span style={{
                                                fontSize: 12, fontWeight: 600,
                                                padding: "2px 10px", borderRadius: 100,
                                                background: item.highlight === "red" ? C.redBg : C.emeraldBg,
                                                color: item.highlight === "red" ? C.redText : C.emeraldText,
                                            }}>
                                                {item.value}
                                            </span>
                                        ) : item.mono ? (
                                            <code style={{ fontSize: 12, color: C.textSecondary, fontFamily: "monospace", wordBreak: "break-all" }}>{item.value}</code>
                                        ) : (
                                            <div style={{ fontSize: 13, color: C.text, lineHeight: 1.5, wordBreak: item.fullWidth ? "break-all" : "normal" }}>
                                                {item.value}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {!selectedSession.is_revoked && !selectedSession.is_current && (
                                <button
                                    onClick={() => { handleRevoke(selectedSession.id); setSelectedSession(null); }}
                                    style={{
                                        width: "100%", padding: "12px", borderRadius: 10,
                                        background: C.red, color: "white", border: "none",
                                        fontSize: 14, fontWeight: 600, cursor: "pointer",
                                        fontFamily: "inherit",
                                        boxShadow: "0 4px 12px rgba(220, 38, 38, 0.3)"
                                    }}
                                >
                                    <XCircle size={14} style={{ marginRight: 6 }} />
                                    Sign Out This Device
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Security Tips Footer */}
            <div className="fade-in" style={{
                marginTop: 40, padding: 24, background: C.bg,
                border: `1px solid ${C.border}`, borderRadius: 16,
                boxShadow: C.shadow
            }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: C.blueBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Shield size={18} color={C.blue} />
                    </div>
                    <div>
                        <h4 style={{ fontSize: 14, fontWeight: 700, color: C.text, margin: "0 0 4px" }}>
                            Security Tip
                        </h4>
                        <p style={{ fontSize: 13, color: C.muted, margin: 0, lineHeight: 1.6 }}>
                            If you notice any unfamiliar devices or locations, sign them out immediately and change your password.
                            Regularly reviewing your active sessions helps keep your account secure.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}