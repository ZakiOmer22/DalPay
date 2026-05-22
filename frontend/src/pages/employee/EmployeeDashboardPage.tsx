// src/pages/employee/EmployeeDashboardPage.tsx
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  CreditCard, FileText, AlertCircle, CheckCircle,
  ChevronRight, TrendingUp, TrendingDown, ShieldCheck,
  Receipt, Users,
} from "lucide-react";
import { request } from "@/services/api";

// ─── Design tokens (identical to taxpayer dashboard) ────────────────
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

// ─── Re‑usable primitives ─────────────────────────────────────────────
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

function Badge({ label, color }: { label: string | null | undefined; color: "green" | "amber" | "red" | "blue" | "gray" | "purple" }) {
  const safeLabel = (label ?? "unknown").replace(/_/g, " ");
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
      {safeLabel}
    </span>
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

function DonutChart({ segments, size = 84 }: {
  segments: { color: string; value: number; label: string }[];
  size?: number;
}) {
  const total = segments.reduce((s, d) => s + d.value, 0);
  const r = 28, cx = size / 2, cy = size / 2;
  const circumference = 2 * Math.PI * r;

  const cumulative = segments.reduce<number[]>((acc, seg, idx) => {
    acc.push(seg.value + (acc[idx - 1] || 0));
    return acc;
  }, []);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
        {segments.map((seg, i) => {
          const pct = total > 0 ? seg.value / total : 0;
          const dash = circumference * pct;
          const gap = circumference - dash;
          const offset = i === 0 ? 0 : cumulative[i - 1];
          return (
            <circle
              key={i}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={10}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={total > 0 ? -(offset / total) * circumference + circumference * 0.25 : 0}
              style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
            />
          );
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

// ─── Correct response types ────────────────────────────────────────────
interface TaxpayerCount {
  total: number;
  taxpayers: any[];
}
interface Assessment {
  id: string;
  assessment_type_name?: string;
  assessment_year?: number;
  amount?: string;
  status: string;
  user_id?: string;
}
interface Payment {
  id: string;
  provider?: string;
  amount?: string;
  status: string;
  created_at?: string;
}

// ─── Main Employee Dashboard Component ─────────────────────────────────
export default function EmployeeDashboardPage() {
  const navigate = useNavigate();
  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  // 1. Total taxpayers
  const { data: taxpayersRes } = useQuery({
    queryKey: ["employee-taxpayers-count"],
    queryFn: () => request<TaxpayerCount>("/admin/taxpayers?limit=1"),
    staleTime: 60000,
    placeholderData: { success: true, message: "", data: { total: 0, taxpayers: [] } },
  });

  // 2. All assessments (returns array directly)
  const { data: assessmentsRes } = useQuery({
    queryKey: ["employee-assessments"],
    queryFn: () => request<Assessment[]>("/admin/assessments"),
    staleTime: 30000,
    placeholderData: { success: true, message: "", data: [] },
  });

  // 3. Recent payments (returns object with payments array)
  const { data: paymentsRes } = useQuery({
    queryKey: ["employee-payments"],
    queryFn: () => request<{ payments: Payment[] }>("/payment/admin/all?limit=10"),
    staleTime: 30000,
    placeholderData: { success: true, message: "", data: { payments: [] } },
  });

  const totalTaxpayers = taxpayersRes?.data?.total || 0;
  const assessments: Assessment[] = assessmentsRes?.data || [];
  const payments: Payment[] = paymentsRes?.data?.payments || [];

  // Derived counts
  const pendingCount = assessments.filter(a => a.status === "unpaid" || a.status === "pending" || a.status === "partially_paid").length;
  const overdueCount = assessments.filter(a => a.status === "overdue").length;
  const paidCount = assessments.filter(a => a.status === "paid").length;
  const totalDue = assessments.reduce((sum, a) => sum + (parseFloat(a.amount || "0")), 0);
  const totalPaid = payments.reduce((sum, p) => p.status === "confirmed" ? sum + parseFloat(p.amount || "0") : sum, 0);
  const complianceRate = totalDue + totalPaid > 0 ? Math.round((totalPaid / (totalDue + totalPaid)) * 100) : 0;

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .dash-section { animation: fadeUp .4s ease both; }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Page title & actions */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: 21, fontWeight: 700, color: C.text, letterSpacing: "-.02em" }}>Staff Dashboard</h1>
            <p style={{ fontSize: 13, color: C.faint, marginTop: 2 }}>{today}</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => navigate("/employee/taxpayers")} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 8, background: C.teal + "15", border: `1px solid ${C.teal}30`, color: C.teal, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              <Users size={12} /> Taxpayers
            </button>
            <button onClick={() => navigate("/employee/payments")} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 8, background: C.blue + "15", border: `1px solid ${C.blue}30`, color: C.blue, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              <Receipt size={12} /> Payments
            </button>
          </div>
        </div>

        {/* KPI row */}
        <div className="dash-section" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
          <KpiCard label="Registered Taxpayers" value={totalTaxpayers} icon={Users} color={C.teal} sub="Total citizens in system" />
          <KpiCard label="Open Assessments" value={assessments.length} icon={FileText} color={C.amber} trend={`${pendingCount + overdueCount} outstanding`} trendUp={false} />
          <KpiCard label="Total Paid (All)" value={`$${totalPaid.toLocaleString()}`} icon={CheckCircle} color={C.teal} trend={`${payments.length} transactions`} trendUp />
          <KpiCard label="Compliance Rate" value={`${complianceRate}%`} icon={ShieldCheck} color={complianceRate >= 70 ? C.teal : C.amber} sub="Across all taxpayers" />
        </div>

        {/* Row 2: Assessments table + donut + quick links */}
        <div className="dash-section" style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 14 }}>
          <Card>
            <SectionHead title="Recent Assessments" sub={`${assessments.length} on record`} icon={FileText} action={{ label: "All assessments", onClick: () => navigate("/employee/assessments") }} />
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
                  <div
                    key={a.id || i}
                    onClick={() => navigate(`/employee/taxpayers/${a.user_id}`)}
                    style={{
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
                      <span style={{ fontSize: 13, fontWeight: 500, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {a.assessment_type_name || "Tax Assessment"}
                      </span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{a.assessment_year}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>${parseFloat(a.amount || "0").toLocaleString()}</span>
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
              { label: "Search Taxpayers", icon: Users, color: C.teal, path: "/employee/taxpayers" },
              { label: "View Payments", icon: CreditCard, color: C.blue, path: "/employee/payments" },
              { label: "Assessments", icon: FileText, color: C.purple, path: "/employee/assessments" },
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

        {/* Recent Payments */}
        <div className="dash-section">
          <Card>
            <SectionHead title="Recent Payments" icon={CreditCard} iconColor={C.teal} action={{ label: "Full history", onClick: () => navigate("/employee/payments") }} />
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
                  <div
                    key={p.id || i}
                    style={{
                      display: "grid", gridTemplateColumns: "1fr 90px 80px 80px", gap: 8,
                      padding: "11px 18px",
                      borderBottom: `1px solid ${C.border}`,
                      cursor: "pointer", transition: "background .1s", alignItems: "center",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = C.bgMuted)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                      <Avi name={p.provider || "MO"} size={26} />
                      <span style={{ fontSize: 13, fontWeight: 500, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {p.provider || "Mobile Money"}
                      </span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>
                      ${parseFloat(p.amount || "0").toLocaleString()}
                    </span>
                    <Badge label={p.status} color={statusColor(p.status)} />
                    <span style={{ fontSize: 11, color: C.faint }}>
                      {p.created_at ? new Date(p.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "N/A"}
                    </span>
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
              <p style={{ fontSize: 13, fontWeight: 600, color: C.amberText }}>Overdue Assessments</p>
              <p style={{ fontSize: 11, color: C.amberText, opacity: 0.8 }}>Some taxpayers have overdue payments. Assist them in paying immediately.</p>
            </div>
            <button onClick={() => navigate("/employee/assessments")} style={{ padding: "7px 16px", borderRadius: 8, background: C.amber, color: "white", fontWeight: 600, fontSize: 12, border: "none", cursor: "pointer", fontFamily: "inherit" }}>
              View
            </button>
          </div>
        )}
      </div>
    </>
  );
}