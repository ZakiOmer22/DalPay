// src/pages/admin/FraudPage.tsx
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Shield, AlertTriangle, Search, BarChart3,
  FileSpreadsheet, X, RefreshCw,
  Activity
} from "lucide-react";
import { request, paymentApi, adminApi } from "@/services/api";
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
  // REMOVED overflow: "hidden" so dropdowns inside are not clipped
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

function StatCard({ label, value, icon: Icon, color, sub }: any) {
  return (
    <Card>
      <div style={{ padding: "14px 16px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 6,
          }}
        >
          <span
            style={{
              fontSize: 10,
              color: C.faint,
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: ".04em",
            }}
          >
            {label}
          </span>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 7,
              background: color + "15",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon size={13} color={color} strokeWidth={1.8} />
          </div>
        </div>
        <p style={{ fontSize: 20, fontWeight: 700, color: C.text, margin: 0 }}>
          {value}
        </p>
        {sub && <p style={{ fontSize: 9, color: C.faint, marginTop: 3 }}>{sub}</p>}
      </div>
    </Card>
  );
}

// ── Searchable dropdown component ──────────────────────────────
function SearchableSelect({
  value,
  onChange,
  options,
  placeholder,
  loading,
}: {
  value: string;
  onChange: (val: string) => void;
  options: { id: string; label: string }[];
  placeholder: string;
  loading?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return options.slice(0, 10);
    const s = search.toLowerCase();
    return options
      .filter(
        (o) =>
          o.id.toLowerCase().includes(s) || o.label.toLowerCase().includes(s)
      )
      .slice(0, 10);
  }, [options, search]);

  const selectedLabel = options.find((o) => o.id === value)?.label ?? value;

  return (
    <div style={{ position: "relative", flex: 1 }}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          padding: "6px 12px",
          borderRadius: 8,
          border: `1px solid ${C.border}`,
          fontSize: 13,
          outline: "none",
          fontFamily: "inherit",
          cursor: "pointer",
          background: C.bg,
          color: value ? C.text : C.faint,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          minWidth: 150,
        }}
      >
        <span
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {value ? selectedLabel : placeholder}
        </span>
        <Search size={13} color={C.faint} />
      </div>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 100, // raised high enough to be above everything
            background: C.bg,
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            maxHeight: 250,
            overflow: "auto",
            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
            marginTop: 4,
          }}
        >
          <div
            style={{
              padding: "6px 10px",
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "6px 8px",
                borderRadius: 6,
                border: `1px solid ${C.border}`,
                fontSize: 12,
                outline: "none",
                fontFamily: "inherit",
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          {loading ? (
            <div
              style={{ padding: "16px", textAlign: "center", color: C.faint }}
            >
              Loading...
            </div>
          ) : filtered.length === 0 ? (
            <div
              style={{ padding: "16px", textAlign: "center", color: C.faint }}
            >
              No results
            </div>
          ) : (
            filtered.map((opt) => (
              <div
                key={opt.id}
                onClick={() => {
                  onChange(opt.id);
                  setOpen(false);
                  setSearch("");
                }}
                style={{
                  padding: "8px 12px",
                  cursor: "pointer",
                  fontSize: 12,
                  background: value === opt.id ? C.tealBg : "transparent",
                  color: C.text,
                  borderBottom: `1px solid ${C.border}`,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = C.bgMuted)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background =
                    value === opt.id ? C.tealBg : "transparent")
                }
              >
                {opt.label}
              </div>
            ))
          )}
        </div>
      )}
      {open && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 99 }}
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  );
}

// ── API helpers ─────────────────────────────────────────────
const fraudApi = {
  getFlags: () => request("/dashboard/fraud-flags"),
  analyzeUser: (userId: string) =>
    request(`/fraud/analyze-user/${userId}`),
  analyzePayment: (paymentId: string) =>
    request(`/fraud/analyze-payment/${paymentId}`, { method: "POST" }),
  // Batch analysis for all tax assessments
  analyzeAllAssessments: () =>
    request("/fraud/analyze-all-assessments", { method: "POST" }),
};

