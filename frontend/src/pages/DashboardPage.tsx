// web/src/pages/DashboardPage.tsx
import { useEffect, useState, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { CircleDollarSign } from "lucide-react";
import { getAccessToken, getUserRole, clearTokens } from "@/services/api";

const messages = [
  "Preparing your dashboard…",
  "Verifying your credentials…",
  "Fetching your tax records…",
  "Almost ready…",
  "Loading your account…",
];

// Theme store – syncs with localStorage and applies "dark" class to <html>
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getSnapshot() {
  return localStorage.getItem("dalpay-theme") === "dark";
}

function applyTheme(isDark: boolean) {
  if (isDark) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const isDark = useSyncExternalStore(subscribe, getSnapshot);
  const [message, setMessage] = useState(messages[0]);
  const [ready, setReady] = useState(false);

  // Apply theme immediately and on every change
  useEffect(() => {
    applyTheme(isDark);
  }, [isDark]);

  useEffect(() => {
    const token = getAccessToken();
    const role = getUserRole();

    if (!token) {
      clearTokens();
      navigate("/login", { replace: true });
      return;
    }

    let index = 0;
    const msgInterval = setInterval(() => {
      index = (index + 1) % messages.length;
      setMessage(messages[index]);
    }, 2000);

    const redirectTimer = setTimeout(() => {
      clearInterval(msgInterval);
      switch (role) {
        case "super_admin":
        case "admin":
          navigate("/admin/dashboard", { replace: true });
          break;
        case "taxpayer":
          navigate("/taxpayer/dashboard", { replace: true });
          break;
        default:
          clearTokens();
          navigate("/login", { replace: true });
      }
    }, 2500);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReady(true);

    return () => {
      clearTimeout(redirectTimer);
      clearInterval(msgInterval);
    };
  }, [navigate]);

  if (!ready) return null;

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 ${isDark ? "bg-gray-950" : "bg-white"}`}>
      <div className="text-center space-y-8 max-w-sm w-full">
        <div className="relative mx-auto w-20 h-20">
          <div className={`absolute inset-0 rounded-full border-4 ${isDark ? "border-gray-700" : "border-gray-200"}`} />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <CircleDollarSign size={32} className="text-primary" strokeWidth={1.5} />
          </div>
        </div>

        <div>
          <h1 className={`text-4xl font-black tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>
            Dal<span className="text-primary">Pay</span>
          </h1>
          <p className={`text-sm mt-2 font-medium h-6 transition-all ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            {message}
          </p>
        </div>

        <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? "bg-gray-800" : "bg-gray-200"}`}>
          <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-primary to-accent animate-pulse" />
        </div>
      </div>
    </div>
  );
}