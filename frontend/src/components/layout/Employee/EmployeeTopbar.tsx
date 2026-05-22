// src/components/layout/Employee/EmployeeTopbar.tsx
import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LogOut, Bell, Search, ChevronRight, X, Menu,
  AlertCircle, CreditCard, FileText, Eye, DollarSign,
} from "lucide-react";
import { clearTokens } from "@/services/api";
import toast from "react-hot-toast";

const C = {
  bg: "#ffffff",
  border: "#e5eae8",
  text: "#0f172a",
  muted: "#475569",
  faint: "#64748b",
  accent: "#22c55e",
  accentBg: "#22c55e10",
  accentText: "#16a34a",
  accentLight: "#f0fdf4",
  kbdBg: "#e2e8f0",
  kbdColor: "#475569",
  dateBg: "#f8fafc",
  dateBorder: "#e2e8f0",
  searchBg: "#f8fafc",
  searchBorder: "#e2e8f0",
  searchText: "#0f172a",
  bellBg: "#f8fafc",
  bellActiveBg: "#ffffff",
  bellActiveText: "#22c55e",
  dropdownShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
  unreadBg: "#f0fdf4",
  readBg: "#ffffff",
  itemBorder: "#f1f5f9",
  footerBg: "#f8fafc",
  footerBorder: "#e2e8f0",
  logoutBg: "#f8fafc",
  logoutBorder: "#e2e8f0",
  logoutColor: "#64748b",
  breadcrumbMuted: "#64748b",
  breadcrumbText: "#0f172a",
  dateText: "#475569",
  buttonText: "#475569",
  warningBg: "#fef3c7",
  warningBorder: "#fcd34d",
  warningText: "#92400e",
  successBg: "#f0fdf4",
  successBorder: "#86efac",
  successText: "#166534",
};

const PAGE_META: Record<string, { title: string; description: string }> = {
  "/employee/dashboard": { title: "Dashboard", description: "Your work overview" },
  "/employee/visitors": { title: "Visitors", description: "Manage office walk-ins" },
  "/employee/tax-assistance": { title: "Tax Assistance", description: "Help taxpayers" },
  "/employee/payments": { title: "Process Payment", description: "Collect tax payments" },
  "/employee/profile": { title: "My Profile", description: "Personal information" },
  "/employee/my-sessions": { title: "Session History", description: "Active logins" },
};

// Mock taxpayer search results (replace with API call)
const mockTaxpayerSearch = (query: string) => {
  if (!query.trim()) return [];
  return [
    {
      id: "usr-001",
      name: "Ahmed Ali Hassan",
      phone: "+252634567890",
      outstanding: 5000,
      status: "overdue",
      assessments: [
        { id: "ass-001", type: "Income Tax", amount: 3000, dueDate: "2026-01-15", status: "unpaid" },
        { id: "ass-002", type: "Business Tax", amount: 2000, dueDate: "2026-02-15", status: "unpaid" },
      ],
    },
    {
      id: "usr-002",
      name: "Fatima Mohamed Ibrahim",
      phone: "+252634567891",
      outstanding: 2500,
      status: "pending",
      assessments: [
        { id: "ass-003", type: "Property Tax", amount: 2500, dueDate: "2026-03-15", status: "unpaid" },
      ],
    },
  ].filter(
    (t) =>
      t.name.toLowerCase().includes(query.toLowerCase()) ||
      t.phone.includes(query)
  );
};

interface TaxpayerResult {
  id: string;
  name: string;
  phone: string;
  outstanding: number;
  status: string;
  assessments: Array<{
    id: string;
    type: string;
    amount: number;
    dueDate: string;
    status: string;
  }>;
}

interface SearchResult {
  type: "taxpayer";
  data: TaxpayerResult;
}

