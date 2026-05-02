// web/src/pages/LoginPage.tsx
import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ShieldCheck,
  ArrowRight,
  Eye,
  EyeOff,
  Mail,
  AlertCircle,
  CheckCircle,
  Loader2,
  Smartphone,
  CreditCard,
  Zap,
  Globe,
  Sparkles,
  Sun,
  Moon,
} from "lucide-react";
import { authApi, setTokens } from "@/services/api";

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [loginMethod, setLoginMethod] = useState<"phone" | "email">("email");

  const [dark, setDark] = useState(() => {
    return localStorage.getItem("dalpay-theme") === "dark";
  });

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dark]);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem("dalpay-theme", next ? "dark" : "light");
  };

  const [successMessage, setSuccessMessage] = useState(
    searchParams.get("registered") === "true"
      ? "Account created successfully! Please sign in."
      : searchParams.get("verified") === "true"
        ? "Identity verified! Please sign in."
        : searchParams.get("welcome") === "true"
          ? "Account created! Please sign in to continue."
          : ""
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      setError(
        `Please enter your ${loginMethod === "phone" ? "phone number" : "email"} and password.`
      );
      return;
    }
    setIsSubmitting(true);
    setError("");
    setSuccessMessage("");
    try {
      const payload: any = { password };
      if (loginMethod === "email") payload.email = identifier.trim();
      else payload.phoneNumber = identifier.trim();

      const response = await authApi.login(payload);
      const { accessToken, refreshToken, user } = response.data;

      setTokens(accessToken, refreshToken, user.role);

      setSuccessMessage("Login successful! Redirecting...");

      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (err: any) {
      setError(err?.message || err?.data?.message || "Login failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-[#0A0E1A]">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#0A5D6B] via-[#0F7B8C] to-[#3BA7BC]">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-[#10B981]/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col justify-center pl-14 xl:pl-20 pr-10 w-full text-white">
          <Link to="/" className="flex items-center gap-4 mb-14 group">
            <img src="/logo.png" alt="DalPay" className="h-20 w-auto brightness-0 invert" />
            <div>
              <span className="text-3xl font-extrabold tracking-tight">
                Dal<span className="text-[#10B981]">Pay</span>
              </span>
              <p className="text-white/50 text-[11px] uppercase tracking-[0.2em]">Ministry of Finance</p>
            </div>
          </Link>

          <h1 className="text-5xl xl:text-6xl font-extrabold leading-[1.1] mb-6">
            Pay Taxes
            <br />
            <span className="text-[#10B981]">Without the Queue</span>
          </h1>
          <p className="text-white/60 text-lg max-w-md mb-12 leading-relaxed">
            Somaliland's official digital tax platform. Connect your mobile money —
            <strong className="text-white"> Zaad, eDahab, Nomad</strong> — and pay in seconds.
          </p>

          <div className="flex flex-wrap gap-3 max-w-md">
            {[
              { icon: Zap, label: "3-Minute Payments" },
              { icon: ShieldCheck, label: "Government Certified" },
              { icon: Globe, label: "Nationwide Access" },
              { icon: CreditCard, label: "All Mobile Money" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2.5"
              >
                <Icon size={15} className="text-[#10B981]" />
                <span className="text-xs font-semibold">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900/30 px-6 py-16 relative">

        <div className="w-full max-w-[420px]">
          <Link to="/" className="lg:hidden flex items-center justify-center gap-3 mb-10">
            <img src="/logo.png" alt="DalPay" className="h-7 w-auto" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              Dal<span className="text-[#0F7B8C]">Pay</span>
            </span>
          </Link>

          {successMessage && (
            <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-2xl flex items-center gap-3 text-sm text-green-700 dark:text-green-300">
              <CheckCircle size={18} />
              <span>{successMessage}</span>
            </div>
          )}
          {error && (
            <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-2xl flex items-center gap-3 text-sm text-red-700 dark:text-red-300">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <div className="bg-white dark:bg-[#111627] border border-gray-200 dark:border-gray-700 rounded-3xl p-8 shadow-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 text-[#0F7B8C] dark:text-[#3BA7BC] text-[11px] font-semibold mb-6">
              <Sparkles size={12} /> Official Government Platform
            </div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Welcome Back</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-8">Sign in to continue to your dashboard</p>

            <div className="flex gap-1.5 mb-6 p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl">
              {[
                { method: "email" as const, icon: Mail, label: "Email" },
                { method: "phone" as const, icon: Smartphone, label: "Phone" },
              ].map(({ method, icon: Icon, label }) => (
                <button
                  key={method}
                  onClick={() => {
                    setLoginMethod(method);
                    setIdentifier("");
                    setError("");
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    loginMethod === method
                      ? "bg-white dark:bg-[#0A0E1A] text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <Icon size={15} /> {label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                  {loginMethod === "phone" ? "Phone Number" : "Email Address"}
                </label>
                <input
                  type={loginMethod === "email" ? "email" : "tel"}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={loginMethod === "phone" ? "+252 63 123 4567" : "you@example.com"}
                  className="w-full px-4 py-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-[#0F7B8C] focus:ring-4 focus:ring-[#0F7B8C]/10 transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3.5 pr-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-[#0F7B8C] focus:ring-4 focus:ring-[#0F7B8C]/10 transition-all text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white p-1"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="text-right">
                <Link
                  to="/forgot-password"
                  className="text-xs text-[#0F7B8C] dark:text-[#3BA7BC] hover:text-[#0A5D6B] dark:hover:text-[#3BA7BC]/80 font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-2xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Signing in...
                  </>
                ) : (
                  <>
                    Sign In <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
              Don't have an account?{" "}
              <Link to="/register" className="text-[#0F7B8C] dark:text-[#3BA7BC] font-semibold hover:text-[#0A5D6B] dark:hover:text-[#3BA7BC]/80">
                Create one
              </Link>
            </p>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-[11px] text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <ShieldCheck size={12} className="text-[#0F7B8C]" /> PCI-DSS
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck size={12} className="text-[#0F7B8C]" /> 256-bit SSL
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck size={12} className="text-[#0F7B8C]" /> Government
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}