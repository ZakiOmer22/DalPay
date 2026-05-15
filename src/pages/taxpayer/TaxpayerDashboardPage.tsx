import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CreditCard, FileText, Clock, AlertCircle, CheckCircle,
  ChevronRight, TrendingUp, TrendingDown, ShieldCheck,
  Receipt, Wallet,
} from "lucide-react";
import { request, clearTokens } from "@/services/api";   // ★ your real API
import toast from "react-hot-toast";

// ─── Design tokens (identical to dental dashboard) ──────────────────────
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
  tealBorder: "#c3e8dc",
  amber: "#f59e0b",
  amberBg: "#fffbeb",
  amberText: "#92400e",
  amberBorder: "#fde68a",
  red: "#e53e3e",
  redBg: "#fff5f5",
  redText: "#c53030",
  redBorder: "#fed7d7",
  blue: "#3b82f6",
  blueBg: "#eff6ff",
  blueText: "#1d4ed8",
  blueBorder: "#bfdbfe",
  purple: "#8b5cf6",
  purpleBg: "#f5f3ff",
  purpleText: "#5b21b6",
};

// ─── Re‑usable primitives (exactly as you had) ─────────────────────────
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden", ...style }}>
      {children}
    </div>
  );
}

function SectionHead({
  title, sub, action, icon: Icon, iconColor,
}: {
  title: string; sub?: string;
  action?: { label: string; onClick: () => void };
  icon?: React.ElementType; iconColor?: string;
}) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "14px 18px", borderBottom: `1px solid ${C.border}`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {Icon && (
          <div style={{
            width: 28, height: 28, borderRadius: 7,
            background: (iconColor ?? C.teal) + "18",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon size={13} color={iconColor ?? C.teal} strokeWidth={2} />
          </div>
        )}
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{title}</p>
          {sub && <p style={{ fontSize: 11, color: C.faint, marginTop: 1 }}>{sub}</p>}
        </div>
      </div>
      {action && (
        <button onClick={action.onClick} style={{
          display: "flex", alignItems: "center", gap: 3,
          fontSize: 12, fontWeight: 600, color: C.teal,
          background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", padding: 0,
        }}>
          {action.label} <ChevronRight size={12} />
        </button>
      )}
    </div>
  );
}

function Badge({ label, color }: { label: string; color: "green" | "amber" | "red" | "blue" | "gray" | "purple" }) {
  const map = {
    green: { bg: C.tealBg, text: C.tealText, border: C.tealBorder },
    amber: { bg: C.amberBg, text: C.amberText, border: C.amberBorder },
    red: { bg: C.redBg, text: C.redText, border: C.redBorder },
    blue: { bg: C.blueBg, text: C.blueText, border: C.blueBorder },
    gray: { bg: C.bgMuted, text: C.muted, border: C.border },
    purple: { bg: C.purpleBg, text: C.purpleText, border: "#ddd6fe" },
  }[color];
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 100,
      background: map.bg, color: map.text, border: `1px solid ${map.border}`,
      whiteSpace: "nowrap", textTransform: "capitalize",
    }}>
      {label.replace(/_/g, " ")}
    </span>
  );
}

function Avi({ name, size = 30 }: { name: string; size?: number }) {
  const initials = name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: "linear-gradient(135deg,#0d9e75,#0a7d5d)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.37, fontWeight: 700, color: "white", flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

function KpiCard({ label, value, sub, trend, trendUp, icon: Icon, color }: {
  label: string; value: string | number; sub?: string;
  trend?: string; trendUp?: boolean;
  icon: React.ElementType; color: string;
}) {
  return (
    <Card>
      <div style={{ padding: "16px 18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
          <span style={{ fontSize: 12, color: C.muted, fontWeight: 500 }}>{label}</span>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: color + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon size={14} color={color} strokeWidth={1.8} />
          </div>
        </div>
        <p style={{ fontSize: 26, fontWeight: 700, color: C.text, letterSpacing: "-.03em", lineHeight: 1 }}>{value}</p>
        {sub && <p style={{ fontSize: 11, color: C.faint, marginTop: 4 }}>{sub}</p>}
        {trend && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 8, fontSize: 11 }}>
            {trendUp !== undefined && (trendUp ? <TrendingUp size={11} color={C.teal} /> : <TrendingDown size={11} color={C.red} />)}
            <span style={{ color: trendUp ? C.tealText : C.redText }}>{trend}</span>
          </div>
        )}
      </div>
    </Card>
  );
}

