/* ─── src/pages/TaxTypeBusinessPage.jsx ─── */
import { Link } from "react-router-dom";
import {
  ShieldCheck, ArrowRight, Smartphone, Clock,
  Zap, Globe, Play, Star,
  ReceiptText, ChevronRight,
  Lock, Server, Cpu, Building2, FileText, BarChart3, Search,
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
          For registered businesses – pay your turnover tax digitally
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-[1.1]">
          Business Tax
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] to-[#3BA7BC]">
            Annual Turnover Tax
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto mb-10">
          Pay your business tax quickly using mobile money — Zaad, eDahab, Nomad. Fast, secure, and compliant.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
          <Link
            to="/register"
            className="group bg-white text-[#0F7B8C] hover:bg-gray-100 font-bold py-4 px-8 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
          >
            Pay Business Tax Now
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <button className="border-2 border-white/80 text-white hover:bg-white hover:text-[#0F7B8C] font-bold py-4 px-8 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2">
            <Play size={20} /> How It Works
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
          {[
            { value: "Flat Rate", label: "Based on Turnover", icon: BarChart3 },
            { value: "All Businesses", label: "Registered & Traders", icon: Building2 },
            { value: "Annual", label: "Payment Schedule", icon: Clock },
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
   3. How to Pay Business Tax (step‑by‑step)
   ──────────────────────────────────────────── */
function HowToPayBusiness() {
  const steps = [
    { step: 1, title: "Enter Business ID", desc: "Use your business registration number to log your tax profile.", icon: Search },
    { step: 2, title: "View Assessment", desc: "The system calculates your tax based on turnover bands.", icon: BarChart3 },
    { step: 3, title: "Pay via Mobile", desc: "Confirm and pay with your preferred mobile money operator.", icon: Smartphone },
    { step: 4, title: "Get Receipt", desc: "Instant SMS + email receipt stored in your business dashboard.", icon: FileText },
  ];

  return (
    <section className="py-24 bg-white dark:bg-[#0A0E1A]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 text-[#0F7B8C] dark:text-[#3BA7BC] text-sm font-semibold mb-6">
            Simple Process
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            How to Pay <span className="text-[#0F7B8C]">Business Tax</span>
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
   4. Features (business tax benefits)
   ──────────────────────────────────────────── */
function Features() {
  const items = [
    { icon: Building2, title: "All Business Types", desc: "Sole traders, partnerships, and limited companies – we cover all.", color: "text-[#0F7B8C]" },
    { icon: BarChart3, title: "Turnover‑Based Rates", desc: "Pay a percentage of your annual revenue – automatically computed.", color: "text-amber-500" },
    { icon: FileText, title: "Detailed Breakdown", desc: "See how your tax is calculated before you pay.", color: "text-green-500" },
    { icon: ShieldCheck, title: "Government‑Compliant", desc: "Every payment is recorded in the official tax ledger.", color: "text-red-500" },
    { icon: Clock, title: "Instant Processing", desc: "Your payment is confirmed and receipted within seconds.", color: "text-blue-500" },
    { icon: ReceiptText, title: "Audit‑Ready Receipts", desc: "Digital receipts accepted by accountants and auditors.", color: "text-purple-500" },
  ];

  return (
    <section className="py-24 bg-white dark:bg-[#0A0E1A]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 text-[#0F7B8C] dark:text-[#3BA7BC] text-sm font-semibold mb-6">
            Why Business Tax with DalPay
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            Built for <span className="text-[#0F7B8C]">Enterprises & SMEs</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Efficient, transparent business tax payment — from any device.
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
   5. Business Tax Rates Table
   ──────────────────────────────────────────── */
function TaxRatesTable() {
  const brackets = [
    { turnover: "Up to 50,000,000 SOS", rate: "5%", desc: "Small business" },
    { turnover: "50,000,001 – 200,000,000 SOS", rate: "10%", desc: "Medium enterprise" },
    { turnover: "Above 200,000,000 SOS", rate: "15%", desc: "Large corporation" },
  ];

  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 text-[#0F7B8C] dark:text-[#3BA7BC] text-sm font-semibold mb-6">
            Current Tax Rates
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            Business Tax <span className="text-[#0F7B8C]">Brackets</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Based on annual turnover. Updated Q1 2026.
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="grid grid-cols-3 bg-gray-100 dark:bg-gray-800 px-6 py-4 font-bold text-sm text-gray-700 dark:text-gray-300">
            <div>Annual Turnover</div>
            <div className="text-center">Rate</div>
            <div className="text-center">Category</div>
          </div>
          {brackets.map((b, idx) => (
            <div
              key={idx}
              className={`grid grid-cols-3 px-6 py-4 text-sm items-center ${
                idx % 2 === 0 ? "bg-white dark:bg-[#111627]" : "bg-gray-50 dark:bg-gray-800/30"
              }`}
            >
              <div className="font-medium text-gray-900 dark:text-white">{b.turnover}</div>
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
    { q: "Who must pay business tax?", a: "Any registered business or trader with annual turnover above 50,000,000 SOS must pay." },
    { q: "How is tax calculated?", a: "Based on your declared annual turnover bands. The system auto‑calculates from your business profile." },
    { q: "Can I pay quarterly?", a: "Yes, the platform supports quarterly filing. Choose your payment schedule in the dashboard." },
    { q: "What if I overpay?", a: "Overpayment is automatically credited or refunded upon request." },
    { q: "How do I get a receipt?", a: "Instant SMS and email after every successful payment; all receipts are stored for future reference." },
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
          Your Business Data is <span className="text-[#0F7B8C]">Safe</span>
        </h2>
        <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
          {[
            { icon: Lock, title: "End‑to‑End Encryption", desc: "All business data and payments are encrypted using AES‑256." },
            { icon: Server, title: "ISO 27001 Certified", desc: "Our infrastructure meets the highest international standards." },
            { icon: Cpu, title: "Real‑Time Anomaly Detection", desc: "AI‑powered monitoring prevents unauthorized tax access." },
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
          { value: "120K+", label: "Businesses Registered" },
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
    { name: "Ali K.", role: "Shop Owner, Hargeisa", text: "I paid my business tax in 3 minutes. No more standing in queues at the tax office." },
    { name: "Nasra J.", role: "Restaurant Owner, Borama", text: "The turnover‑based calculation was perfect. I downloaded the receipt for my accountant." },
    { name: "Hassan G.", role: "Trading Company, Berbera", text: "DalPay made business tax simple. We file quarterly now — it's a breeze." },
  ];

  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 text-[#0F7B8C] dark:text-[#3BA7BC] text-sm font-semibold mb-6">
            Testimonials
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            What <span className="text-[#0F7B8C]">Businesses</span> Say
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
          Ready to File Your Business Tax?
        </h2>
        <p className="text-xl text-white/80 mb-10">
          Join thousands of businesses paying their taxes digitally — secure, fast, and compliant.
        </p>
        <Link
          to="/pay?tax=business"
          className="inline-flex items-center gap-3 bg-white text-[#0F7B8C] hover:bg-gray-100 font-bold py-4 px-10 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
        >
          Pay Business Tax Now
          <ArrowRight size={22} />
        </Link>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   TaxTypeBusinessPage
   ──────────────────────────────────────────── */
export default function TaxTypeBusinessPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-[#0A0E1A]">
      <Hero />
      <TrustBadges />
      <HowToPayBusiness />
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