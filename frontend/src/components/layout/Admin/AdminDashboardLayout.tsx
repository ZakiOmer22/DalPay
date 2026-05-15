import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";
import { getAccessToken, getUserRole } from "@/services/api";

export default function AdminDashboardLayout() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const actuallyOpen = isMobile ? mobileSidebarOpen : sidebarOpen;

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileSidebarOpen(!mobileSidebarOpen);
    } else {
      setSidebarOpen(!sidebarOpen);
    }
  };

  useEffect(() => {
    const token = getAccessToken();
    const role = getUserRole();
    if (!token || (role !== "admin" && role !== "super_admin")) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "#f0f2f1",   // light page background
        color: "#0f172a",
        overflow: "hidden",
      }}
    >
      <AdminSidebar
        sidebarOpen={actuallyOpen}
        toggleSidebar={toggleSidebar}
        isMobile={isMobile}
      />

      {/* Overlay for mobile when sidebar is open */}
      {isMobile && mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 35,
          }}
        />
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minWidth: 0,
          marginLeft: isMobile ? 0 : sidebarOpen ? 256 : 68,
          transition: "margin-left 0.25s cubic-bezier(.4,0,.2,1)",
        }}
      >
        <AdminTopbar
          onMenuClick={isMobile ? () => setMobileSidebarOpen(!mobileSidebarOpen) : undefined}
        />
        <main
          style={{
            flex: 1,
            overflowY: "auto",
            padding: isMobile ? "16px" : "24px 28px",
            background: "#f0f2f1",
          }}
        >
          <Outlet />

          {/* Footer */}
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