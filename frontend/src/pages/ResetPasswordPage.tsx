// web/src/pages/ResetPasswordPage.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { authApi } from '@/api/auth';

export default function ResetPasswordPage() {
  const navigate = useNavigate();

  // ✅ Read from sessionStorage directly in the initial state
  const [identifier] = useState(() => sessionStorage.getItem('resetIdentifier') || '');
  const [method] = useState<'email' | 'phone'>(() => {
    const saved = sessionStorage.getItem('resetMethod');
    return saved === 'email' || saved === 'phone' ? saved : 'email';
  });

  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !newPassword) {
      setError('Please enter the reset code and a new password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload =
        method === 'email'
          ? { email: identifier, code, newPassword }
          : { phoneNumber: identifier, code, newPassword };

      await authApi.resetPassword(payload);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Reset failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-[#0A0E1A]">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#0A5D6B] via-[#0F7B8C] to-[#3BA7BC]">
        <div className="absolute -top-40 -left-40 w-125 h-125 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-125 h-125 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-white/5 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col justify-center pl-14 xl:pl-20 pr-10 w-full text-white">
          <Link to="/" className="flex items-center gap-4 mb-14 group">
            <img src="/logo.png" alt="DalPay" className="h-20 w-auto brightness-0 invert" />
            <div>
              <span className="text-3xl font-extrabold tracking-tight">
                Dal<span className="text-accent">Pay</span>
              </span>
              <p className="text-white/50 text-[11px] uppercase tracking-[0.2em]">Ministry of Finance</p>
            </div>
          </Link>

          <h1 className="text-5xl xl:text-6xl font-extrabold leading-[1.1] mb-6">
            Set new
            <br />
            <span className="text-accent">password</span>
          </h1>
          <p className="text-white/60 text-lg max-w-md mb-12 leading-relaxed">
            Enter the 6‑digit code we sent you and choose a new password.
          </p>
        </div>
      </div>

      {/* Right panel – form */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900/30 px-6 py-16 relative">
        <div className="w-full max-w-105">
          <Link to="/" className="lg:hidden flex items-center justify-center gap-3 mb-10">
            <img src="/logo.png" alt="DalPay" className="h-7 w-auto" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              Dal<span className="text-[#0F7B8C]">Pay</span>
            </span>
          </Link>

          {success ? (
            <div className="bg-white dark:bg-[#111627] border border-gray-200 dark:border-gray-700 rounded-3xl p-8 shadow-2xl text-center">
              <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Password Reset!</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Redirecting you to login…
              </p>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-2xl flex items-center gap-3 text-sm text-red-700 dark:text-red-300">
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              <div className="bg-white dark:bg-[#111627] border border-gray-200 dark:border-gray-700 rounded-3xl p-8 shadow-2xl">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Reset Password</h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-8">
                  Code sent to {identifier}
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                      Reset Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                      className="w-full px-4 py-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[#0F7B8C] focus:ring-4 focus:ring-[#0F7B8C]/10 transition-all text-sm tracking-widest text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 12 characters"
                      className="w-full px-4 py-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[#0F7B8C] focus:ring-4 focus:ring-[#0F7B8C]/10 transition-all text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-2xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" /> Resetting…
                      </>
                    ) : (
                      <>
                        Set Password <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}