// src/pages/taxpayer/ReceiptsPage.tsx
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Receipt, Printer, FileSpreadsheet, Search,
  Filter, Calendar, CreditCard, CheckCircle,
  FileText,
  AlertCircle,
} from "lucide-react";
import { request } from "@/services/api";
import toast from "react-hot-toast";
import React from "react";

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

// ─── Receipt Document (same professional layout as before) ──────────────
function ReceiptDocument({ payment, assessment }: { payment: any; assessment: any }) {
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

// ─── Receipt Modal (for viewing and printing) ───────────────────────────
function ReceiptModal({ payment, isOpen, onClose }: { payment: any; isOpen: boolean; onClose: () => void }) {
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
export default function TaxPayerReceiptsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [providerFilter, setProviderFilter] = useState("all");
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["payment-history"],
    queryFn: () => request("/payment/history?limit=100"),
  });

  const responseData = data as any;
  let payments: any[] = responseData?.data?.payments || [];
  // Only show confirmed payments for receipts
  payments = payments.filter(p => p.payment_status === "confirmed");

  // Extract unique providers for filter
  const providers = useMemo(() => {
    const set = new Set(payments.map(p => p.provider_name));
    return Array.from(set);
  }, [payments]);

  // Filter payments
  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      const matchesSearch = search === "" || p.provider_name?.toLowerCase().includes(search.toLowerCase()) || p.transaction_reference?.includes(search);
      const matchesProvider = providerFilter === "all" || p.provider_name === providerFilter;
      return matchesSearch && matchesProvider;
    });
  }, [payments, search, providerFilter]);

  const totalReceipts = filteredPayments.length;
  const totalAmount = filteredPayments.reduce((sum, p) => sum + parseFloat(p.payment_amount), 0);

  const handleViewReceipt = (payment: any) => {
    setSelectedPayment(payment);
    setShowReceipt(true);
  };

  const handleExportPDF = () => {
    const win = window.open("", "_blank");
    if (!win) { toast.error("Please allow popups"); return; }
    const now = new Date().toLocaleString();
    const html = `<!DOCTYPE html><html><head><title>DalPay Receipts Summary</title><style>
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
      <div class="header"><h1>DalPay Receipts Summary</h1><p>Generated: ${now}</p></div>
      <div class="summary">
        <div class="summary-box"><div class="label">Total Receipts</div><div class="value">${totalReceipts}</div></div>
        <div class="summary-box"><div class="label">Total Amount</div><div class="value">USD ${totalAmount.toLocaleString()}</div></div>
      </div>
      <table><thead><tr><th>Date</th><th>Provider</th><th>Amount</th><th>Reference</th></tr></thead><tbody>
      ${filteredPayments.map(p => `<tr><td>${new Date(p.payment_date).toLocaleDateString()}</td><td>${p.provider_name}</td><td>USD ${parseFloat(p.payment_amount).toLocaleString()}</td><td>${p.transaction_reference}</td></tr>`).join("")}
      </tbody></table>
    </body></html>`;
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 500);
    toast.success("Receipt summary exported");
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: 0 }}>Tax Receipts</h1>
          <p style={{ fontSize: 13, color: C.faint, marginTop: 4 }}>View and print official payment receipts</p>
        </div>
        <button onClick={handleExportPDF} style={{ padding: "8px 16px", borderRadius: 8, background: C.blue + "15", border: `1px solid ${C.blue}30`, color: C.blue, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}><FileSpreadsheet size={13} /> Export Summary</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        <StatCard label="Total Receipts" value={totalReceipts} icon={Receipt} color={C.teal} />
        <StatCard label="Total Amount" value={`USD ${totalAmount.toLocaleString()}`} icon={CreditCard} color={C.blue} />
        <StatCard label="Last Receipt" value={payments[0] ? new Date(payments[0].payment_date).toLocaleDateString() : "—"} icon={Calendar} color={C.amber} />
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", padding: "12px 16px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, alignItems: "center" }}>
        <Filter size={13} color={C.faint} />
        <div style={{ position: "relative", flex: 1, minWidth: 180 }}>
          <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: C.faint }} />
          <input type="text" placeholder="Search by provider or reference..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: "100%", padding: "6px 8px 6px 28px", borderRadius: 7, border: `1px solid ${C.border}`, fontSize: 11, outline: "none", background: C.bgPage, color: C.text, fontFamily: "inherit", boxSizing: "border-box" }} />
        </div>
        <select value={providerFilter} onChange={(e) => setProviderFilter(e.target.value)} style={{ padding: "6px 8px", borderRadius: 7, border: `1px solid ${C.border}`, fontSize: 11, outline: "none", background: C.bgPage, color: C.text, fontFamily: "inherit", cursor: "pointer", minWidth: 110 }}>
          <option value="all">All Providers</option>
          {providers.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        {(search || providerFilter !== "all") && (
          <button onClick={() => { setSearch(""); setProviderFilter("all"); }} style={{ fontSize: 10, color: C.red, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>Clear</button>
        )}
      </div>

      {/* Receipts Table */}
      <Card>
        <div style={{ overflowX: "auto" }}>
          {filteredPayments.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <Receipt size={32} color={C.border} style={{ margin: "0 auto 10px" }} />
              <p style={{ fontSize: 14, fontWeight: 600, color: C.text }}>No receipts found</p>
              <p style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>Make a payment to generate a receipt</p>
            </div>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 2fr 100px", gap: 8, padding: "10px 20px", borderBottom: `1px solid ${C.border}`, background: C.bgMuted }}>
                {["Date", "Provider", "Amount", "Reference", ""].map(h => (
                  <span key={h} style={{ fontSize: 10, fontWeight: 700, color: C.faint, letterSpacing: ".06em", textTransform: "uppercase" }}>{h}</span>
                ))}
              </div>
              {filteredPayments.map((p, idx) => (
                <div
                  key={p.payment_id}
                  style={{
                    display: "grid", gridTemplateColumns: "1fr 1fr 1fr 2fr 100px", gap: 8,
                    padding: "12px 20px", borderBottom: idx < filteredPayments.length - 1 ? `1px solid ${C.border}` : "none",
                    alignItems: "center", transition: "background 0.1s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = C.bgMuted}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <span style={{ fontSize: 12, color: C.text }}>{new Date(p.payment_date).toLocaleDateString()}</span>
                  <span style={{ fontSize: 12, color: C.text }}>{p.provider_name}</span>
                  <span style={{ fontWeight: 600, color: C.teal }}>USD {parseFloat(p.payment_amount).toLocaleString()}</span>
                  <span style={{ fontSize: 11, color: C.muted, fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis" }}>{p.transaction_reference}</span>
                  <button onClick={() => handleViewReceipt(p)} style={{ background: "none", border: "none", cursor: "pointer", color: C.teal, display: "flex", alignItems: "center", gap: 4 }}>
                    <Printer size={14} /> <span style={{ fontSize: 11, fontWeight: 500 }}>Print</span>
                  </button>
                </div>
              ))}
            </>
          )}
        </div>
      </Card>

      <ReceiptModal payment={selectedPayment} isOpen={showReceipt} onClose={() => { setShowReceipt(false); setSelectedPayment(null); }} />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}