// src/pages/admin/DisputesPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FileText, AlertCircle, CheckCircle, Clock, Filter,
  FileSpreadsheet, X, Search, XCircle, Eye,
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

// ── Reusable components ─────────────────────────────────────────
function Card({ children, style, ...rest }: any) {
  return <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden", ...style }} {...rest}>{children}</div>;
}

function Badge({ label, color }: { label?: string | null; color: string }) {
  const safe = label || "—";
  const map: Record<string, { bg: string; text: string; border: string }> = {
    green: { bg: C.tealBg, text: C.tealText, border: C.tealBorder },
    amber: { bg: C.amberBg, text: C.amberText, border: C.amberBorder },
    red: { bg: C.redBg, text: C.redText, border: C.redBorder },
    blue: { bg: C.blueBg, text: C.blueText, border: "#bfdbfe" },
    gray: { bg: C.bgMuted, text: C.muted, border: C.border },
    purple: { bg: C.purpleBg, text: C.purpleText, border: "#d8c9f0" },
  };
  const m = map[color] || map.gray;
  return (
    <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 100, background: m.bg, color: m.text, border: `1px solid ${m.border}`, whiteSpace: "nowrap", textTransform: "capitalize", display: "inline-block" }}>
      {safe.replace(/_/g, " ")}
    </span>
  );
}

function StatCard({ label, value, icon: Icon, color, sub }: any) {
  return (
    <Card>
      <div style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
          <span style={{ fontSize: 10, color: C.faint, fontWeight: 500, textTransform: "uppercase", letterSpacing: ".04em" }}>{label}</span>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: color + "15", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon size={13} color={color} strokeWidth={1.8} />
          </div>
        </div>
        <p style={{ fontSize: 20, fontWeight: 700, color: C.text, margin: 0 }}>{value}</p>
        {sub && <p style={{ fontSize: 9, color: C.faint, marginTop: 3 }}>{sub}</p>}
      </div>
    </Card>
  );
}

// ── API helpers ─────────────────────────────────────────────
const disputesApi = {
  getAll: (page = 1, limit = 20, status?: string) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status && status !== "all") params.set("status", status);
    return request(`/tax/disputes/all?${params.toString()}`);
  },
  resolve: (disputeId: string, data: { status: string; adjusted_amount?: number; resolution_comment?: string }) =>
    request(`/tax/disputes/${disputeId}`, { method: "PATCH", body: JSON.stringify(data) }),
};

