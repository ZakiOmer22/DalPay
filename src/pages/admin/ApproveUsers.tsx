import { useState, useEffect } from "react";
import { CheckCircle, XCircle, AlertCircle, Loader2, Eye, UserCheck, FileText } from "lucide-react";
import { adminApi } from "@/services/api";
import toast from "react-hot-toast";

// ─── Design tokens ──────────────────────────────────────────
const C = {
  border: "#e5eae8",
  bg: "#ffffff",
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
};

// ─── Reusable components ──────────────────────────────────────────
function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
      {children}
    </div>
  );
}

function Badge({ label, color }: { label: string; color: "green" | "amber" | "red" | "blue" | "gray" }) {
  const map = {
    green: { bg: C.tealBg, text: C.tealText, border: C.tealBorder },
    amber: { bg: C.amberBg, text: C.amberText, border: C.amberBorder },
    red: { bg: C.redBg, text: C.redText, border: C.redBorder },
    blue: { bg: C.blueBg, text: C.blueText, border: "#bfdbfe" },
    gray: { bg: C.bgMuted, text: C.muted, border: C.border },
  }[color];
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 600,
        padding: "2px 8px",
        borderRadius: 100,
        background: map.bg,
        color: map.text,
        border: `1px solid ${map.border}`,
        whiteSpace: "nowrap",
        textTransform: "capitalize",
      }}
    >
      {label}
    </span>
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
        backdropFilter: "blur(2px)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: C.bg,
          borderRadius: 12,
          width: "90%",
          maxWidth: 600,
          maxHeight: "90vh",
          overflow: "auto",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 20px",
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 700, color: C.text }}>{title}</h2>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: C.faint }}
          >
            <XCircle size={18} />
          </button>
        </div>
        <div style={{ padding: "20px" }}>{children}</div>
      </div>
    </div>
  );
}

// ─── Interfaces ───────────────────────────────────────────────────
interface PendingUser {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  createdAt: string;
  approvalStatus: string;
}

interface PendingVerification {
  id: string;
  user_id: string;
  type: string;
  data: {
    occupation: string;
    monthly_income: number;
    region: string;
    district: string;
    business_name?: string;
    business_type?: string;
    property_value?: number;
  };
  created_at: string;
  full_name: string;
  email: string;
  phone: string;
}

