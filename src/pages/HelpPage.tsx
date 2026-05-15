// web/src/pages/HelpPage.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HelpCircle,
  Search,
  ChevronDown,
  MessageCircle,
  PhoneCall,
  Mail,
  ExternalLink,
  Book,
  FileText,
  Shield,
  Zap,
  Globe,
  Smartphone,
} from 'lucide-react';

const faqs = [
  {
    q: 'How do I pay my taxes?',
    a: 'Log in to your account, go to "Pay Tax", choose the assessment you want to settle, select your mobile money provider, and confirm the payment. You can also use the USSD *888# from any phone.',
  },
  {
    q: 'What mobile money providers are supported?',
    a: 'Currently Zaad, eDahab, and Nomad are supported. We are actively working to add more providers.',
  },
  {
    q: 'How can I register for a DalPay account?',
    a: 'Click "Register" on the login page. You’ll need your National ID, phone number, and a valid email. After registration, verify your phone or email to activate your account.',
  },
  {
    q: 'Is my personal information safe?',
    a: 'Yes. All sensitive data is encrypted with AES‑256‑GCM. Your tax records are protected by Somali law and strict security policies. We never share your data without consent.',
  },
  {
    q: 'What if I think my assessment is incorrect?',
    a: 'You can file a dispute from the "Tax" section of your dashboard. Provide a reason and any supporting documents. An officer will review your case.',
  },
  {
    q: 'Can I use DalPay on a feature phone?',
    a: 'Absolutely. Dial *888# on any mobile phone to check your tax balance, pay taxes, and view your statement. No internet required.',
  },
  {
    q: 'How do I contact support?',
    a: 'You can email us at support@dalpay.gov.so, call our hotline +252 63 123 4567, or visit the Ministry of Finance office in Hargeisa.',
  },
];

const helpCategories = [
  { icon: Book, label: 'User Guide', desc: 'Step-by-step instructions', to: '/resources/forms' },
  { icon: FileText, label: 'Tax Rates', desc: 'Current tax rates & slabs', to: '/resources/tax-rates' },
  { icon: Shield, label: 'Security', desc: 'How we protect your data', to: '/faq' },
  { icon: Zap, label: 'Pay Tax', desc: 'Make a payment online', to: '/pay' },
  { icon: Smartphone, label: 'USSD Guide', desc: 'Use DalPay on any phone', to: '/ussd' },
  { icon: Globe, label: 'Contact Us', desc: 'Get in touch with our team', to: '/contact' },
];

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <section className="min-h-screen bg-white dark:bg-[#0A0E1A] pt-28 pb-20 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 flex items-center justify-center mb-4">
            <HelpCircle size={32} className="text-[#0F7B8C]" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Help Center
          </h1>
          <p className="mt-3 text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
            Find answers to common questions or get in touch with our support team.
          </p>
        </div>

        {/* Search Bar (visual) */}
        <div className="max-w-md mx-auto mb-12">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search help articles..."
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[#0F7B8C] focus:ring-2 focus:ring-[#0F7B8C]/20"
            />
          </div>
        </div>

        {/* Quick Categories */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-16">
          {helpCategories.map(({ icon: Icon, label, desc, to }) => (
            <Link
              key={label}
              to={to}
              className="bg-white dark:bg-[#111627] border border-gray-200 dark:border-gray-700 rounded-2xl p-4 text-center hover:shadow-lg hover:border-[#0F7B8C]/30 transition-all group"
            >
              <div className="w-10 h-10 mx-auto bg-[#0F7B8C]/10 rounded-xl flex items-center justify-center mb-3 group-hover:bg-[#0F7B8C]/20 transition-colors">
                <Icon size={20} className="text-[#0F7B8C]" />
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{label}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 hidden sm:block">{desc}</p>
            </Link>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white dark:bg-[#111627] border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left"
                >
                  <span className="font-medium text-gray-900 dark:text-white">{faq.q}</span>
                  <ChevronDown
                    size={20}
                    className={`text-gray-400 transition-transform ${
                      openFaq === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4 text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-[#0F7B8C]/5 dark:bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 rounded-3xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Still need help?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
            Our support team is available Sunday to Thursday, 8:00 AM to 4:00 PM.
          </p>
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <div className="flex items-center gap-3 text-gray-900 dark:text-white">
              <PhoneCall size={18} className="text-[#0F7B8C]" />
              <span>+252 63 123 4567</span>
            </div>
            <div className="flex items-center gap-3 text-gray-900 dark:text-white">
              <Mail size={18} className="text-[#0F7B8C]" />
              <span>support@dalpay.gov.so</span>
            </div>
            <div className="flex items-center gap-3 text-gray-900 dark:text-white">
              <MessageCircle size={18} className="text-[#0F7B8C]" />
              <span>Live Chat (coming soon)</span>
            </div>
          </div>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all"
          >
            Contact Us <ExternalLink size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}