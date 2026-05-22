// src/pages/Employee/EmployeeProcessPaymentPage.tsx
import { useState, useRef } from "react";
import {
  CreditCard, Search, CheckCircle2, DollarSign,
  Phone, User, FileText, Calendar, Zap, X,
  ArrowRight, Smartphone, Lock, ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";

interface Assessment {
  id: string;
  type: "income_tax" | "business_tax" | "property_tax" | "sales_tax" | "customs_tax";
  amount: number;
  dueDate: string;
  status: "unpaid" | "partially_paid" | "paid" | "overdue";
  paidAmount?: number;
}

interface Taxpayer {
  id: string;
  name: string;
  phone: string;
  national_id: string;
  email: string;
  occupation: string;
  business_name?: string;
  outstanding: number;
  status: "overdue" | "pending" | "current";
  assessments: Assessment[];
  monthly_income?: number;
  region?: string;
  property_value?: number;
}

// Mock data - replace with API calls
const mockSearchTaxpayer = (query: string): Taxpayer | null => {
  const taxpayers: Record<string, Taxpayer> = {
    "+252634567890": {
      id: "usr-001",
      name: "Ahmed Ali Hassan",
      phone: "+252634567890",
      national_id: "SL-2026-001",
      email: "ahmed@example.com",
      occupation: "Trader",
      business_name: "Hassan Trading Co.",
      outstanding: 5000,
      status: "overdue",
      monthly_income: 1500,
      region: "Maroodi Jeex",
      property_value: 50000,
      assessments: [
        {
          id: "ass-001",
          type: "income_tax",
          amount: 3000,
          dueDate: "2026-01-15",
          status: "unpaid",
        },
        {
          id: "ass-002",
          type: "business_tax",
          amount: 2000,
          dueDate: "2026-02-15",
          status: "unpaid",
        },
      ],
    },
    "+252634567891": {
      id: "usr-002",
      name: "Fatima Mohamed Ibrahim",
      phone: "+252634567891",
      national_id: "SL-2026-002",
      email: "fatima@example.com",
      occupation: "Shop Owner",
      business_name: "Fatima's Shop",
      outstanding: 2500,
      status: "pending",
      monthly_income: 2000,
      region: "Banaadir",
      property_value: 75000,
      assessments: [
        {
          id: "ass-003",
          type: "property_tax",
          amount: 2500,
          dueDate: "2026-03-15",
          status: "unpaid",
        },
      ],
    },
  };

  return taxpayers[query] || null;
};

const getTaxTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    income_tax: "Income Tax",
    business_tax: "Business Tax",
    property_tax: "Property Tax",
    sales_tax: "Sales Tax",
    customs_tax: "Customs Tax",
  };
  return labels[type] || type;
};

const getStatusColor = (
  status: string
): { bg: string; border: string; text: string; icon: string } => {
  switch (status) {
    case "overdue":
      return { bg: "#fef2f2", border: "#fecaca", text: "#991b1b", icon: "🔴" };
    case "pending":
      return { bg: "#fffbeb", border: "#fcd34d", text: "#92400e", icon: "🟡" };
    case "current":
      return { bg: "#f0fdf4", border: "#86efac", text: "#166534", icon: "🟢" };
    default:
      return { bg: "#f3f4f6", border: "#d1d5db", text: "#374151", icon: "⚪" };
  }
};

export default function EmployeeProcessPaymentPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTaxpayer, setSelectedTaxpayer] = useState<Taxpayer | null>(null);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState<
    "review" | "confirm_pin" | "processing" | "success"
  >("review");
  const [pin, setPin] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [, setShowPinInput] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResponse, setPaymentResponse] = useState<any>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a phone number or ID");
      return;
    }
    const taxpayer = mockSearchTaxpayer(searchQuery);
    if (taxpayer) {
      setSelectedTaxpayer(taxpayer);
      setPaymentAmount("");
      setSelectedAssessment(null);
      toast.success("Taxpayer found!");
    } else {
      toast.error("Taxpayer not found. Check phone or ID format.");
    }
  };

  const handleSelectAssessment = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    setPaymentAmount(assessment.amount.toString());
    setPaymentStep("review");
  };

  const handleInitiatePayment = () => {
    if (!selectedAssessment || !paymentAmount) {
      toast.error("Please select an assessment and enter amount");
      return;
    }
    if (
      parseFloat(paymentAmount) <= 0 ||
      parseFloat(paymentAmount) > selectedAssessment.amount
    ) {
      toast.error("Invalid payment amount");
      return;
    }
    if (!phoneNumber) {
      toast.error("Please enter payment phone number");
      return;
    }
    setPaymentStep("confirm_pin");
    setShowPinInput(true);
  };

  const handlePinSubmit = async () => {
    if (pin.length !== 4) {
      toast.error("PIN must be 4 digits");
      return;
    }

    setIsProcessing(true);
    setPaymentStep("processing");

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2500));

      const response = {
        paymentId: "pay-" + Math.random().toString(36).substr(2, 9),
        transactionRef: "zaad-" + Math.random().toString(36).substr(2, 12),
        taxpayerName: selectedTaxpayer?.name,
        taxpayerPhone: phoneNumber,
        assessmentType: getTaxTypeLabel(selectedAssessment?.type || ""),
        amount: parseFloat(paymentAmount),
        provider: "zaad",
        timestamp: new Date().toISOString(),
        status: "confirmed",
      };

      setPaymentResponse(response);
      setPaymentStep("success");
      toast.success("Payment processed successfully!");
    } catch (error) {
      toast.error("Payment failed. Please try again.");
      setPaymentStep("review");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setSearchQuery("");
    setSelectedTaxpayer(null);
    setSelectedAssessment(null);
    setPaymentAmount("");
    setPhoneNumber("");
    setPin("");
    setShowPinInput(false);
    setPaymentStep("review");
    setPaymentResponse(null);
    setShowPaymentModal(false);
  };

  const statusColor = selectedTaxpayer
    ? getStatusColor(selectedTaxpayer.status)
    : null;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "24px",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "8px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #22c55e, #16a34a)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CreditCard size={24} color="white" />
            </div>
            <h1
              style={{
                fontSize: "28px",
                fontWeight: "700",
                color: "#0f172a",
                margin: 0,
              }}
            >
              Process Payment
            </h1>
          </div>
          <p
            style={{
              fontSize: "14px",
              color: "#64748b",
              margin: "0 0 0 52px",
            }}
          >
            Search, review, and process tax payments with integrated Zaad mobile
            money
          </p>
        </div>

        {!selectedTaxpayer ? (
          // SEARCH SECTION
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "24px",
            }}
          >
            {/* Search Card */}
            <div
              style={{
                background: "white",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "28px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}
            >
              <h2
                style={{
                  fontSize: "18px",
                  fontWeight: "700",
                  color: "#0f172a",
                  marginBottom: "16px",
                }}
              >
                <Search size={20} style={{ display: "inline", marginRight: "8px" }} />
                Find Taxpayer
              </h2>
              <p
                style={{
                  fontSize: "13px",
                  color: "#64748b",
                  marginBottom: "16px",
                }}
              >
                Enter phone number or national ID to search
              </p>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="e.g., +252634567890 or SL-2026-001"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                  }}
                />
                <button
                  onClick={handleSearch}
                  style={{
                    padding: "10px 24px",
                    background: "#22c55e",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: "600",
                    fontSize: "14px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#16a34a")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "#22c55e")
                  }
                >
                  <Search size={16} /> Search
                </button>
              </div>
            </div>

            {/* Quick Tips */}
            <div
              style={{
                background: "#f0fdf4",
                border: "1px solid #86efac",
                borderRadius: "12px",
                padding: "16px",
                display: "flex",
                gap: "12px",
                alignItems: "flex-start",
              }}
            >
              <CheckCircle2 size={20} color="#16a34a" style={{ flexShrink: 0 }} />
              <div>
                <p style={{ fontWeight: "600", color: "#166534", margin: "0 0 4px 0" }}>
                  Tip: Test with provided numbers
                </p>
                <p
                  style={{
                    fontSize: "13px",
                    color: "#16a34a",
                    margin: 0,
                  }}
                >
                  Use <code style={{ background: "rgba(0,0,0,0.05)", padding: "2px 6px", borderRadius: "4px" }}>+252634567890</code> or{" "}
                  <code style={{ background: "rgba(0,0,0,0.05)", padding: "2px 6px", borderRadius: "4px" }}>+252634567891</code>
                </p>
              </div>
            </div>
          </div>
        ) : (
          // TAXPAYER PROFILE + PAYMENT SECTION
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "24px",
            }}
          >
            {/* LEFT: Taxpayer Profile Card */}
            <div
              style={{
                background: "white",
                border: `2px solid ${statusColor?.border}`,
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 4px 6px rgba(0,0,0,0.07)",
              }}
            >
              {/* Header */}
              <div
                style={{
                  background: statusColor?.bg,
                  padding: "20px",
                  borderBottom: `1px solid ${statusColor?.border}`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "12px",
                    }}
                  >
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "12px",
                        background: "rgba(34, 197, 94, 0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "2px solid #22c55e",
                      }}
                    >
                      <User size={24} color="#22c55e" />
                    </div>
                    <div>
                      <h2
                        style={{
                          fontSize: "16px",
                          fontWeight: "700",
                          color: "#0f172a",
                          margin: 0,
                        }}
                      >
                        {selectedTaxpayer.name}
                      </h2>
                      <p
                        style={{
                          fontSize: "12px",
                          color: statusColor?.text,
                          margin: "4px 0 0 0",
                          fontWeight: "500",
                          textTransform: "uppercase",
                        }}
                      >
                        {statusColor?.icon} {selectedTaxpayer.status.replace("_", " ")}
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTaxpayer(null)}
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: statusColor?.text,
                    padding: "4px",
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Info Grid */}
              <div
                style={{
                  padding: "20px",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: "11px",
                      color: "#94a3b8",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      margin: "0 0 4px 0",
                    }}
                  >
                    Phone
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Phone size={14} color="#64748b" />
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#0f172a",
                      }}
                    >
                      {selectedTaxpayer.phone}
                    </span>
                  </div>
                </div>

                <div>
                  <p
                    style={{
                      fontSize: "11px",
                      color: "#94a3b8",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      margin: "0 0 4px 0",
                    }}
                  >
                    National ID
                  </p>
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#0f172a",
                      fontFamily: "monospace",
                    }}
                  >
                    {selectedTaxpayer.national_id}
                  </span>
                </div>

                <div>
                  <p
                    style={{
                      fontSize: "11px",
                      color: "#94a3b8",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      margin: "0 0 4px 0",
                    }}
                  >
                    Email
                  </p>
                  <span style={{ fontSize: "13px", color: "#0f172a" }}>
                    {selectedTaxpayer.email}
                  </span>
                </div>

                <div>
                  <p
                    style={{
                      fontSize: "11px",
                      color: "#94a3b8",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      margin: "0 0 4px 0",
                    }}
                  >
                    Occupation
                  </p>
                  <span style={{ fontSize: "13px", color: "#0f172a" }}>
                    {selectedTaxpayer.occupation}
                  </span>
                </div>

                {selectedTaxpayer.business_name && (
                  <div style={{ gridColumn: "1 / -1" }}>
                    <p
                      style={{
                        fontSize: "11px",
                        color: "#94a3b8",
                        fontWeight: "600",
                        textTransform: "uppercase",
                        margin: "0 0 4px 0",
                      }}
                    >
                      Business
                    </p>
                    <span style={{ fontSize: "13px", color: "#0f172a" }}>
                      {selectedTaxpayer.business_name}
                    </span>
                  </div>
                )}

                {selectedTaxpayer.monthly_income && (
                  <div>
                    <p
                      style={{
                        fontSize: "11px",
                        color: "#94a3b8",
                        fontWeight: "600",
                        textTransform: "uppercase",
                        margin: "0 0 4px 0",
                      }}
                    >
                      Monthly Income
                    </p>
                    <span style={{ fontSize: "13px", color: "#0f172a" }}>
                      {selectedTaxpayer.monthly_income} SOS
                    </span>
                  </div>
                )}

                {selectedTaxpayer.region && (
                  <div>
                    <p
                      style={{
                        fontSize: "11px",
                        color: "#94a3b8",
                        fontWeight: "600",
                        textTransform: "uppercase",
                        margin: "0 0 4px 0",
                      }}
                    >
                      Region
                    </p>
                    <span style={{ fontSize: "13px", color: "#0f172a" }}>
                      {selectedTaxpayer.region}
                    </span>
                  </div>
                )}
              </div>

              {/* Outstanding Summary */}
              <div
                style={{
                  padding: "16px 20px",
                  background: "#f8fafc",
                  borderTop: "1px solid #e2e8f0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: "11px",
                      color: "#94a3b8",
                      fontWeight: "600",
                      margin: "0 0 4px 0",
                    }}
                  >
                    TOTAL OUTSTANDING
                  </p>
                  <p
                    style={{
                      fontSize: "22px",
                      fontWeight: "800",
                      color:
                        selectedTaxpayer.status === "overdue"
                          ? "#ef4444"
                          : "#22c55e",
                      margin: 0,
                    }}
                  >
                    {selectedTaxpayer.outstanding} SOS
                  </p>
                </div>
                <div
                  style={{
                    textAlign: "right",
                  }}
                >
                  <p
                    style={{
                      fontSize: "11px",
                      color: "#94a3b8",
                      fontWeight: "600",
                      margin: "0 0 4px 0",
                    }}
                  >
                    ASSESSMENTS
                  </p>
                  <p
                    style={{
                      fontSize: "22px",
                      fontWeight: "800",
                      color: "#0f7b8c",
                      margin: 0,
                    }}
                  >
                    {selectedTaxpayer.assessments.length}
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT: Assessments & Payment Section */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "20px",
              }}
            >
              {/* Assessments List */}
              <div
                style={{
                  background: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  padding: "20px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                }}
              >
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: "700",
                    color: "#0f172a",
                    marginBottom: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <FileText size={18} color="#22c55e" />
                  Tax Assessments
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {selectedTaxpayer.assessments.map((assessment) => {
                    const isSelected = selectedAssessment?.id === assessment.id;
                    const aStatusColor = getStatusColor(assessment.status);
                    return (
                      <div
                        key={assessment.id}
                        onClick={() => handleSelectAssessment(assessment)}
                        style={{
                          padding: "12px 14px",
                          border: isSelected
                            ? "2px solid #22c55e"
                            : `1px solid ${aStatusColor.border}`,
                          background: isSelected
                            ? "rgba(34, 197, 94, 0.08)"
                            : aStatusColor.bg,
                          borderRadius: "8px",
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateX(4px)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateX(0)";
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <p
                              style={{
                                fontSize: "13px",
                                fontWeight: "600",
                                color: "#0f172a",
                                margin: "0 0 4px 0",
                              }}
                            >
                              {getTaxTypeLabel(assessment.type)}
                            </p>
                            <p
                              style={{
                                fontSize: "11px",
                                color: "#64748b",
                                margin: 0,
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                            >
                              <Calendar size={12} />
                              Due:{" "}
                              {new Date(assessment.dueDate).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                            </p>
                          </div>
                          <div style={{ textAlign: "right", marginLeft: "12px" }}>
                            <p
                              style={{
                                fontSize: "14px",
                                fontWeight: "700",
                                color: aStatusColor.text,
                                margin: "0 0 4px 0",
                              }}
                            >
                              {assessment.amount} SOS
                            </p>
                            <span
                              style={{
                                fontSize: "10px",
                                fontWeight: "600",
                                color: aStatusColor.text,
                                background: aStatusColor.bg,
                                border: `1px solid ${aStatusColor.border}`,
                                padding: "2px 8px",
                                borderRadius: "4px",
                                display: "inline-block",
                                textTransform: "capitalize",
                              }}
                            >
                              {assessment.status.replace("_", " ")}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Payment Form */}
              {selectedAssessment && (
                <div
                  style={{
                    background: "white",
                    border: "2px solid #22c55e",
                    borderRadius: "12px",
                    padding: "20px",
                    boxShadow: "0 4px 12px rgba(34, 197, 94, 0.1)",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "16px",
                      fontWeight: "700",
                      color: "#0f172a",
                      marginBottom: "16px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <CreditCard size={18} color="#22c55e" />
                    Payment Details
                  </h3>

                  <div style={{ display: "grid", gap: "12px" }}>
                    {/* Amount */}
                    <div>
                      <label
                        style={{
                          fontSize: "12px",
                          fontWeight: "600",
                          color: "#475569",
                          display: "block",
                          marginBottom: "6px",
                        }}
                      >
                        Payment Amount (SOS)
                      </label>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          padding: "8px 12px",
                          background: "#f8fafc",
                        }}
                      >
                        <DollarSign size={16} color="#94a3b8" />
                        <input
                          type="number"
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                          style={{
                            flex: 1,
                            border: "none",
                            background: "transparent",
                            fontSize: "14px",
                            outline: "none",
                            color: "#0f172a",
                            fontWeight: "600",
                          }}
                        />
                      </div>
                      <p
                        style={{
                          fontSize: "11px",
                          color: "#64748b",
                          margin: "6px 0 0 0",
                        }}
                      >
                        Max: {selectedAssessment.amount} SOS
                      </p>
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label
                        style={{
                          fontSize: "12px",
                          fontWeight: "600",
                          color: "#475569",
                          display: "block",
                          marginBottom: "6px",
                        }}
                      >
                        Payment Phone (Zaad)
                      </label>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          padding: "8px 12px",
                          background: "#f8fafc",
                        }}
                      >
                        <Smartphone size={16} color="#94a3b8" />
                        <input
                          type="text"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder={selectedTaxpayer.phone}
                          style={{
                            flex: 1,
                            border: "none",
                            background: "transparent",
                            fontSize: "14px",
                            outline: "none",
                            color: "#0f172a",
                            fontWeight: "600",
                          }}
                        />
                      </div>
                    </div>

                    {/* Provider Badge */}
                    <div
                      style={{
                        padding: "10px 12px",
                        background: "rgba(59, 167, 188, 0.08)",
                        border: "1px solid rgba(59, 167, 188, 0.3)",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <Zap size={16} color="#3BA7BC" />
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: "600",
                          color: "#3BA7BC",
                        }}
                      >
                        Zaad Mobile Money
                      </span>
                      <div
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          background: "#10B981",
                          marginLeft: "auto",
                          boxShadow: "0 0 6px rgba(16, 185, 129, 0.5)",
                        }}
                      />
                    </div>

                    {/* Initiate Button */}
                    <button
                      onClick={() => {
                        handleInitiatePayment();
                        setShowPaymentModal(true);
                      }}
                      style={{
                        padding: "12px 16px",
                        background: "linear-gradient(135deg, #22c55e, #16a34a)",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        fontWeight: "700",
                        fontSize: "14px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        transition: "all 0.2s",
                        marginTop: "8px",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow =
                          "0 8px 16px rgba(34, 197, 94, 0.3)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <CreditCard size={16} />
                      Initiate Payment
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: "16px",
            }}
            onClick={() => !isProcessing && setShowPaymentModal(false)}
          >
            <div
              style={{
                background: "white",
                borderRadius: "16px",
                width: "100%",
                maxWidth: "500px",
                boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                overflow: "hidden",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* REVIEW STEP */}
              {paymentStep === "review" && (
                <>
                  <div
                    style={{
                      padding: "24px",
                      borderBottom: "1px solid #e2e8f0",
                    }}
                  >
                    <h2
                      style={{
                        fontSize: "18px",
                        fontWeight: "700",
                        color: "#0f172a",
                        margin: "0 0 8px 0",
                      }}
                    >
                      Review Payment
                    </h2>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "#64748b",
                        margin: 0,
                      }}
                    >
                      Confirm the details before proceeding
                    </p>
                  </div>

                  <div style={{ padding: "24px" }}>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "16px",
                        marginBottom: "24px",
                      }}
                    >
                      <div
                        style={{
                          padding: "12px",
                          background: "#f8fafc",
                          borderRadius: "8px",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        <p
                          style={{
                            fontSize: "11px",
                            color: "#94a3b8",
                            fontWeight: "600",
                            margin: "0 0 6px 0",
                          }}
                        >
                          TAXPAYER
                        </p>
                        <p
                          style={{
                            fontSize: "14px",
                            fontWeight: "700",
                            color: "#0f172a",
                            margin: 0,
                          }}
                        >
                          {selectedTaxpayer?.name}
                        </p>
                      </div>

                      <div
                        style={{
                          padding: "12px",
                          background: "#f8fafc",
                          borderRadius: "8px",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        <p
                          style={{
                            fontSize: "11px",
                            color: "#94a3b8",
                            fontWeight: "600",
                            margin: "0 0 6px 0",
                          }}
                        >
                          TAX TYPE
                        </p>
                        <p
                          style={{
                            fontSize: "14px",
                            fontWeight: "700",
                            color: "#0f172a",
                            margin: 0,
                          }}
                        >
                          {getTaxTypeLabel(selectedAssessment?.type || "")}
                        </p>
                      </div>

                      <div
                        style={{
                          padding: "12px",
                          background: "rgba(34, 197, 94, 0.08)",
                          borderRadius: "8px",
                          border: "2px solid #22c55e",
                        }}
                      >
                        <p
                          style={{
                            fontSize: "11px",
                            color: "#16a34a",
                            fontWeight: "600",
                            margin: "0 0 6px 0",
                          }}
                        >
                          AMOUNT
                        </p>
                        <p
                          style={{
                            fontSize: "20px",
                            fontWeight: "800",
                            color: "#16a34a",
                            margin: 0,
                          }}
                        >
                          {paymentAmount} SOS
                        </p>
                      </div>

                      <div
                        style={{
                          padding: "12px",
                          background: "#f8fafc",
                          borderRadius: "8px",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        <p
                          style={{
                            fontSize: "11px",
                            color: "#94a3b8",
                            fontWeight: "600",
                            margin: "0 0 6px 0",
                          }}
                        >
                          PAYMENT METHOD
                        </p>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <Zap size={14} color="#3BA7BC" />
                          <span
                            style={{
                              fontSize: "14px",
                              fontWeight: "700",
                              color: "#0f172a",
                            }}
                          >
                            Zaad
                          </span>
                        </div>
                      </div>

                      <div
                        style={{
                          padding: "12px",
                          background: "#f8fafc",
                          borderRadius: "8px",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        <p
                          style={{
                            fontSize: "11px",
                            color: "#94a3b8",
                            fontWeight: "600",
                            margin: "0 0 6px 0",
                          }}
                        >
                          PHONE
                        </p>
                        <p
                          style={{
                            fontSize: "14px",
                            fontWeight: "700",
                            color: "#0f172a",
                            margin: 0,
                            fontFamily: "monospace",
                          }}
                        >
                          {phoneNumber || selectedTaxpayer?.phone}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleInitiatePayment}
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        background: "linear-gradient(135deg, #22c55e, #16a34a)",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        fontWeight: "700",
                        fontSize: "14px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        marginBottom: "8px",
                      }}
                    >
                      <ShieldCheck size={16} />
                      Proceed to PIN
                    </button>

                    <button
                      onClick={() => setShowPaymentModal(false)}
                      style={{
                        width: "100%",
                        padding: "10px 16px",
                        background: "#f1f5f9",
                        color: "#475569",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        fontWeight: "600",
                        fontSize: "14px",
                        cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}

              {/* PIN CONFIRMATION STEP */}
              {paymentStep === "confirm_pin" && (
                <>
                  <div
                    style={{
                      padding: "24px",
                      borderBottom: "1px solid #e2e8f0",
                    }}
                  >
                    <h2
                      style={{
                        fontSize: "18px",
                        fontWeight: "700",
                        color: "#0f172a",
                        margin: "0 0 8px 0",
                      }}
                    >
                      Confirm with PIN
                    </h2>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "#64748b",
                        margin: 0,
                      }}
                    >
                      Enter the visitor's 4-digit Zaad PIN
                    </p>
                  </div>

                  <div style={{ padding: "24px" }}>
                    <div
                      style={{
                        marginBottom: "20px",
                        padding: "16px",
                        background: "#f8fafc",
                        borderRadius: "8px",
                        borderLeft: "4px solid #22c55e",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "13px",
                          color: "#0f172a",
                          margin: 0,
                        }}
                      >
                        Amount: <strong>{paymentAmount} SOS</strong>
                      </p>
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#64748b",
                          margin: "6px 0 0 0",
                        }}
                      >
                        via Zaad on {phoneNumber || selectedTaxpayer?.phone}
                      </p>
                    </div>

                    {/* PIN Input */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: "8px",
                        marginBottom: "24px",
                      }}
                    >
                      {[0, 1, 2, 3].map((i) => (
                        <div
                          key={i}
                          style={{
                            width: "50px",
                            height: "50px",
                            borderRadius: "12px",
                            border:
                              pin.length > i ? "2px solid #22c55e" : "2px solid #e2e8f0",
                            background:
                              pin.length > i
                                ? "rgba(34, 197, 94, 0.1)"
                                : "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "24px",
                            fontWeight: "700",
                            color: pin.length > i ? "#22c55e" : "#cbd5e1",
                          }}
                        >
                          {pin[i] ? "●" : "○"}
                        </div>
                      ))}
                    </div>

                    {/* Keypad */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: "8px",
                        marginBottom: "24px",
                      }}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, "", 0, "x"].map((num) => (
                        <button
                          key={num}
                          disabled={num === ""}
                          onClick={() => {
                            if (num === "x" && pin.length > 0) {
                              setPin((prev) => prev.slice(0, -1));
                            } else if (typeof num === "number" && pin.length < 4) {
                              setPin((prev) => prev + num);
                            }
                          }}
                          style={{
                            padding: "12px 8px",
                            background:
                              num === ""
                                ? "transparent"
                                : "#f1f5f9",
                            border: "1px solid #e2e8f0",
                            borderRadius: "8px",
                            fontWeight: "700",
                            fontSize: "16px",
                            cursor: num === "" ? "default" : "pointer",
                            color: "#0f172a",
                            transition: "all 0.2s",
                          }}
                          onMouseEnter={(e) => {
                            if (num !== "") {
                              e.currentTarget.style.background = "#e2e8f0";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (num !== "") {
                              e.currentTarget.style.background = "#f1f5f9";
                            }
                          }}
                        >
                          {num === "x" ? "⌫" : num}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={handlePinSubmit}
                      disabled={pin.length !== 4}
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        background:
                          pin.length === 4
                            ? "linear-gradient(135deg, #22c55e, #16a34a)"
                            : "#cbd5e1",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        fontWeight: "700",
                        fontSize: "14px",
                        cursor: pin.length === 4 ? "pointer" : "not-allowed",
                        marginBottom: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                      }}
                    >
                      <Lock size={16} />
                      Confirm Payment
                    </button>

                    <button
                      onClick={() => setPaymentStep("review")}
                      style={{
                        width: "100%",
                        padding: "10px 16px",
                        background: "#f1f5f9",
                        color: "#475569",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        fontWeight: "600",
                        fontSize: "14px",
                        cursor: "pointer",
                      }}
                    >
                      Back
                    </button>
                  </div>
                </>
              )}

              {/* PROCESSING STEP */}
              {paymentStep === "processing" && (
                <div
                  style={{
                    padding: "40px 24px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      width: "64px",
                      height: "64px",
                      margin: "0 auto 20px",
                      borderRadius: "50%",
                      background: "rgba(34, 197, 94, 0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      animation: "spin 1s linear infinite",
                    }}
                  >
                    <Zap size={32} color="#22c55e" />
                  </div>
                  <h2
                    style={{
                      fontSize: "18px",
                      fontWeight: "700",
                      color: "#0f172a",
                      margin: "0 0 8px 0",
                    }}
                  >
                    Processing Payment
                  </h2>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#64748b",
                      margin: 0,
                    }}
                  >
                    Please wait while we process your payment...
                  </p>
                </div>
              )}

              {/* SUCCESS STEP */}
              {paymentStep === "success" && paymentResponse && (
                <>
                  <div
                    style={{
                      padding: "24px",
                      background: "#f0fdf4",
                      borderBottom: "1px solid #86efac",
                    }}
                  >
                    <div
                      style={{
                        width: "64px",
                        height: "64px",
                        margin: "0 auto 16px",
                        borderRadius: "50%",
                        background: "rgba(16, 185, 129, 0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <CheckCircle2 size={40} color="#10B981" />
                    </div>
                    <h2
                      style={{
                        fontSize: "18px",
                        fontWeight: "700",
                        color: "#166534",
                        margin: "0 0 6px 0",
                        textAlign: "center",
                      }}
                    >
                      Payment Successful!
                    </h2>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "#16a34a",
                        margin: 0,
                        textAlign: "center",
                      }}
                    >
                      Your payment has been processed
                    </p>
                  </div>

                  <div style={{ padding: "24px" }}>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                        marginBottom: "20px",
                      }}
                    >
                      <div
                        style={{
                          padding: "12px",
                          background: "#f8fafc",
                          borderRadius: "8px",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        <p
                          style={{
                            fontSize: "11px",
                            color: "#94a3b8",
                            fontWeight: "600",
                            margin: "0 0 6px 0",
                          }}
                        >
                          TRANSACTION ID
                        </p>
                        <p
                          style={{
                            fontSize: "13px",
                            fontWeight: "700",
                            color: "#0f172a",
                            margin: 0,
                            fontFamily: "monospace",
                            wordBreak: "break-all",
                          }}
                        >
                          {paymentResponse.transactionRef}
                        </p>
                      </div>

                      <div
                        style={{
                          padding: "12px",
                          background: "#f8fafc",
                          borderRadius: "8px",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        <p
                          style={{
                            fontSize: "11px",
                            color: "#94a3b8",
                            fontWeight: "600",
                            margin: "0 0 6px 0",
                          }}
                        >
                          AMOUNT PAID
                        </p>
                        <p
                          style={{
                            fontSize: "16px",
                            fontWeight: "700",
                            color: "#10B981",
                            margin: 0,
                          }}
                        >
                          {paymentResponse.amount} SOS
                        </p>
                      </div>

                      <div
                        style={{
                          padding: "12px",
                          background: "#f8fafc",
                          borderRadius: "8px",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        <p
                          style={{
                            fontSize: "11px",
                            color: "#94a3b8",
                            fontWeight: "600",
                            margin: "0 0 6px 0",
                          }}
                        >
                          TIME
                        </p>
                        <p
                          style={{
                            fontSize: "13px",
                            color: "#0f172a",
                            margin: 0,
                          }}
                        >
                          {new Date(paymentResponse.timestamp).toLocaleString(
                            "en-GB"
                          )}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleReset}
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        background: "linear-gradient(135deg, #22c55e, #16a34a)",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        fontWeight: "700",
                        fontSize: "14px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                      }}
                    >
                      <ArrowRight size={16} />
                      New Payment
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (max-width: 1024px) {
          div:has(> div:nth-child(1)) {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}