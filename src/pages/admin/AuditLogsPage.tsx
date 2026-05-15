// src/pages/admin/AuditLogsPage.tsx
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
    Search, FileText, AlertCircle, Shield, FileSpreadsheet,
    Filter, Users, Tag, Calendar, CheckCircle,
    XCircle, Loader2, ChevronDown, ChevronRight,
} from "lucide-react";
import { request } from "@/services/api";
import toast from "react-hot-toast";

const C = {
    border: "#e5eae8", bg: "#ffffff", bgPage: "#f0f2f1", bgMuted: "#f7f9f8",
    text: "#111816", muted: "#7a918b", faint: "#a0b4ae",
    teal: "#0d9e75", tealBg: "#e8f7f2", tealText: "#0a7d5d", tealBorder: "#c3e8dc",
    amber: "#f59e0b", amberBg: "#fffbeb", amberText: "#92400e", amberBorder: "#fde68a",
    red: "#e53e3e", redBg: "#fff5f5", redText: "#c53030", redBorder: "#fed7d7",
    blue: "#3b82f6", blueBg: "#eff6ff", blueText: "#1d4ed8",
    purple: "#8b5cf6", purpleBg: "#f5f3ff", purpleText: "#5b21b6",
};

interface AuditLog {
    id: string;
    user_id: string;
    action: string;
    entity: string;
    entity_id: string;
    metadata: any;
    hash_chain: string;
    created_at: string;
}

interface ChainEntry {
    id: string;
    action: string;
    hash_chain: string;
    prev_hash: string;
    expected_hash: string;
    valid: boolean;
}