export default function DisputesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedDispute, setSelectedDispute] = useState<any>(null);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolution, setResolution] = useState({ status: "approved", adjusted_amount: 0, resolution_comment: "" });
  const limit = 20;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin-disputes", page, statusFilter],
    queryFn: () => disputesApi.getAll(page, limit, statusFilter),
  });

  const disputes = (data?.data as any)?.disputes ?? (Array.isArray(data?.data) ? data.data : []);
  const total = (data?.data as any)?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  // Stats from current page
  const pendingCount = disputes.filter((d: any) => d.status === "pending").length;
  const approvedCount = disputes.filter((d: any) => d.status === "approved").length;
  const rejectedCount = disputes.filter((d: any) => d.status === "rejected").length;

  const fmt = (val: number) => `USD ${val.toLocaleString()}`;
  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  const resolveMutation = useMutation({
    mutationFn: (args: any) => disputesApi.resolve(selectedDispute.id, args),
    onSuccess: () => {
      toast.success("Dispute resolved");
      setShowResolveModal(false);
      setSelectedDispute(null);
      queryClient.invalidateQueries({ queryKey: ["admin-disputes"] });
    },
    onError: (err: any) => toast.error(err.message || "Resolution failed"),
  });

  const handleResolve = () => {
    const payload: any = { status: resolution.status };
    if (resolution.status === "approved") {
      payload.adjusted_amount = resolution.adjusted_amount || selectedDispute?.proposed_amount;
    }
    if (resolution.resolution_comment) payload.resolution_comment = resolution.resolution_comment;
    resolveMutation.mutate(payload);
  };

  const handleExportPDF = () => {
    const w = window.open("", "_blank");
    if (!w) { toast.error("Please allow popups"); return; }
    const now = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    let h = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>DalPay Disputes Report</title><style>
      @page { size: A4 landscape; margin: 15mm; }
      body { font-family: 'Segoe UI', Arial, sans-serif; padding: 0; color: #111816; font-size: 10px; }
      .header { border-bottom: 3px solid #0d9e75; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; }
      .header .logo-area { display: flex; align-items: center; gap: 12px; }
      .header img { height: 40px; }
      .header h1 { font-size: 18px; margin: 0; color: #0d9e75; }
      .header .badge { background: #e8f7f2; color: #0a7d5d; padding: 4px 12px; border-radius: 12px; font-size: 9px; font-weight: 600; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
      th { background: #0d9e75; color: white; padding: 8px; font-size: 9px; text-transform: uppercase; }
      td { padding: 7px; font-size: 9px; border-bottom: 1px solid #e5eae8; }
      .footer { border-top: 1px solid #e5eae8; padding-top: 10px; font-size: 8px; color: #a0b4ae; text-align: center; }
    </style></head><body>
    <div class="header">
      <div class="logo-area"><img src="/icon.png" alt="DalPay Logo" /><div><h1>DalPay Disputes Report</h1><p class="sub">Republic of Somaliland • Ministry of Finance • ${now}</p></div></div>
      <div class="badge">OFFICIAL</div>
    </div>
    <table><thead><tr><th>ID</th><th>User ID</th><th>Assessment ID</th><th>Reason</th><th>Proposed Amount</th><th>Status</th><th>Date</th></tr></thead><tbody>`;
    disputes.forEach((d: any) => {
      h += `<tr>
        <td style="font-size:8px;">${(d.id || "").slice(0,8)}</td>
        <td>${d.user_id?.slice(0,8) ?? "?"}</td>
        <td>${d.assessment_id?.slice(0,8) ?? "?"}</td>
        <td>${d.reason}</td>
        <td>${fmt(d.proposed_amount || 0)}</td>
        <td>${d.status}</td>
        <td>${formatDate(d.created_at)}</td>
      </tr>`;
    });
    h += `</tbody></table><div class="footer"><span>DalPay Digital Tax System v2.0</span><span>DAL-${Date.now().toString(36).toUpperCase()}</span></div></body></html>`;
    w.document.write(h); w.document.close();
    setTimeout(() => w.print(), 500);
    toast.success("Disputes report exported");
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

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: 0 }}>Tax Disputes</h1>
          <p style={{ fontSize: 13, color: C.faint, marginTop: 4 }}>
            {total} total • {pendingCount} pending • {approvedCount} approved
          </p>
        </div>
        <button onClick={handleExportPDF} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, background: C.blue + "15", border: `1px solid ${C.blue}30`, color: C.blue, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
          <FileSpreadsheet size={13} /> Export PDF
        </button>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
        <StatCard label="Total Disputes" value={total} icon={FileText} color={C.blue} />
        <StatCard label="Pending" value={pendingCount} icon={Clock} color={C.amber} />
        <StatCard label="Approved" value={approvedCount} icon={CheckCircle} color={C.teal} />
        <StatCard label="Rejected" value={rejectedCount} icon={XCircle} color={C.red} />
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", padding: "12px 16px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, alignItems: "center" }}>
        <Filter size={13} color={C.faint} />
        <div style={{ position: "relative", flex: 1, minWidth: 180 }}>
          <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: C.faint }} />
          <input type="text" placeholder="Search by reason or ID..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} style={{ width: "100%", padding: "6px 8px 6px 28px", borderRadius: 7, border: `1px solid ${C.border}`, fontSize: 11, outline: "none", background: C.bgPage, color: C.text, fontFamily: "inherit", boxSizing: "border-box" }} />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} style={{ padding: "6px 8px", borderRadius: 7, border: `1px solid ${C.border}`, fontSize: 11, outline: "none", background: C.bgPage, color: C.text, fontFamily: "inherit", cursor: "pointer", minWidth: 110 }}>
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        {(search || statusFilter !== "all") && (
          <button onClick={() => { setSearch(""); setStatusFilter("all"); setPage(1); }} style={{ fontSize: 10, color: C.red, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>Clear</button>
        )}
      </div>

      {/* Table */}
      <Card>
        <div style={{ overflowX: "auto" }}>
          {isLoading ? (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "60px 0" }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid #e2e8f0", borderTopColor: C.teal, animation: "spin 0.7s linear infinite" }} />
            </div>
          ) : disputes.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <FileText size={32} color={C.border} style={{ margin: "0 auto 10px" }} />
              <p style={{ fontSize: 14, fontWeight: 600, color: C.text }}>No disputes found</p>
            </div>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 100px 1.5fr 100px 100px 120px 80px", gap: 8, padding: "10px 20px", borderBottom: `1px solid ${C.border}`, background: C.bgMuted }}>
                {["ID", "User ID", "Assessment", "Reason", "Proposed", "Status", "Date", ""].map(h => (
                  <span key={h} style={{ fontSize: 9, fontWeight: 700, color: C.faint, letterSpacing: ".06em", textTransform: "uppercase" }}>{h}</span>
                ))}
              </div>
              {disputes.map((d: any) => (
                <div key={d.id} style={{ display: "grid", gridTemplateColumns: "1fr 100px 100px 1.5fr 100px 100px 120px 80px", gap: 8, padding: "10px 20px", borderBottom: `1px solid ${C.border}`, alignItems: "center" }}
                  onMouseEnter={e => (e.currentTarget.style.background = C.bgMuted)}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <span style={{ fontSize: 11, fontFamily: "monospace", color: C.text }}>{(d.id || "").slice(0, 8)}…</span>
                  <span style={{ fontSize: 11, fontFamily: "monospace", color: C.muted }}>{d.user_id?.slice(0, 8) ?? "?"}</span>
                  <span style={{ fontSize: 11, fontFamily: "monospace", color: C.muted }}>{d.assessment_id?.slice(0, 8) ?? "?"}</span>
                  <span style={{ fontSize: 11, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.reason}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: C.teal }}>{fmt(d.proposed_amount || 0)}</span>
                  <Badge label={d.status} color={d.status === "approved" ? "green" : d.status === "rejected" ? "red" : "amber"} />
                  <span style={{ fontSize: 10, color: C.faint }}>{formatDate(d.created_at)}</span>
                  {d.status === "pending" ? (
                    <button
                      onClick={() => { setSelectedDispute(d); setResolution({ status: "approved", adjusted_amount: d.proposed_amount || 0, resolution_comment: "" }); setShowResolveModal(true); }}
                      style={{ fontSize: 10, fontWeight: 600, color: C.teal, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontFamily: "inherit" }}>
                      <Eye size={12} /> Resolve
                    </button>
                  ) : (
                    <span style={{ fontSize: 10, color: C.faint }}>—</span>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
          <button disabled={page === 1} onClick={() => setPage(page - 1)} style={{ padding: "6px 12px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.bg, color: C.text, cursor: "pointer", fontFamily: "inherit", fontSize: 11 }}>Prev</button>
          <span style={{ fontSize: 11, color: C.muted, alignSelf: "center" }}>Page {page} of {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(page + 1)} style={{ padding: "6px 12px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.bg, color: C.text, cursor: "pointer", fontFamily: "inherit", fontSize: 11 }}>Next</button>
        </div>
      )}

      {/* Resolve Modal */}
      {showResolveModal && selectedDispute && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={() => setShowResolveModal(false)}>
          <Card style={{ width: "90%", maxWidth: 500 }} onClick={(e: { stopPropagation: () => any; }) => e.stopPropagation()}>
            <div style={{ padding: "18px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: 0 }}>Resolve Dispute</h2>
              <button onClick={() => setShowResolveModal(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: C.faint }}><X size={18} /></button>
            </div>
            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ background: C.bgMuted, padding: 10, borderRadius: 8 }}>
                <p style={{ fontSize: 11, color: C.faint }}>Reason: <span style={{ color: C.text, fontWeight: 500 }}>{selectedDispute.reason}</span></p>
                <p style={{ fontSize: 11, color: C.faint }}>Proposed Amount: <span style={{ color: C.teal, fontWeight: 600 }}>{fmt(selectedDispute.proposed_amount || 0)}</span></p>
              </div>
              <div>
                <label style={{ fontSize: 11, color: C.faint, marginBottom: 4, display: "block" }}>Decision</label>
                <select value={resolution.status} onChange={(e) => setResolution({ ...resolution, status: e.target.value })} style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}>
                  <option value="approved">Approve</option>
                  <option value="rejected">Reject</option>
                </select>
              </div>
              {resolution.status === "approved" && (
                <div>
                  <label style={{ fontSize: 11, color: C.faint, marginBottom: 4, display: "block" }}>Adjusted Amount (USD)</label>
                  <input type="number" value={resolution.adjusted_amount} onChange={(e) => setResolution({ ...resolution, adjusted_amount: parseInt(e.target.value) || 0 })} style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
                </div>
              )}
              <div>
                <label style={{ fontSize: 11, color: C.faint, marginBottom: 4, display: "block" }}>Resolution Comment</label>
                <textarea value={resolution.resolution_comment} onChange={(e) => setResolution({ ...resolution, resolution_comment: e.target.value })} rows={3} style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, outline: "none", fontFamily: "inherit", resize: "vertical", boxSizing: "border-box" }} />
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button onClick={() => setShowResolveModal(false)} style={{ flex: 1, padding: "10px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, color: C.text, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
                <button onClick={handleResolve} disabled={resolveMutation.isPending} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "none", background: C.teal, color: "white", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", opacity: resolveMutation.isPending ? 0.7 : 1 }}>
                  {resolveMutation.isPending ? "Resolving..." : "Submit"}
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}