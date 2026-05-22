// src/pages/admin/ApproveUsers.tsx
import { useState, useEffect } from "react";
import { CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { adminApi } from "@/services/api";
import toast from "react-hot-toast";

// ─── Design tokens (identical to your other admin pages) ──────────
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

// ─── Reusable card & badge ────────────────────────────────────────
function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: C.bg,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
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

// Interface matching the actual API response (camelCase)
interface PendingUser {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  createdAt: string;
  approvalStatus: string;
}

export default function ApproveUsers() {
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchPendingUsers = async () => {
    try {
      const res = await adminApi.getPendingUsers();
      setUsers(res.data);
    } catch (err: any) {
      setError(err.message || "Failed to load pending users");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    setProcessingId(userId);
    try {
      await adminApi.approveUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      toast.success("User approved successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to approve user");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (userId: string) => {
    setProcessingId(userId);
    try {
      await adminApi.rejectUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      toast.success("User rejected");
    } catch (err: any) {
      toast.error(err.message || "Failed to reject user");
    } finally {
      setProcessingId(null);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 300 }}>
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
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: 0 }}>Pending Approvals</h1>
        <p style={{ fontSize: 13, color: C.faint, marginTop: 4 }}>
          {users.length} user{users.length !== 1 ? "s" : ""} waiting for review
        </p>
      </div>

      {error && (
        <div
          style={{
            padding: "12px 16px",
            background: C.redBg,
            border: `1px solid ${C.redBorder}`,
            borderRadius: 10,
            color: C.redText,
            fontSize: 13,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {users.length === 0 ? (
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
                  {["Name", "Contact (hashed)", "Registered", "Status", "Actions"].map((h) => (
                    <th
                      key={h}
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
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    style={{ borderBottom: `1px solid ${C.border}`, transition: "background 0.1s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = C.bgMuted)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "12px 16px", fontWeight: 500, color: C.text }}>{user.fullName}</td>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: C.muted, fontFamily: "monospace" }}>
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
                          onClick={() => handleApprove(user.id)}
                          disabled={processingId === user.id}
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
                            cursor: processingId === user.id ? "not-allowed" : "pointer",
                            fontFamily: "inherit",
                            transition: "all 0.1s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = C.teal;
                            e.currentTarget.style.color = "white";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = C.teal + "15";
                            e.currentTarget.style.color = C.tealText;
                          }}
                        >
                          {processingId === user.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(user.id)}
                          disabled={processingId === user.id}
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
                            cursor: processingId === user.id ? "not-allowed" : "pointer",
                            fontFamily: "inherit",
                            transition: "all 0.1s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = C.red;
                            e.currentTarget.style.color = "white";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = C.red + "15";
                            e.currentTarget.style.color = C.redText;
                          }}
                        >
                          {processingId === user.id ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />}
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
    </div>
  );
}