// ── Reusable components (unchanged) ───────────────────────────
function Card({ children, style, ...rest }: any) { /* ... same as before ... */
    return <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden", ...style }} {...rest}>{children}</div>;
}
function StatCard({ label, value, icon: Icon, color, sub }: any) { /* ... same ... */
    return (
        <Card><div style={{ padding: "14px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <span style={{ fontSize: 10, color: C.faint, fontWeight: 500, textTransform: "uppercase", letterSpacing: ".04em" }}>{label}</span>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: color + "15", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon size={13} color={color} strokeWidth={1.8} /></div>
            </div>
            <p style={{ fontSize: 20, fontWeight: 700, color: C.text, margin: 0 }}>{value}</p>
            {sub && <p style={{ fontSize: 9, color: C.faint, marginTop: 3 }}>{sub}</p>}
        </div></Card>
    );
}
function BarChart({ data, maxValue, height = 20 }: any) { /* ... same ... */
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {data.map((item: any) => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 10, color: C.text, minWidth: 130, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.label}</span>
                    <div style={{ flex: 1, height, background: C.bgMuted, borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ width: maxValue > 0 ? `${(item.value / maxValue) * 100}%` : "0%", height: "100%", background: item.color, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 6, minWidth: item.value > 0 ? 24 : 0 }}>
                            {item.value > 0 && <span style={{ fontSize: 9, fontWeight: 600, color: "white" }}>{item.value.toLocaleString()}</span>}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

const auditApi = {
    getLogs: (page = 1, limit = 20, filters?: { action?: string; userId?: string }) => {
        const params = new URLSearchParams({ page: String(page), limit: String(limit) });
        if (filters?.action) params.set("action", filters.action);
        if (filters?.userId) params.set("userId", filters.userId);
        return request<{ logs: AuditLog[]; total: number }>(`/audit?${params.toString()}`);
    },
    verifyChain: () => request<{ valid: boolean; logs: ChainEntry[] }>("/audit/verify"),
    getAllLogs: (filters?: { action?: string }) => {
        const params = new URLSearchParams({ page: "1", limit: "100000" });
        if (filters?.action) params.set("action", filters.action);
        return request<{ logs: AuditLog[]; total: number }>(`/audit?${params.toString()}`);
    },
};

export default function AuditLogsPage() {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const limit = 20;
    const [verifyOpen, setVerifyOpen] = useState(false);
    const [verifyData, setVerifyData] = useState<{ valid: boolean; logs: ChainEntry[] } | null>(null);
    const [verifyLoading, setVerifyLoading] = useState(false);
    const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["audit-logs", page, search],
        queryFn: () => auditApi.getLogs(page, limit, search ? { action: search } : undefined),
        retry: 1,
    });

    const logs: AuditLog[] = (data?.data as any)?.logs ?? [];
    const total = (data?.data as any)?.total ?? 0;

    // Stats (computed from current page – acceptable for now)
    const today = new Date().toISOString().slice(0, 10);
    const todayCount = logs.filter(log => log.created_at?.startsWith(today)).length;
    const uniqueUsers = new Set(logs.map(log => log.user_id)).size;
    const uniqueActions = new Set(logs.map(log => log.action)).size;

    const actionDistribution = useMemo(() => {
        const counts: Record<string, number> = {};
        logs.forEach(log => {
            const action = log.action.replace(/_/g, " ");
            counts[action] = (counts[action] || 0) + 1;
        });
        return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([label, value], idx) => ({
            label, value, color: [C.teal, C.blue, C.purple, C.amber, C.red][idx % 5],
        }));
    }, [logs]);

    const totalPages = Math.ceil(total / limit);

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) +
        " " + new Date(dateStr).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

    const handleVerifyChain = async () => {
        setVerifyLoading(true);
        try {
            const resp = await auditApi.verifyChain();
            const raw = (resp as any).data;
            // Handle both flat and nested responses
            let result: { valid: boolean; logs: ChainEntry[] };
            if (raw && typeof raw.valid === 'object' && raw.valid.logs) {
                // Nested: { valid: { valid: bool, logs: [...] } }
                result = { valid: raw.valid.valid, logs: raw.valid.logs };
            } else {
                // Flat: { valid: bool, logs: [...] }
                result = raw || { valid: false, logs: [] };
            }
            setVerifyData(result);
            setExpandedEntries(new Set());
            setVerifyOpen(true);
            if (result.valid) {
                toast.success("Chain is intact.");
            } else {
                toast.error("Chain broken! Tampering detected.");
            }
        } catch (err: any) {
            toast.error("Verification failed: " + (err.message || "Unknown error"));
        } finally {
            setVerifyLoading(false);
        }
    };

    const toggleExpand = (id: string) => {
        setExpandedEntries(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const handleExportAll = async () => {
        const w = window.open("", "_blank");
        if (!w) { toast.error("Please allow popups"); return; }
        toast.loading("Exporting all logs...");
        try {
            const resp = await auditApi.getAllLogs(search ? { action: search } : undefined);
            const allLogs: AuditLog[] = (resp as any).data?.logs ?? [];
            const now = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
            let h = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>DalPay Complete Audit Log</title><style>
        @page { size: A4 landscape; margin: 15mm; }
        body { font-family: 'Segoe UI', Arial, sans-serif; padding: 0; color: #111816; font-size: 9px; }
        .header { border-bottom: 3px solid #0d9e75; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; }
        .header .logo-area { display: flex; align-items: center; gap: 12px; }
        .header img { height: 40px; }
        .header h1 { font-size: 18px; margin: 0; color: #0d9e75; }
        .header .badge { background: #e8f7f2; color: #0a7d5d; padding: 4px 12px; border-radius: 12px; font-size: 9px; font-weight: 600; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
        th { background: #0d9e75; color: white; padding: 6px; font-size: 8px; text-transform: uppercase; }
        td { padding: 5px; font-size: 8px; border-bottom: 1px solid #e5eae8; }
        .footer { border-top: 1px solid #e5eae8; padding-top: 10px; font-size: 8px; color: #a0b4ae; text-align: center; }
      </style></head><body>
      <div class="header"><div class="logo-area"><img src="/icon.png" alt="DalPay Logo" /><div><h1>DalPay Complete Audit Log</h1><p class="sub">Republic of Somaliland • Ministry of Finance • ${now}</p></div></div><div class="badge">OFFICIAL</div></div>
      <table><thead><tr><th>Time</th><th>Action</th><th>User ID</th><th>Entity</th><th>Hash Chain</th></tr></thead><tbody>`;
            allLogs.forEach(log => {
                h += `<tr><td>${formatDate(log.created_at)}</td><td>${log.action}</td><td style="font-size:7px;">${log.user_id?.slice(0, 8) ?? "?"}</td><td>${log.entity}</td><td style="font-size:6px;word-break:break-all;">${log.hash_chain?.slice(0, 16) ?? "?"}…</td></tr>`;
            });
            h += `</tbody></table><div class="footer"><span>DalPay Digital Tax System v2.0</span><span>DAL-${Date.now().toString(36).toUpperCase()}</span></div></body></html>`;
            w.document.write(h); w.document.close();
            setTimeout(() => w.print(), 500);
            toast.dismiss();
            toast.success("All logs exported");
        } catch (err: any) {
            toast.dismiss();
            toast.error("Export failed: " + (err.message || ""));
        }
    };

    if (isError && (error as any)?.status === 401) {
        return (
            <div style={{ textAlign: "center", padding: "80px 20px" }}>
                <AlertCircle size={40} style={{ margin: "0 auto 16px", color: C.amber }} />
                <p style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 8 }}>Session Expired</p>
                <button onClick={() => navigate("/login")} style={{ padding: "10px 24px", background: C.teal, color: "white", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13, fontFamily: "inherit" }}>Go to Login</button>
            </div>
        );
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: 0 }}>Audit Logs</h1>
                    <p style={{ fontSize: 13, color: C.faint, marginTop: 4 }}>{total} total entries • immutable hash‑chained records</p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={handleVerifyChain} disabled={verifyLoading} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, background: C.purple + "15", border: `1px solid ${C.purple}30`, color: C.purpleText, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                        {verifyLoading ? <Loader2 size={13} /> : <CheckCircle size={13} />} Verify Chain
                    </button>
                    <button onClick={handleExportAll} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, background: C.blue + "15", border: `1px solid ${C.blue}30`, color: C.blue, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                        <FileSpreadsheet size={13} /> Export All
                    </button>
                </div>
            </div>

            {/* Stat Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                <StatCard label="Total Entries" value={total} icon={Shield} color={C.blue} sub="all time" />
                <StatCard label="Today's Activities" value={todayCount} icon={Calendar} color={C.teal} sub="on this page" />
                <StatCard label="Unique Users" value={uniqueUsers} icon={Users} color={C.purple} sub="on this page" />
                <StatCard label="Action Types" value={uniqueActions} icon={Tag} color={C.amber} sub="on this page" />
            </div>

            {/* Charts Row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Card>
                    <div style={{ padding: "14px 16px", borderBottom: `1px solid ${C.border}` }}><p style={{ fontSize: 12, fontWeight: 600, color: C.text, margin: 0 }}>Action Distribution (Top 5)</p></div>
                    <div style={{ padding: "14px 16px" }}>
                        {actionDistribution.length > 0 ? (
                            <BarChart data={actionDistribution} maxValue={Math.max(...actionDistribution.map(i => i.value), 1)} />
                        ) : <p style={{ fontSize: 11, color: C.faint }}>No actions to display.</p>}
                    </div>
                </Card>
                <Card>
                    <div style={{ padding: "14px 16px", borderBottom: `1px solid ${C.border}` }}><p style={{ fontSize: 12, fontWeight: 600, color: C.text, margin: 0 }}>Recent Activity</p></div>
                    <div style={{ padding: "10px 16px" }}>
                        {logs.slice(0, 5).map((log, idx) => (
                            <div key={log.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: idx < 4 ? `1px solid ${C.border}` : "none" }}>
                                <span style={{ fontSize: 11, color: C.text }}>{log.action.replace(/_/g, " ")}</span>
                                <span style={{ fontSize: 10, color: C.faint }}>{formatDate(log.created_at)}</span>
                            </div>
                        ))}
                        {logs.length === 0 && <p style={{ fontSize: 11, color: C.faint }}>No recent activity.</p>}
                    </div>
                </Card>
            </div>

            {/* Filters */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", padding: "12px 16px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, alignItems: "center" }}>
                <Filter size={13} color={C.faint} />
                <div style={{ position: "relative", flex: 1, minWidth: 180 }}>
                    <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: C.faint }} />
                    <input type="text" placeholder="Filter by action (e.g. PAYMENT_INITIATED)" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} style={{ width: "100%", padding: "6px 8px 6px 28px", borderRadius: 7, border: `1px solid ${C.border}`, fontSize: 11, outline: "none", background: C.bgPage, color: C.text, fontFamily: "inherit", boxSizing: "border-box" }} />
                </div>
                {search && <button onClick={() => { setSearch(""); setPage(1); }} style={{ fontSize: 10, color: C.red, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>Clear</button>}
            </div>

            {/* Table (unchanged, but keep original table code) */}
            <Card>
                <div style={{ overflowX: "auto" }}>
                    {isLoading ? (
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "60px 0" }}><div style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid #e2e8f0", borderTopColor: C.teal, animation: "spin 0.7s linear infinite" }} /></div>
                    ) : logs.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "60px 20px" }}><FileText size={32} color={C.border} style={{ margin: "0 auto 10px" }} /><p style={{ fontSize: 14, fontWeight: 600, color: C.text }}>No audit logs found</p></div>
                    ) : (
                        <>
                            <div style={{ display: "grid", gridTemplateColumns: "160px 180px 100px 120px 1fr", gap: 8, padding: "10px 20px", borderBottom: `1px solid ${C.border}`, background: C.bgMuted }}>
                                {["Time", "Action", "User ID", "Entity", "Hash Chain"].map(h => <span key={h} style={{ fontSize: 9, fontWeight: 700, color: C.faint, letterSpacing: ".06em", textTransform: "uppercase" }}>{h}</span>)}
                            </div>
                            {logs.map(log => (
                                <div key={log.id} style={{ display: "grid", gridTemplateColumns: "160px 180px 100px 120px 1fr", gap: 8, padding: "10px 20px", borderBottom: `1px solid ${C.border}`, alignItems: "center" }}>
                                    <span style={{ fontSize: 10, color: C.faint }}>{formatDate(log.created_at)}</span>
                                    <span style={{ fontSize: 11, color: C.text, fontWeight: 500 }}>{log.action.replace(/_/g, " ")}</span>
                                    <span style={{ fontSize: 10, fontFamily: "monospace", color: C.muted }}>{log.user_id?.slice(0, 8) ?? "?"}</span>
                                    <span style={{ fontSize: 11, color: C.text }}>{log.entity}</span>
                                    <span style={{ fontSize: 9, fontFamily: "monospace", color: C.faint }} title={log.hash_chain}>{log.hash_chain?.slice(0, 24)}…</span>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </Card>

            {totalPages > 1 && (
                <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
                    <button disabled={page === 1} onClick={() => setPage(page - 1)} style={{ padding: "6px 12px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.bg, color: C.text, cursor: "pointer", fontFamily: "inherit", fontSize: 11 }}>Prev</button>
                    <span style={{ fontSize: 11, color: C.muted, alignSelf: "center" }}>Page {page} of {totalPages}</span>
                    <button disabled={page === totalPages} onClick={() => setPage(page + 1)} style={{ padding: "6px 12px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.bg, color: C.text, cursor: "pointer", fontFamily: "inherit", fontSize: 11 }}>Next</button>
                </div>
            )}

            {/* === VERIFY CHAIN MODAL (TIMELINE) === */}
            {verifyOpen && verifyData && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={() => setVerifyOpen(false)}>
                    <Card style={{ width: "90%", maxWidth: 750, maxHeight: "85vh", overflow: "auto" }} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: verifyData.valid ? C.tealBg : C.redBg }}>
                            <h2 style={{ fontSize: 16, fontWeight: 700, color: verifyData.valid ? C.tealText : C.redText, margin: 0 }}>
                                {verifyData.valid ? "Chain Intact" : "Chain Broken"}
                            </h2>
                            <button onClick={() => setVerifyOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: C.faint }}>✕</button>
                        </div>
                        <div style={{ padding: "10px 20px" }}>
                            <div style={{ position: "relative", paddingLeft: 32 }}>
                                <div style={{ position: "absolute", left: 16, top: 0, bottom: 0, width: 2, background: C.border }} />
                                {(verifyData?.logs || []).map((entry) => (
                                    <div key={entry.id} style={{ position: "relative", marginBottom: 16 }}>
                                        <div style={{ position: "absolute", left: -16, top: 4, width: 12, height: 12, borderRadius: "50%", background: entry.valid ? C.teal : C.red, border: `2px solid ${C.bg}` }} />
                                        <div style={{ background: C.bgMuted, borderRadius: 8, padding: 10, marginLeft: 8 }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={() => toggleExpand(entry.id)}>
                                                {entry.valid ? <CheckCircle size={16} color={C.teal} /> : <XCircle size={16} color={C.red} />}
                                                <span style={{ fontSize: 12, fontWeight: 600, color: C.text, textTransform: "capitalize" }}>{entry.action.replace(/_/g, " ")}</span>
                                                <span style={{ marginLeft: "auto", color: C.faint }}>
                                                    {expandedEntries.has(entry.id) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                                </span>
                                            </div>
                                            {expandedEntries.has(entry.id) && (
                                                <div style={{ marginTop: 8, paddingLeft: 28, borderLeft: `2px solid ${C.border}` }}>
                                                    <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                                                        <span style={{ fontSize: 10, color: C.faint, minWidth: 70 }}>Current Hash:</span>
                                                        <span style={{ fontSize: 10, fontFamily: "monospace", color: C.teal, wordBreak: "break-all" }}>{entry.hash_chain}</span>
                                                    </div>
                                                    <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                                                        <span style={{ fontSize: 10, color: C.faint, minWidth: 70 }}>Previous Hash:</span>
                                                        <span style={{ fontSize: 10, fontFamily: "monospace", color: C.muted, wordBreak: "break-all" }}>{entry.prev_hash}</span>
                                                    </div>
                                                    {!entry.valid && (
                                                        <div style={{ display: "flex", gap: 8 }}>
                                                            <span style={{ fontSize: 10, color: C.red, minWidth: 70 }}>Expected Hash:</span>
                                                            <span style={{ fontSize: 10, fontFamily: "monospace", color: C.red, wordBreak: "break-all" }}>{entry.expected_hash}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div style={{ padding: "12px 20px", borderTop: `1px solid ${C.border}`, textAlign: "right" }}>
                            <button onClick={() => setVerifyOpen(false)} style={{ padding: "6px 16px", borderRadius: 6, border: "none", background: C.teal, color: "white", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Close</button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}