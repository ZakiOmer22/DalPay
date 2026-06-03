// src/pages/employee/EmployeeCounterPaymentPage.tsx
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Banknote, Search, Plus, X, Check, AlertCircle,
  CreditCard, Phone, Mail, DollarSign, Receipt,
  ChevronRight, Clock, TrendingUp, User,
} from "lucide-react";
import { useState } from "react";
import { request } from "@/services/api";

// ─── Design tokens ────────────────────────────────────
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
  green: "#10b981",
  greenBg: "#ecfdf5",
  greenText: "#065f46",
  purple: "#8b5cf6",
  purpleBg: "#f5f3ff",
  purpleText: "#5b21b6",
};

// ─── Primitives ───────────────────────────────────────
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: C.bg,
      border: `1px solid ${C.border}`,
      borderRadius: 14,
      overflow: "hidden",
      ...style,
    }}>
      {children}
    </div>
  );
}

function SectionHead({
  title,
  sub,
  action,
  icon: Icon,
  iconColor,
}: {
  title: string;
  sub?: string;
  action?: { label: string; onClick: () => void };
  icon?: React.ElementType;
  iconColor?: string;
}) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "14px 18px",
      borderBottom: `1px solid ${C.border}`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {Icon && (
          <div style={{
            width: 28,
            height: 28,
            borderRadius: 7,
            background: (iconColor ?? C.teal) + "18",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
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
        <button
          onClick={action.onClick}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 3,
            fontSize: 12,
            fontWeight: 600,
            color: C.teal,
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: "inherit",
            padding: 0,
          }}>
          {action.label} <ChevronRight size={12} />
        </button>
      )}
    </div>
  );
}

function Badge({
  label,
  color,
}: {
  label: string | null | undefined;
  color: "green" | "amber" | "red" | "blue" | "gray" | "purple";
}) {
  const safeLabel = (label ?? "unknown").replace(/_/g, " ");
  const map = {
    green: { bg: C.greenBg, text: C.greenText, border: "#a7f3d0" },
    amber: { bg: C.amberBg, text: C.amberText, border: C.amberBorder },
    red: { bg: C.redBg, text: C.redText, border: C.redBorder },
    blue: { bg: C.blueBg, text: C.blueText, border: C.blueBorder },
    gray: { bg: C.bgMuted, text: C.muted, border: C.border },
    purple: { bg: C.purpleBg, text: C.purpleText, border: "#ddd6fe" },
  }[color];
  return (
    <span style={{
      fontSize: 11,
      fontWeight: 600,
      padding: "2px 8px",
      borderRadius: 100,
      background: map.bg,
      color: map.text,
      border: `1px solid ${map.border}`,
      whiteSpace: "nowrap",
      textTransform: "capitalize",
    }}>
      {safeLabel}
    </span>
  );
}

function Button({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  style,
  icon: Icon,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "outline" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  style?: React.CSSProperties;
  icon?: React.ElementType;
}) {
  const sizeMap = {
    sm: { padding: "5px 12px", fontSize: 11 },
    md: { padding: "7px 16px", fontSize: 12 },
    lg: { padding: "12px 24px", fontSize: 13 },
  };

  const variantMap = {
    primary: { bg: C.teal, text: "white", border: "none" },
    secondary: { bg: C.tealBg, text: C.teal, border: `1px solid ${C.tealBorder}` },
    outline: { bg: "transparent", text: C.text, border: `1px solid ${C.border}` },
    danger: { bg: C.red, text: "white", border: "none" },
    success: { bg: C.green, text: "white", border: "none" },
  };

  const vm = variantMap[variant];
  const sm = sizeMap[size];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...sm,
        background: vm.bg,
        color: vm.text,
        border: vm.border,
        borderRadius: 8,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "inherit",
        opacity: disabled ? 0.5 : 1,
        transition: "all .15s",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        ...style,
      }}
      onMouseEnter={(e) => !disabled && (e.currentTarget.style.opacity = "0.85")}
      onMouseLeave={(e) => !disabled && (e.currentTarget.style.opacity = "1")}>
      {Icon && <Icon size={size === "sm" ? 11 : size === "md" ? 12 : 14} />}
      {children}
    </button>
  );
}

