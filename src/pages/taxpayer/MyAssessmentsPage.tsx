// src/pages/taxpayer/MyAssessmentsPage.tsx
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  FileText, Eye, TrendingUp, AlertCircle, CheckCircle, Clock,
  Filter, Search, Landmark,
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
  created_at?: string;
}

// ─── Assessment Detail Modal ──────────────────────────────────────────
function AssessmentDetailModal({ assessment, isOpen, onClose }: { assessment: Assessment | null; isOpen: boolean; onClose: () => void }) {
  const navigate = useNavigate();

  if (!isOpen || !assessment) return null;

  const formatCurrency = (val: number) => `USD ${val.toLocaleString()}`;
  const isUnpaid = assessment.status === "unpaid" || assessment.status === "overdue";

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={onClose}>
      <Card style={{ width: "90%", maxWidth: 500 }} onClick={(e: any) => e.stopPropagation()}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: 16, fontWeight: 700 }}>Assessment Details</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer" }}>×</button>
        </div>
        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><p style={{ fontSize: 10, color: C.faint }}>Tax Type</p><p style={{ fontSize: 13, fontWeight: 600, textTransform: "capitalize" }}>{assessment.tax_type.replace(/_/g, " ")}</p></div>
            <div><p style={{ fontSize: 10, color: C.faint }}>Year</p><p style={{ fontSize: 13, fontWeight: 600 }}>{assessment.year}</p></div>
            <div><p style={{ fontSize: 10, color: C.faint }}>Amount</p><p style={{ fontSize: 13, fontWeight: 700, color: C.teal }}>{formatCurrency(assessment.amount)}</p></div>
            <div><p style={{ fontSize: 10, color: C.faint }}>Due Date</p><p style={{ fontSize: 13 }}>{new Date(assessment.due_date).toLocaleDateString()}</p></div>
            <div><p style={{ fontSize: 10, color: C.faint }}>Status</p><Badge label={assessment.status} color={assessment.status === "paid" ? "green" : assessment.status === "overdue" ? "red" : "amber"} /></div>
            {assessment.created_at && (
              <div><p style={{ fontSize: 10, color: C.faint }}>Issued</p><p style={{ fontSize: 13 }}>{new Date(assessment.created_at).toLocaleDateString()}</p></div>
            )}
          </div>
          {isUnpaid && (
            <div style={{ marginTop: 8 }}>
              <button
                onClick={() => { onClose(); navigate("/taxpayer/pay", { state: { preselectedAssessment: assessment.id } }); }}
                style={{ width: "100%", padding: "10px", background: C.teal, color: "white", borderRadius: 8, border: "none", fontWeight: 600, cursor: "pointer" }}
              >
                Pay This Assessment
              </button>
            </div>
          )}
          <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
            <button onClick={onClose} style={{ flex: 1, padding: "10px", border: `1px solid ${C.border}`, borderRadius: 8, background: C.bg, cursor: "pointer", fontWeight: 600 }}>Close</button>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────
export default function TaxPayerMyAssessmentsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["taxpayer-assessments"],
    queryFn: () => request("/tax/assessments"),
  });

  const rawAssessments = (data as any)?.data || [];
  const assessments: Assessment[] = Array.isArray(rawAssessments)
    ? rawAssessments.map((a: any) => ({
        id: a.id || a.assessment_id,
        tax_type: a.tax_type,
        year: a.year || a.assessment_year,
        amount: Number(a.amount || a.assessed_amount || 0),
        due_date: a.due_date || a.payment_due_date,
        status: a.status,
        created_at: a.created_at,
      }))
    : [];

  // Available years for filter
  const availableYears = useMemo(() => {
    const years = new Set(assessments.map(a => a.year));
    return Array.from(years).sort((a, b) => b - a);
  }, [assessments]);

  // Filter assessments
  const filteredAssessments = useMemo(() => {
    return assessments.filter(a => {
      const matchesSearch = search === "" || a.tax_type.includes(search) || a.year.toString().includes(search);
      const matchesStatus = statusFilter === "all" || a.status === statusFilter;
      const matchesYear = yearFilter === "all" || a.year.toString() === yearFilter;
      return matchesSearch && matchesStatus && matchesYear;
    });
  }, [assessments, search, statusFilter, yearFilter]);

  const stats = useMemo(() => {
    const totalDue = assessments.reduce((sum, a) => sum + (a.status !== "paid" ? a.amount : 0), 0);
    const totalPaid = assessments.filter(a => a.status === "paid").reduce((sum, a) => sum + a.amount, 0);
    const paidCount = assessments.filter(a => a.status === "paid").length;
    const unpaidCount = assessments.filter(a => a.status === "unpaid").length;
    const overdueCount = assessments.filter(a => a.status === "overdue").length;
    const partiallyPaidCount = assessments.filter(a => a.status === "partially_paid").length;
    return { totalDue, totalPaid, paidCount, unpaidCount, overdueCount, partiallyPaidCount };
  }, [assessments]);

  const formatCurrency = (val: number) => `USD ${val.toLocaleString()}`;

  const handleViewDetails = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    setShowDetailModal(true);
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setYearFilter("all");
  };

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
        <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: 0 }}>My Tax Assessments</h1>
        <p style={{ fontSize: 13, color: C.faint, marginTop: 4 }}>View all your tax obligations and payment status</p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
        <StatCard label="Total Due" value={formatCurrency(stats.totalDue)} icon={Landmark} color={C.red} />
        <StatCard label="Total Paid" value={formatCurrency(stats.totalPaid)} icon={CheckCircle} color={C.teal} />
        <StatCard label="Unpaid" value={stats.unpaidCount} icon={Clock} color={C.amber} />
        <StatCard label="Overdue" value={stats.overdueCount} icon={AlertCircle} color={C.red} />
        <StatCard label="Partially Paid" value={stats.partiallyPaidCount} icon={TrendingUp} color={C.purple} />
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", padding: "12px 16px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, alignItems: "center" }}>
        <Filter size={13} color={C.faint} />
        <div style={{ position: "relative", flex: 1, minWidth: 180 }}>
          <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: C.faint }} />
          <input type="text" placeholder="Search by type or year..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: "100%", padding: "6px 8px 6px 28px", borderRadius: 7, border: `1px solid ${C.border}`, fontSize: 11, outline: "none", background: C.bgPage, color: C.text, fontFamily: "inherit", boxSizing: "border-box" }} />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: "6px 8px", borderRadius: 7, border: `1px solid ${C.border}`, fontSize: 11, outline: "none", background: C.bgPage, color: C.text, fontFamily: "inherit", cursor: "pointer", minWidth: 110 }}>
          <option value="all">All Status</option>
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
          <option value="overdue">Overdue</option>
          <option value="partially_paid">Partially Paid</option>
        </select>
        <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} style={{ padding: "6px 8px", borderRadius: 7, border: `1px solid ${C.border}`, fontSize: 11, outline: "none", background: C.bgPage, color: C.text, fontFamily: "inherit", cursor: "pointer", minWidth: 80 }}>
          <option value="all">All Years</option>
          {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        {(search || statusFilter !== "all" || yearFilter !== "all") && (
          <button onClick={handleClearFilters} style={{ fontSize: 10, color: C.red, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>Clear</button>
        )}
      </div>

      {/* Assessments Table */}
      <Card>
        <div style={{ overflowX: "auto" }}>
          {filteredAssessments.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <FileText size={32} color={C.border} style={{ margin: "0 auto 10px" }} />
              <p style={{ fontSize: 14, fontWeight: 600, color: C.text }}>No assessments found</p>
            </div>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1.2fr 1.2fr 1fr 70px", gap: 8, padding: "10px 20px", borderBottom: `1px solid ${C.border}`, background: C.bgMuted }}>
                {["Tax Type", "Year", "Amount", "Due Date", "Status", ""].map(h => (
                  <span key={h} style={{ fontSize: 10, fontWeight: 700, color: C.faint, letterSpacing: ".06em", textTransform: "uppercase" }}>{h}</span>
                ))}
              </div>
              {filteredAssessments.map((assessment, idx) => (
                <div
                  key={assessment.id}
                  style={{
                    display: "grid", gridTemplateColumns: "2fr 1fr 1.2fr 1.2fr 1fr 70px", gap: 8,
                    padding: "12px 20px", borderBottom: idx < filteredAssessments.length - 1 ? `1px solid ${C.border}` : "none",
                    alignItems: "center", transition: "background 0.1s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = C.bgMuted}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <span style={{ textTransform: "capitalize", color: C.text }}>{assessment.tax_type.replace(/_/g, " ")}</span>
                  <span style={{ color: C.text }}>{assessment.year}</span>
                  <span style={{ fontWeight: 600, color: C.teal }}>{formatCurrency(assessment.amount)}</span>
                  <span style={{ color: C.text }}>{new Date(assessment.due_date).toLocaleDateString()}</span>
                  <Badge label={assessment.status} color={assessment.status === "paid" ? "green" : assessment.status === "overdue" ? "red" : "amber"} />
                  <button onClick={() => handleViewDetails(assessment)} style={{ background: "none", border: "none", cursor: "pointer", color: C.teal, display: "flex", alignItems: "center", gap: 4 }}>
                    <Eye size={14} /> <span style={{ fontSize: 11, fontWeight: 500 }}>View</span>
                  </button>
                </div>
              ))}
            </>
          )}
        </div>
      </Card>

      <AssessmentDetailModal assessment={selectedAssessment} isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}