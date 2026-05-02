import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";
import { getAccessToken, getUserRole } from "@/services/api";

export default function AdminDashboardLayout() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    const role = getUserRole();
    if (!token || (role !== "admin" && role !== "super_admin")) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  return (
    <div style={{ display: "flex", height: "100vh", background: "#f0f2f1", overflow: "hidden" }}>
      <AdminSidebar
        sidebarOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minWidth: 0,
          marginLeft: sidebarOpen ? 256 : 68,
          transition: "margin-left 0.25s cubic-bezier(.4,0,.2,1)",
        }}
      >
        <AdminTopbar />
        <main style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          <Outlet />

          {/* Elegant Footer */}
          <div
            style={{
              marginTop: 48,
              padding: "24px 0 16px",
              borderTop: "1px solid rgba(245, 158, 11, 0.15)",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: -1,
                left: "10%",
                width: "80%",
                height: 2,
                background:
                  "linear-gradient(90deg, transparent, #f59e0b, #d97706, #f59e0b, transparent)",
                borderRadius: "50%",
              }}
            />
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "rgba(245, 158, 11, 0.05)",
                  padding: "8px 20px",
                  borderRadius: 100,
                  backdropFilter: "blur(4px)",
                }}
              >
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    background: "linear-gradient(135deg, #f59e0b, #d97706)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    color: "transparent",
                    letterSpacing: "0.5px",
                  }}
                >
                  DalPay Government Portal
                </span>
                <span style={{ fontSize: 11, color: "#f59e0b", opacity: 0.7 }}>
                  © {new Date().getFullYear()}
                </span>
              </div>
              <p
                style={{
                  fontSize: 11,
                  color: "#94a3b8",
                  marginTop: 12,
                  letterSpacing: "0.3px",
                }}
              >
                Tax Administration System • Security • Compliance • Efficiency
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}