export default function ApproveUsers() {
  const [activeTab, setActiveTab] = useState<"users" | "profiles">("users");

  // User approvals state
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [errorUsers, setErrorUsers] = useState("");
  const [processingUserId, setProcessingUserId] = useState<string | null>(null);

  // Profile verifications state
  const [verifications, setVerifications] = useState<PendingVerification[]>([]);
  const [loadingVerifications, setLoadingVerifications] = useState(true);
  const [errorVerifications, setErrorVerifications] = useState("");
  const [processingVerificationId, setProcessingVerificationId] = useState<string | null>(null);
  const [selectedVerification, setSelectedVerification] = useState<PendingVerification | null>(null);
  const [adminNotes, setAdminNotes] = useState("");

  // Fetch pending users
  const fetchPendingUsers = async () => {
    try {
      const res = await adminApi.getPendingUsers();
      setUsers(res.data as PendingUser[]);
    } catch (err: any) {
      setErrorUsers(err.message || "Failed to load pending users");
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fetch pending profile verifications
  const fetchPendingVerifications = async () => {
    try {
      const res = await adminApi.getPendingVerifications();
      setVerifications(res.data as PendingVerification[]);
    } catch (err: any) {
      setErrorVerifications(err.message || "Failed to load verifications");
    } finally {
      setLoadingVerifications(false);
    }
  };

  // User approval handlers
  const handleApproveUser = async (userId: string) => {
    setProcessingUserId(userId);
    try {
      await adminApi.approveUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      toast.success("User approved successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to approve user");
    } finally {
      setProcessingUserId(null);
    }
  };

  const handleRejectUser = async (userId: string) => {
    setProcessingUserId(userId);
    try {
      await adminApi.rejectUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      toast.success("User rejected");
    } catch (err: any) {
      toast.error(err.message || "Failed to reject user");
    } finally {
      setProcessingUserId(null);
    }
  };

  // Profile verification handlers
  const handleApproveVerification = async (verificationId: string) => {
    setProcessingVerificationId(verificationId);
    try {
      await adminApi.approveVerification(verificationId, adminNotes);
      setVerifications((prev) => prev.filter((v) => v.id !== verificationId));
      setSelectedVerification(null);
      setAdminNotes("");
      toast.success("Profile verified successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to approve verification");
    } finally {
      setProcessingVerificationId(null);
    }
  };

  const handleRejectVerification = async (verificationId: string) => {
    setProcessingVerificationId(verificationId);
    try {
      await adminApi.rejectVerification(verificationId, adminNotes);
      setVerifications((prev) => prev.filter((v) => v.id !== verificationId));
      setSelectedVerification(null);
      setAdminNotes("");
      toast.success("Profile rejected");
    } catch (err: any) {
      toast.error(err.message || "Failed to reject verification");
    } finally {
      setProcessingVerificationId(null);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  useEffect(() => {
    if (activeTab === "profiles") {
      fetchPendingVerifications();
    }
  }, [activeTab]);

  const renderProfileDetails = (v: PendingVerification) => {
    const d = v.data;
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <strong>Full Name:</strong> {v.full_name}
        </div>
        <div>
          <strong>Email:</strong> {v.email}
        </div>
        <div>
          <strong>Phone:</strong> {v.phone}
        </div>
        <div>
          <strong>Occupation:</strong> {d.occupation}
        </div>
        <div>
          <strong>Monthly Income:</strong> ${d.monthly_income?.toLocaleString()}
        </div>
        <div>
          <strong>Region:</strong> {d.region}
        </div>
        <div>
          <strong>District:</strong> {d.district}
        </div>
        {d.business_name && (
          <div>
            <strong>Business Name:</strong> {d.business_name}
          </div>
        )}
        {d.business_type && (
          <div>
            <strong>Business Type:</strong> {d.business_type}
          </div>
        )}
        {d.property_value && (
          <div>
            <strong>Property Value:</strong> ${d.property_value.toLocaleString()}
          </div>
        )}
        <div>
          <strong>Submitted:</strong> {new Date(v.created_at).toLocaleString()}
        </div>
        <div style={{ marginTop: 8 }}>
          <label
            style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 4 }}
          >
            Admin Notes (optional)
          </label>
          <textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: 6,
              border: `1px solid ${C.border}`,
              fontSize: 12,
            }}
            rows={3}
            placeholder="Add internal notes..."
          />
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button
            onClick={() => handleApproveVerification(v.id)}
            disabled={processingVerificationId === v.id}
            style={{
              flex: 1,
              padding: "8px",
              background: C.teal,
              color: "white",
              border: "none",
              borderRadius: 6,
              fontWeight: 600,
              cursor: processingVerificationId === v.id ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            {processingVerificationId === v.id ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <CheckCircle size={14} />
            )}
            Approve
          </button>
          <button
            onClick={() => handleRejectVerification(v.id)}
            disabled={processingVerificationId === v.id}
            style={{
              flex: 1,
              padding: "8px",
              background: C.red,
              color: "white",
              border: "none",
              borderRadius: 6,
              fontWeight: 600,
              cursor: processingVerificationId === v.id ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            {processingVerificationId === v.id ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <XCircle size={14} />
            )}
            Reject
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: 0 }}>Pending Approvals</h1>
        <p style={{ fontSize: 13, color: C.faint, marginTop: 4 }}>
          Manage user accounts and tax profile verifications
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, borderBottom: `1px solid ${C.border}`, marginBottom: 8 }}>
        <button
          onClick={() => setActiveTab("users")}
          style={{
            padding: "10px 16px",
            fontSize: 13,
            fontWeight: activeTab === "users" ? 700 : 500,
            color: activeTab === "users" ? C.teal : C.muted,
            border: "none",
            background: "none",
            cursor: "pointer",
            borderBottom: activeTab === "users" ? `2px solid ${C.teal}` : "none",
            fontFamily: "inherit",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <UserCheck size={14} /> User Approvals ({users.length})
        </button>
        <button
          onClick={() => setActiveTab("profiles")}
          style={{
            padding: "10px 16px",
            fontSize: 13,
            fontWeight: activeTab === "profiles" ? 700 : 500,
            color: activeTab === "profiles" ? C.teal : C.muted,
            border: "none",
            background: "none",
            cursor: "pointer",
            borderBottom: activeTab === "profiles" ? `2px solid ${C.teal}` : "none",
            fontFamily: "inherit",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <FileText size={14} /> Profile Verifications ({verifications.length})
        </button>
      </div>

      {/* TAB: USER APPROVALS */}
      {activeTab === "users" && (
        <>
          {errorUsers && (
            <div
              style={{
                padding: "12px 16px",
                background: C.redBg,
                border: `1px solid ${C.redBorder}`,
                borderRadius: 10,
                color: C.redText,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <AlertCircle size={16} /> {errorUsers}
            </div>
          )}
          {loadingUsers ? (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 200 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  border: `3px solid ${C.border}`,
                  borderTopColor: C.teal,
                  animation: "spin 0.7s linear infinite",
                }}
              />
            </div>
          ) : users.length === 0 ? (
            <Card>
              <div style={{ padding: "40px 20px", textAlign: "center" }}>
                <CheckCircle size={40} color={C.teal} style={{ marginBottom: 12 }} />
                <p style={{ fontSize: 14, fontWeight: 500, color: C.text }}>All caught up!</p>
                <p style={{ fontSize: 12, color: C.faint }}>No pending user approvals at this time.</p>
              </div>
            </Card>
          ) : (
            <Card>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${C.border}`, background: C.bgMuted }}>
                      <th
                        style={{
                          textAlign: "left",
                          padding: "12px 16px",
                          fontSize: 11,
                          fontWeight: 700,
                          color: C.faint,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                        }}
                      >
                        Name
                      </th>
                      <th
                        style={{
                          textAlign: "left",
                          padding: "12px 16px",
                          fontSize: 11,
                          fontWeight: 700,
                          color: C.faint,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                        }}
                      >
                        Contact
                      </th>
                      <th
                        style={{
                          textAlign: "left",
                          padding: "12px 16px",
                          fontSize: 11,
                          fontWeight: 700,
                          color: C.faint,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                        }}
                      >
                        Registered
                      </th>
                      <th
                        style={{
                          textAlign: "left",
                          padding: "12px 16px",
                          fontSize: 11,
                          fontWeight: 700,
                          color: C.faint,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                        }}
                      >
                        Status
                      </th>
                      <th
                        style={{
                          textAlign: "left",
                          padding: "12px 16px",
                          fontSize: 11,
                          fontWeight: 700,
                          color: C.faint,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                        }}
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: "12px 16px", fontWeight: 500, color: C.text }}>
                          {user.fullName}
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: C.muted }}>
                          {user.email || user.phone || "—"}
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: C.muted }}>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <Badge label="pending" color="amber" />
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button
                              onClick={() => handleApproveUser(user.id)}
                              disabled={processingUserId === user.id}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                padding: "4px 10px",
                                borderRadius: 6,
                                background: C.teal + "15",
                                border: `1px solid ${C.teal}30`,
                                color: C.tealText,
                                fontSize: 11,
                                fontWeight: 600,
                                cursor: processingUserId === user.id ? "not-allowed" : "pointer",
                              }}
                            >
                              {processingUserId === user.id ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : (
                                <CheckCircle size={12} />
                              )}
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectUser(user.id)}
                              disabled={processingUserId === user.id}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                padding: "4px 10px",
                                borderRadius: 6,
                                background: C.red + "15",
                                border: `1px solid ${C.red}30`,
                                color: C.redText,
                                fontSize: 11,
                                fontWeight: 600,
                                cursor: processingUserId === user.id ? "not-allowed" : "pointer",
                              }}
                            >
                              {processingUserId === user.id ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : (
                                <XCircle size={12} />
                              )}
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}

      {/* TAB: PROFILE VERIFICATIONS */}
      {activeTab === "profiles" && (
        <>
          {errorVerifications && (
            <div
              style={{
                padding: "12px 16px",
                background: C.redBg,
                border: `1px solid ${C.redBorder}`,
                borderRadius: 10,
                color: C.redText,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <AlertCircle size={16} /> {errorVerifications}
            </div>
          )}
          {loadingVerifications ? (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 200 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  border: `3px solid ${C.border}`,
                  borderTopColor: C.teal,
                  animation: "spin 0.7s linear infinite",
                }}
              />
            </div>
          ) : verifications.length === 0 ? (
            <Card>
              <div style={{ padding: "40px 20px", textAlign: "center" }}>
                <CheckCircle size={40} color={C.teal} style={{ marginBottom: 12 }} />
                <p style={{ fontSize: 14, fontWeight: 500, color: C.text }}>No pending verifications</p>
                <p style={{ fontSize: 12, color: C.faint }}>All taxpayer profiles have been processed.</p>
              </div>
            </Card>
          ) : (
            <Card>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${C.border}`, background: C.bgMuted }}>
                      <th
                        style={{
                          textAlign: "left",
                          padding: "12px 16px",
                          fontSize: 11,
                          fontWeight: 700,
                          color: C.faint,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                        }}
                      >
                        Taxpayer
                      </th>
                      <th
                        style={{
                          textAlign: "left",
                          padding: "12px 16px",
                          fontSize: 11,
                          fontWeight: 700,
                          color: C.faint,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                        }}
                      >
                        Occupation
                      </th>
                      <th
                        style={{
                          textAlign: "left",
                          padding: "12px 16px",
                          fontSize: 11,
                          fontWeight: 700,
                          color: C.faint,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                        }}
                      >
                        Income
                      </th>
                      <th
                        style={{
                          textAlign: "left",
                          padding: "12px 16px",
                          fontSize: 11,
                          fontWeight: 700,
                          color: C.faint,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                        }}
                      >
                        Region
                      </th>
                      <th
                        style={{
                          textAlign: "left",
                          padding: "12px 16px",
                          fontSize: 11,
                          fontWeight: 700,
                          color: C.faint,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                        }}
                      >
                        Submitted
                      </th>
                      <th
                        style={{
                          textAlign: "left",
                          padding: "12px 16px",
                          fontSize: 11,
                          fontWeight: 700,
                          color: C.faint,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                        }}
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {verifications.map((v) => (
                      <tr key={v.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: "12px 16px", fontWeight: 500, color: C.text }}>
                          {v.full_name}
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: C.muted }}>
                          {v.data.occupation}
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: C.muted }}>
                          ${v.data.monthly_income?.toLocaleString()}
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: C.muted }}>
                          {v.data.region}
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: C.muted }}>
                          {new Date(v.created_at).toLocaleDateString()}
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <button
                            onClick={() => setSelectedVerification(v)}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              padding: "4px 10px",
                              borderRadius: 6,
                              background: C.blue + "15",
                              border: `1px solid ${C.blue}30`,
                              color: C.blueText,
                              fontSize: 11,
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            <Eye size={12} /> Review
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}

      <Modal
        isOpen={!!selectedVerification}
        onClose={() => {
          setSelectedVerification(null);
          setAdminNotes("");
        }}
        title="Profile Verification Details"
      >
        {selectedVerification && renderProfileDetails(selectedVerification)}
      </Modal>

      <style>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}