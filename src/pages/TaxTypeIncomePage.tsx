/* ─── src/pages/TaxTypeIncomePage.jsx ─── */
import { Link } from "react-router-dom";
import {
  ShieldCheck, ArrowRight, Smartphone, Clock,
  Zap, Globe, Play, Star,
  ReceiptText, ChevronRight,
  Lock, Server, Cpu, Briefcase, FileText, BarChart3, Search,
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
          Official tax rates – always up to date
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-[1.1]">
          Income Tax
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] to-[#3BA7BC]">
            Pay on Your Earnings
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto mb-10">
          Understand income tax rates, who needs to pay, and how DalPay makes filing effortless.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
          <Link
            to="/register"
            className="group bg-white text-[#0F7B8C] hover:bg-gray-100 font-bold py-4 px-8 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
          >
            Pay Income Tax Now
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <button className="border-2 border-white/80 text-white hover:bg-white hover:text-[#0F7B8C] font-bold py-4 px-8 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2">
            <Play size={20} /> How to Calculate
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
          {[
            { value: "0–30%", label: "Progressive Rates", icon: BarChart3 },
            { value: "Salaried", label: "& Self‑Employed", icon: Briefcase },
            { value: "Annual", label: "Filing Required", icon: Clock },
            { value: "Instant", label: "Digital Receipt", icon: ReceiptText },
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
   3. How to Pay Income Tax (step‑by‑step)
   ──────────────────────────────────────────── */
function HowToPayIncome() {
  const steps = [
    { step: 1, title: "Enter Taxpayer Info", desc: "Provide your National ID and occupation details.", icon: Search },
    { step: 2, title: "View Your Assessment", desc: "See how much you owe based on income brackets.", icon: BarChart3 },
    { step: 3, title: "Pay via Mobile Money", desc: "Use Zaad, eDahab, or Nomad — just like a normal transaction.", icon: Smartphone },
    { step: 4, title: "Download Receipt", desc: "Instant SMS + email receipt kept in your history forever.", icon: FileText },
  ];

  return (
    <section className="py-24 bg-white dark:bg-[#0A0E1A]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 text-[#0F7B8C] dark:text-[#3BA7BC] text-sm font-semibold mb-6">
            Simple Process
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            How to Pay <span className="text-[#0F7B8C]">Income Tax</span>
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
   4. Features (income tax benefits)
   ──────────────────────────────────────────── */
function Features() {
  const items = [
    { icon: Briefcase, title: "Salaried & Freelance", desc: "Covers both employed and self‑employed taxpayers.", color: "text-[#0F7B8C]" },
    { icon: BarChart3, title: "Progressive Rates", desc: "Pay based on income bands — fair and transparent.", color: "text-amber-500" },
    { icon: FileText, title: "Auto‑Generated Assessment", desc: "No manual calculations — the system tells you what to pay.", color: "text-green-500" },
    { icon: ShieldCheck, title: "Secure & Compliant", desc: "End‑to‑end encryption, government‑certified compliance.", color: "text-red-500" },
    { icon: Clock, title: "Instant Processing", desc: "Payment reflected in the tax ledger immediately.", color: "text-blue-500" },
    { icon: ReceiptText, title: "Digital Receipt", desc: "SMS + email proof stored permanently for your records.", color: "text-purple-500" },
  ];

  return (
    <section className="py-24 bg-white dark:bg-[#0A0E1A]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 text-[#0F7B8C] dark:text-[#3BA7BC] text-sm font-semibold mb-6">
            Why Income Tax with DalPay
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            Built for <span className="text-[#0F7B8C]">Taxpayers Like You</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Hassle‑free, transparent, and fast — just the way tax payment should be.
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
   5. Income Tax Rates Table
   ──────────────────────────────────────────── */
function TaxRatesTable() {
  const brackets = [
    { income: "Up to 3,000,000 SOS", rate: "0%", desc: "Exempt" },
    { income: "3,000,001 – 6,000,000 SOS", rate: "10%", desc: "Low bracket" },
    { income: "6,000,001 – 10,000,000 SOS", rate: "20%", desc: "Middle bracket" },
    { income: "Above 10,000,000 SOS", rate: "30%", desc: "Top bracket" },
  ];

  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 text-[#0F7B8C] dark:text-[#3BA7BC] text-sm font-semibold mb-6">
            Current Tax Rates
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            Income Tax <span className="text-[#0F7B8C]">Brackets</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Rates based on annual taxable income. Updated Q1 2026.
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="grid grid-cols-3 bg-gray-100 dark:bg-gray-800 px-6 py-4 font-bold text-sm text-gray-700 dark:text-gray-300">
            <div>Annual Income</div>
            <div className="text-center">Rate</div>
            <div className="text-center">Details</div>
          </div>
          {brackets.map((b, idx) => (
            <div
              key={idx}
              className={`grid grid-cols-3 px-6 py-4 text-sm items-center ${
                idx % 2 === 0 ? "bg-white dark:bg-[#111627]" : "bg-gray-50 dark:bg-gray-800/30"
              }`}
            >
              <div className="font-medium text-gray-900 dark:text-white">{b.income}</div>
              <div className="text-center font-bold text-[#0F7B8C] dark:text-[#3BA7BC]">{b.rate}</div>
              <div className="text-center text-gray-600 dark:text-gray-400">{b.desc}</div>
            </div>
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
    { q: "Who must pay income tax?", a: "Any individual earning above 3,000,000 SOS per year from employment or business activities." },
    { q: "How is the tax calculated?", a: "Based on progressive brackets. The system auto‑calculates from your National ID‑linked income data." },
    { q: "Can I pay in instalments?", a: "Yes, the platform supports quarterly payments. Contact your tax officer for details." },
    { q: "What if I overpay?", a: "Overpayment is automatically credited to your account or refunded upon request." },
    { q: "How do I get a receipt?", a: "Instant SMS and email after payment. Also available in your history section." },
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
          Your Income Data is <span className="text-[#0F7B8C]">Safe</span>
        </h2>
        <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
          {[
            { icon: Lock, title: "End‑to‑End Encryption", desc: "All income data and payments are encrypted in transit and at rest using AES‑256." },
            { icon: Server, title: "ISO 27001 Certified", desc: "Our infrastructure meets the highest international standards for data protection." },
            { icon: Cpu, title: "Real‑Time Anomaly Detection", desc: "AI‑powered monitoring prevents unauthorized access to your tax records." },
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
          { value: "350K+", label: "Income Tax Payers" },
          { value: "100%", label: "Compliance Rate" },
          { value: "Instant", label: "Receipt Delivery" },
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
    { name: "Ahmed D.", role: "Software Developer, Hargeisa", text: "The income tax brackets made it so clear what I owe. Paid in 2 minutes!" },
    { name: "Sahra M.", role: "Freelancer, Borama", text: "I used to dread income tax. DalPay showed me my exact assessment — and it was right." },
    { name: "Hassan A.", role: "Teacher, Berbera", text: "The instant receipt gave me complete confidence. I keep it in my email for records." },
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
          Ready to Settle Your Income Tax?
        </h2>
        <p className="text-xl text-white/80 mb-10">
          Pay securely, get an instant receipt, and stay compliant — all from your mobile money.
        </p>
        <Link
          to="/pay?tax=income"
          className="inline-flex items-center gap-3 bg-white text-[#0F7B8C] hover:bg-gray-100 font-bold py-4 px-10 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
        >
          Pay Income Tax Now
          <ArrowRight size={22} />
        </Link>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   TaxTypeIncomePage
   ──────────────────────────────────────────── */
export default function TaxTypeIncomePage() {
  return (
    <main className="min-h-screen bg-white dark:bg-[#0A0E1A]">
      <Hero />
      <TrustBadges />
      <HowToPayIncome />
      <Features />
      <TaxRatesTable />
      <Security />
      <Faq />
      <Stats />
      <Testimonials />
      <Cta />
    </main>
  );
}