export default function EmployeeTopbar({
  onMenuClick,
}: {
  onMenuClick?: () => void;
}) {
  const loc = useLocation();
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("dalpay_user");
  const user = storedUser
    ? JSON.parse(storedUser)
    : { fullName: "Employee", role: "employee" };

  const initials = user?.fullName
    ?.split(" ")
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() ?? "E";

  // Notifications (empty for now)
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = 0;

  // Enhanced search
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const [, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [selectedAssessment, setSelectedAssessment] = useState("");

  const notificationRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const meta = PAGE_META[loc.pathname] ?? { title: "Dashboard", description: "" };
  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const handleLogout = () => {
    clearTokens();
    localStorage.removeItem("dalpay_user");
    navigate("/login");
    toast.success("Signed out successfully");
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    if (value.trim().length > 0) {
      const results = mockTaxpayerSearch(value);
      setSearchResults(results.map((r) => ({ type: "taxpayer" as const, data: r })));
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectResult = (result: SearchResult) => {
    setSelectedResult(result);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleProcessPayment = async () => {
    if (!selectedAssessment || !paymentAmount) {
      toast.error("Please select an assessment and enter amount");
      return;
    }

    if (!selectedResult) return;

    const assessment = selectedResult.data.assessments.find(
      (a) => a.id === selectedAssessment
    );
    if (!assessment) return;

    if (parseFloat(paymentAmount) > assessment.amount) {
      toast.error("Amount cannot exceed assessment total");
      return;
    }

    // Mock payment initiation
    toast.success(
      `Payment initiated: ${paymentAmount} SOS for ${selectedResult.data.name}`
    );
    
    // Close modal and reset
    setShowPaymentModal(false);
    setPaymentAmount("");
    setSelectedAssessment("");
    setSelectedResult(null);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node) &&
        bellRef.current &&
        !bellRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearch(false);
        setSearchResults([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowSearch(true);
      }
      if (e.key === "Escape" && showSearch) {
        setShowSearch(false);
        setSearchResults([]);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showSearch]);

  useEffect(() => {
    if (showSearch && searchInputRef.current) searchInputRef.current.focus();
  }, [showSearch]);

  return (
    <>
      <header
        className="topbar"
        style={{
          height: 64,
          background: C.bg,
          borderBottom: `1px solid ${C.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          flexShrink: 0,
          gap: 12,
          boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
          position: "relative",
          zIndex: 100,
        }}
      >
        {/* Breadcrumb */}
        <div
          className="breadcrumb"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            minWidth: 0,
            flex: "1 1 auto",
          }}
        >
          <span
            style={{
              fontSize: 13,
              color: C.breadcrumbMuted,
              whiteSpace: "nowrap",
              fontWeight: 500,
            }}
          >
            DalPay Employee
          </span>
          <ChevronRight
            size={12}
            color="#94a3b8"
            strokeWidth={2}
            style={{ flexShrink: 0 }}
          />
          <span
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: C.breadcrumbText,
              whiteSpace: "nowrap",
            }}
          >
            {meta.title}
          </span>
          {meta.description && (
            <>
              <span
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  background: "#cbd5e1",
                  flexShrink: 0,
                }}
              />
              <span
                className="breadcrumb-desc"
                style={{
                  fontSize: 13,
                  color: C.muted,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {meta.description}
              </span>
            </>
          )}
        </div>

        {/* Right actions */}
        <div
          className="actions"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexShrink: 0,
          }}
        >
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="mobile-menu-btn"
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                border: `1px solid ${C.border}`,
                background: C.bg,
                display: "none",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: C.buttonText,
                flexShrink: 0,
              }}
            >
              <Menu size={18} />
            </button>
          )}

          <span
            className="date-pill"
            style={{
              fontSize: 12,
              color: C.dateText,
              background: C.dateBg,
              padding: "6px 12px",
              borderRadius: 100,
              border: `1px solid ${C.dateBorder}`,
              whiteSpace: "nowrap",
              fontVariantNumeric: "tabular-nums",
              fontWeight: 500,
            }}
          >
            {today}
          </span>

          {/* Enhanced Search */}
          <div
            ref={searchRef}
            style={{ position: "relative", width: showSearch ? 360 : "auto" }}
            className="search-container"
          >
            {showSearch ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: C.searchBg,
                  border: `1px solid ${C.searchBorder}`,
                  borderRadius: 8,
                  padding: "4px 4px 4px 12px",
                  transition: "all 0.2s ease",
                  position: "relative",
                }}
              >
                <Search size={14} color="#94a3b8" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search by name or phone..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  style={{
                    border: "none",
                    background: "transparent",
                    padding: "6px 8px",
                    fontSize: 13,
                    width: "100%",
                    outline: "none",
                    color: C.searchText,
                  }}
                />
                <button
                  onClick={() => {
                    setShowSearch(false);
                    setSearchQuery("");
                    setSearchResults([]);
                  }}
                  style={{
                    background: "transparent",
                    border: "none",
                    padding: "4px 8px",
                    cursor: "pointer",
                    color: "#94a3b8",
                    borderRadius: 6,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <X size={14} />
                </button>

                {/* Search Results Dropdown */}
                {searchResults.length > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 6px)",
                      left: 0,
                      right: 0,
                      background: C.bg,
                      border: `1px solid ${C.border}`,
                      borderRadius: 8,
                      boxShadow: C.dropdownShadow,
                      zIndex: 1000,
                      maxHeight: 400,
                      overflowY: "auto",
                    }}
                  >
                    {searchResults.map((result, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelectResult(result)}
                        style={{
                          padding: "12px 14px",
                          borderBottom:
                            idx < searchResults.length - 1
                              ? `1px solid ${C.border}`
                              : "none",
                          cursor: "pointer",
                          transition: "background 0.2s",
                          background: C.bg,
                          // ":hover": { background: C.accentLight },
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = C.accentLight;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = C.bg;
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 10,
                          }}
                        >
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: 8,
                              background:
                                result.type === "taxpayer" ? C.accentBg : C.searchBg,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            <FileText
                              size={16}
                              color={
                                result.type === "taxpayer" ? C.accent : C.buttonText
                              }
                            />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p
                              style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: C.text,
                                marginBottom: 4,
                              }}
                            >
                              {result.data.name}
                            </p>
                            <p
                              style={{
                                fontSize: 12,
                                color: C.muted,
                                marginBottom: 4,
                              }}
                            >
                              {result.data.phone}
                            </p>
                            <div
                              style={{
                                display: "flex",
                                gap: 6,
                                alignItems: "center",
                              }}
                            >
                              <DollarSign
                                size={12}
                                color={
                                  result.data.status === "overdue"
                                    ? "#ef4444"
                                    : C.accent
                                }
                              />
                              <span
                                style={{
                                  fontSize: 11,
                                  fontWeight: 600,
                                  color:
                                    result.data.status === "overdue"
                                      ? "#ef4444"
                                      : C.accentText,
                                }}
                              >
                                Outstanding: {result.data.outstanding} SOS
                              </span>
                              {result.data.status === "overdue" && (
                                <AlertCircle
                                  size={12}
                                  color="#ef4444"
                                  style={{ marginLeft: "auto" }}
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowSearch(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  borderRadius: 8,
                  border: `1px solid ${C.searchBorder}`,
                  background: C.searchBg,
                  cursor: "pointer",
                  color: C.buttonText,
                  fontSize: 13,
                  height: 36,
                }}
              >
                <Search size={14} strokeWidth={2} />
                <span className="search-text">Search</span>
                <kbd
                  style={{
                    fontSize: 10,
                    background: C.kbdBg,
                    padding: "2px 6px",
                    borderRadius: 4,
                    color: C.kbdColor,
                  }}
                >
                  ⌘K
                </kbd>
              </button>
            )}
          </div>

          {/* Notifications Bell */}
          <div style={{ position: "relative" }}>
            <button
              ref={bellRef}
              onClick={() => setShowNotifications(!showNotifications)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                border: `1px solid ${C.border}`,
                background: showNotifications ? C.bellActiveBg : C.bellBg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                position: "relative",
                color: showNotifications ? C.bellActiveText : C.buttonText,
                flexShrink: 0,
              }}
            >
              <Bell size={16} strokeWidth={1.8} />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: 5,
                    right: 5,
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#ef4444",
                    border: "2px solid #fff",
                  }}
                />
              )}
            </button>

            {showNotifications && (
              <div
                ref={notificationRef}
                className="notif-dropdown"
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  right: 0,
                  width: 380,
                  maxWidth: "90vw",
                  background: C.bg,
                  borderRadius: 12,
                  border: `1px solid ${C.border}`,
                  boxShadow: C.dropdownShadow,
                  zIndex: 1000,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "14px 18px",
                    borderBottom: `1px solid ${C.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: C.footerBg,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Bell size={16} color={C.accent} />
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: C.text,
                      }}
                    >
                      Notifications
                    </span>
                  </div>
                </div>

                <div style={{ maxHeight: 400, overflowY: "auto" }}>
                  <div
                    style={{
                      padding: "40px 20px",
                      textAlign: "center",
                      color: C.faint,
                    }}
                  >
                    <Bell size={32} style={{ marginBottom: 12, opacity: 0.5 }} />
                    <p
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        marginBottom: 4,
                        color: C.text,
                      }}
                    >
                      No notifications
                    </p>
                    <p style={{ fontSize: 12 }}>You're all caught up!</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div
            style={{
              width: 1,
              height: 28,
              background: C.border,
              flexShrink: 0,
            }}
          />

          {/* User Avatar */}
          <div
            className="user-info"
            style={{ display: "flex", alignItems: "center", gap: 10 }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "linear-gradient(135deg, #22c55e, #16a34a)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 600,
                color: "white",
                flexShrink: 0,
                boxShadow: "0 4px 6px -1px rgba(34,197,94,0.3)",
              }}
            >
              {initials}
            </div>
            <div>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: C.text,
                  lineHeight: 1.4,
                  whiteSpace: "nowrap",
                }}
              >
                {user.fullName}
              </p>
              <p
                style={{
                  fontSize: 11,
                  color: C.muted,
                  textTransform: "capitalize",
                  lineHeight: 1.4,
                }}
              >
                {user.role}
              </p>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            title="Sign out"
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              border: `1px solid ${C.logoutBorder}`,
              background: C.logoutBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: C.logoutColor,
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#fecaca";
              e.currentTarget.style.color = "#ef4444";
              e.currentTarget.style.background = "#fef2f2";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = C.logoutBorder;
              e.currentTarget.style.color = C.logoutColor;
              e.currentTarget.style.background = C.logoutBg;
            }}
          >
            <LogOut size={14} strokeWidth={1.8} />
          </button>
        </div>
      </header>

      {/* Taxpayer Details + Payment Modal */}
      {selectedResult && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
            padding: "16px",
          }}
          onClick={() => setSelectedResult(null)}
        >
          <div
            style={{
              background: C.bg,
              borderRadius: 12,
              boxShadow: C.dropdownShadow,
              maxWidth: 600,
              width: "100%",
              maxHeight: "80vh",
              overflowY: "auto",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                padding: "20px 24px",
                borderBottom: `1px solid ${C.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: C.text, margin: 0 }}>
                  {selectedResult.data.name}
                </h2>
                <p
                  style={{
                    fontSize: 12,
                    color: C.muted,
                    margin: "4px 0 0 0",
                  }}
                >
                  {selectedResult.data.phone}
                </p>
              </div>
              <button
                onClick={() => setSelectedResult(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: C.buttonText,
                  padding: 4,
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Status Overview */}
            <div
              style={{
                padding: "16px 24px",
                background:
                  selectedResult.data.status === "overdue"
                    ? C.warningBg
                    : C.accentLight,
                borderBottom: `1px solid ${
                  selectedResult.data.status === "overdue"
                    ? C.warningBorder
                    : C.accent
                }`,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              {selectedResult.data.status === "overdue" ? (
                <AlertCircle
                  size={20}
                  color={C.warningText}
                  style={{ flexShrink: 0 }}
                />
              ) : (
                <Eye size={20} color={C.accentText} style={{ flexShrink: 0 }} />
              )}
              <div>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color:
                      selectedResult.data.status === "overdue"
                        ? C.warningText
                        : C.accentText,
                    margin: 0,
                  }}
                >
                  Outstanding Amount: {selectedResult.data.outstanding} SOS
                </p>
                <p
                  style={{
                    fontSize: 11,
                    color:
                      selectedResult.data.status === "overdue"
                        ? C.warningText
                        : C.accentText,
                    margin: "2px 0 0 0",
                    textTransform: "capitalize",
                  }}
                >
                  Status: {selectedResult.data.status}
                </p>
              </div>
            </div>

            {/* Assessments List */}
            <div style={{ padding: "20px 24px" }}>
              <h3
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: C.text,
                  marginBottom: 12,
                }}
              >
                Tax Assessments
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {selectedResult.data.assessments.map((assessment) => (
                  <div
                    key={assessment.id}
                    onClick={() => {
                      setSelectedAssessment(assessment.id);
                      setPaymentAmount(assessment.amount.toString());
                    }}
                    style={{
                      padding: "12px 14px",
                      border: `1px solid ${
                        selectedAssessment === assessment.id ? C.accent : C.border
                      }`,
                      borderRadius: 8,
                      background:
                        selectedAssessment === assessment.id ? C.accentLight : C.bg,
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        <p
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: C.text,
                            margin: 0,
                          }}
                        >
                          {assessment.type}
                        </p>
                        <p
                          style={{
                            fontSize: 11,
                            color: C.muted,
                            margin: "4px 0 0 0",
                          }}
                        >
                          Due: {new Date(assessment.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: C.accentText,
                            margin: 0,
                          }}
                        >
                          {assessment.amount} SOS
                        </p>
                        <span
                          style={{
                            fontSize: 10,
                            background: C.accentBg,
                            color: C.accentText,
                            padding: "2px 8px",
                            borderRadius: 4,
                            display: "inline-block",
                            marginTop: 4,
                          }}
                        >
                          {assessment.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Form */}
            {selectedAssessment && (
              <div
                style={{
                  padding: "16px 24px",
                  borderTop: `1px solid ${C.border}`,
                  background: C.searchBg,
                }}
              >
                <h3
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: C.text,
                    marginBottom: 12,
                  }}
                >
                  <CreditCard
                    size={16}
                    style={{ marginRight: 8, display: "inline" }}
                  />
                  Process Payment
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <label
                      style={{
                        fontSize: 12,
                        fontWeight: 500,
                        color: C.text,
                        display: "block",
                        marginBottom: 6,
                      }}
                    >
                      Amount (SOS)
                    </label>
                    <input
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        border: `1px solid ${C.border}`,
                        borderRadius: 6,
                        fontSize: 13,
                        color: C.text,
                        background: C.bg,
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                  <button
                    onClick={handleProcessPayment}
                    style={{
                      padding: "10px 16px",
                      borderRadius: 8,
                      border: "none",
                      background: C.accent,
                      color: "white",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#16a34a";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = C.accent;
                    }}
                  >
                    <CreditCard
                      size={14}
                      style={{ marginRight: 6, display: "inline" }}
                    />
                    Initiate Payment
                  </button>
                </div>
              </div>
            )}

            {/* Close Button */}
            <div
              style={{
                padding: "12px 24px",
                borderTop: `1px solid ${C.border}`,
                display: "flex",
                justifyContent: "flex-end",
                gap: 8,
              }}
            >
              <button
                onClick={() => setSelectedResult(null)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 6,
                  border: `1px solid ${C.border}`,
                  background: C.bg,
                  color: C.text,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 768px) {
          .topbar {
            height: auto !important;
            flex-direction: column;
            padding: 12px 16px !important;
            gap: 10px;
          }
          .breadcrumb {
            flex-wrap: wrap;
          }
          .breadcrumb-desc {
            display: none;
          }
          .actions {
            flex-wrap: wrap;
            justify-content: flex-end;
            gap: 6px;
            width: 100%;
          }
          .date-pill {
            font-size: 10px !important;
            padding: 4px 10px !important;
          }
          .search-text {
            display: none;
          }
          .user-info {
            display: none !important;
          }
          .notif-dropdown {
            width: 100vw !important;
            max-width: 100vw !important;
            right: -16px !important;
          }
          .mobile-menu-btn {
            display: flex !important;
          }
        }
      `}</style>
    </>
  );
}