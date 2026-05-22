// src/pages/taxpayer/PaymentHistoryPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  CreditCard, FileText, AlertCircle, CheckCircle, Clock,
  Printer, Eye, FileSpreadsheet,
} from "lucide-react";
import { request } from "@/services/api";
import toast from "react-hot-toast";

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

interface Payment {
  payment_id: string;
  assessment_id: string;
  provider_name: string;
  payment_amount: string;
  transaction_reference: string;
  payment_status: string;
  payment_date: string;
}

// ─── Receipt Document ───────────────────────────────────────────────────
function ReceiptDocument({ payment, assessment }: { payment: Payment; assessment: any }) {
  const receiptNo = payment.payment_id.slice(0, 8).toUpperCase();
  const date = new Date(payment.payment_date);
  const amount = parseFloat(payment.payment_amount);
  const taxType = assessment?.tax_type || "tax";
  const year = assessment?.year || "—";

  return (
    <div style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
      <div style={{ borderBottom: "2px solid #111816", paddingBottom: 16, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#111816", letterSpacing: "-0.5px" }}>DalPay</div>
            <div style={{ fontSize: 10, color: "#7a918b", marginTop: 2, letterSpacing: "0.08em", textTransform: "uppercase" }}>Digital Tax Payment System</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: "#7a918b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Official Receipt</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#111816" }}>#{receiptNo}</div>
          </div>
        </div>
      </div>

      <div style={{ background: "#e8f7f2", border: "1px solid #c3e8dc", borderRadius: 8, padding: "10px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
        <CheckCircle size={18} color="#0d9e75" />
        <div>
          <div style={{ fontFamily: "sans-serif", fontSize: 12, fontWeight: 700, color: "#0a7d5d" }}>PAYMENT CONFIRMED</div>
          <div style={{ fontFamily: "sans-serif", fontSize: 10, color: "#0a7d5d" }}>
            {date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            {" at "}
            {date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
      </div>

      <div style={{ borderRadius: 10, border: "1px solid #e5eae8", padding: "16px 20px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 10, color: "#a0b4ae", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Amount Paid</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#0d9e75", letterSpacing: "-1px" }}>USD {amount.toLocaleString()}</div>
        </div>
        <div style={{ fontSize: 10, color: "#7a918b", textAlign: "right" }}>
          <div>{taxType.replace(/_/g, " ")}</div>
          <div style={{ fontWeight: 600, color: "#111816", fontSize: 13, marginTop: 2 }}>Year {year}</div>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#a0b4ae", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Transaction Details</div>
        {[
          { label: "Transaction Reference", value: payment.transaction_reference },
          { label: "Payment ID", value: payment.payment_id },
          { label: "Tax Assessment ID", value: payment.assessment_id },
          { label: "Payment Provider", value: payment.provider_name },
          { label: "Date Issued", value: date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) },
        ].map(({ label, value }) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "8px 0", borderBottom: "1px solid #f0f2f1", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
              <FileText size={13} color="#a0b4ae" strokeWidth={1.5} />
              <span style={{ fontSize: 12, color: "#7a918b" }}>{label}</span>
            </div>
            <span style={{ fontFamily: "monospace", fontSize: 11, color: "#111816", fontWeight: 600, textAlign: "right", wordBreak: "break-all" }}>{value}</span>
          </div>
        ))}
      </div>

      <div style={{ borderTop: "1px solid #e5eae8", paddingTop: 14, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div style={{ fontSize: 9, color: "#a0b4ae", lineHeight: 1.6 }}>
          <div>This is an official receipt generated by DalPay.</div>
          <div>Please retain for your records.</div>
        </div>
        <div style={{ fontSize: 9, color: "#a0b4ae", textAlign: "right" }}>
          <div>Somaliland Revenue Authority</div>
          <div style={{ fontWeight: 600 }}>dalpay.gov.so</div>
        </div>
      </div>
    </div>
  );
}

// ─── Receipt Modal ──────────────────────────────────────────────────────
function ReceiptModal({ payment, isOpen, onClose }: { payment: Payment | null; isOpen: boolean; onClose: () => void }) {
  const [assessment, setAssessment] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (payment && isOpen) {
      setLoading(true);
      request(`/tax/assessments/${payment.assessment_id}`)
        .then(res => setAssessment(res?.data))
        .catch(() => toast.error("Could not load assessment details"))
        .finally(() => setLoading(false));
    }
  }, [payment, isOpen]);

  if (!isOpen || !payment) return null;

  const printReceipt = () => {
    const content = document.getElementById("receipt-print-content");
    if (!content) return;
    const win = window.open("", "_blank", "width=680,height=900");
    if (!win) return;
    win.document.write(`<!DOCTYPE html>
<html>
<head><title>Receipt #${payment.payment_id.slice(0, 8).toUpperCase()} — DalPay</title>
<style> * { box-sizing: border-box; margin: 0; padding: 0; } body { font-family: Georgia, 'Times New Roman', serif; color: #111816; padding: 40px; max-width: 600px; margin: 0 auto; background: #fff; } @media print { body { padding: 20px; } button { display: none !important; } } </style>
</head>
<body>
${content.innerHTML}
<div style="margin-top: 32px; text-align: center; font-family: sans-serif;">
  <button onclick="window.print(); window.close();" style="padding: 10px 24px; background: #0d9e75; color: #fff; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer;">Print / Save PDF</button>
</div>
</body>
</html>`);
    win.document.close();
    win.focus();
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={onClose}>
      <Card style={{ width: "90%", maxWidth: 700, maxHeight: "90vh", overflow: "auto" }} onClick={(e: any) => e.stopPropagation()}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: 16, fontWeight: 700 }}>Payment Receipt</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer" }}>×</button>
        </div>
        <div style={{ padding: "24px" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: 40 }}>Loading receipt...</div>
          ) : (
            <div id="receipt-print-content">
              <ReceiptDocument payment={payment} assessment={assessment} />
            </div>
          )}
        </div>
        <div style={{ padding: "0 24px 24px", display: "flex", gap: 12 }}>
          <button onClick={printReceipt} style={{ flex: 1, padding: "10px", background: C.teal, color: "white", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><Printer size={15} /> Print Receipt</button>
          <button onClick={onClose} style={{ flex: 1, padding: "10px", border: `1px solid ${C.border}`, borderRadius: 8, background: C.bg, cursor: "pointer", fontWeight: 600 }}>Close</button>
        </div>
      </Card>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────
export default function PaymentHistoryPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const limit = 10;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["payment-history", page],
    queryFn: () => request(`/payment/history?page=${page}&limit=${limit}`),
  });

  // Safe data extraction with proper typing
  const responseData = data as any;
  const payments: Payment[] = responseData?.data?.payments || [];
  const total = responseData?.data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const totalPaid = payments.reduce((sum, p) => sum + (p.payment_status === "confirmed" ? parseFloat(p.payment_amount) : 0), 0);
  const confirmedCount = payments.filter(p => p.payment_status === "confirmed").length;

  const handleViewReceipt = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowReceipt(true);
  };

  const handleExportPDF = () => {
    const win = window.open("", "_blank");
    if (!win) { toast.error("Please allow popups"); return; }
    const now = new Date().toLocaleString();
    const html = `<!DOCTYPE html><html><head><title>DalPay Payment History</title><style>
      @page { size: A4 landscape; margin: 15mm; }
      body { font-family: 'Segoe UI', Arial, sans-serif; padding: 0; color: #111816; font-size: 10px; }
      .header { border-bottom: 3px solid #0d9e75; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; }
      .header h1 { color: #0d9e75; margin: 0; font-size: 18px; }
      .summary { display: flex; gap: 12px; margin-bottom: 20px; }
      .summary-box { background: #f7f9f8; border: 1px solid #e5eae8; border-radius: 8px; padding: 10px 14px; flex: 1; }
      .summary-box .value { font-size: 16px; font-weight: 700; }
      table { width: 100%; border-collapse: collapse; }
      th { background: #0d9e75; color: white; padding: 8px; font-size: 9px; text-align: left; }
      td { padding: 6px 8px; border-bottom: 1px solid #e5eae8; }
    </style></head><body>
      <div class="header"><h1>DalPay Payment History</h1><p>Generated: ${now}</p></div>
      <div class="summary">
        <div class="summary-box"><div class="label">Total Paid</div><div class="value">USD ${totalPaid.toLocaleString()}</div></div>
        <div class="summary-box"><div class="label">Payments</div><div class="value">${confirmedCount}</div></div>
      </div>
      <tr><thead><tr><th>Date</th><th>Provider</th><th>Amount</th><th>Status</th><th>Ref</th></tr></thead><tbody>
      ${payments.map(p => `<tr><td>${new Date(p.payment_date).toLocaleDateString()}</td><td>${p.provider_name}</td><td>USD ${parseFloat(p.payment_amount).toLocaleString()}</td><td>${p.payment_status}</td><td>${p.transaction_reference}</td></tr>`).join("")}
      </tbody></table>
    </body></html>`;
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 500);
    toast.success("Report exported");
  };

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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: 0 }}>Payment History</h1>
          <p style={{ fontSize: 13, color: C.faint, marginTop: 4 }}>View all your tax payments and receipts</p>
        </div>
        <button onClick={handleExportPDF} style={{ padding: "8px 16px", borderRadius: 8, background: C.blue + "15", border: `1px solid ${C.blue}30`, color: C.blue, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}><FileSpreadsheet size={13} /> Export PDF</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        <StatCard label="Total Paid" value={`USD ${totalPaid.toLocaleString()}`} icon={CheckCircle} color={C.teal} />
        <StatCard label="Payments Made" value={confirmedCount} icon={CreditCard} color={C.blue} />
        <StatCard label="Last Payment" value={payments[0] ? new Date(payments[0].payment_date).toLocaleDateString() : "—"} icon={Clock} color={C.amber} />
      </div>

      <Card>
        <div style={{ overflowX: "auto" }}>
          {isLoading ? (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "60px 0" }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid #e2e8f0", borderTopColor: C.teal, animation: "spin 0.7s linear infinite" }} />
            </div>
          ) : payments.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <CreditCard size={32} color={C.border} style={{ margin: "0 auto 10px" }} />
              <p style={{ fontSize: 14, fontWeight: 600 }}>No payments found</p>
            </div>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 80px", gap: 8, padding: "10px 20px", borderBottom: `1px solid ${C.border}`, background: C.bgMuted }}>
                {["Date", "Provider", "Amount", "Status", ""].map(h => (
                  <span key={h} style={{ fontSize: 10, fontWeight: 700, color: C.faint, letterSpacing: ".06em", textTransform: "uppercase" }}>{h}</span>
                ))}
              </div>
              {payments.map((p, idx) => (
                <div key={p.payment_id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 80px", gap: 8, padding: "12px 20px", borderBottom: idx < payments.length - 1 ? `1px solid ${C.border}` : "none", alignItems: "center" }}
                  onMouseEnter={e => e.currentTarget.style.background = C.bgMuted}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <span style={{ fontSize: 12, color: C.text }}>{new Date(p.payment_date).toLocaleDateString()}</span>
                  <span style={{ fontSize: 12, color: C.text }}>{p.provider_name}</span>
                  <span style={{ fontWeight: 600, color: C.teal }}>USD {parseFloat(p.payment_amount).toLocaleString()}</span>
                  <Badge label={p.payment_status} color={p.payment_status === "confirmed" ? "green" : p.payment_status === "failed" ? "red" : "amber"} />
                  <button onClick={() => handleViewReceipt(p)} style={{ background: "none", border: "none", cursor: "pointer", color: C.teal, display: "flex", alignItems: "center", gap: 4 }}>
                    <Eye size={14} /> <span style={{ fontSize: 11, fontWeight: 500 }}>Receipt</span>
                  </button>
                </div>
              ))}
            </>
          )}
        </div>
      </Card>

      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 8 }}>
          <button disabled={page === 1} onClick={() => setPage(page - 1)} style={{ padding: "6px 12px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.bg, cursor: "pointer", fontSize: 11 }}>Prev</button>
          <span style={{ fontSize: 11, color: C.muted, alignSelf: "center" }}>Page {page} of {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(page + 1)} style={{ padding: "6px 12px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.bg, cursor: "pointer", fontSize: 11 }}>Next</button>
        </div>
      )}

      <ReceiptModal payment={selectedPayment} isOpen={showReceipt} onClose={() => { setShowReceipt(false); setSelectedPayment(null); }} />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}