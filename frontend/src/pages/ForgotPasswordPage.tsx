// web/src/pages/ForgotPasswordPage.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  ArrowRight,
  Mail,
  AlertCircle,
  CheckCircle,
  Loader2,
  Smartphone,
} from 'lucide-react';
import { authApi } from '@/api/auth';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError(`Please enter your ${method === 'email' ? 'email address' : 'phone number'}.`);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload =
        method === 'email'
          ? { email: identifier.trim() }
          : { phoneNumber: identifier.trim() };

      await authApi.forgotPassword(payload);

      // Store identifier and method for the reset page
      sessionStorage.setItem('resetIdentifier', identifier.trim());
      sessionStorage.setItem('resetMethod', method);

      setSuccess(
        'If that account exists, a reset code has been sent. Please check your inbox or SMS.'
      );
      setIdentifier('');

      // Redirect to reset-password page after a short delay
      setTimeout(() => {
        navigate('/reset-password');
      }, 1500);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-[#0A0E1A]">
      {/* Left panel – same as LoginPage for brand consistency */}
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
            Forgot your
            <br />
            <span className="text-accent">password?</span>
          </h1>
          <p className="text-white/60 text-lg max-w-md mb-12 leading-relaxed">
            No worries – enter your email or phone number and we’ll send you a one‑time code to reset it.
          </p>

          <div className="flex flex-wrap gap-3 max-w-md">
            <div className="inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2.5">
              <ShieldCheck size={15} className="text-accent" />
              <span className="text-xs font-semibold">Government Certified</span>
            </div>
          </div>
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

          {success && (
            <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-2xl flex items-center gap-3 text-sm text-green-700 dark:text-green-300">
              <CheckCircle size={18} />
              <span>{success}</span>
            </div>
          )}
          {error && (
            <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-2xl flex items-center gap-3 text-sm text-red-700 dark:text-red-300">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <div className="bg-white dark:bg-[#111627] border border-gray-200 dark:border-gray-700 rounded-3xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Reset Password</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-8">
              We’ll send a verification code to your contact.
            </p>

            <div className="flex gap-1.5 mb-6 p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl">
              {[
                { m: 'email' as const, icon: Mail, label: 'Email' },
                { m: 'phone' as const, icon: Smartphone, label: 'Phone' },
              ].map(({ m, icon: Icon, label }) => (
                <button
                  key={m}
                  onClick={() => { setMethod(m); setError(''); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    method === m
                      ? 'bg-white dark:bg-[#0A0E1A] text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Icon size={15} /> {label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                  {method === 'phone' ? 'Phone Number' : 'Email Address'}
                </label>
                <input
                  type={method === 'email' ? 'email' : 'tel'}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={method === 'phone' ? '+252 63 123 4567' : 'you@example.com'}
                  className="w-full px-4 py-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-[#0F7B8C] focus:ring-4 focus:ring-[#0F7B8C]/10 transition-all text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-2xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Sending…
                  </>
                ) : (
                  <>
                    Send Reset Code <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
              Remember your password?{' '}
              <Link to="/login" className="text-[#0F7B8C] dark:text-primary-light font-semibold hover:text-primary-dark">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}