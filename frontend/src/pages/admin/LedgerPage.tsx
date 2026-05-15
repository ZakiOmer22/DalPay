// src/pages/admin/LedgerPage.tsx
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  BookOpen, Search, AlertTriangle,
  RefreshCw, FileSpreadsheet,
} from "lucide-react";
import { request } from "@/services/api";
import toast from "react-hot-toast";

// ── Design tokens (same palette as FraudPage) ─────────────────
const C = {
  border: "#e5eae8", bg: "#ffffff", bgPage: "#f0f2f1", bgMuted: "#f7f9f8",
  text: "#111816", muted: "#7a918b", faint: "#a0b4ae",
  teal: "#0d9e75", tealBg: "#e8f7f2", tealText: "#0a7d5d", tealBorder: "#c3e8dc",
  amber: "#f59e0b", amberBg: "#fffbeb", amberText: "#92400e", amberBorder: "#fde68a",
  red: "#e53e3e", redBg: "#fff5f5", redText: "#c53030", redBorder: "#fed7d7",
  blue: "#3b82f6", blueBg: "#eff6ff", blueText: "#1d4ed8",
  purple: "#8b5cf6", purpleBg: "#f5f3ff", purpleText: "#5b21b6",
};

// ── Reusable UI components ─────────────────────────────────────
function Card({ children, style, ...rest }: any) {
  return (
    <div
      style={{
        background: C.bg,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
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
    <span
      style={{
        fontSize: 10,
        fontWeight: 600,
        padding: "2px 8px",
        borderRadius: 100,
        background: m.bg,
        color: m.text,
        border: `1px solid ${m.border}`,
        whiteSpace: "nowrap",
        textTransform: "capitalize",
        display: "inline-block",
      }}
    >
      {safe.replace(/_/g, " ")}
    </span>
  );
}

// ── API helper ──────────────────────────────────────────────────
const ledgerApi = {
  getLedger: (page = 1, limit = 50, filters?: any) =>
    request(`/ledger?page=${page}&limit=${limit}${filters ? `&${new URLSearchParams(filters).toString()}` : ""}`),
};

// ── Main component ─────────────────────────────────────────────
export default function LedgerPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const filters = useMemo(() => {
    const f: any = {};
    if (search) f.search = search;
    if (filterType !== "all") f.type = filterType;
    if (startDate) f.startDate = startDate;
    if (endDate) f.endDate = endDate;
    return f;
  }, [search, filterType, startDate, endDate]);

  const {
    data: ledgerData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["ledger", page, limit, filters],
    queryFn: () => ledgerApi.getLedger(page, limit, filters),
    staleTime: 30000,
  });

  // Safely extract data
  const ledgerPayload = ledgerData?.data as any;
  const entries = (ledgerPayload?.entries || ledgerPayload || []) as any[];
  const totalEntries = ledgerPayload?.total || 0;

  // FIX: parseFloat() to avoid string concatenation
  const totalDebits = entries
    .filter((e: any) => e.type === "debit")
    .reduce((sum: number, e: any) => sum + parseFloat(e.amount || 0), 0);
  const totalCredits = entries
    .filter((e: any) => e.type === "credit")
    .reduce((sum: number, e: any) => sum + parseFloat(e.amount || 0), 0);

  const fmt = (val: number) => `USD ${val.toLocaleString()}`;
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  // Export PDF
  const handleExport = () => {
    const w = window.open("", "_blank");
    if (!w) {
      toast.error("Please allow popups");
      return;
    }
    const now = new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    let h = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>DalPay Ledger</title><style>
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
      <div class="logo-area"><img src="/icon.png" alt="DalPay Logo" /><div><h1>DalPay General Ledger</h1><p class="sub">Republic of Somaliland • Ministry of Finance • ${now}</p></div></div>
      <div class="badge">OFFICIAL</div>
    </div>
    <table><thead><tr><th>Date</th><th>Description</th><th>Type</th><th>Amount</th><th>Reference</th></tr></thead><tbody>`;
    entries.forEach((e: any) => {
      h += `<tr>
        <td>${formatDate(e.date || e.created_at)}</td>
        <td>${e.description || "—"}</td>
        <td>${e.type || "—"}</td>
        <td>${fmt(parseFloat(e.amount || 0))}</td>
        <td style="font-size:8px;">${(e.reference || e.id || "").slice(0, 8)}</td>
      </tr>`;
    });
    h += `</tbody></table><div class="footer"><span>DalPay Digital Tax System v2.0</span><span>DAL-${Date.now().toString(36).toUpperCase()}</span></div></body></html>`;
    w.document.write(h);
    w.document.close();
    setTimeout(() => w.print(), 500);
    toast.success("Ledger exported");
  };

  // Pagination
  const totalPages = Math.ceil(totalEntries / limit);

  // 401 handler
  if (isError && (error as any)?.status === 401) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <AlertTriangle size={40} style={{ margin: "0 auto 16px", color: C.amber }} />
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
          <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: 0 }}>General Ledger</h1>
          <p style={{ fontSize: 13, color: C.faint, marginTop: 4 }}>
            All financial transactions recorded in the system
          </p>
        </div>
        <button
          onClick={handleExport}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 16px",
            borderRadius: 8,
            background: C.blue + "15",
            border: `1px solid ${C.blue}30`,
            color: C.blue,
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          <FileSpreadsheet size={13} /> Export PDF
        </button>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
        <Card>
          <div style={{ padding: "14px 16px" }}>
            <span style={{ fontSize: 10, color: C.faint, textTransform: "uppercase", fontWeight: 500 }}>Total Entries</span>
            <p style={{ fontSize: 20, fontWeight: 700, color: C.text, margin: 0 }}>{totalEntries}</p>
          </div>
        </Card>
        <Card>
          <div style={{ padding: "14px 16px" }}>
            <span style={{ fontSize: 10, color: C.faint, textTransform: "uppercase", fontWeight: 500 }}>Total Debits</span>
            <p style={{ fontSize: 20, fontWeight: 700, color: C.red, margin: 0 }}>{fmt(totalDebits)}</p>
          </div>
        </Card>
        <Card>
          <div style={{ padding: "14px 16px" }}>
            <span style={{ fontSize: 10, color: C.faint, textTransform: "uppercase", fontWeight: 500 }}>Total Credits</span>
            <p style={{ fontSize: 20, fontWeight: 700, color: C.teal, margin: 0 }}>{fmt(totalCredits)}</p>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div style={{ padding: "14px 16px", display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <Search size={14} style={{ position: "absolute", left: 10, top: 8, color: C.faint }} />
            <input
              placeholder="Search description or reference..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              style={{ width: "100%", padding: "6px 10px 6px 32px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12, outline: "none", fontFamily: "inherit" }}
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
            style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12, outline: "none", fontFamily: "inherit", background: C.bg, color: C.text }}
          >
            <option value="all">All Types</option>
            <option value="debit">Debit</option>
            <option value="credit">Credit</option>
          </select>
          <input
            type="date"
            value={startDate}
            onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
            style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12, outline: "none", fontFamily: "inherit" }}
            placeholder="Start Date"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
            style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12, outline: "none", fontFamily: "inherit" }}
            placeholder="End Date"
          />
          <button
            onClick={() => refetch()}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 8, background: C.bgMuted, border: `1px solid ${C.border}`, color: C.text, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
          >
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </Card>

      {/* Ledger table */}
      <Card>
        <div style={{ overflowX: "auto" }}>
          {isLoading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid #e2e8f0", borderTopColor: C.teal, animation: "spin 0.7s linear infinite" }} />
            </div>
          ) : entries.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <BookOpen size={32} color={C.border} style={{ margin: "0 auto 10px" }} />
              <p style={{ fontSize: 14, fontWeight: 600, color: C.text }}>No ledger entries found</p>
            </div>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "120px 1fr 80px 120px 120px 100px", gap: 8, padding: "10px 20px", borderBottom: `1px solid ${C.border}`, background: C.bgMuted }}>
                {["Date", "Description", "Type", "Amount", "Reference", "Status"].map((h) => (
                  <span key={h} style={{ fontSize: 9, fontWeight: 700, color: C.faint, letterSpacing: ".06em", textTransform: "uppercase" }}>{h}</span>
                ))}
              </div>
              {entries.map((entry: any) => (
                <div
                  key={entry.id}
                  style={{ display: "grid", gridTemplateColumns: "120px 1fr 80px 120px 120px 100px", gap: 8, padding: "10px 20px", borderBottom: `1px solid ${C.border}`, alignItems: "center" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = C.bgMuted)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <span style={{ fontSize: 11, color: C.faint }}>{formatDate(entry.date || entry.created_at)}</span>
                  <span style={{ fontSize: 11, color: C.text }}>{entry.description || "—"}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: entry.type === "debit" ? C.red : C.teal, textTransform: "capitalize" }}>{entry.type}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: entry.type === "debit" ? C.red : C.teal }}>
                    {entry.type === "debit" ? "−" : "+"}{fmt(parseFloat(entry.amount || 0))}
                  </span>
                  <span style={{ fontSize: 10, fontFamily: "monospace", color: C.muted }}>{(entry.reference || entry.id || "").slice(0, 8)}…</span>
                  <Badge label={entry.status || "completed"} color={
                    entry.status === "pending" ? "amber" :
                    entry.status === "failed" ? "red" : "green"
                  } />
                </div>
              ))}
            </>
          )}
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ padding: "10px 20px", borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: C.faint }}>Page {page} of {totalPages} ({totalEntries} entries)</span>
            <div style={{ display: "flex", gap: 8 }}>
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} style={{ padding: "4px 12px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.bg, fontSize: 11, cursor: page <= 1 ? "not-allowed" : "pointer", opacity: page <= 1 ? 0.5 : 1 }}>Previous</button>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} style={{ padding: "4px 12px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.bg, fontSize: 11, cursor: page >= totalPages ? "not-allowed" : "pointer", opacity: page >= totalPages ? 0.5 : 1 }}>Next</button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}