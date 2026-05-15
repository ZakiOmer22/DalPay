// src/pages/admin/NotificationsPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search, FileText, AlertCircle, CheckCircle, Clock, Bell,
  Filter, FileSpreadsheet, X, Plus,
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
const notificationsApi = {
  getAll: (page = 1, limit = 20, filters?: { search?: string; read?: string }) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (filters?.search) params.set("search", filters.search);
    if (filters?.read) params.set("read", filters.read);
    return request<{ notifications: any[]; total: number }>(`/notification/admin/all?${params.toString()}`);
  },
  send: (data: { userId: string; title: string; message: string }) =>
    request("/dashboard/notify", { method: "POST", body: JSON.stringify(data) }),
};

export default function NotificationsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [readFilter, setReadFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendForm, setSendForm] = useState({ userId: "", title: "", message: "" });
  const limit = 20;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin-notifications", page, search, readFilter],
    queryFn: () => notificationsApi.getAll(page, limit, { search, read: readFilter }),
  });

  const notifications = (data?.data as any)?.notifications ?? [];
  const total = (data?.data as any)?.total ?? 0;

  const totalPages = Math.ceil(total / limit);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }) +
    " " +
    new Date(dateStr).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  // Send notification mutation
  const sendMutation = useMutation({
    mutationFn: notificationsApi.send,
    onSuccess: () => {
      toast.success("Notification sent");
      setShowSendModal(false);
      setSendForm({ userId: "", title: "", message: "" });
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
    },
    onError: (err: any) => toast.error(err.message || "Failed to send"),
  });

  const handleSend = () => {
    if (!sendForm.userId || !sendForm.title || !sendForm.message) {
      toast.error("All fields are required");
      return;
    }
    sendMutation.mutate(sendForm);
  };

  // Export PDF
  const handleExportPDF = () => {
    const w = window.open("", "_blank");
    if (!w) { toast.error("Please allow popups"); return; }
    const now = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    let h = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>DalPay Notifications</title><style>
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
      <div class="logo-area"><img src="/icon.png" alt="DalPay Logo" /><div><h1>DalPay Notifications</h1><p class="sub">Republic of Somaliland • Ministry of Finance • ${now}</p></div></div>
      <div class="badge">OFFICIAL</div>
    </div>
    <table><thead><tr><th>Time</th><th>User ID</th><th>Title</th><th>Message</th><th>Status</th></tr></thead><tbody>`;
    notifications.forEach((n: any) => {
      h += `<tr>
        <td>${formatDate(n.created_at)}</td>
        <td>${n.user_id?.slice(0, 8) ?? "?"}</td>
        <td>${n.title}</td>
        <td>${n.message}</td>
        <td>${n.read ? "Read" : "Unread"}</td>
      </tr>`;
    });
    h += `</tbody></table><div class="footer"><span>DalPay Digital Tax System v2.0</span><span>DAL-${Date.now().toString(36).toUpperCase()}</span></div></body></html>`;
    w.document.write(h); w.document.close();
    setTimeout(() => w.print(), 500);
    toast.success("Notifications exported");
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
          <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: 0 }}>Notifications</h1>
          <p style={{ fontSize: 13, color: C.faint, marginTop: 4 }}>
            {total} total • send notifications to taxpayers
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={handleExportPDF} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, background: C.blue + "15", border: `1px solid ${C.blue}30`, color: C.blue, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            <FileSpreadsheet size={13} /> Export PDF
          </button>
          <button onClick={() => setShowSendModal(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, background: C.teal, border: "none", color: "white", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            <Plus size={13} /> Send Notification
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
        <StatCard label="Total Sent" value={total} icon={Bell} color={C.blue} />
        <StatCard label="Read" value={notifications.filter((n: any) => n.read).length} icon={CheckCircle} color={C.teal} sub="on this page" />
        <StatCard label="Unread" value={notifications.filter((n: any) => !n.read).length} icon={Clock} color={C.amber} sub="on this page" />
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", padding: "12px 16px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, alignItems: "center" }}>
        <Filter size={13} color={C.faint} />
        <div style={{ position: "relative", flex: 1, minWidth: 180 }}>
          <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: C.faint }} />
          <input
            type="text"
            placeholder="Search by user ID or title..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{ width: "100%", padding: "6px 8px 6px 28px", borderRadius: 7, border: `1px solid ${C.border}`, fontSize: 11, outline: "none", background: C.bgPage, color: C.text, fontFamily: "inherit", boxSizing: "border-box" }}
          />
        </div>
        <select value={readFilter} onChange={(e) => { setReadFilter(e.target.value); setPage(1); }} style={{ padding: "6px 8px", borderRadius: 7, border: `1px solid ${C.border}`, fontSize: 11, outline: "none", background: C.bgPage, color: C.text, fontFamily: "inherit", cursor: "pointer", minWidth: 110 }}>
          <option value="all">All Status</option>
          <option value="true">Read</option>
          <option value="false">Unread</option>
        </select>
        {(search || readFilter !== "all") && (
          <button onClick={() => { setSearch(""); setReadFilter("all"); setPage(1); }} style={{ fontSize: 10, color: C.red, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>Clear</button>
        )}
      </div>

      {/* Table */}
      <Card>
        <div style={{ overflowX: "auto" }}>
          {isLoading ? (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "60px 0" }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid #e2e8f0", borderTopColor: C.teal, animation: "spin 0.7s linear infinite" }} />
            </div>
          ) : notifications.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <FileText size={32} color={C.border} style={{ margin: "0 auto 10px" }} />
              <p style={{ fontSize: 14, fontWeight: 600, color: C.text }}>No notifications found</p>
            </div>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "180px 100px 1fr 2fr 80px", gap: 8, padding: "10px 20px", borderBottom: `1px solid ${C.border}`, background: C.bgMuted }}>
                {["Time", "User ID", "Title", "Message", "Status"].map(h => (
                  <span key={h} style={{ fontSize: 9, fontWeight: 700, color: C.faint, letterSpacing: ".06em", textTransform: "uppercase" }}>{h}</span>
                ))}
              </div>
              {notifications.map((n: any) => (
                <div key={n.id} style={{ display: "grid", gridTemplateColumns: "180px 100px 1fr 2fr 80px", gap: 8, padding: "10px 20px", borderBottom: `1px solid ${C.border}`, alignItems: "center" }}
                  onMouseEnter={e => (e.currentTarget.style.background = C.bgMuted)}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <span style={{ fontSize: 10, color: C.faint }}>{formatDate(n.created_at)}</span>
                  <span style={{ fontSize: 11, fontFamily: "monospace", color: C.muted }}>{n.user_id?.slice(0, 8) ?? "?"}</span>
                  <span style={{ fontSize: 11, fontWeight: 500, color: C.text }}>{n.title}</span>
                  <span style={{ fontSize: 11, color: C.text }}>{n.message}</span>
                  <Badge label={n.read ? "read" : "unread"} color={n.read ? "green" : "amber"} />
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

      {/* Send Notification Modal */}
      {showSendModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={() => setShowSendModal(false)}>
          <Card style={{ width: "90%", maxWidth: 450 }}  onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <div style={{ padding: "18px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: 0 }}>Send Notification</h2>
              <button onClick={() => setShowSendModal(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: C.faint }}><X size={18} /></button>
            </div>
            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 11, color: C.faint, marginBottom: 4, display: "block" }}>User ID *</label>
                <input type="text" value={sendForm.userId} onChange={e => setSendForm({ ...sendForm, userId: e.target.value })} placeholder="Enter taxpayer UUID" style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: C.faint, marginBottom: 4, display: "block" }}>Title *</label>
                <input type="text" value={sendForm.title} onChange={e => setSendForm({ ...sendForm, title: e.target.value })} placeholder="Notification title" style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: C.faint, marginBottom: 4, display: "block" }}>Message *</label>
                <textarea value={sendForm.message} onChange={e => setSendForm({ ...sendForm, message: e.target.value })} placeholder="Notification message" rows={4} style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, outline: "none", fontFamily: "inherit", resize: "vertical", boxSizing: "border-box" }} />
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button onClick={() => setShowSendModal(false)} style={{ flex: 1, padding: "10px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, color: C.text, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
                <button onClick={handleSend} disabled={sendMutation.isPending} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "none", background: C.teal, color: "white", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", opacity: sendMutation.isPending ? 0.7 : 1 }}>{sendMutation.isPending ? "Sending..." : "Send"}</button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}