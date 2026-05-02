/* ─── src/pages/TaxTypeConsumptionPage.jsx ─── */
import { Link } from "react-router-dom";
import {
  ShieldCheck, ArrowRight, Smartphone, Clock,
  Zap, Globe, Play, Star,
  ReceiptText, ChevronRight,
  Lock, Server, Cpu, ShoppingCart, FileText, BarChart3, Search,
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
          For consumers and businesses – indirect tax on goods and services
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-[1.1]">
          Consumption Tax
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] to-[#3BA7BC]">
            Pay on Goods & Services
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto mb-10">
          Settle consumption tax on purchases, imports, and certain services using mobile money — fast, secure, compliant.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
          <Link
            to="/register"
            className="group bg-white text-[#0F7B8C] hover:bg-gray-100 font-bold py-4 px-8 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
          >
            Pay Consumption Tax Now
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <button className="border-2 border-white/80 text-white hover:bg-white hover:text-[#0F7B8C] font-bold py-4 px-8 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2">
            <Play size={20} /> How It Works
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
          {[
            { value: "5–15%", label: "Standard VAT Rate", icon: BarChart3 },
            { value: "Goods & Services", label: "Domestic + Imports", icon: ShoppingCart },
            { value: "Monthly/Quarterly", label: "Filing Schedule", icon: Clock },
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
   3. How to Pay Consumption Tax (step‑by‑step)
   ──────────────────────────────────────────── */
function HowToPayConsumption() {
  const steps = [
    { step: 1, title: "Select Tax Category", desc: "Choose domestic goods or imported items with duty rate.", icon: ShoppingCart },
    { step: 2, title: "Enter Transaction Details", desc: "Input invoice value, quantity, and applicable exemptions.", icon: Search },
    { step: 3, title: "Confirm & Pay", desc: "Review the computed tax and pay via your preferred mobile money.", icon: Smartphone },
    { step: 4, title: "Get Receipt", desc: "Instant SMS + email receipt stored in your dashboard.", icon: FileText },
  ];

  return (
    <section className="py-24 bg-white dark:bg-[#0A0E1A]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 text-[#0F7B8C] dark:text-[#3BA7BC] text-sm font-semibold mb-6">
            Simple Process
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            How to Pay <span className="text-[#0F7B8C]">Consumption Tax</span>
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
   4. Features (consumption tax benefits)
   ──────────────────────────────────────────── */
function Features() {
  const items = [
    { icon: ShoppingCart, title: "Goods & Services", desc: "Covers VAT on domestic purchases, imports, and selected services.", color: "text-[#0F7B8C]" },
    { icon: BarChart3, title: "Real‑Time Calculation", desc: "Auto‑compute tax based on product value or customs rate.", color: "text-amber-500" },
    { icon: FileText, title: "Detailed Invoice", desc: "View and download a complete breakdown of your tax obligation.", color: "text-green-500" },
    { icon: ShieldCheck, title: "Government‑Compliant", desc: "All payments logged in the official tax ledger.", color: "text-red-500" },
    { icon: Clock, title: "Instant Processing", desc: "Payment confirmation and receipt delivered within seconds.", color: "text-blue-500" },
    { icon: ReceiptText, title: "Audit‑Ready Records", desc: "Digital receipts accepted for business accounting and audits.", color: "text-purple-500" },
  ];

  return (
    <section className="py-24 bg-white dark:bg-[#0A0E1A]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 text-[#0F7B8C] dark:text-[#3BA7BC] text-sm font-semibold mb-6">
            Why Consumption Tax with DalPay
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            Built for <span className="text-[#0F7B8C]">Consumers & Businesses</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Fast, accurate indirect tax payment — anytime, anywhere.
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
   5. Consumption Tax Rates Table
   ──────────────────────────────────────────── */
function TaxRatesTable() {
  const brackets = [
    { category: "Standard Rate (most goods/services)", rate: "15%", desc: "VAT on non‑exempt items" },
    { category: "Reduced Rate (essential items)", rate: "5%", desc: "Basic foodstuffs, medicine" },
    { category: "Zero‑Rated (exports)", rate: "0%", desc: "Exported goods & services" },
    { category: "Exempt", rate: "0%", desc: "Healthcare, education, financial services" },
  ];

  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 text-[#0F7B8C] dark:text-[#3BA7BC] text-sm font-semibold mb-6">
            Current Tax Rates
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            Consumption Tax <span className="text-[#0F7B8C]">Rates</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Based on goods/services category. Updated Q1 2026.
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="grid grid-cols-3 bg-gray-100 dark:bg-gray-800 px-6 py-4 font-bold text-sm text-gray-700 dark:text-gray-300">
            <div>Category</div>
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
              <div className="font-medium text-gray-900 dark:text-white">{b.category}</div>
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
    { q: "Who pays consumption tax?", a: "Businesses and importers remit it, but consumers bear the final cost. Anyone can pay directly via DalPay." },
    { q: "What's the difference between VAT and consumption tax?", a: "They're often the same; consumption tax is a broad term that includes VAT on goods and services." },
    { q: "Can I pay for imported goods?", a: "Yes, select 'Imports' at the calculation step. Customs duties and VAT are combined." },
    { q: "Is there a registration threshold?", a: "Small businesses with turnover below 25,000,000 SOS may be exempt. Check with your tax office." },
    { q: "How do I get a receipt?", a: "Instant SMS and email after each payment. Receipts are stored permanently in your history." },
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
          Your Transaction Data is <span className="text-[#0F7B8C]">Safe</span>
        </h2>
        <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
          {[
            { icon: Lock, title: "End‑to‑End Encryption", desc: "All transaction data and payments encrypted using AES‑256." },
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
          { value: "200K+", label: "VAT Returns Filed" },
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
    { name: "Ahmed N.", role: "Importer, Hargeisa", text: "I cleared customs VAT through DalPay without leaving my office. The receipt came instantly." },
    { name: "Nasra K.", role: "Restaurant Owner, Borama", text: "Filing consumption tax used to take hours. Now I do it on my phone while checking inventory." },
    { name: "Hassan O.", role: "Small Trader, Berbera", text: "The calculator is spot‑on. I pay the exact VAT on my purchases — no more overpaying." },
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
          Ready to Pay Your Consumption Tax?
        </h2>
        <p className="text-xl text-white/80 mb-10">
          Join thousands using DalPay for fast, secure indirect tax payments — anytime, anywhere.
        </p>
        <Link
          to="/pay?tax=consumption"
          className="inline-flex items-center gap-3 bg-white text-[#0F7B8C] hover:bg-gray-100 font-bold py-4 px-10 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
        >
          Pay Consumption Tax Now
          <ArrowRight size={22} />
        </Link>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   TaxTypeConsumptionPage
   ──────────────────────────────────────────── */
export default function TaxTypeConsumptionPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-[#0A0E1A]">
      <Hero />
      <TrustBadges />
      <HowToPayConsumption />
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