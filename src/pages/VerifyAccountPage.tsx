// web/src/pages/VerifyAccountPage.tsx
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ShieldCheck, Mail, Smartphone, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { request } from "@/services/api";

export default function VerifyAccountPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMethod = (searchParams.get("method") as "email" | "phone") || "email";
  const initialIdentifier = searchParams.get("identifier") || "";

  const [method, setMethod] = useState<"email" | "phone">(initialMethod);
  const [identifier, setIdentifier] = useState(initialIdentifier);
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"input" | "verify">("input");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSendCode = async () => {
    if (!identifier.trim()) {
      setError("Please enter your email or phone number.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await request("/auth/send-verification", {
        method: "POST",
        body: JSON.stringify({ identifier: identifier.trim(), method }),
      });
      setStep("verify");
      setSuccess("A verification code has been sent.");
    } catch (err: any) {
      setError(err.message || "Failed to send code.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!code.trim()) {
      setError("Please enter the verification code.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await request("/auth/verify-code", {
        method: "POST",
        body: JSON.stringify({ identifier: identifier.trim(), method, code: code.trim() }),
      });
      setSuccess("Account verified! Redirecting to login...");
      setTimeout(() => navigate("/login?verified=true"), 2000);
    } catch (err: any) {
      setError(err.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md bg-white dark:bg-[#111627] border border-gray-200 dark:border-gray-700 rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#0F7B8C]/10 mb-4">
            <ShieldCheck size={32} className="text-[#0F7B8C]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Verify Your Account</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            We need to confirm your {method} before you can log in.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-xl flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
            <AlertCircle size={16} /> {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-xl flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
            <CheckCircle size={16} /> {success}
          </div>
        )}

        {/* Method toggle */}
        <div className="flex gap-1.5 mb-6 p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl">
          {[
            { m: "email" as const, icon: Mail, label: "Email" },
            { m: "phone" as const, icon: Smartphone, label: "Phone" },
          ].map(({ m, icon: Icon, label }) => (
            <button
              key={m}
              onClick={() => {
                setMethod(m);
                setIdentifier("");
                setStep("input");
                setError("");
                setSuccess("");
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                method === m
                  ? "bg-white dark:bg-[#0A0E1A] text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>

        {step === "input" ? (
          <>
            <div className="mb-6">
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                {method === "email" ? "Email Address" : "Phone Number"}
              </label>
              <input
                type={method === "email" ? "email" : "tel"}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={method === "email" ? "you@example.com" : "+252 63 123 4567"}
                className="w-full px-4 py-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-[#0F7B8C] focus:ring-4 focus:ring-[#0F7B8C]/10 transition-all text-sm"
              />
            </div>
            <button
              onClick={handleSendCode}
              disabled={loading}
              className="w-full py-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-2xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : null}
              Send Verification Code
            </button>
          </>
        ) : (
          <>
            <div className="mb-6">
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                Verification Code
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                className="w-full px-4 py-3.5 text-center text-2xl tracking-widest bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white focus:outline-none focus:border-[#0F7B8C] focus:ring-4 focus:ring-[#0F7B8C]/10 transition-all"
              />
            </div>
            <button
              onClick={handleVerify}
              disabled={loading || code.length !== 6}
              className="w-full py-3.5 bg-[#0F7B8C] text-white font-bold rounded-2xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : null}
              Verify &amp; Activate Account
            </button>
            <button
              onClick={() => setStep("input")}
              className="w-full mt-3 py-2 text-sm text-[#0F7B8C] hover:underline"
            >
              ← Back
            </button>
          </>
        )}

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          Already verified?{" "}
          <button onClick={() => navigate("/login")} className="text-[#0F7B8C] font-semibold hover:underline">
            Log in
          </button>
        </p>
      </div>
    </div>
  );
}