function DonutChart({ segments, size = 84 }: {
  segments: { color: string; value: number; label: string }[];
  size?: number;
}) {
  const total = segments.reduce((s, d) => s + d.value, 0);
  const r = 28, cx = size / 2, cy = size / 2;
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
        {segments.map((seg, i) => {
          const pct = seg.value / total;
          const dash = circumference * pct;
          const gap = circumference - dash;
          const el = (
            <circle
              key={i}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={10}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-offset * circumference / total + circumference * 0.25}
              style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
            />
          );
          offset += seg.value;
          return el;
        })}
        <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 13, fontWeight: 700, fill: C.text }}>
          {total}
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 8, fill: C.faint }}>
          total
        </text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {segments.map((s) => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: C.muted }}>{s.label}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.text, marginLeft: "auto", paddingLeft: 8 }}>{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Activity({ size = 15, strokeWidth = 1.8, style }: { size?: number; strokeWidth?: number; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

function statusColor(s: string): "green" | "amber" | "red" | "blue" | "gray" {
  const m: Record<string, "green" | "amber" | "red" | "blue" | "gray"> = {
    paid: "green", confirmed: "green", reconciled: "blue",
    pending: "amber", overdue: "red", failed: "red",
    initiated: "gray", pending_confirmation: "amber",
  };
  return m[s] ?? "gray";
}

// ─── Types ─────────────────────────────────────────────────────────────
interface Assessment {
  assessment_id: string;
  assessment_type_name?: string;
  assessment_year: number;
  assessed_amount: string;
  payment_due_date: string;
  status: string;
}
interface Payment {
  payment_id: string;
  provider_name?: string;
  payment_amount: string;
  payment_date: string;
  transaction_reference?: string;
  payment_status: string;
}
interface DashboardSummary {
  assessments?: { total_due?: string; pending?: number; overdue?: number; paid?: number };
  payments?: { total_paid?: string; total_payments?: number };
}

// ─── Main Dashboard Component ──────────────────────────────────────────
export default function TaxpayerDashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  const loadData = async () => {
    try {
      const [summaryRes, assessmentsRes, paymentsRes] = await Promise.all([
        request("/tax/summary"),
        request("/tax/assessments"),
        request("/payment/history?page=1&limit=10"),
      ]);
      // @ts-ignore
      setSummary(summaryRes.data);
      // @ts-ignore
      setAssessments(assessmentsRes.data || []);
      // @ts-ignore
      setPayments(paymentsRes.data?.payments || []);
    } catch (err: any) {
      // @ts-ignore
      if (err.status === 401) {
        clearTokens();
        navigate("/login", { replace: true });
        toast.error("Session expired. Please log in again.");
      } else {
        toast.error(err.message || "Could not load dashboard data.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "60px 0", textAlign: "center", color: C.faint }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", border: `3px solid #e2e8f0`, borderTopColor: C.teal, animation: "spin 0.7s linear infinite", margin: "0 auto 16px" }} />
        <p style={{ fontSize: 13 }}>Loading your dashboard…</p>
      </div>
    );
  }

  // ── Derived figures ────────────────────────────────────────────────
  const totalDue = parseFloat(summary?.assessments?.total_due || "0");
  const totalPaid = parseFloat(summary?.payments?.total_paid || "0");
  const pendingCount = summary?.assessments?.pending || 0;
  const overdueCount = summary?.assessments?.overdue || 0;
  const paidCount = summary?.assessments?.paid || 0;
  const complianceRate = totalDue + totalPaid > 0
    ? Math.round((totalPaid / (totalDue + totalPaid)) * 100)
    : 0;

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .dash-section { animation: fadeUp .4s ease both; }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Overdue banner */}
        {overdueCount > 0 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", background: C.amberBg, border: `1px solid ${C.amberBorder}`, borderRadius: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <AlertCircle size={14} color={C.amber} />
              <span style={{ fontSize: 13, fontWeight: 500, color: C.amberText }}>
                {overdueCount} overdue assessment{overdueCount > 1 ? "s" : ""} — pay now to stay compliant
              </span>
            </div>
            <button onClick={() => navigate("/taxpayer/pay")} style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 12, fontWeight: 600, color: C.amberText, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
              Pay Now <ChevronRight size={12} />
            </button>
          </div>
        )}

        {/* Page title & actions */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: 21, fontWeight: 700, color: C.text, letterSpacing: "-.02em" }}>Dashboard</h1>
            <p style={{ fontSize: 13, color: C.faint, marginTop: 2 }}>{today}</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => navigate("/taxpayer/pay")} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 8, background: C.teal + "15", border: `1px solid ${C.teal}30`, color: C.teal, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              <CreditCard size={12} /> Pay Tax
            </button>
            <button onClick={() => navigate("/taxpayer/history")} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 8, background: C.blue + "15", border: `1px solid ${C.blue}30`, color: C.blue, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              <Receipt size={12} /> Payment History
            </button>
          </div>
        </div>

        {/* KPI row */}
        <div className="dash-section" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
          <KpiCard label="Total Due" value={`$${totalDue.toLocaleString()}`} icon={FileText} color={C.red} trend={`${pendingCount + overdueCount} outstanding`} trendUp={false} />
          <KpiCard label="Total Paid" value={`$${totalPaid.toLocaleString()}`} icon={CheckCircle} color={C.teal} trend={`${paidCount} assessments settled`} trendUp />
          <KpiCard label="Compliance Rate" value={`${complianceRate}%`} icon={ShieldCheck} color={complianceRate >= 70 ? C.teal : C.amber} sub="Of total obligations" trend={complianceRate >= 70 ? "Good standing" : "Needs attention"} trendUp={complianceRate >= 70} />
          <KpiCard label="Pending Actions" value={pendingCount + overdueCount} icon={Clock} color={C.amber} sub={`${overdueCount} overdue · ${pendingCount} pending`} trend={overdueCount > 0 ? `${overdueCount} need attention` : "All up to date"} trendUp={overdueCount === 0} />
        </div>

        {/* Row 2: Assessments table + status donut + quick links */}
        <div className="dash-section" style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 14 }}>
          <Card>
            <SectionHead title="Recent Assessments" sub={`${assessments.length} on record`} icon={FileText} action={{ label: "All assessments", onClick: () => navigate("/taxpayer/assessments") }} />
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 90px 80px", gap: 8, padding: "8px 18px", borderBottom: `1px solid ${C.border}`, background: C.bgMuted }}>
                {["Assessment", "Year", "Amount", "Status"].map((h) => (
                  <span key={h} style={{ fontSize: 10, fontWeight: 700, color: C.faint, letterSpacing: ".06em", textTransform: "uppercase" }}>{h}</span>
                ))}
              </div>
              {assessments.length === 0 ? (
                <div style={{ padding: "40px 18px", textAlign: "center" }}>
                  <FileText size={30} color={C.border} style={{ margin: "0 auto 8px", display: "block" }} />
                  <p style={{ fontSize: 13, color: C.faint }}>No assessments found</p>
                </div>
              ) : (
                assessments.slice(0, 6).map((a, i) => (
                  <div key={a.assessment_id} onClick={() => navigate(`/taxpayer/assessments/${a.assessment_id}`)} style={{
                    display: "grid", gridTemplateColumns: "1fr 80px 90px 80px", gap: 8,
                    padding: "11px 18px", borderBottom: i < assessments.length - 1 ? `1px solid ${C.border}` : "none",
                    cursor: "pointer", transition: "background .1s", alignItems: "center",
                  }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = C.bgMuted)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                      <div style={{ width: 26, height: 26, borderRadius: 7, background: C.tealBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <FileText size={13} color={C.teal} />
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 500, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.assessment_type_name || "Tax Assessment"}</span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{a.assessment_year}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>${parseFloat(a.assessed_amount).toLocaleString()}</span>
                    <Badge label={a.status} color={statusColor(a.status)} />
                  </div>
                ))
              )}
            </div>
          </Card>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Card>
              <SectionHead title="Assessment Status" icon={Activity} />
              <div style={{ padding: "14px 18px" }}>
                <DonutChart size={84} segments={[
                  { color: C.teal, value: paidCount, label: "Paid" },
                  { color: C.amber, value: pendingCount, label: "Pending" },
                  { color: C.red, value: overdueCount, label: "Overdue" },
                ].filter((s) => s.value > 0)} />
              </div>
            </Card>
            {[
              { label: "Pay Tax", icon: CreditCard, color: C.teal, path: "/taxpayer/pay" },
              { label: "Calculator", icon: TrendingUp, color: C.blue, path: "/taxpayer/calculator" },
              { label: "Balance", icon: Wallet, color: C.purple, path: "/taxpayer/balance" },
            ].map((item) => (
              <button key={item.label} onClick={() => navigate(item.path)} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "11px 14px",
                background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, cursor: "pointer",
                transition: "all .15s", fontFamily: "inherit", width: "100%", textAlign: "left",
              }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = item.color; e.currentTarget.style.background = item.color + "08"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.bg; }}
              >
                <div style={{ width: 30, height: 30, borderRadius: 8, background: item.color + "15", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <item.icon size={14} color={item.color} strokeWidth={1.8} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 500, color: C.text, flex: 1 }}>{item.label}</span>
                <ChevronRight size={12} color={C.faint} />
              </button>
            ))}
          </div>
        </div>

        {/* Row 3: Recent Payments */}
        <div className="dash-section">
          <Card>
            <SectionHead title="Recent Payments" icon={CreditCard} iconColor={C.teal} action={{ label: "Full history", onClick: () => navigate("/taxpayer/history") }} />
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 90px 80px 80px", gap: 8, padding: "8px 18px", borderBottom: `1px solid ${C.border}`, background: C.bgMuted }}>
                {["Provider", "Amount", "Status", "Date"].map((h) => (
                  <span key={h} style={{ fontSize: 10, fontWeight: 700, color: C.faint, letterSpacing: ".06em", textTransform: "uppercase" }}>{h}</span>
                ))}
              </div>
              {payments.length === 0 ? (
                <div style={{ padding: "44px 18px", textAlign: "center" }}>
                  <CreditCard size={30} color={C.border} style={{ margin: "0 auto 8px", display: "block" }} />
                  <p style={{ fontSize: 13, color: C.faint }}>No payments recorded yet</p>
                </div>
              ) : (
                payments.slice(0, 8).map((p, i) => (
                  <div key={p.payment_id} style={{
                    display: "grid", gridTemplateColumns: "1fr 90px 80px 80px", gap: 8,
                    padding: "11px 18px", borderBottom: i < payments.length - 1 ? `1px solid ${C.border}` : "none",
                    cursor: "pointer", transition: "background .1s", alignItems: "center",
                  }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = C.bgMuted)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                      <Avi name={p.provider_name || "MO"} size={26} />
                      <span style={{ fontSize: 13, fontWeight: 500, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.provider_name || "Mobile Money"}</span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>${parseFloat(p.payment_amount).toLocaleString()}</span>
                    <Badge label={p.payment_status} color={statusColor(p.payment_status)} />
                    <span style={{ fontSize: 11, color: C.faint }}>{new Date(p.payment_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Compliance tip */}
        {overdueCount > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 18px", background: C.amberBg, border: `1px solid ${C.amberBorder}`, borderRadius: 10, marginTop: 4 }}>
            <AlertCircle size={16} color={C.amber} style={{ flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: C.amberText }}>Avoid penalties</p>
              <p style={{ fontSize: 11, color: C.amberText, opacity: 0.8 }}>Pay overdue assessments now to keep your compliance status.</p>
            </div>
            <button onClick={() => navigate("/taxpayer/pay")} style={{ padding: "7px 16px", borderRadius: 8, background: C.amber, color: "white", fontWeight: 600, fontSize: 12, border: "none", cursor: "pointer", fontFamily: "inherit" }}>
              Pay Now
            </button>
          </div>
        )}
      </div>
    </>
  );
}