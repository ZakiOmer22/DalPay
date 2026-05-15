// web/src/pages/DataProtectionPage.tsx
import { Link } from 'react-router-dom';
import {
  Shield,
  Lock,
  FileText,
  Eye,
  UserCheck,
  Database,
  Globe,
  ArrowLeft,
  AlertTriangle,
  CreditCard,
  Smartphone,
  Cookie,
  Bell,
  ClipboardList,
  Users,
  ChevronRight,
} from 'lucide-react';

const sections = [
  {
    icon: Lock,
    title: 'How We Protect Your Data',
    content:
      'All sensitive information (National ID, phone number, email address) is encrypted with AES‑256‑GCM both at rest and in transit. Our servers enforce TLS 1.2+, and we follow strict access controls.',
  },
  {
    icon: Database,
    title: 'What Data We Collect',
    content:
      'We collect only the information necessary to calculate and process your taxes: full name, national ID, contact details, tax assessment data, and payment records. We never collect biometric data or location without explicit consent.',
  },
  {
    icon: Eye,
    title: 'Who Can See Your Data',
    content:
      'Only you, your designated tax officer, and authorised administrators have access to your data. All access is logged, and employees undergo background checks.',
  },
  {
    icon: UserCheck,
    title: 'Your Rights',
    content:
      'You have the right to access, correct, or delete your personal data. You can request a copy of all data we hold about you by contacting our support team.',
  },
  {
    icon: FileText,
    title: 'Data Retention',
    content:
      'Tax records are retained for 7 years as required by Somaliland law. After that period, your data is securely anonymised or deleted.',
  },
  {
    icon: Globe,
    title: 'International Standards',
    content:
      'Our data protection practices align with the African Union Convention on Cyber Security and Personal Data Protection (Malabo Convention) and are inspired by the GDPR.',
  },

  // ---- NEW SECTIONS ----
  {
    icon: CreditCard,
    title: 'Payment Security',
    content:
      'All payment transactions are processed through PCI‑DSS compliant mobile money gateways. We use idempotency keys, double‑entry accounting, and SERIALIZABLE database isolation to prevent fraud and double‑spending.',
  },
  {
    icon: Smartphone,
    title: 'Two‑Factor Authentication',
    content:
      'We encourage all users to enable two‑factor authentication (OTP via email or phone). High‑risk actions, such as initiating a payment, require a recent OTP verification to proceed.',
  },
  {
    icon: Users,
    title: 'Third‑Party Sharing',
    content:
      'We do not sell or share your personal data with third parties for marketing purposes. Data may be shared with authorised government agencies strictly as required by tax laws.',
  },
  {
    icon: AlertTriangle,
    title: 'Data Breach Notification',
    content:
      'In the unlikely event of a data breach, we will notify affected users within 72 hours of discovery and provide guidance on protective steps. Our incident response team is on standby 24/7.',
  },
  {
    icon: Cookie,
    title: 'Cookies & Tracking',
    content:
      'We use only essential cookies (session management, security tokens) that do not track your browsing activity across other websites. No third‑party analytics or advertising cookies are placed.',
  },
  {
    icon: Bell,
    title: 'Policy Updates',
    content:
      'We will notify you of any material changes to this privacy policy via email and a prominent notice on our website. Continued use of DalPay after an update constitutes acceptance of the revised policy.',
  },
  {
    icon: ClipboardList,
    title: 'Data Protection Officer',
    content:
      'Our Data Protection Officer (DPO) can be reached at dpo@dalpay.gov.so. You may contact them to exercise your data rights, report concerns, or request further information.',
  },
];

export default function DataProtectionPage() {
  return (
    <section className="min-h-screen bg-white dark:bg-[#0A0E1A] pt-28 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-8"
        >
          <ArrowLeft size={16} />
          Back to home
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 flex items-center justify-center mb-4">
            <Shield size={32} className="text-[#0F7B8C]" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Data Protection & Privacy
          </h1>
          <p className="mt-3 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Your trust is paramount. Learn how we secure your personal information and respect your privacy.
          </p>
        </div>

        {/* Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {sections.map(({ icon: Icon, title, content }) => (
            <div
              key={title}
              className="bg-white dark:bg-[#111627] border border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:shadow-xl transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#0F7B8C]/10 flex items-center justify-center shrink-0">
                  <Icon size={20} className="text-[#0F7B8C]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Privacy Policy */}
        <div className="bg-[#0F7B8C]/5 dark:bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 rounded-3xl p-8 text-center mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Full Privacy Policy
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto mb-6">
            For complete legal details, please review our comprehensive privacy policy document.
          </p>
          <Link
            to="/privacy-policy"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all"
          >
            Read Privacy Policy <ChevronRight size={18} />
          </Link>
        </div>

        {/* Questions */}
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Have questions about your data?
          </p>
          <Link
            to="/contact"
            className="text-[#0F7B8C] font-semibold hover:underline"
          >
            Contact our Data Protection Officer
          </Link>
        </div>
      </div>
    </section>
  );
}