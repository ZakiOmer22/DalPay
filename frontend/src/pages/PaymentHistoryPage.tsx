/* ─── src/pages/PaymentHistoryPage.jsx ─── */
import { Link } from "react-router-dom";
import {
  ShieldCheck, ArrowRight, Smartphone, Clock, BadgeCheck,
  Zap, Globe, Play, Star,
  CreditCard, Wallet, ReceiptText, ChevronRight,
  Lock, Server, Cpu, FileText, BarChart3, Search,
} from "lucide-react";

/* ─────────────────────────────────────────────
   1. Hero
   ──────────────────────────────────────────── */
function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-[#0F7B8C] via-[#0A5D6B] to-[#0F7B8C] text-white py-28 overflow-hidden">
      <div className="absolute inset-0 bg-black/10" />
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#3BA7BC] rounded-full mix-blend-soft-light opacity-20 -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#10B981] rounded-full mix-blend-soft-light opacity-20 translate-x-1/3 translate-y-1/3" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#3BA7BC]/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm font-semibold mb-8">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#10B981]" />
          </span>
          Always accessible – your complete tax payment history
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-[1.1]">
          Your Payment History
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] to-[#3BA7BC]">
            All in One Place
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto mb-10">
          Review every payment you've made — income, business, or property tax — with instant receipts.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
          <Link
            to="/register"
            className="group bg-white text-[#0F7B8C] hover:bg-gray-100 font-bold py-4 px-8 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
          >
            View Your History
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <button className="border-2 border-white/80 text-white hover:bg-white hover:text-[#0F7B8C] font-bold py-4 px-8 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2">
            <Play size={20} /> How It Works
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
          {[
            { value: "Unlimited", label: "Access to History", icon: Clock },
            { value: "Instant", label: "Receipt Retrieval", icon: ReceiptText },
            { value: "All Tax Types", label: "Income, Business, Property", icon: CreditCard },
            { value: "Secure", label: "End‑to‑End Encrypted", icon: Lock },
          ].map((stat, i) => (
            <div key={i} className="text-center p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
              <stat.icon size={20} className="mx-auto mb-2 text-[#10B981]" />
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-white/60">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   2. Trust Badges
   ──────────────────────────────────────────── */
function TrustBadges() {
  return (
    <section className="py-12 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center gap-10 items-center">
        <div className="flex items-center gap-3 text-sm font-semibold text-gray-600 dark:text-gray-400">
          <ShieldCheck className="text-[#0F7B8C]" size={22} /> PCI-DSS Certified
        </div>
        <div className="flex items-center gap-3 text-sm font-semibold text-gray-600 dark:text-gray-400">
          <Zap className="text-[#0F7B8C]" size={22} /> ISO 27001
        </div>
        <div className="flex items-center gap-3 text-sm font-semibold text-gray-600 dark:text-gray-400">
          <Globe className="text-[#0F7B8C]" size={22} /> Government Approved
        </div>
        <div className="flex items-center gap-3 text-sm font-semibold text-gray-600 dark:text-gray-400">
          <Smartphone className="text-[#0F7B8C]" size={22} /> All Mobile Networks
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   3. How to View History (steps)
   ──────────────────────────────────────────── */
function HowToView() {
  const steps = [
    { step: 1, title: "Log In Securely", desc: "Access your DalPay account with National ID + OTP.", icon: Lock },
    { step: 2, title: "Open History Tab", desc: "Go to your dashboard and click Payment History.", icon: Search },
    { step: 3, title: "Filter & Sort", desc: "Narrow by date, tax type, or amount. Quick and simple.", icon: BarChart3 },
    { step: 4, title: "Download Receipt", desc: "Click any payment to view full details or save as PDF.", icon: FileText },
  ];

  return (
    <section className="py-24 bg-white dark:bg-[#0A0E1A]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 text-[#0F7B8C] dark:text-[#3BA7BC] text-sm font-semibold mb-6">
            Simple Process
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            View Your History in <span className="text-[#0F7B8C]">4 Easy Steps</span>
          </h2>
        </div>
        <div className="grid gap-8 md:grid-cols-4 relative">
          {steps.map(({ step, title, desc, icon: Icon }) => (
            <div key={step} className="bg-white dark:bg-[#111627] border border-gray-200 dark:border-gray-700 rounded-2xl p-6 text-center relative group hover:-translate-y-2 transition-transform">
              <div className="w-14 h-14 rounded-full bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-[#0F7B8C] group-hover:border-[#0F7B8C] transition-all">
                <Icon size={26} className="text-[#0F7B8C] group-hover:text-white" />
              </div>
              <span className="absolute top-4 left-4 text-4xl font-extrabold text-[#0F7B8C]/10 dark:text-[#0F7B8C]/20">{step}</span>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   4. Features (history‑focused)
   ──────────────────────────────────────────── */
function Features() {
  const items = [
    { icon: BarChart3, title: "Full Payment Ledger", desc: "Every transaction from day one, sorted and searchable.", color: "text-[#0F7B8C]" },
    { icon: ReceiptText, title: "Instant Receipts", desc: "Re‑download SMS/email receipts with a single click.", color: "text-amber-500" },
    { icon: FileText, title: "Export to CSV/PDF", desc: "Take your records offline for accounting or audits.", color: "text-green-500" },
    { icon: ShieldCheck, title: "Data Privacy", desc: "Only you can see your history — protected by biometric login.", color: "text-red-500" },
    { icon: Clock, title: "Real‑Time Updates", desc: "Payments appear instantly with status confirmed.", color: "text-blue-500" },
    { icon: BadgeCheck, title: "Audit‑Ready", desc: "Complete records accepted by tax authorities.", color: "text-purple-500" },
  ];

  return (
    <section className="py-24 bg-white dark:bg-[#0A0E1A]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 text-[#0F7B8C] dark:text-[#3BA7BC] text-sm font-semibold mb-6">
            Key Benefits
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            Why Track History with <span className="text-[#0F7B8C]">DalPay</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Your payments, always at your fingertips — transparent and secure.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="bg-white dark:bg-[#111627] border border-gray-200 dark:border-gray-700 rounded-2xl p-7 hover:border-[#0F7B8C]/40 hover:shadow-xl hover:shadow-[#0F7B8C]/5 transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 flex items-center justify-center mb-5">
                <Icon size={26} className={color} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   5. Tax Types (history coverage)
   ──────────────────────────────────────────── */
function TaxTypes() {
  const types = [
    { icon: CreditCard, title: "Income Tax", desc: "View all income tax payments and receipts.", link: "/history?tax=income" },
    { icon: Wallet, title: "Business Tax", desc: "Track business tax payments for your company.", link: "/history?tax=business" },
    { icon: ShieldCheck, title: "Property Tax", desc: "Review property tax payments and obligations.", link: "/history?tax=property" },
  ];

  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 text-[#0F7B8C] dark:text-[#3BA7BC] text-sm font-semibold mb-6">
            What You Can Track
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            All <span className="text-[#0F7B8C]">Tax Types</span> Covered
          </h2>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {types.map(({ icon: Icon, title, desc, link }) => (
            <Link to={link} key={title} className="bg-white dark:bg-[#111627] border border-gray-200 dark:border-gray-700 rounded-3xl p-8 group hover:border-[#0F7B8C]/40 transition-all duration-300 hover:-translate-y-2">
              <div className="w-16 h-16 rounded-2xl bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 flex items-center justify-center mb-6 group-hover:bg-[#0F7B8C] group-hover:border-[#0F7B8C] transition-all">
                <Icon size={30} className="text-[#0F7B8C] group-hover:text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{title}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{desc}</p>
              <span className="inline-flex items-center gap-2 text-[#0F7B8C] font-semibold group-hover:underline">
                View History <ArrowRight size={16} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   6. FAQ
   ──────────────────────────────────────────── */
function Faq() {
  const faqs = [
    { q: "How far back can I see my history?", a: "Your complete payment history is available from your very first transaction." },
    { q: "Can I search by date or amount?", a: "Yes. Use filters to narrow down by date range, tax type, or specific amount." },
    { q: "Is my history shareable?", a: "You can export it as PDF or CSV for your accountant, but your data remains private." },
    { q: "Do I need to register to see history?", a: "Yes. Payment history is linked to your National ID and secure DalPay account." },
    { q: "What if a payment is missing?", a: "Contact support from your dashboard — we verify against mobile money records and correct immediately." },
  ];

  return (
    <section className="py-24 bg-white dark:bg-[#0A0E1A]">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 text-[#0F7B8C] dark:text-[#3BA7BC] text-sm font-semibold mb-6">
            Got Questions?
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            Frequently Asked <span className="text-[#0F7B8C]">Questions</span>
          </h2>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <details key={i} className="bg-white dark:bg-[#111627] border border-gray-200 dark:border-gray-700 rounded-2xl p-6 group">
              <summary className="flex justify-between items-center cursor-pointer font-semibold text-gray-900 dark:text-white text-lg list-none">
                {faq.q}
                <ChevronRight size={20} className="transition-transform group-open:rotate-90 text-gray-400" />
              </summary>
              <p className="mt-4 text-gray-600 dark:text-gray-400 leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   7. Security Section
   ──────────────────────────────────────────── */
function Security() {
  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 text-[#0F7B8C] dark:text-[#3BA7BC] text-sm font-semibold mb-6">
          Enterprise Security
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8">
          Your History Data is <span className="text-[#0F7B8C]">Safe</span>
        </h2>
        <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
          {[
            { icon: Lock, title: "End‑to‑End Encryption", desc: "All history queries are encrypted in transit and at rest using AES‑256." },
            { icon: Server, title: "ISO 27001 Certified", desc: "Our infrastructure meets the highest international standards for data protection." },
            { icon: Cpu, title: "Real‑Time Anomaly Detection", desc: "AI‑powered monitoring prevents unauthorized access to your records." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title}>
              <div className="w-16 h-16 rounded-full bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 flex items-center justify-center mx-auto mb-4">
                <Icon size={30} className="text-[#0F7B8C]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   8. Stats Section
   ──────────────────────────────────────────── */
function Stats() {
  return (
    <section className="py-24 bg-gradient-to-br from-[#0F7B8C] via-[#0A5D6B] to-[#0F7B8C] text-white">
      <div className="max-w-7xl mx-auto px-6 grid gap-8 md:grid-cols-3 text-center">
        {[
          { value: "5M+", label: "Payments Recorded" },
          { value: "Instant", label: "Receipt Retrieval" },
          { value: "100%", label: "Audit Compliance" },
        ].map((stat) => (
          <div key={stat.label}>
            <div className="text-5xl font-extrabold mb-2">{stat.value}</div>
            <div className="text-lg text-white/70">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   9. Testimonials
   ──────────────────────────────────────────── */
function Testimonials() {
  const quotes = [
    { name: "Ali G.", role: "Business Owner, Hargeisa", text: "I downloaded my entire 2025 history for my accountant. Took two clicks. Amazing." },
    { name: "Sahra N.", role: "Property Owner, Berbera", text: "The ability to filter by tax type saved me hours. I found all my property tax receipts instantly." },
    { name: "Khadra O.", role: "Freelancer, Borama", text: "My payment history is always up to date — I never worry about missing a payment record." },
  ];

  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 text-[#0F7B8C] dark:text-[#3BA7BC] text-sm font-semibold mb-6">
            Testimonials
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            What <span className="text-[#0F7B8C]">Taxpayers</span> Say
          </h2>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {quotes.map(({ name, role, text }) => (
            <div key={name} className="bg-white dark:bg-[#111627] border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
              <div className="flex gap-2 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="text-amber-500 fill-amber-500" />
                ))}
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6 italic">“{text}”</p>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">{role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   10. CTA
   ──────────────────────────────────────────── */
function Cta() {
  return (
    <section className="py-24 bg-gradient-to-br from-[#0F7B8C] via-[#0A5D6B] to-[#0F7B8C] text-white">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Ready to See Your Payment History?
        </h2>
        <p className="text-xl text-white/80 mb-10">
          Join thousands who trust DalPay to keep their tax records secure and accessible anytime.
        </p>
        <Link
          to="/register"
          className="inline-flex items-center gap-3 bg-white text-[#0F7B8C] hover:bg-gray-100 font-bold py-4 px-10 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
        >
          View My History
          <ArrowRight size={22} />
        </Link>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   PaymentHistoryPage
   ──────────────────────────────────────────── */
export default function PaymentHistoryPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-[#0A0E1A]">
      <Hero />
      <TrustBadges />
      <HowToView />
      <Features />
      <TaxTypes />
      <Security />
      <Faq />
      <Stats />
      <Testimonials />
      <Cta />
    </main>
  );
}