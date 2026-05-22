// src/pages/taxpayer/CheckBalancePage.tsx
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  TrendingUp, AlertCircle, CheckCircle, Landmark,
} from "lucide-react";
import { request } from "@/services/api";

const C = {
  border: "#e5eae8", bg: "#ffffff", bgPage: "#f0f2f1", bgMuted: "#f7f9f8",
  text: "#111816", muted: "#7a918b", faint: "#a0b4ae",
  teal: "#0d9e75", tealBg: "#e8f7f2", tealText: "#0a7d5d", tealBorder: "#c3e8dc",
  amber: "#f59e0b", amberBg: "#fffbeb", amberText: "#92400e", amberBorder: "#fde68a",
  red: "#e53e3e", redBg: "#fff5f5", redText: "#c53030", redBorder: "#fed7d7",
  blue: "#3b82f6", blueBg: "#eff6ff", blueText: "#1d4ed8", blueBorder: "#bfdbfe",
  purple: "#8b5cf6", purpleBg: "#f5f3ff", purpleText: "#5b21b6",
};

function Card({ children, style, ...rest }: any) {
  return <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden", ...style }} {...rest}>{children}</div>;
}

function Badge({ label, color }: { label?: string | null; color: string }) {
  const safe = label || "—";
  const map: Record<string, any> = {
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

interface Assessment {
  id: string;
  tax_type: string;
  year: number;
  amount: number;
  due_date: string;
  status: "unpaid" | "overdue" | "partially_paid" | "paid";
}

export default function TaxPayerCheckBalancePage() {
  const navigate = useNavigate();

  // Fetch all assessments (or only unpaid/overdue)
  const { data: assessmentsData, isLoading, isError, error } = useQuery({
    queryKey: ["taxpayer-assessments"],
    queryFn: () => request("/tax/assessments"),
  });

  // Fetch summary
  const { data: summaryData } = useQuery({
    queryKey: ["tax-summary"],
    queryFn: () => request("/tax/summary"),
  });

  const rawAssessments = (assessmentsData as any)?.data || [];
  const assessments: Assessment[] = Array.isArray(rawAssessments)
    ? rawAssessments.map((a: any) => ({
        id: a.id || a.assessment_id,
        tax_type: a.tax_type,
        year: a.year || a.assessment_year,
        amount: Number(a.amount || a.assessed_amount || 0),
        due_date: a.due_date || a.payment_due_date,
        status: a.status,
      }))
    : [];

  // Filter only unpaid/overdue for the table
  const outstanding = assessments.filter(a => a.status === "unpaid" || a.status === "overdue");

  const summary = (summaryData as any)?.data || {};
  const totalDue = parseFloat(summary.total_due || 0);
  const totalPaid = parseFloat(summary.total_paid || 0);
  const overdueCount = summary.overdue || 0;
  const complianceRate = totalDue + totalPaid > 0 ? Math.round((totalPaid / (totalDue + totalPaid)) * 100) : 100;

  const formatCurrency = (val: number) => `USD ${val.toLocaleString()}`;

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "300px" }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", border: `3px solid ${C.border}`, borderTopColor: C.teal, animation: "spin 0.7s linear infinite" }} />
      </div>
    );
  }

  if (isError && (error as any)?.status === 401) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <AlertCircle size={40} style={{ margin: "0 auto 16px", color: C.amber }} />
        <p style={{ fontSize: 16, fontWeight: 700 }}>Session Expired</p>
        <button onClick={() => navigate("/login")} style={{ padding: "10px 24px", background: C.teal, color: "white", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600 }}>Go to Login</button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: 0 }}>Check Balance</h1>
        <p style={{ fontSize: 13, color: C.faint, marginTop: 4 }}>View your current tax obligations and payment status</p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        <StatCard label="Total Due" value={formatCurrency(totalDue)} icon={Landmark} color={C.red} sub="Outstanding tax liability" />
        <StatCard label="Total Paid" value={formatCurrency(totalPaid)} icon={CheckCircle} color={C.teal} sub="Lifetime payments" />
        <StatCard label="Overdue Assessments" value={overdueCount} icon={AlertCircle} color={C.red} sub="Needs immediate attention" />
        <StatCard label="Compliance Rate" value={`${complianceRate}%`} icon={TrendingUp} color={complianceRate >= 70 ? C.teal : C.amber} sub="Of total obligations" />
      </div>

      {/* Outstanding Assessments Table */}
      <Card>
        <div style={{ padding: "12px 20px", borderBottom: `1px solid ${C.border}` }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>Outstanding Tax Balance</span>
          {outstanding.length === 0 && <span style={{ float: "right", fontSize: 12, color: C.teal }}>✓ All taxes paid</span>}
        </div>
        {outstanding.length === 0 ? (
          <div style={{ padding: "48px 20px", textAlign: "center", color: C.muted }}>
            <CheckCircle size={32} color={C.teal} style={{ margin: "0 auto 12px" }} />
            <p style={{ fontSize: 13, color: C.muted }}>No outstanding taxes</p>
            <p style={{ fontSize: 12, color: C.faint, marginTop: 4 }}>You are fully compliant. Thank you!</p>
          </div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1.2fr 1.2fr 1fr", gap: 8, padding: "10px 20px", background: C.bgMuted, borderBottom: `1px solid ${C.border}`, fontSize: 10, fontWeight: 700, color: C.faint, textTransform: "uppercase" }}>
              <span>Tax Type</span><span>Year</span><span>Amount</span><span>Due Date</span><span>Status</span>
            </div>
            {outstanding.map((assessment) => (
              <div
                key={assessment.id}
                style={{
                  display: "grid", gridTemplateColumns: "2fr 1fr 1.2fr 1.2fr 1fr", gap: 8,
                  padding: "12px 20px", borderBottom: `1px solid ${C.border}`,
                  cursor: "pointer", transition: "background 0.1s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = C.bgMuted)}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                onClick={() => navigate("/taxpayer/pay", { state: { preselectedAssessment: assessment.id } })}
              >
                <span style={{ textTransform: "capitalize", color: C.text }}>{assessment.tax_type.replace(/_/g, " ")}</span>
                <span style={{ color: C.text }}>{assessment.year}</span>
                <span style={{ fontWeight: 600, color: C.teal }}>{formatCurrency(assessment.amount)}</span>
                <span style={{ color: C.text }}>{new Date(assessment.due_date).toLocaleDateString()}</span>
                <Badge label={assessment.status} color={assessment.status === "overdue" ? "red" : "amber"} />
              </div>
            ))}
          </>
        )}
      </Card>

      {/* Call to action */}
      {outstanding.length > 0 && (
        <div style={{ textAlign: "center", marginTop: 8 }}>
          <button
            onClick={() => navigate("/taxpayer/pay")}
            style={{ padding: "10px 24px", background: C.teal, color: "white", borderRadius: 8, border: "none", fontWeight: 600, cursor: "pointer", fontSize: 13 }}
          >
            Pay Outstanding Taxes
          </button>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}