function Modal({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!isOpen) return null;

  return (
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
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: C.bg,
        borderRadius: 12,
        width: "90%",
        maxWidth: 700,
        maxHeight: "90vh",
        overflow: "auto",
        boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px",
          borderBottom: `1px solid ${C.border}`,
        }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{title}</h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: C.faint,
              padding: 0,
            }}>
            <X size={18} />
          </button>
        </div>
        <div style={{ padding: "20px" }}>{children}</div>
      </div>
    </div>
  );
}

// ─── Types ────────────────────────────────────────────
interface Taxpayer {
  id: string;
  name: string;
  phone: string;
  email: string;
  totalDue: number;
  paid: number;
  status: "active" | "overdue" | "resolved";
}

interface Transaction {
  id: string;
  taxpayerId: string;
  taxpayerName: string;
  amount: number;
  method: "mobile_money" | "cash" | "bank_transfer" | "check";
  status: "completed" | "pending" | "failed";
  timestamp: string;
  receiptId: string;
}

// ─── Main Component ───────────────────────────────────
export default function EmployeeCounterPaymentPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isNewPaymentModalOpen, setIsNewPaymentModalOpen] = useState(false);
  const [selectedTaxpayer, setSelectedTaxpayer] = useState<Taxpayer | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"mobile_money" | "cash" | "bank_transfer" | "check">("cash");
  const [showReceipt, setShowReceipt] = useState<Transaction | null>(null);

  // Fetch taxpayers
  const { data: taxpayersRes } = useQuery({
    queryKey: ["counter-taxpayers"],
    queryFn: () => request<{ taxpayers: Taxpayer[] }>("/admin/taxpayers-counter"),
    staleTime: 30000,
    placeholderData: { success: true, message: "", data: { taxpayers: [] } },
  });

  // Fetch transactions
  const { data: transactionsRes, refetch: refetchTransactions } = useQuery({
    queryKey: ["counter-transactions"],
    queryFn: () => request<Transaction[]>("/admin/counter/transactions?limit=20"),
    staleTime: 15000,
    placeholderData: { success: true, message: "", data: [] },
  });

  const taxpayers: Taxpayer[] = taxpayersRes?.data?.taxpayers || [];
  const transactions: Transaction[] = transactionsRes?.data || [];

  const filteredTaxpayers = taxpayers.filter(tp =>
    tp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tp.phone.includes(searchQuery) ||
    tp.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Process payment mutation
  const processPaymentMutation = useMutation({
    mutationFn: async () => {
      if (!selectedTaxpayer || !paymentAmount) return;
      return request<Transaction>("/admin/counter/process-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taxpayerId: selectedTaxpayer.id,
          amount: parseFloat(paymentAmount),
          method: paymentMethod,
        }),
      });
    },
    onSuccess: (data) => {
      setShowReceipt(data?.data ?? null);
      setPaymentAmount("");
      setPaymentMethod("cash");
      setIsNewPaymentModalOpen(false);
      setSelectedTaxpayer(null);
      refetchTransactions();
    },
  });

  const todayTransactions = transactions.filter(t => {
    const today = new Date().toLocaleDateString();
    return new Date(t.timestamp).toLocaleDateString() === today;
  });

  const todayTotal = todayTransactions
    .filter(t => t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .section { animation: fadeUp .4s ease both; }
        @keyframes slideIn { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .receipt-slide { animation: slideIn .3s ease; }
      `}</style>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>

        {/* Main Content */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Page Header */}
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: C.text, letterSpacing: "-.02em" }}>
              💳 Walk-in Desk (POS)
            </h1>
            <p style={{ fontSize: 13, color: C.faint, marginTop: 4 }}>
              Process customer payments at the counter
            </p>
          </div>

          {/* Quick Stats */}
          <div className="section" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            <Card style={{ padding: "16px" }}>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: 11, color: C.faint, fontWeight: 600, marginBottom: 4 }}>
                  Today's Total
                </p>
                <p style={{ fontSize: 28, fontWeight: 700, color: C.green }}>
                  ${todayTotal.toLocaleString()}
                </p>
                <p style={{ fontSize: 10, color: C.muted, marginTop: 4 }}>
                  {todayTransactions.filter(t => t.status === "completed").length} completed
                </p>
              </div>
            </Card>

            <Card style={{ padding: "16px" }}>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: 11, color: C.faint, fontWeight: 600, marginBottom: 4 }}>
                  Pending
                </p>
                <p style={{ fontSize: 28, fontWeight: 700, color: C.amber }}>
                  {todayTransactions.filter(t => t.status === "pending").length}
                </p>
                <p style={{ fontSize: 10, color: C.muted, marginTop: 4 }}>Awaiting confirmation</p>
              </div>
            </Card>

            <Card style={{ padding: "16px" }}>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: 11, color: C.faint, fontWeight: 600, marginBottom: 4 }}>
                  Active Taxpayers
                </p>
                <p style={{ fontSize: 28, fontWeight: 700, color: C.teal }}>
                  {taxpayers.length}
                </p>
                <p style={{ fontSize: 10, color: C.muted, marginTop: 4 }}>Available to pay</p>
              </div>
            </Card>
          </div>

          {/* Search & New Payment */}
          <div className="section">
            <Card>
              <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}`, display: "flex", gap: 8 }}>
                <div style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: C.bgMuted,
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  padding: "0 12px",
                }}>
                  <Search size={14} color={C.faint} />
                  <input
                    placeholder="Search by name, phone, or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      flex: 1,
                      border: "none",
                      background: "transparent",
                      fontSize: 12,
                      fontFamily: "inherit",
                      padding: "10px 0",
                      outline: "none",
                    }}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: C.faint,
                        padding: 0,
                      }}>
                      <X size={14} />
                    </button>
                  )}
                </div>
                <Button
                  variant="success"
                  size="md"
                  icon={Plus}
                  onClick={() => {
                    setSelectedTaxpayer(null);
                    setPaymentAmount("");
                    setPaymentMethod("cash");
                    setIsNewPaymentModalOpen(true);
                  }}>
                  New Payment
                </Button>
              </div>

              {filteredTaxpayers.length === 0 ? (
                <div style={{ padding: "40px 20px", textAlign: "center" }}>
                  <User size={32} color={C.border} style={{ marginBottom: 12 }} />
                  <p style={{ fontSize: 13, color: C.faint }}>
                    {searchQuery ? "No taxpayers found" : "No taxpayers available"}
                  </p>
                </div>
              ) : (
                <div>
                  {filteredTaxpayers.map((taxpayer, idx) => (
                    <div
                      key={taxpayer.id}
                      style={{
                        padding: "14px 18px",
                        borderBottom: idx < filteredTaxpayers.length - 1 ? `1px solid ${C.border}` : "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        cursor: "pointer",
                        transition: "background .1s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = C.bgMuted)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <div style={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            background: `linear-gradient(135deg,${C.teal},${C.teal}dd)`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontWeight: 700,
                            fontSize: 12,
                            flexShrink: 0,
                          }}>
                            {taxpayer.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                          </div>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <p style={{ fontSize: 12, fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {taxpayer.name}
                            </p>
                            <p style={{ fontSize: 10, color: C.faint }}>
                              {taxpayer.phone} • {taxpayer.email}
                            </p>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 12, fontSize: 11, fontWeight: 600 }}>
                          <span style={{ color: C.amber }}>Due: ${taxpayer.totalDue.toLocaleString()}</span>
                          <span style={{ color: C.green }}>Paid: ${taxpayer.paid.toLocaleString()}</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Badge
                          label={taxpayer.status}
                          color={
                            taxpayer.status === "active"
                              ? "blue"
                              : taxpayer.status === "overdue"
                              ? "red"
                              : "green"
                          }
                        />
                        <Button
                          size="sm"
                          variant="primary"
                          icon={DollarSign}
                          onClick={() => {
                            setSelectedTaxpayer(taxpayer);
                            setIsNewPaymentModalOpen(true);
                          }}>
                          Pay Now
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Recent Transactions */}
          <div className="section">
            <Card>
              <SectionHead
                title="Today's Transactions"
                sub={`${todayTransactions.length} transactions`}
                icon={Receipt}
                iconColor={C.teal}
              />
              <div style={{ padding: "16px 18px" }}>
                {todayTransactions.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "30px 20px" }}>
                    <Receipt size={32} color={C.border} style={{ marginBottom: 12 }} />
                    <p style={{ fontSize: 13, color: C.faint }}>No transactions today</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {todayTransactions.map((tx) => (
                      <div
                        key={tx.id}
                        onClick={() => setShowReceipt(tx)}
                        style={{
                          padding: "12px 14px",
                          background: C.bgMuted,
                          borderRadius: 8,
                          border: `1px solid ${C.border}`,
                          cursor: "pointer",
                          transition: "all .1s",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = C.tealBg)}
                        onMouseLeave={(e) => (e.currentTarget.style.background = C.bgMuted)}>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 2 }}>
                            {tx.taxpayerName}
                          </p>
                          <p style={{ fontSize: 10, color: C.faint }}>
                            {tx.method.replace(/_/g, " ")} • {new Date(tx.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <p style={{ fontSize: 13, fontWeight: 700, color: C.text }}>
                            ${tx.amount.toLocaleString()}
                          </p>
                          <Badge
                            label={tx.status}
                            color={tx.status === "completed" ? "green" : tx.status === "pending" ? "amber" : "red"}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Right Sidebar - Receipt Display */}
        <div>
          {showReceipt ? (
            <div className="receipt-slide" style={{
              position: "sticky",
              top: 20,
              background: C.bg,
              border: `2px solid ${C.teal}`,
              borderRadius: 12,
              overflow: "hidden",
            }}>
              {/* Receipt Header */}
              <div style={{
                background: `linear-gradient(135deg, ${C.teal}, ${C.tealText})`,
                color: "white",
                padding: "16px",
                textAlign: "center",
              }}>
                <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>✓ PAYMENT CONFIRMED</p>
                <p style={{ fontSize: 11, opacity: 0.9 }}>Receipt #{showReceipt.receiptId}</p>
              </div>

              {/* Receipt Content */}
              <div style={{ padding: "16px" }}>
                {/* Customer Info */}
                <div style={{ marginBottom: 16, paddingBottom: 12, borderBottom: `1px solid ${C.border}` }}>
                  <p style={{ fontSize: 10, color: C.faint, fontWeight: 600, marginBottom: 4 }}>CUSTOMER</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{showReceipt.taxpayerName}</p>
                </div>

                {/* Amount */}
                <div style={{ marginBottom: 16, paddingBottom: 12, borderBottom: `1px solid ${C.border}`, textAlign: "center" }}>
                  <p style={{ fontSize: 10, color: C.faint, fontWeight: 600, marginBottom: 4 }}>AMOUNT PAID</p>
                  <p style={{ fontSize: 28, fontWeight: 700, color: C.teal }}>
                    ${showReceipt.amount.toLocaleString()}
                  </p>
                </div>

                {/* Payment Details */}
                <div style={{ marginBottom: 16, paddingBottom: 12, borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 11 }}>
                    <span style={{ color: C.faint }}>Method:</span>
                    <span style={{ fontWeight: 600, color: C.text, textTransform: "capitalize" }}>
                      {showReceipt.method.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 11 }}>
                    <span style={{ color: C.faint }}>Time:</span>
                    <span style={{ fontWeight: 600, color: C.text }}>
                      {new Date(showReceipt.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                    <span style={{ color: C.faint }}>Date:</span>
                    <span style={{ fontWeight: 600, color: C.text }}>
                      {new Date(showReceipt.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <Button
                    variant="primary"
                    size="md"
                    style={{ width: "100%" }}>
                    Print Receipt
                  </Button>
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => setShowReceipt(null)}
                    style={{ width: "100%" }}>
                    Close
                  </Button>
                </div>

                {/* Footer */}
                <div style={{
                  marginTop: 16,
                  padding: "12px",
                  background: C.greenBg,
                  borderRadius: 8,
                  textAlign: "center",
                  borderLeft: `4px solid ${C.green}`,
                }}>
                  <p style={{ fontSize: 10, color: C.greenText, fontWeight: 600 }}>
                    ✓ Payment processed successfully
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <Card style={{ padding: "24px", textAlign: "center" }}>
              <Banknote size={48} color={C.border} style={{ margin: "0 auto 16px" }} />
              <p style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 4 }}>
                No Receipt Selected
              </p>
              <p style={{ fontSize: 11, color: C.faint }}>
                Click on a transaction to view its receipt
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* New Payment Modal */}
      <Modal
        isOpen={isNewPaymentModalOpen}
        onClose={() => {
          setIsNewPaymentModalOpen(false);
          setSelectedTaxpayer(null);
          setPaymentAmount("");
          setPaymentMethod("cash");
        }}
        title={selectedTaxpayer ? `Process Payment - ${selectedTaxpayer.name}` : "Select Taxpayer"}>
        <div>
          {!selectedTaxpayer ? (
            // Taxpayer Selection
            <div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.text, display: "block", marginBottom: 6 }}>
                  Search Taxpayer
                </label>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: C.bgMuted,
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  padding: "0 12px",
                }}>
                  <Search size={14} color={C.faint} />
                  <input
                    placeholder="Enter name, phone, or email..."
                    onChange={(e) => setSearchQuery(e.target.value)}
                    value={searchQuery}
                    style={{
                      flex: 1,
                      border: "none",
                      background: "transparent",
                      fontSize: 12,
                      fontFamily: "inherit",
                      padding: "10px 0",
                      outline: "none",
                    }}
                  />
                </div>
              </div>

              <div style={{ maxHeight: 300, overflow: "auto", border: `1px solid ${C.border}`, borderRadius: 8 }}>
                {filteredTaxpayers.length === 0 ? (
                  <p style={{ padding: "20px", textAlign: "center", color: C.faint, fontSize: 12 }}>
                    No taxpayers found
                  </p>
                ) : (
                  filteredTaxpayers.map((tp) => (
                    <div
                      key={tp.id}
                      onClick={() => {
                        setSelectedTaxpayer(tp);
                        setSearchQuery("");
                      }}
                      style={{
                        padding: "12px 14px",
                        borderBottom: `1px solid ${C.border}`,
                        cursor: "pointer",
                        transition: "background .1s",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = C.bgMuted)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                      <div>
                        <p style={{ fontSize: 11, fontWeight: 600, color: C.text }}>{tp.name}</p>
                        <p style={{ fontSize: 10, color: C.faint, marginTop: 2 }}>
                          {tp.phone} • {tp.email}
                        </p>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: C.amber }}>
                        ${tp.totalDue.toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            // Payment Form
            <div>
              <div style={{ marginBottom: 16, padding: "12px 14px", background: C.bgMuted, borderRadius: 8 }}>
                <p style={{ fontSize: 10, color: C.faint, fontWeight: 600, marginBottom: 4 }}>TAXPAYER</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6 }}>
                  {selectedTaxpayer.name}
                </p>
                <p style={{ fontSize: 10, color: C.faint }}>
                  Total Due: <span style={{ fontWeight: 600, color: C.text }}>
                    ${selectedTaxpayer.totalDue.toLocaleString()}
                  </span>
                </p>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.text, display: "block", marginBottom: 6 }}>
                  Payment Amount
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    fontSize: 14,
                    border: `1px solid ${C.border}`,
                    borderRadius: 8,
                    fontFamily: "inherit",
                    fontWeight: 600,
                    boxSizing: "border-box",
                  }}
                />
                {paymentAmount && (
                  <p style={{ fontSize: 10, color: C.teal, fontWeight: 600, marginTop: 4 }}>
                    Amount: ${parseFloat(paymentAmount).toLocaleString()}
                  </p>
                )}
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.text, display: "block", marginBottom: 6 }}>
                  Payment Method
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
                  {[
                    { value: "cash", label: "💵 Cash", icon: "💵" },
                    { value: "mobile_money", label: "📱 Mobile Money", icon: "📱" },
                    { value: "bank_transfer", label: "🏦 Bank Transfer", icon: "🏦" },
                    { value: "check", label: "✓ Check", icon: "✓" },
                  ].map((method) => (
                    <button
                      key={method.value}
                      onClick={() => setPaymentMethod(method.value as any)}
                      style={{
                        padding: "12px",
                        background: paymentMethod === method.value ? C.tealBg : C.bgMuted,
                        border: `1px solid ${paymentMethod === method.value ? C.teal : C.border}`,
                        borderRadius: 8,
                        cursor: "pointer",
                        transition: "all .1s",
                        fontSize: 11,
                        fontWeight: 600,
                        color: paymentMethod === method.value ? C.teal : C.text,
                      }}>
                      {method.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <Button
                  variant="outline"
                  onClick={() => setSelectedTaxpayer(null)}
                  style={{ flex: 1 }}>
                  Back
                </Button>
                <Button
                  variant="success"
                  onClick={() => processPaymentMutation.mutate()}
                  disabled={!paymentAmount || processPaymentMutation.isPending}
                  style={{ flex: 1 }}>
                  {processPaymentMutation.isPending ? "Processing..." : "Complete Payment"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}