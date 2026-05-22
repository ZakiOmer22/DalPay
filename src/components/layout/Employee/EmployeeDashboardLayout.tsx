// src/components/layout/Employee/EmployeeDashboardLayout.tsx
import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import EmployeeSidebar from "./EmployeeSidebar";
import EmployeeTopbar from "./EmployeeTopbar";
import { getAccessToken, getUserRole } from "@/services/api";

export default function EmployeeDashboardLayout() {
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
    if (!token || (role !== "employee" && role !== "admin" && role !== "super_admin")) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "#f0f2f1",
        color: "#0f172a",
        overflow: "hidden",
      }}
    >
      <EmployeeSidebar
        sidebarOpen={actuallyOpen}
        toggleSidebar={toggleSidebar}
        isMobile={isMobile}
      />

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
        <EmployeeTopbar
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
        </main>
      </div>
    </div>
  );
}