export default function FraudPage() {
  const navigate = useNavigate();
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedPaymentId, setSelectedPaymentId] = useState("");
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false); // for the new bulk button

  // Fetch recent high-risk payments (fraud flags)
  const {
    data: flagsData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["fraud-flags"],
    queryFn: fraudApi.getFlags,
    staleTime: 30000,
  });

  // Fetch taxpayers for user dropdown
  const { data: taxpayersData } = useQuery({
    queryKey: ["taxpayers-dropdown", { page: 1, limit: 1000 }],
    queryFn: () => adminApi.getTaxpayers({ page: 1, limit: 1000 }),
    staleTime: 60000,
  });

  // Fetch all payments for payment dropdown
  const { data: allPaymentsData } = useQuery({
    queryKey: ["all-payments-dropdown"],
    queryFn: () => paymentApi.getAllPaymentsAdmin(1, 1000),
    staleTime: 60000,
  });

  // ---------- HELPER FUNCTIONS ----------
  const fmt = (val: number) => `SOS ${val.toLocaleString()}`;
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  // ---------- DROPDOWN OPTIONS ----------
  const userOptions = useMemo(() => {
    let list: any[] = [];
    const raw = taxpayersData?.data as any;
    if (Array.isArray(raw)) list = raw;
    else if (raw?.taxpayers) list = raw.taxpayers;
    return list.map((tp: any) => ({
      id: tp.id,
      label: `${tp.full_name || "Unknown"} (${tp.id?.slice(0, 8)}…)`,
    }));
  }, [taxpayersData]);

  const paymentOptions = useMemo(() => {
    let list: any[] = [];
    const raw = allPaymentsData?.data as any;
    if (Array.isArray(raw)) list = raw;
    else if (raw?.payments) list = raw.payments;
    return list.map((p: any) => ({
      id: p.id,
      label: `${p.amount ? fmt(p.amount) : "?"} • ${p.provider || "?"} (${p.id?.slice(0, 8)}…)`,
    }));
  }, [allPaymentsData]);

  const flags = (flagsData?.data as any[]) || [];
  const suspiciousCount = flags.filter(
    (f: any) =>
      f.fraud_status === "suspicious" ||
      (f.risk_score >= 0.6 && f.risk_score < 0.8)
  ).length;
  const highRiskCount = flags.filter(
    (f: any) => f.fraud_status === "high_risk" || f.risk_score >= 0.8
  ).length;

  // ---------- HANDLERS ----------
  const handleAnalyzeUser = async () => {
    if (!selectedUserId.trim()) {
      toast.error("Select a user");
      return;
    }
    setAnalysisLoading(true);
    try {
      const res = await fraudApi.analyzeUser(selectedUserId.trim());
      setAnalysisResult(res.data || res);
      setShowAnalysisModal(true);
      toast.success("AI analysis completed");
    } catch (err: any) {
      toast.error(err.message || "Analysis failed");
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleAnalyzePayment = async () => {
    if (!selectedPaymentId.trim()) {
      toast.error("Select a payment");
      return;
    }
    setAnalysisLoading(true);
    try {
      const res = await fraudApi.analyzePayment(selectedPaymentId.trim());
      setAnalysisResult(res.data || res);
      setShowAnalysisModal(true);
      toast.success("AI analysis completed");
    } catch (err: any) {
      toast.error(err.message || "Analysis failed");
    } finally {
      setAnalysisLoading(false);
    }
  };

  // Bulk analyze all tax assessments
  const handleBulkAnalysis = async () => {
    setBulkLoading(true);
    try {
      const res = await fraudApi.analyzeAllAssessments();
      setAnalysisResult(res.data || res);
      setShowAnalysisModal(true);
      toast.success("Bulk analysis completed");
    } catch (err: any) {
      toast.error(err.message || "Bulk analysis failed");
    } finally {
      setBulkLoading(false);
    }
  };

  // Export PDF
  const handleExportPDF = () => {
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
    let h = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>DalPay Fraud Report</title><style>
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
      <div class="logo-area"><img src="/icon.png" alt="DalPay Logo" /><div><h1>DalPay Fraud Report</h1><p class="sub">Republic of Somaliland • Ministry of Finance • ${now}</p></div></div>
      <div class="badge">OFFICIAL</div>
    </div>
    <table><thead><tr><th>Payment ID</th><th>Amount</th><th>Provider</th><th>Fraud Status</th><th>Date</th></tr></thead><tbody>`;
    flags.forEach((f: any) => {
      h += `<tr>
        <td style="font-size:8px;">${(f.id || f.payment_id || "").slice(0, 8)}</td>
        <td>${fmt(f.amount || 0)}</td>
        <td>${f.provider || "—"}</td>
        <td>${f.fraud_status || "none"}</td>
        <td>${formatDate(f.created_at)}</td>
      </tr>`;
    });
    h += `</tbody></table><div class="footer"><span>DalPay Digital Tax System v2.0</span><span>DAL-${Date.now().toString(36).toUpperCase()}</span></div></body></html>`;
    w.document.write(h);
    w.document.close();
    setTimeout(() => w.print(), 500);
    toast.success("Fraud report exported");
  };

  // ---------- EARLY RETURN FOR 401 ----------
  if (isError && (error as any)?.status === 401) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <AlertTriangle
          size={40}
          style={{ margin: "0 auto 16px", color: C.amber }}
        />
        <p
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: C.text,
            marginBottom: 8,
          }}
        >
          Session Expired
        </p>
        <button
          onClick={() => navigate("/login")}
          style={{
            padding: "10px 24px",
            background: C.teal,
            color: "white",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: 13,
            fontFamily: "inherit",
          }}
        >
          Go to Login
        </button>
      </div>
    );
  }

  // ---------- MAIN RENDER ----------
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: C.text,
              margin: 0,
            }}
          >
            Fraud Analysis
          </h1>
          <p style={{ fontSize: 13, color: C.faint, marginTop: 4 }}>
            AI‑powered risk scoring & rule‑based detection
          </p>
        </div>
        <button
          onClick={handleExportPDF}
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

      {/* Stat cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 10,
        }}
      >
        <StatCard
          label="Flagged Payments"
          value={flags.length}
          icon={Shield}
          color={C.blue}
        />
        <StatCard
          label="Suspicious"
          value={suspiciousCount}
          icon={AlertTriangle}
          color={C.amber}
        />
        <StatCard
          label="High Risk"
          value={highRiskCount}
          icon={AlertTriangle}
          color={C.red}
        />
      </div>

      {/* Manual analysis tools */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
        }}
      >
        <Card>
          <div
            style={{
              padding: "14px 16px",
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            <p
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: C.text,
                margin: 0,
              }}
            >
              Analyze User
            </p>
          </div>
          <div style={{ padding: "14px 16px", display: "flex", gap: 8 }}>
            <SearchableSelect
              value={selectedUserId}
              onChange={setSelectedUserId}
              options={userOptions}
              placeholder="Select user…"
            />
            <button
              onClick={handleAnalyzeUser}
              disabled={analysisLoading}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 14px",
                borderRadius: 8,
                background: C.teal,
                border: "none",
                color: "white",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
                opacity: analysisLoading ? 0.7 : 1,
              }}
            >
              {analysisLoading ? (
                <RefreshCw size={13} className="spin" />
              ) : (
                <Search size={13} />
              )}
              Analyze
            </button>
          </div>
        </Card>
        <Card>
          <div
            style={{
              padding: "14px 16px",
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            <p
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: C.text,
                margin: 0,
              }}
            >
              Re‑Analyze Payment
            </p>
          </div>
          <div style={{ padding: "14px 16px", display: "flex", gap: 8 }}>
            <SearchableSelect
              value={selectedPaymentId}
              onChange={setSelectedPaymentId}
              options={paymentOptions}
              placeholder="Select payment…"
            />
            <button
              onClick={handleAnalyzePayment}
              disabled={analysisLoading}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 14px",
                borderRadius: 8,
                background: C.purple,
                border: "none",
                color: "white",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
                opacity: analysisLoading ? 0.7 : 1,
              }}
            >
              {analysisLoading ? (
                <RefreshCw size={13} className="spin" />
              ) : (
                <BarChart3 size={13} />
              )}
              Analyze
            </button>
          </div>
        </Card>
      </div>

      {/* Bulk analysis card – NEW */}
      <Card>
        <div
          style={{
            padding: "14px 16px",
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          <p
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: C.text,
              margin: 0,
            }}
          >
            Bulk Analysis
          </p>
        </div>
        <div
          style={{
            padding: "14px 16px",
            display: "flex",
            gap: 8,
            alignItems: "center",
          }}
        >
          <button
            onClick={handleBulkAnalysis}
            disabled={bulkLoading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 18px",
              borderRadius: 8,
              background: C.amber,
              border: "none",
              color: "white",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              opacity: bulkLoading ? 0.7 : 1,
            }}
          >
            {bulkLoading ? (
              <RefreshCw size={13} className="spin" />
            ) : (
              <Activity size={13} />
            )}
            Analyze All Tax Assessments
          </button>
          <span style={{ fontSize: 11, color: C.faint }}>
            Run AI analysis on every assessment record
          </span>
        </div>
      </Card>

      {/* Recent flags table */}
      <Card>
        <div
          style={{
            padding: "14px 16px",
            borderBottom: `1px solid ${C.border}`,
            background: C.bgMuted,
          }}
        >
          <p
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: C.text,
              margin: 0,
            }}
          >
            Recent Fraud Flags
          </p>
        </div>
        <div style={{ overflowX: "auto" }}>
          {isLoading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "60px 0",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  border: "3px solid #e2e8f0",
                  borderTopColor: C.teal,
                  animation: "spin 0.7s linear infinite",
                }}
              />
            </div>
          ) : flags.length === 0 ? (
            <div
              style={{ textAlign: "center", padding: "60px 20px" }}
            >
              <Shield
                size={32}
                color={C.border}
                style={{ margin: "0 auto 10px" }}
              />
              <p style={{ fontSize: 14, fontWeight: 600, color: C.text }}>
                No flagged payments
              </p>
            </div>
          ) : (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 100px 100px 120px 120px",
                  gap: 8,
                  padding: "10px 20px",
                  borderBottom: `1px solid ${C.border}`,
                  background: C.bgMuted,
                }}
              >
                {["ID", "Amount", "Provider", "Fraud Status", "Date"].map(
                  (h) => (
                    <span
                      key={h}
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        color: C.faint,
                        letterSpacing: ".06em",
                        textTransform: "uppercase",
                      }}
                    >
                      {h}
                    </span>
                  )
                )}
              </div>
              {flags.map((f: any) => (
                <div
                  key={f.id || f.payment_id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 100px 100px 120px 120px",
                    gap: 8,
                    padding: "10px 20px",
                    borderBottom: `1px solid ${C.border}`,
                    alignItems: "center",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = C.bgMuted)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontFamily: "monospace",
                      color: C.text,
                    }}
                  >
                    {(f.id || f.payment_id || "").slice(0, 8)}…
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: C.teal,
                    }}
                  >
                    {fmt(f.amount || 0)}
                  </span>
                  <span style={{ fontSize: 11, color: C.text }}>
                    {f.provider || "—"}
                  </span>
                  <Badge
                    label={f.fraud_status || "none"}
                    color={
                      f.fraud_status === "high_risk"
                        ? "red"
                        : f.fraud_status === "suspicious"
                        ? "amber"
                        : "gray"
                    }
                  />
                  <span style={{ fontSize: 10, color: C.faint }}>
                    {formatDate(f.created_at)}
                  </span>
                </div>
              ))}
            </>
          )}
        </div>
      </Card>

      {/* Analysis Result Modal */}
      {showAnalysisModal && analysisResult && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowAnalysisModal(false)}
        >
          <Card
            style={{
              width: "90%",
              maxWidth: 550,
              maxHeight: "80vh",
              overflow: "auto",
            }}
            onClick={(e: any) => e.stopPropagation()}
          >
            <div
              style={{
                padding: "16px 20px",
                borderBottom: `1px solid ${C.border}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h2
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: C.text,
                  margin: 0,
                }}
              >
                AI Analysis Result
              </h2>
              <button
                onClick={() => setShowAnalysisModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 20,
                  color: C.faint,
                }}
              >
                <X size={18} />
              </button>
            </div>
            <div
              style={{
                padding: "14px 20px",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              {analysisResult.risk_score !== undefined && (
                <div
                  style={{ display: "flex", gap: 8, alignItems: "center" }}
                >
                  <span style={{ fontSize: 11, color: C.faint }}>
                    Risk Score:
                  </span>
                  <span
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color:
                        analysisResult.risk_score >= 0.8
                          ? C.red
                          : analysisResult.risk_score >= 0.6
                          ? C.amber
                          : C.teal,
                    }}
                  >
                    {(analysisResult.risk_score * 100).toFixed(0)}%
                  </span>
                </div>
              )}
              {analysisResult.reason && (
                <div>
                  <span style={{ fontSize: 11, color: C.faint }}>Reason:</span>
                  <p
                    style={{
                      fontSize: 13,
                      color: C.text,
                      marginTop: 4,
                      background: C.bgMuted,
                      padding: "8px 12px",
                      borderRadius: 8,
                    }}
                  >
                    {analysisResult.reason}
                  </p>
                </div>
              )}
              {analysisResult.recommendation && (
                <div>
                  <span style={{ fontSize: 11, color: C.faint }}>
                    Recommendation:
                  </span>
                  <p
                    style={{ fontSize: 13, color: C.text, marginTop: 4 }}
                  >
                    {analysisResult.recommendation}
                  </p>
                </div>
              )}
              {analysisResult.flagged !== undefined && (
                <div>
                  <Badge
                    label={analysisResult.flagged ? "Flagged" : "Clean"}
                    color={analysisResult.flagged ? "red" : "green"}
                  />
                </div>
              )}
            </div>
            <div
              style={{
                padding: "12px 20px",
                borderTop: `1px solid ${C.border}`,
                textAlign: "right",
              }}
            >
              <button
                onClick={() => setShowAnalysisModal(false)}
                style={{
                  padding: "6px 16px",
                  borderRadius: 6,
                  border: "none",
                  background: C.teal,
                  color: "white",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Close
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}