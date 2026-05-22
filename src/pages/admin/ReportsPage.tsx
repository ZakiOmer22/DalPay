// src/pages/admin/ReportsPage.tsx
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FileSpreadsheet,
  Landmark, CheckCircle, Clock, Users,
} from "lucide-react";
import { paymentApi, taxApi, adminApi } from "@/services/api";
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
  return (
    <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden", ...style }} {...rest}>
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

function BarChart({ data, maxValue, height = 20 }: any) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {data.map((item: any) => (
        <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 10, color: C.text, minWidth: 90, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.label}</span>
          <div style={{ flex: 1, height, background: C.bgMuted, borderRadius: 4, overflow: "hidden" }}>
            <div
              style={{
                width: maxValue > 0 ? `${(item.value / maxValue) * 100}%` : "0%",
                height: "100%", background: item.color, borderRadius: 4,
                display: "flex", alignItems: "center", justifyContent: "flex-end",
                paddingRight: 6, minWidth: item.value > 0 ? 24 : 0,
              }}
            >
              {item.value > 0 && <span style={{ fontSize: 9, fontWeight: 600, color: "white" }}>{item.value.toLocaleString()}</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Page Component ─────────────────────────────────────────────
export default function ReportsPage() {
  const { data: assessmentsData } = useQuery({
    queryKey: ["assessments"],
    queryFn: () => taxApi.getAssessments(),
    staleTime: 30000,
  });

  const { data: paymentsData } = useQuery({
    queryKey: ["all-payments-report"],
    queryFn: () => paymentApi.getAllPaymentsAdmin(1, 1000),
    staleTime: 30000,
  });

  const { data: taxpayersData } = useQuery({
    queryKey: ["taxpayers", { page: 1, limit: 1000 }],
    queryFn: () => adminApi.getTaxpayers({ page: 1, limit: 1000 }),
    staleTime: 60000,
  });

  // Normalise assessments
  const assessments = useMemo(() => {
    const raw = assessmentsData?.data as Record<string, any>;
    if (!Array.isArray(raw)) return [];
    return raw.map((item: any) => ({
      id: item.assessment_id || item.id,
      user_id: item.user_id || "",
      tax_type: item.tax_type,
      amount: parseFloat(item.assessed_amount || item.amount || 0),
      status: item.status,
      year: item.assessment_year || item.year,
    }));
  }, [assessmentsData]);

  // Normalise payments
  const payments = useMemo(() => {
    const raw = paymentsData?.data as Record<string, any>;
    let list: any[] = [];
    if (raw?.payments) list = raw.payments;
    else if (Array.isArray(raw)) list = raw;
    return list.map((item: any) => ({
      id: item.id || item.payment_id,
      user_id: item.user_id || "",
      amount: Number(item.amount || 0),
      provider: item.provider || "unknown",
      status: item.status || "pending",
      created_at: item.created_at,
    }));
  }, [paymentsData]);

  // Normalise taxpayers
  const taxpayerMap = useMemo(() => {
    const raw = taxpayersData?.data as Record<string, any>;
    let list: any[] = [];
    if (Array.isArray(raw)) list = raw;
    else if (raw?.taxpayers) list = raw.taxpayers;
    const map: Record<string, string> = {};
    list.forEach((tp: any) => {
      map[tp.id] = tp.full_name || "Unknown";
    });
    return map;
  }, [taxpayersData]);

  const totalAssessed = assessments.reduce((sum, a) => sum + a.amount, 0);
  const totalCollected = payments.filter(p => p.status === "confirmed").reduce((sum, p) => sum + p.amount, 0);
  const totalOutstanding = totalAssessed - totalCollected;
  const collectionRate = totalAssessed > 0 ? ((totalCollected / totalAssessed) * 100).toFixed(1) : "0";
  const taxpayersTotal = Object.keys(taxpayerMap).length || 0;
  const fmt = (val: number) => `USD ${val.toLocaleString()}`;

  // Assessment status breakdown
  const statusBreakdown = useMemo(() => {
    const counts: Record<string, number> = {
      paid: 0,
      unpaid: 0,
      partially_paid: 0,
      overdue: 0,
    };
    assessments.forEach(a => {
      if (counts[a.status] !== undefined) counts[a.status]++;
      else counts[a.status] = (counts[a.status] || 0) + 1;
    });
    return [
      { label: "Paid", value: counts.paid, color: C.teal },
      { label: "Unpaid", value: counts.unpaid, color: C.amber },
      { label: "Partial", value: counts.partially_paid, color: C.purple },
      { label: "Overdue", value: counts.overdue, color: C.red },
    ];
  }, [assessments]);

  // Revenue by provider
  const providerRevenue = useMemo(() => {
    const rev: Record<string, number> = {};
    payments.forEach(p => {
      if (p.status === "confirmed") {
        rev[p.provider] = (rev[p.provider] || 0) + p.amount;
      }
    });
    return Object.entries(rev).map(([label, value]) => ({ label, value, color: C.purple }));
  }, [payments]);

  // Top taxpayers by payment (confirmed)
  const topTaxpayers = useMemo(() => {
    const map: Record<string, number> = {};
    payments.forEach(p => {
      if (p.status === "confirmed") {
        map[p.user_id] = (map[p.user_id] || 0) + p.amount;
      }
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([userId, amount]) => ({
        userId,
        name: taxpayerMap[userId] || "Unknown",
        amount,
      }));
  }, [payments, taxpayerMap]);

  // Recent payments (last 5)
  const recentPayments = useMemo(() => {
    return [...payments].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);
  }, [payments]);

  // Monthly revenue
  const monthlyRevenue = useMemo(() => {
    const revMap: Record<string, number> = {};
    payments.forEach(p => {
      if (p.status === "confirmed" && p.created_at) {
        const d = new Date(p.created_at);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        revMap[key] = (revMap[key] || 0) + p.amount;
      }
    });
    return Object.entries(revMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-12)
      .map(([label, value]) => ({ label, value, color: C.teal }));
  }, [payments]);

  const handleExportPDF = () => {
    const w = window.open("", "_blank");
    if (!w) { toast.error("Please allow popups"); return; }
    const now = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    let h = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>DalPay Financial Report</title><style>
      @page { size: A4; margin: 15mm; }
      body { font-family: 'Segoe UI', Arial, sans-serif; padding: 0; color: #111816; font-size: 10px; }
      .header { border-bottom: 3px solid #0d9e75; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; }
      .header .logo-area { display: flex; align-items: center; gap: 12px; }
      .header img { height: 40px; }
      .header h1 { font-size: 18px; margin: 0; color: #0d9e75; }
      .header .badge { background: #e8f7f2; color: #0a7d5d; padding: 4px 12px; border-radius: 12px; font-size: 9px; font-weight: 600; }
      .summary { display: flex; gap: 12px; margin-bottom: 16px; }
      .summary-box { flex: 1; background: #f7f9f8; padding: 10px 14px; border-radius: 8px; border: 1px solid #e5eae8; }
      .summary-box .label { font-size: 8px; color: #7a918b; text-transform: uppercase; }
      .summary-box .value { font-size: 16px; font-weight: 700; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
      th { background: #0d9e75; color: white; padding: 8px; font-size: 9px; text-transform: uppercase; }
      td { padding: 7px; font-size: 9px; border-bottom: 1px solid #e5eae8; }
      .footer { border-top: 1px solid #e5eae8; padding-top: 10px; font-size: 8px; color: #a0b4ae; text-align: center; }
    </style></head><body>
    <div class="header">
      <div class="logo-area"><img src="/icon.png" alt="DalPay Logo" /><div><h1>DalPay Financial Report</h1><p class="sub">Republic of Somaliland • Ministry of Finance • ${now}</p></div></div>
      <div class="badge">OFFICIAL</div>
    </div>
    <div class="summary">
      <div class="summary-box"><div class="label">Total Assessed</div><div class="value">${fmt(totalAssessed)}</div></div>
      <div class="summary-box"><div class="label">Collected</div><div class="value">${fmt(totalCollected)}</div></div>
      <div class="summary-box"><div class="label">Rate</div><div class="value">${collectionRate}%</div></div>
      <div class="summary-box"><div class="label">Taxpayers</div><div class="value">${taxpayersTotal}</div></div>
    </div>
    <h2>Top Taxpayers</h2>
    <table><thead><tr><th>Name</th><th>Amount Paid</th></tr></thead><tbody>
      ${topTaxpayers.map(tp => `<tr><td>${tp.name}</td><td>${fmt(tp.amount)}</td></tr>`).join("")}
    </tbody></table>
    <h2>Recent Payments</h2>
    <table><thead><tr><th>ID</th><th>Amount</th><th>Provider</th><th>Status</th><th>Date</th></tr></thead><tbody>
      ${recentPayments.map(p => `<tr><td>${(p.id || "").slice(0,8)}</td><td>${fmt(p.amount)}</td><td>${p.provider}</td><td>${p.status}</td><td>${new Date(p.created_at).toLocaleDateString('en-GB')}</td></tr>`).join("")}
    </tbody></table>
    <div class="footer"><span>DalPay Digital Tax System v2.0</span><span>DAL-${Date.now().toString(36).toUpperCase()}</span></div>
    </body></html>`;
    w.document.write(h); w.document.close();
    setTimeout(() => w.print(), 500);
    toast.success("Report generated");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: 0 }}>Financial Reports</h1>
          <p style={{ fontSize: 13, color: C.faint, marginTop: 4 }}>Comprehensive overview of tax revenue and collections</p>
        </div>
        <button onClick={handleExportPDF} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, background: C.blue + "15", border: `1px solid ${C.blue}30`, color: C.blue, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
          <FileSpreadsheet size={13} /> Export Report
        </button>
      </div>

      {/* Key Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
        <StatCard label="Total Assessed" value={fmt(totalAssessed)} icon={Landmark} color={C.blue} sub={`${assessments.length} assessments`} />
        <StatCard label="Collected" value={fmt(totalCollected)} icon={CheckCircle} color={C.teal} sub={`${collectionRate}% rate`} />
        <StatCard label="Outstanding" value={fmt(totalOutstanding)} icon={Clock} color={C.amber} />
        <StatCard label="Taxpayers" value={taxpayersTotal} icon={Users} color={C.purple} />
      </div>

      {/* Collection Progress Bar */}
      <Card>
        <div style={{ padding: "14px 16px", borderBottom: `1px solid ${C.border}` }}><p style={{ fontSize: 12, fontWeight: 600, color: C.text, margin: 0 }}>Collection Progress</p></div>
        <div style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 10, color: C.faint }}>{fmt(totalCollected)} collected of {fmt(totalAssessed)}</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: C.teal }}>{collectionRate}%</span>
          </div>
          <div style={{ height: 8, background: C.bgMuted, borderRadius: 4, overflow: "hidden" }}>
            <div style={{ width: `${collectionRate}%`, height: "100%", background: C.teal, borderRadius: 4, transition: "width .4s ease" }} />
          </div>
        </div>
      </Card>

      {/* Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Card>
          <div style={{ padding: "14px 16px", borderBottom: `1px solid ${C.border}` }}><p style={{ fontSize: 12, fontWeight: 600, color: C.text, margin: 0 }}>Monthly Revenue</p></div>
          <div style={{ padding: "14px 16px" }}>
            {monthlyRevenue.length > 0 ? (
              <BarChart data={monthlyRevenue} maxValue={Math.max(...monthlyRevenue.map(i => i.value), 1)} />
            ) : (
              <p style={{ fontSize: 11, color: C.faint }}>No revenue data yet.</p>
            )}
          </div>
        </Card>
        <Card>
          <div style={{ padding: "14px 16px", borderBottom: `1px solid ${C.border}` }}><p style={{ fontSize: 12, fontWeight: 600, color: C.text, margin: 0 }}>Revenue by Provider</p></div>
          <div style={{ padding: "14px 16px" }}>
            {providerRevenue.length > 0 ? (
              <BarChart data={providerRevenue} maxValue={Math.max(...providerRevenue.map(i => i.value), 1)} />
            ) : (
              <p style={{ fontSize: 11, color: C.faint }}>No payment data.</p>
            )}
          </div>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Card>
          <div style={{ padding: "14px 16px", borderBottom: `1px solid ${C.border}` }}><p style={{ fontSize: 12, fontWeight: 600, color: C.text, margin: 0 }}>Assessment Status</p></div>
          <div style={{ padding: "14px 16px" }}>
            <BarChart data={statusBreakdown} maxValue={Math.max(...statusBreakdown.map(i => i.value), 1)} />
          </div>
        </Card>
        <Card>
          <div style={{ padding: "14px 16px", borderBottom: `1px solid ${C.border}` }}><p style={{ fontSize: 12, fontWeight: 600, color: C.text, margin: 0 }}>Top 5 Taxpayers</p></div>
          <div style={{ padding: "10px 16px" }}>
            {topTaxpayers.length === 0 ? (
              <p style={{ fontSize: 11, color: C.faint }}>No payment data.</p>
            ) : (
              <div>
                {topTaxpayers.map((tp, idx) => (
                  <div key={tp.userId} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: idx < topTaxpayers.length - 1 ? `1px solid ${C.border}` : "none" }}>
                    <span style={{ fontSize: 11, color: C.text, fontWeight: 500 }}>{tp.name}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: C.teal }}>{fmt(tp.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Recent Payments Table */}
      <Card>
        <div style={{ padding: "14px 16px", borderBottom: `1px solid ${C.border}`, background: C.bgMuted }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: C.text, margin: 0 }}>Recent Payments</p>
        </div>
        <div style={{ padding: "10px 16px" }}>
          {recentPayments.length === 0 ? (
            <p style={{ fontSize: 12, color: C.faint }}>No payments recorded.</p>
          ) : (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 100px 100px 120px", gap: 8, padding: "10px 0", borderBottom: `1px solid ${C.border}`, background: C.bgMuted }}>
                {["ID", "Amount", "Provider", "Status", "Date"].map(h => <span key={h} style={{ fontSize: 9, fontWeight: 700, color: C.faint, letterSpacing: ".06em", textTransform: "uppercase" }}>{h}</span>)}
              </div>
              {recentPayments.map(p => (
                <div key={p.id} style={{ display: "grid", gridTemplateColumns: "1fr 100px 100px 100px 120px", gap: 8, padding: "10px 0", borderBottom: `1px solid ${C.border}`, alignItems: "center" }}>
                  <span style={{ fontSize: 11, fontFamily: "monospace", color: C.text }}>{(p.id || "?").slice(0, 8)}…</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: C.teal }}>{fmt(p.amount)}</span>
                  <span style={{ fontSize: 11, color: C.text }}>{p.provider}</span>
                  <Badge label={p.status} color={p.status === "confirmed" ? "green" : p.status === "failed" ? "red" : "amber"} />
                  <span style={{ fontSize: 10, color: C.faint }}>{new Date(p.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}