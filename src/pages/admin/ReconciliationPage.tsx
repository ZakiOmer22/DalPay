// src/pages/admin/ReconciliationPage.tsx
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
   FileText, AlertCircle, CheckCircle,
  RefreshCw, X, Calendar, FileSpreadsheet,
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
const reconciliationApi = {
  run: () => request("/reconciliation/run", { method: "POST" }),
  getSummary: () => request("/reconciliation/summary"),
  getReport: (date: string) => request(`/reconciliation/report/${date}`),
};

export default function ReconciliationPage() {
  // const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Fetch 30‑day summary
  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ["reconciliation-summary"],
    queryFn: reconciliationApi.getSummary,
    staleTime: 30000,
  });

  // Fetch specific day report
  const { data: reportData, isLoading: reportLoading } = useQuery({
    queryKey: ["reconciliation-report", selectedDate],
    queryFn: () => reconciliationApi.getReport(selectedDate!),
    enabled: !!selectedDate,
  });

  // Run reconciliation mutation
  const runMutation = useMutation({
    mutationFn: reconciliationApi.run,
    onSuccess: () => {
      toast.success("Reconciliation completed for today");
      queryClient.invalidateQueries({ queryKey: ["reconciliation-summary"] });
    },
    onError: (err: any) => toast.error(err.message || "Reconciliation failed"),
  });

  const summary = (summaryData?.data as any[]) || [];
  const report = reportData?.data as any;

  // Compute overall stats from summary
  const totalDays = summary.length;
  const successfulDays = summary.filter((d: any) => d.status === "success").length;
  const failedDays = summary.filter((d: any) => d.status !== "success").length;
  const totalDiscrepancies = summary.reduce((sum: number, d: any) => sum + (d.discrepancies || 0), 0);

  // Safe currency formatter
  const fmt = (val: number | undefined | null) => {
    const num = val ?? 0;
    return `USD ${Number(num).toLocaleString()}`;
  };

  const handleRunReconciliation = () => {
    runMutation.mutate();
  };

  // ── Export PDF ────────────────────────────────────────────
  const handleExportPDF = () => {
    const w = window.open("", "_blank");
    if (!w) { toast.error("Please allow popups"); return; }
    const now = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    let h = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>DalPay Reconciliation Report</title><style>
      @page { size: A4; margin: 15mm; }
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
      <div class="logo-area"><img src="/icon.png" alt="DalPay Logo" /><div><h1>DalPay Reconciliation Report</h1><p class="sub">Republic of Somaliland • Ministry of Finance • ${now}</p></div></div>
      <div class="badge">OFFICIAL</div>
    </div>
    <h2>30‑Day Summary</h2>
    <table><thead><tr><th>Date</th><th>Status</th><th>Collected (USD)</th><th>Discrepancies</th></tr></thead><tbody>`;
    summary.forEach((day: any) => {
      h += `<tr>
        <td>${day.date}</td>
        <td>${day.status}</td>
        <td>${(day.total_collected || 0).toLocaleString()}</td>
        <td>${day.discrepancies ?? 0}</td>
      </tr>`;
    });
    h += `</tbody></table>`;

    if (report) {
      h += `<h2>Report for ${selectedDate || ""}</h2>
      <table><thead><tr><th>Provider</th><th>Collected (USD)</th><th>Disbursed (USD)</th></tr></thead><tbody>`;
      (report.details || []).forEach((d: any) => {
        h += `<tr><td>${d.provider_name}</td><td>${(d.total_collected || 0).toLocaleString()}</td><td>${(d.total_disbursed || 0).toLocaleString()}</td></tr>`;
      });
      h += `</tbody></table>`;
    }

    h += `<div class="footer"><span>DalPay Digital Tax System v2.0</span><span>DAL-${Date.now().toString(36).toUpperCase()}</span></div></body></html>`;
    w.document.write(h);
    w.document.close();
    setTimeout(() => w.print(), 500);
    toast.success("Report exported");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: 0 }}>Reconciliation</h1>
          <p style={{ fontSize: 13, color: C.faint, marginTop: 4 }}>
            Daily matching of collected payments with mobile money operator reports
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={handleExportPDF}
            style={{
              display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8,
              background: C.blue + "15", border: `1px solid ${C.blue}30`, color: C.blue,
              fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
            }}
          >
            <FileSpreadsheet size={13} /> Export PDF
          </button>
          <button
            onClick={handleRunReconciliation}
            disabled={runMutation.isPending}
            style={{
              display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8,
              background: C.teal, border: "none", color: "white", fontSize: 12, fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit", opacity: runMutation.isPending ? 0.7 : 1,
            }}
          >
            {runMutation.isPending ? <RefreshCw size={13} className="spin" /> : <CheckCircle size={13} />}
            Run Today's Reconciliation
          </button>
        </div>
      </div>

      {/* Key metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
        <StatCard label="Days Reconciled" value={totalDays} icon={Calendar} color={C.blue} sub="last 30 days" />
        <StatCard label="Successful" value={successfulDays} icon={CheckCircle} color={C.teal} />
        <StatCard label="Failed" value={failedDays} icon={AlertCircle} color={C.red} />
        <StatCard label="Discrepancies" value={totalDiscrepancies} icon={FileText} color={C.amber} sub="total over 30 days" />
      </div>

      {/* Summary table */}
      <Card>
        <div style={{ padding: "14px 16px", borderBottom: `1px solid ${C.border}`, background: C.bgMuted }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: C.text, margin: 0 }}>30‑Day Reconciliation Summary</p>
        </div>
        <div style={{ padding: "10px 16px" }}>
          {summaryLoading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "30px 0" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", border: "3px solid #e2e8f0", borderTopColor: C.teal, animation: "spin 0.7s linear infinite" }} />
            </div>
          ) : summary.length === 0 ? (
            <p style={{ fontSize: 12, color: C.faint }}>No reconciliation data yet.</p>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 120px 100px", gap: 8, padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
                {["Date", "Status", "Collected", "Discrepancies"].map(h => (
                  <span key={h} style={{ fontSize: 9, fontWeight: 700, color: C.faint, letterSpacing: ".06em", textTransform: "uppercase" }}>{h}</span>
                ))}
              </div>
              {summary.map((day: any) => (
                <div
                  key={day.date}
                  onClick={() => setSelectedDate(day.date)}
                  style={{
                    display: "grid", gridTemplateColumns: "1fr 100px 120px 100px", gap: 8, padding: "10px 0",
                    borderBottom: `1px solid ${C.border}`, cursor: "pointer", alignItems: "center",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = C.bgMuted)}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <span style={{ fontSize: 11, color: C.text, fontWeight: 500 }}>{day.date}</span>
                  <Badge label={day.status} color={day.status === "success" ? "green" : "red"} />
                  <span style={{ fontSize: 11, color: C.teal, fontWeight: 600 }}>{fmt(day.total_collected)}</span>
                  <span style={{ fontSize: 11, color: C.red, fontWeight: 600 }}>{day.discrepancies ?? 0}</span>
                </div>
              ))}
            </>
          )}
        </div>
      </Card>

      {/* Day Report Modal */}
      {selectedDate && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={() => setSelectedDate(null)}>
          <Card style={{ width: "90%", maxWidth: 600, maxHeight: "80vh", overflow: "auto" }} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: 0 }}>Reconciliation Report – {selectedDate}</h2>
              <button onClick={() => setSelectedDate(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: C.faint }}><X size={18} /></button>
            </div>
            <div style={{ padding: "14px 20px" }}>
              {reportLoading ? (
                <div style={{ textAlign: "center", padding: "30px" }}><div style={{ width: 28, height: 28, borderRadius: "50%", border: "3px solid #e2e8f0", borderTopColor: C.teal, animation: "spin 0.7s linear infinite", margin: "0 auto" }} /></div>
              ) : report ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div><span style={{ fontSize: 10, color: C.faint }}>Status</span><p style={{ fontSize: 14, fontWeight: 600, color: C.text }}><Badge label={report.status} color={report.status === "success" ? "green" : "red"} /></p></div>
                    <div><span style={{ fontSize: 10, color: C.faint }}>Total Collected</span><p style={{ fontSize: 14, fontWeight: 600, color: C.teal }}>{fmt(report.total_collected)}</p></div>
                    <div><span style={{ fontSize: 10, color: C.faint }}>Total Disbursed</span><p style={{ fontSize: 14, fontWeight: 600, color: C.blue }}>{fmt(report.total_disbursed)}</p></div>
                    <div><span style={{ fontSize: 10, color: C.faint }}>Discrepancies</span><p style={{ fontSize: 14, fontWeight: 600, color: C.red }}>{report.discrepancies ?? 0}</p></div>
                  </div>
                  {report.details && report.details.length > 0 && (
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 600, color: C.text, margin: "8px 0" }}>Provider Breakdown</p>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
                        {["Provider", "Collected", "Disbursed"].map(h => <span key={h} style={{ fontSize: 9, fontWeight: 700, color: C.faint }}>{h}</span>)}
                      </div>
                      {report.details.map((d: any) => (
                        <div key={d.provider_id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, padding: "6px 0", borderBottom: `1px solid ${C.border}` }}>
                          <span style={{ fontSize: 11, color: C.text }}>{d.provider_name}</span>
                          <span style={{ fontSize: 11, color: C.teal, fontWeight: 600 }}>{fmt(d.total_collected)}</span>
                          <span style={{ fontSize: 11, color: C.blue, fontWeight: 600 }}>{fmt(d.total_disbursed)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p style={{ fontSize: 12, color: C.faint }}>No report data available for this date.</p>
              )}
            </div>
            <div style={{ padding: "12px 20px", borderTop: `1px solid ${C.border}`, textAlign: "right" }}>
              <button onClick={() => setSelectedDate(null)} style={{ padding: "6px 16px", borderRadius: 6, border: "none", background: C.teal, color: "white", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Close</button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}