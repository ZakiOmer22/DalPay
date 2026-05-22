// src/pages/taxpayer/NotificationsPage.tsx
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bell, CheckCheck, Trash2, EyeOff, AlertCircle,
  RefreshCw, CheckCircle,
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

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  type?: string;
}

export default function NotificationsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [markingAll, setMarkingAll] = useState(false);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => request("/notification"),
  });

  // ✅ SAFE ARRAY EXTRACTION – prevents "filter is not a function"
  const rawData = (data as any)?.data;
  let notifications: Notification[] = [];
  if (Array.isArray(rawData)) {
    notifications = rawData;
  } else if (rawData?.notifications && Array.isArray(rawData.notifications)) {
    notifications = rawData.notifications;
  } else if (Array.isArray(data)) {
    notifications = data;
  }

  const stats = useMemo(() => {
    const total = notifications.length;
    const unread = notifications.filter(n => !n.read).length;
    const read = total - unread;
    return { total, unread, read };
  }, [notifications]);

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => request(`/notification/${id}/read`, { method: "PATCH" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Marked as read");
    },
    onError: (err: any) => toast.error(err.message || "Failed to mark as read"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => request(`/notification/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Notification deleted");
    },
    onError: (err: any) => toast.error(err.message || "Failed to delete"),
  });

  const handleMarkRead = (id: string) => markAsReadMutation.mutate(id);
  const handleDelete = (id: string) => {
    if (confirm("Delete this notification?")) deleteMutation.mutate(id);
  };

  const handleMarkAllRead = async () => {
    if (stats.unread === 0) {
      toast("No unread notifications");
      return;
    }
    if (!confirm("Mark all notifications as read?")) return;
    setMarkingAll(true);
    try {
      // Try dedicated endpoint first
      try {
        await request("/notification/read-all", { method: "POST" });
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
        toast.success("All notifications marked as read");
      } catch (err) {
        // Fallback: mark each unread individually
        const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
        await Promise.all(unreadIds.map(id => markAsReadMutation.mutateAsync(id)));
        toast.success("All notifications marked as read");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to mark all as read");
    } finally {
      setMarkingAll(false);
    }
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
          <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: 0 }}>Notifications</h1>
          <p style={{ fontSize: 13, color: C.faint, marginTop: 4 }}>Stay updated on your tax activities</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => refetch()} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, background: C.bg, border: `1px solid ${C.border}`, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            <RefreshCw size={13} /> Refresh
          </button>
          <button onClick={handleMarkAllRead} disabled={markingAll} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, background: C.teal, color: "white", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", opacity: markingAll ? 0.6 : 1 }}>
            <CheckCheck size={13} /> Mark all as read
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        <StatCard label="Total" value={stats.total} icon={Bell} color={C.blue} />
        <StatCard label="Unread" value={stats.unread} icon={EyeOff} color={C.amber} sub="New notifications" />
        <StatCard label="Read" value={stats.read} icon={CheckCircle} color={C.teal} />
      </div>

      <Card>
        <div style={{ overflowX: "auto" }}>
          {notifications.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <Bell size={32} color={C.border} style={{ margin: "0 auto 10px" }} />
              <p style={{ fontSize: 14, fontWeight: 600, color: C.text }}>No notifications</p>
              <p style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>You're all caught up</p>
            </div>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 3fr 100px 80px", gap: 8, padding: "10px 20px", borderBottom: `1px solid ${C.border}`, background: C.bgMuted }}>
                {["Title", "Message", "Date", "Actions"].map(h => (
                  <span key={h} style={{ fontSize: 10, fontWeight: 700, color: C.faint, letterSpacing: ".06em", textTransform: "uppercase" }}>{h}</span>
                ))}
              </div>
              {notifications.map((n, idx) => (
                <div
                  key={n.id}
                  style={{
                    display: "grid", gridTemplateColumns: "2fr 3fr 100px 80px", gap: 8,
                    padding: "12px 20px", borderBottom: idx < notifications.length - 1 ? `1px solid ${C.border}` : "none",
                    background: n.read ? "transparent" : C.tealBg + "40",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = C.bgMuted}
                  onMouseLeave={e => e.currentTarget.style.background = n.read ? "transparent" : C.tealBg + "40"}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {!n.read && <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.teal, flexShrink: 0 }} />}
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{n.title}</span>
                  </div>
                  <span style={{ fontSize: 12, color: C.muted }}>{n.message}</span>
                  <span style={{ fontSize: 11, color: C.faint }}>{new Date(n.created_at).toLocaleDateString()}</span>
                  <div style={{ display: "flex", gap: 8 }}>
                    {!n.read && (
                      <button onClick={() => handleMarkRead(n.id)} style={{ background: "none", border: "none", cursor: "pointer", color: C.blue, fontSize: 11 }} title="Mark read">
                        <CheckCheck size={14} />
                      </button>
                    )}
                    <button onClick={() => handleDelete(n.id)} style={{ background: "none", border: "none", cursor: "pointer", color: C.red, fontSize: 11 }} title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </Card>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}