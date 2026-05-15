// web/src/pages/SecurityPage.tsx
import { Link } from 'react-router-dom';
import {
  Shield,
  Lock,
  Key,
  Fingerprint,
  Server,
  Globe,
  Eye,
  AlertTriangle,
  FileText,
  Zap,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';

const features = [
  {
    icon: Lock,
    title: 'AES‑256‑GCM Encryption',
    description:
      'All personally identifiable data (National ID, phone, email) is encrypted at rest using military‑grade AES‑256 in Galois/Counter Mode. Decryption happens only on the server when absolutely necessary.',
  },
  {
    icon: Fingerprint,
    title: 'Token Fingerprinting',
    description:
      'Every access token is cryptographically bound to the device that obtained it. If a token is used from a different device or network, it is immediately rejected.',
  },
  {
    icon: Key,
    title: 'Key Rotation & Versioning',
    description:
      'Encryption keys and JWT signing secrets support versioning. We can rotate keys without invalidating existing sessions or data. Decryption automatically selects the correct key version.',
  },
  {
    icon: Server,
    title: 'Row‑Level Security (RLS)',
    description:
      'PostgreSQL Row‑Level Security ensures that taxpayers can only see their own data. Even if a query bypasses the application layer, the database itself enforces ownership.',
  },
  {
    icon: Eye,
    title: 'Anti‑Enumeration & PII Protection',
    description:
      'Sensitive responses are normalised to prevent user enumeration. Login, password reset, and OTP endpoints never reveal whether an account exists. Login and registration responses no longer include email, phone, or national ID.',
  },
  {
    icon: Globe,
    title: 'CSP & HTTP Headers',
    description:
      'A strict Content Security Policy blocks inline scripts from unauthorised sources. Helmet‑powered headers (HSTS, X‑Frame‑Options, nosniff, etc.) protect against common web attacks.',
  },
  {
    icon: AlertTriangle,
    title: 'Brute‑Force & Rate Limiting',
    description:
      'After 5 consecutive failed login attempts, the account is locked for 15 minutes. Global rate limiting (100 req/15 min) and progressive slow‑down protect against volumetric attacks.',
  },
  {
    icon: FileText,
    title: 'Immutable Audit Trails',
    description:
      'Every action (registration, login, payment, dispute) is recorded in a hash‑chained audit log. Any attempt to modify a past entry breaks the chain, making tampering mathematically detectable.',
  },
  {
    icon: Zap,
    title: 'Idempotency & Race Condition Protection',
    description:
      'Payment initiation is guarded by idempotency keys and SERIALIZABLE database transactions with row locking. Double‑spending is prevented at both the application and database levels.',
  },
];

export default function SecurityPage() {
  return (
    <section className="min-h-screen bg-white dark:bg-[#0A0E1A] pt-28 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 flex items-center justify-center mb-4">
            <Shield size={32} className="text-[#0F7B8C]" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Security at DalPay
          </h1>
          <p className="mt-3 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Your financial data is protected by multiple layers of enterprise‑grade
            security – from encryption at rest to real‑time fraud detection.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="bg-white dark:bg-[#111627] border border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:shadow-xl hover:border-[#0F7B8C]/30 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#0F7B8C]/10 flex items-center justify-center mb-4 group-hover:bg-[#0F7B8C]/20 transition-colors">
                <Icon size={24} className="text-[#0F7B8C]" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>

        {/* Compliance & Certifications (visual) */}
        <div className="bg-[#0F7B8C]/5 dark:bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 rounded-3xl p-8 text-center mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Built to industry standards
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto mb-8">
            Our security architecture is aligned with OWASP Top 10, PCI‑DSS, and
            NIST SP 800‑52 guidelines for government tax systems.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            {['OWASP Top 10', 'PCI‑DSS', 'NIST SP 800‑52', 'GDPR‑ready'].map(
              (standard) => (
                <div
                  key={standard}
                  className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
                >
                  <CheckCircle size={18} className="text-green-500" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {standard}
                  </span>
                </div>
              )
            )}
          </div>
        </div>

        {/* Call to action */}
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Have a security concern? We want to hear about it.
          </p>
          <Link
            to="/report"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all"
          >
            Report a Vulnerability <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}