// src/pages/taxpayer/PayTaxPage.tsx
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CreditCard, Smartphone, Building2, Loader2, CheckCircle, XCircle,
  Printer, ChevronRight, Shield, Landmark,
  AlertCircle, Clock, Send, KeyRound, BadgeCheck, Hash,
  CalendarDays, Phone, Tag,
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

function Card({ children, style, ...rest }: any) {
  return (
    <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden", ...style }} {...rest}>
      {children}
    </div>
  );
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
  status: string;
}

interface Provider {
  provider_id: string;
  provider_name: string;
  is_active: boolean;
}

// ─── Professional Receipt Component ─────────────────────────────────────────
function ReceiptDocument({ receipt, providerName }: { receipt: any; providerName: string }) {
  const receiptNo = receipt.paymentId.slice(0, 8).toUpperCase();
  const date = new Date(receipt.date);

  return (
    <div id={`receipt-${receipt.paymentId}`} style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
      {/* Header */}
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

      {/* Status Banner */}
      <div style={{ background: "#e8f7f2", border: "1px solid #c3e8dc", borderRadius: 8, padding: "10px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
        <BadgeCheck size={18} color="#0d9e75" />
        <div>
          <div style={{ fontFamily: "sans-serif", fontSize: 12, fontWeight: 700, color: "#0a7d5d" }}>PAYMENT CONFIRMED</div>
          <div style={{ fontFamily: "sans-serif", fontSize: 10, color: "#0a7d5d" }}>
            {date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            {" at "}
            {date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
      </div>

      {/* Amount Highlight */}
      <div style={{ borderRadius: 10, border: "1px solid #e5eae8", padding: "16px 20px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontFamily: "sans-serif" }}>
          <div style={{ fontSize: 10, color: "#a0b4ae", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Amount Paid</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#0d9e75", letterSpacing: "-1px" }}>
            USD {receipt.amount.toLocaleString()}
          </div>
        </div>
        <div style={{ fontFamily: "sans-serif", fontSize: 10, color: "#7a918b", textAlign: "right" }}>
          <div>{receipt.taxType?.replace(/_/g, " ")}</div>
          <div style={{ fontWeight: 600, color: "#111816", fontSize: 13, marginTop: 2 }}>Year {receipt.year}</div>
        </div>
      </div>

      {/* Details Table */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: "sans-serif", fontSize: 10, fontWeight: 700, color: "#a0b4ae", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Transaction Details</div>
        {[
          { icon: Hash, label: "Transaction Reference", value: receipt.transactionRef },
          { icon: Hash, label: "Payment ID", value: receipt.paymentId },
          { icon: Tag, label: "Tax Assessment ID", value: receipt.assessmentId },
          { icon: Phone, label: "Payment Provider", value: providerName },
          { icon: CalendarDays, label: "Date Issued", value: date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "8px 0", borderBottom: "1px solid #f0f2f1", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
              <Icon size={13} color="#a0b4ae" strokeWidth={1.5} />
              <span style={{ fontFamily: "sans-serif", fontSize: 12, color: "#7a918b" }}>{label}</span>
            </div>
            <span style={{ fontFamily: "monospace", fontSize: 11, color: "#111816", fontWeight: 600, textAlign: "right", wordBreak: "break-all" }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid #e5eae8", paddingTop: 14, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div style={{ fontFamily: "sans-serif", fontSize: 9, color: "#a0b4ae", lineHeight: 1.6 }}>
          <div>This is an official receipt generated by DalPay.</div>
          <div>Please retain for your records.</div>
        </div>
        <div style={{ fontFamily: "sans-serif", fontSize: 9, color: "#a0b4ae", textAlign: "right" }}>
          <div>Somaliland Revenue Authority</div>
          <div style={{ fontWeight: 600 }}>dalpay.gov.so</div>
        </div>
      </div>
    </div>
  );
}

// ─── Print a single receipt ──────────────────────────────────────────────────
function printReceipt(paymentId: string, _providerName: any, _receipt: any) {
  const content = document.getElementById(`receipt-${paymentId}`);
  if (!content) return;

  const win = window.open("", "_blank", "width=680,height=900");
  if (!win) return;

  win.document.write(`<!DOCTYPE html>
<html>
<head>
<title>Receipt #${paymentId.slice(0, 8).toUpperCase()} — DalPay</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Georgia, 'Times New Roman', serif; color: #111816; padding: 40px; max-width: 600px; margin: 0 auto; background: #fff; }
  @media print {
    body { padding: 20px; }
    button { display: none !important; }
  }
</style>
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
}

export default function PayTaxPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [paymentPeriod, setPaymentPeriod] = useState<"full" | "quarter">("full");
  const [selectedProvider, setSelectedProvider] = useState<string>("zaad");
  const [paymentPhone, setPaymentPhone] = useState("");
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState(["", "", "", ""]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<{ success: boolean; receipt?: any; error?: string } | null>(null);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpStep, setOtpStep] = useState<"request" | "verify">("request");
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpVerifiedAt, setOtpVerifiedAt] = useState<Date | null>(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  const isOtpValid = () =>
    otpVerified && otpVerifiedAt && (new Date().getTime() - otpVerifiedAt.getTime()) <= 5 * 60 * 1000;

  const formatPhoneNumber = (phone: string): string => {
    let cleaned = phone.replace(/\D/g, "");
    if (cleaned.startsWith("252")) cleaned = `+${cleaned}`;
    else if (cleaned.startsWith("0")) cleaned = `+252${cleaned.slice(1)}`;
    else if (!cleaned.startsWith("+")) cleaned = `+252${cleaned}`;
    return cleaned;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "");
    if (digits.length <= 12) setPaymentPhone(digits);
  };

  const computedAmount = selectedAssessment
    ? paymentPeriod === "full" ? selectedAssessment.amount : Math.ceil(selectedAssessment.amount / 4)
    : 0;

  const { data: assessmentsData, isLoading: loadingAssessments } = useQuery({
    queryKey: ["taxpayer-assessments-unpaid"],
    queryFn: () => request("/tax/assessments?status=unpaid,overdue"),
  });
  let rawAssessments = (assessmentsData as any)?.data?.assessments || (assessmentsData as any)?.data || [];
  const assessments: Assessment[] = Array.isArray(rawAssessments)
    ? rawAssessments
        .map((a: any) => ({
          id: a.id || a.assessment_id,
          tax_type: a.tax_type,
          year: a.year || a.assessment_year,
          amount: Number(a.amount || a.assessed_amount || 0),
          due_date: a.due_date || a.payment_due_date,
          status: a.status,
        }))
        .filter((a: Assessment) => a.status === "unpaid" || a.status === "overdue")
    : [];

  const { data: providersData } = useQuery({
    queryKey: ["payment-providers"],
    queryFn: () => request("/payment/providers"),
  });
  const providers: Provider[] = (providersData as any)?.data?.providers || (providersData as any)?.data || [];

  const stats = useMemo(() => {
    const totalDue = assessments.reduce((sum, a) => sum + (a.amount || 0), 0);
    const overdueAmount = assessments.filter(a => a.status === "overdue").reduce((sum, a) => sum + (a.amount || 0), 0);
    const unpaidCount = assessments.filter(a => a.status === "unpaid").length;
    const overdueCount = assessments.filter(a => a.status === "overdue").length;
    return { totalDue, overdueAmount, unpaidCount, overdueCount };
  }, [assessments]);

  const generateIdempotencyKey = () => `pay_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

  const handleAssessmentSelect = (assessment: Assessment) => {
    if (assessment.status === "paid") {
      toast.error("This assessment is already paid");
      return;
    }
    setSelectedAssessment(assessment);
  };

  const handleProceedToCheckout = () => {
    if (!selectedAssessment) { toast.error("Please select an assessment to pay"); return; }
    const phoneDigits = paymentPhone.replace(/\D/g, "");
    if (phoneDigits.length < 9 || phoneDigits.length > 12) {
      toast.error("Enter a valid phone number (e.g. 633650179)");
      return;
    }
    if (isOtpValid()) {
      setShowPinModal(true);
      setPin(["", "", "", ""]);
    } else {
      setShowOtpModal(true);
      setOtpStep("request");
      setOtpCode("");
      setOtpError(null);
    }
  };

  const handleSendOtp = async () => {
    setIsSendingOtp(true);
    setOtpError(null);
    try {
      const res = await request("/auth/send-otp", { method: "POST", body: JSON.stringify({ type: "email" }) });
      if (res?.success === false) throw new Error(res.message || "Failed to send OTP");
      toast.success("OTP sent to your email");
      setOtpStep("verify");
    } catch (err: any) {
      toast.error(err.message || "Failed to send OTP");
      setOtpError(err.message || "Failed to send OTP");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length !== 6) { toast.error("Enter the 6-digit code"); return; }
    setIsVerifyingOtp(true);
    setOtpError(null);
    try {
      const res = await request("/auth/verify-otp", { method: "POST", body: JSON.stringify({ code: otpCode }) });
      if (res?.success === false) throw new Error(res.message || "Invalid OTP");
      toast.success("OTP verified. You can now proceed.");
      setOtpVerified(true);
      setOtpVerifiedAt(new Date());
      setShowOtpModal(false);
      setShowPinModal(true);
      setPin(["", "", "", ""]);
    } catch (err: any) {
      toast.error(err.message || "Invalid OTP");
      setOtpError(err.message || "Invalid verification code");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handlePinChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    if (value && index < 3) document.getElementById(`pin-${index + 1}`)?.focus();
  };

  const handleSubmitPayment = async () => {
    const pinCode = pin.join("");
    if (pinCode.length !== 4) { toast.error("Please enter a 4-digit PIN"); return; }

    const formattedPhone = formatPhoneNumber(paymentPhone);
    setIsProcessing(true);
    try {
      const idempotencyKey = generateIdempotencyKey();
      const initRes = await request("/payment/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Idempotency-Key": idempotencyKey },
        body: JSON.stringify({
          assessmentId: selectedAssessment!.id,
          amount: computedAmount,
          providerId: selectedProvider,
          phoneNumber: formattedPhone,
        }),
      });
      if (!initRes.success) throw new Error(initRes.message || "Initiation failed");

      const paymentId = (initRes.data as any)?.paymentId || (initRes.data as any)?.id;
      const transactionRef = (initRes.data as any)?.transactionRef || (initRes.data as any)?.transaction_reference;
      if (!paymentId || !transactionRef) throw new Error("Invalid payment response");

      await new Promise((resolve) => setTimeout(resolve, 1500));

      // ✅ FIX: explicitly pass status: "confirmed" so the backend
      // doesn't receive undefined and log "Payment undefined"
      const confirmRes = await request("/payment/confirm", {
        method: "POST",
        body: JSON.stringify({
          paymentId,
          transactionRef,
          pin: pinCode,
          phoneNumber: formattedPhone,
          status: "confirmed",
        }),
      });
      if (!confirmRes.success) throw new Error(confirmRes.message || "Confirmation failed");

      setShowSuccessAnimation(true);
      setTimeout(() => setShowSuccessAnimation(false), 3000);

      const providerName =
        providers.find(p => p.provider_id === selectedProvider)?.provider_name || selectedProvider;

      setPaymentResult({
        success: true,
        receipt: {
          paymentId,
          transactionRef,
          amount: computedAmount,
          provider: selectedProvider,
          providerName,
          date: new Date().toISOString(),
          assessmentId: selectedAssessment!.id,
          taxType: selectedAssessment!.tax_type,
          year: selectedAssessment!.year,
        },
      });
      queryClient.invalidateQueries({ queryKey: ["taxpayer-assessments-unpaid"] });
      toast.success("Payment successful!");
      setShowPinModal(false);
    } catch (err: any) {
      setPaymentResult({ success: false, error: err.message || "Payment failed. Please try again." });
      toast.error(err.message || "Payment failed");
      setShowPinModal(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetPayment = () => {
    setSelectedAssessment(null);
    setPaymentResult(null);
    setPaymentPhone("");
    setOtpVerified(false);
    setOtpVerifiedAt(null);
  };

  if (loadingAssessments) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "300px" }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", border: `3px solid ${C.border}`, borderTopColor: C.teal, animation: "spin 0.7s linear infinite" }} />
      </div>
    );
  }

  if (paymentResult) {
    if (paymentResult.success) {
      const providerName = paymentResult.receipt.providerName || paymentResult.receipt.provider;
      return (
        <div style={{ maxWidth: "640px", margin: "0 auto" }}>
          {showSuccessAnimation && (
            <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1001 }}>
              {[...Array(40)].map((_, i) => (
                <div key={i} style={{ position: "absolute", bottom: "-20px", left: `${Math.random() * 100}%`, width: `${6 + Math.random() * 14}px`, height: `${6 + Math.random() * 14}px`, background: `rgba(13, 158, 117, ${0.5 + Math.random() * 0.5})`, borderRadius: "50%", animation: `floatUp ${0.8 + Math.random() * 1.2}s ease-out forwards`, animationDelay: `${Math.random() * 0.5}s` }} />
              ))}
            </div>
          )}

          <Card>
            {/* Top bar */}
            <div style={{ background: C.tealBg, borderBottom: `1px solid ${C.tealBorder}`, padding: "16px 24px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: C.teal, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <CheckCircle size={20} color="white" />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.tealText }}>Payment Successful</div>
                <div style={{ fontSize: 11, color: C.tealText, opacity: 0.8 }}>Your transaction has been recorded</div>
              </div>
            </div>

            {/* Receipt body (hidden div used for printing) */}
            <div style={{ display: "none" }}>
              <ReceiptDocument receipt={paymentResult.receipt} providerName={providerName} />
            </div>

            {/* Visible receipt preview */}
            <div style={{ padding: "24px" }}>
              <ReceiptDocument receipt={paymentResult.receipt} providerName={providerName} />
            </div>

            {/* Actions */}
            <div style={{ padding: "0 24px 24px", display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                onClick={() => printReceipt(paymentResult.receipt.paymentId, providerName, paymentResult.receipt)}
                style={{ width: "100%", padding: "11px", background: C.teal, color: "white", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              >
                <Printer size={15} /> Print / Save Receipt
              </button>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={resetPayment}
                  style={{ flex: 1, padding: "10px", border: `1px solid ${C.border}`, borderRadius: 8, background: C.bg, cursor: "pointer", fontWeight: 600, fontSize: 13 }}
                >
                  Make Another Payment
                </button>
                <button
                  onClick={() => navigate("/taxpayer/dashboard")}
                  style={{ flex: 1, padding: "10px", color: C.muted, background: C.bgMuted, border: `1px solid ${C.border}`, borderRadius: 8, cursor: "pointer", fontSize: 13 }}
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    return (
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <Card>
          <div style={{ padding: "24px", textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: C.redBg, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <XCircle size={32} color={C.red} />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text }}>Payment Failed</h2>
            <p style={{ fontSize: 13, color: C.muted, marginTop: 8 }}>{paymentResult.error}</p>
            <button onClick={resetPayment} style={{ marginTop: 20, width: "100%", padding: "10px", background: C.teal, color: "white", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600 }}>Try Again</button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: 0 }}>Pay Tax</h1>
          <p style={{ fontSize: 13, color: C.faint, marginTop: 4 }}>Select an assessment and pay using mobile money</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        <StatCard label="Total Due" value={`USD ${stats.totalDue.toLocaleString()}`} icon={Landmark} color={C.blue} />
        <StatCard label="Overdue Amount" value={`USD ${stats.overdueAmount.toLocaleString()}`} icon={AlertCircle} color={C.red} />
        <StatCard label="Unpaid Assessments" value={stats.unpaidCount} icon={Clock} color={C.amber} />
        <StatCard label="Overdue Assessments" value={stats.overdueCount} icon={AlertCircle} color={C.red} />
      </div>

      <Card>
        <div style={{ padding: "12px 20px", borderBottom: `1px solid ${C.border}` }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>Outstanding Assessments</span>
        </div>
        {assessments.length === 0 ? (
          <div style={{ padding: "48px 20px", textAlign: "center" }}>
            <CreditCard size={32} color={C.border} style={{ margin: "0 auto 12px" }} />
            <p style={{ fontSize: 13, color: C.muted }}>No outstanding assessments</p>
          </div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1.2fr 1.2fr 1fr", gap: 8, padding: "10px 20px", background: C.bgMuted, borderBottom: `1px solid ${C.border}`, fontSize: 10, fontWeight: 700, color: C.faint, textTransform: "uppercase" }}>
              <span>Tax Type</span><span>Year</span><span>Amount</span><span>Due Date</span><span>Status</span>
            </div>
            {assessments.map((assessment, idx) => (
              <div
                key={assessment.id}
                onClick={() => handleAssessmentSelect(assessment)}
                style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1.2fr 1.2fr 1fr", gap: 8, padding: "12px 20px", borderBottom: idx < assessments.length - 1 ? `1px solid ${C.border}` : "none", cursor: "pointer", background: selectedAssessment?.id === assessment.id ? C.tealBg : "transparent" }}
              >
                <span style={{ textTransform: "capitalize", color: C.text }}>{assessment.tax_type.replace(/_/g, " ")}</span>
                <span style={{ color: C.text }}>{assessment.year}</span>
                <span style={{ fontWeight: 600, color: C.teal }}>USD {(assessment.amount || 0).toLocaleString()}</span>
                <span style={{ color: C.text }}>{new Date(assessment.due_date).toLocaleDateString()}</span>
                <Badge label={assessment.status} color={assessment.status === "overdue" ? "red" : "amber"} />
              </div>
            ))}
          </>
        )}
      </Card>

      {selectedAssessment && (
        <Card>
          <div style={{ padding: "20px" }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 16 }}>Payment Details</h2>
            <div style={{ display: "grid", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: C.muted, marginBottom: 4 }}>Payment Period</label>
                <div style={{ display: "flex", gap: 12 }}>
                  <button type="button" onClick={() => setPaymentPeriod("full")} style={{ flex: 1, padding: "8px 12px", borderRadius: 8, background: paymentPeriod === "full" ? C.tealBg : C.bg, border: `1px solid ${paymentPeriod === "full" ? C.teal : C.border}`, color: paymentPeriod === "full" ? C.tealText : C.text, cursor: "pointer", fontWeight: 500 }}>
                    Full Year<br /><span style={{ fontSize: 11 }}>USD {selectedAssessment.amount.toLocaleString()}</span>
                  </button>
                  <button type="button" onClick={() => setPaymentPeriod("quarter")} style={{ flex: 1, padding: "8px 12px", borderRadius: 8, background: paymentPeriod === "quarter" ? C.tealBg : C.bg, border: `1px solid ${paymentPeriod === "quarter" ? C.teal : C.border}`, color: paymentPeriod === "quarter" ? C.tealText : C.text, cursor: "pointer", fontWeight: 500 }}>
                    Quarterly<br /><span style={{ fontSize: 11 }}>USD {Math.ceil(selectedAssessment.amount / 4).toLocaleString()}</span>
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: C.muted, marginBottom: 4 }}>Provider</label>
                <div style={{ display: "flex", gap: 12 }}>
                  {providers.filter(p => p.is_active).map(provider => (
                    <button key={provider.provider_id} type="button" onClick={() => setSelectedProvider(provider.provider_id)} style={{ flex: 1, padding: "8px 12px", border: `1px solid ${selectedProvider === provider.provider_id ? C.teal : C.border}`, borderRadius: 8, background: selectedProvider === provider.provider_id ? C.tealBg : C.bg, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                      {provider.provider_id === "zaad" ? <Smartphone size={14} /> : <Building2 size={14} />}
                      {provider.provider_name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: C.muted, marginBottom: 4 }}>Phone Number</label>
                <input type="tel" value={paymentPhone} onChange={handlePhoneChange} placeholder="633650179" style={{ width: "100%", padding: "8px 12px", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, color: C.text }} />
              </div>

              <button onClick={handleProceedToCheckout} style={{ padding: "10px 16px", background: C.teal, color: "white", borderRadius: 8, border: "none", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                Proceed to Checkout <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* OTP Modal */}
      {showOtpModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={() => setShowOtpModal(false)}>
          <Card style={{ width: "90%", maxWidth: 450 }} onClick={(e: any) => e.stopPropagation()}>
            <div style={{ padding: "18px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: C.text }}>Secure Payment</h2>
              <button onClick={() => setShowOtpModal(false)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer" }}>×</button>
            </div>
            <div style={{ padding: "20px" }}>
              {otpError && <div style={{ padding: 8, background: C.redBg, borderRadius: 8, color: C.redText, fontSize: 12, marginBottom: 16 }}>{otpError}</div>}
              {otpStep === "request" ? (
                <>
                  <div style={{ textAlign: "center", marginBottom: 24 }}>
                    <Shield size={48} style={{ margin: "0 auto 8px", color: C.teal }} />
                    <p style={{ fontSize: 13, fontWeight: 500, color: C.text }}>Verify your identity</p>
                    <p style={{ fontSize: 12, color: C.muted }}>We'll send a code to your email.</p>
                  </div>
                  <button onClick={handleSendOtp} disabled={isSendingOtp} style={{ width: "100%", padding: "10px", background: C.teal, color: "white", borderRadius: 8, border: "none", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    {isSendingOtp ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    {isSendingOtp ? "Sending..." : "Send OTP"}
                  </button>
                </>
              ) : (
                <>
                  <div style={{ textAlign: "center", marginBottom: 24 }}>
                    <KeyRound size={48} style={{ margin: "0 auto 8px", color: C.teal }} />
                    <p style={{ fontSize: 13, fontWeight: 500, color: C.text }}>Enter verification code</p>
                  </div>
                  <input type="text" maxLength={6} value={otpCode} onChange={e => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="123456" style={{ width: "100%", padding: "10px", textAlign: "center", fontSize: 18, letterSpacing: 4, border: `1px solid ${C.border}`, borderRadius: 8, marginBottom: 16, color: C.text }} />
                  <button onClick={handleVerifyOtp} disabled={isVerifyingOtp} style={{ width: "100%", padding: "10px", background: C.teal, color: "white", borderRadius: 8, border: "none", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    {isVerifyingOtp ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                    {isVerifyingOtp ? "Verifying..." : "Verify & Continue"}
                  </button>
                </>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* PIN Modal */}
      {showPinModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={() => setShowPinModal(false)}>
          <Card style={{ width: "90%", maxWidth: 500 }} onClick={(e: any) => e.stopPropagation()}>
            <div style={{ padding: "18px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: C.text }}>Enter Payment PIN</h2>
              <button onClick={() => setShowPinModal(false)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer" }}>×</button>
            </div>
            <div style={{ padding: "20px" }}>
              <div style={{ background: C.bgMuted, padding: 12, borderRadius: 8, marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}><span>Provider:</span><span>{selectedProvider}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}><span>Amount:</span><span style={{ fontWeight: 600, color: C.teal }}>USD {computedAmount.toLocaleString()}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}><span>Phone:</span><span>{formatPhoneNumber(paymentPhone)}</span></div>
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 24 }}>
                {[0, 1, 2, 3].map(idx => (
                  <input key={idx} id={`pin-${idx}`} type="password" maxLength={1} value={pin[idx]} onChange={e => handlePinChange(idx, e.target.value)} style={{ width: 56, height: 56, textAlign: "center", fontSize: 24, fontWeight: "bold", border: `1px solid ${C.border}`, borderRadius: 12, outline: "none", background: C.bg, color: C.text }} autoFocus={idx === 0} />
                ))}
              </div>
              {isProcessing ? (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", border: `3px solid ${C.border}`, borderTopColor: C.teal, animation: "spin 0.7s linear infinite", margin: "0 auto 8px" }} />
                  <p>Processing...</p>
                </div>
              ) : (
                <button onClick={handleSubmitPayment} disabled={pin.join("").length !== 4} style={{ width: "100%", padding: "12px", background: C.teal, color: "white", borderRadius: 8, border: "none", fontWeight: 600, cursor: "pointer", opacity: pin.join("").length !== 4 ? 0.5 : 1 }}>
                  Confirm Payment
                </button>
              )}
            </div>
          </Card>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes floatUp { 0% { transform: translateY(0) scale(1); opacity: 1; } 100% { transform: translateY(-100vh) scale(0); opacity: 0; } }
      `}</style>
    </div>
  );
}