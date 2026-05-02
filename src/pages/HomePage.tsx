/* ─── src/pages/HomePage.jsx ─── */
import { Link } from "react-router-dom";
import {
  ShieldCheck, ArrowRight, Smartphone, Play, Users, TrendingUp, Star,
  Lock, Server, Clock, BadgeCheck, Zap, Globe, CreditCard, ReceiptText,
  ChevronDown, FileText, UserPlus, CheckCircle, Bell, UserCheck,
  Building2, Briefcase, Home, ShoppingCart, TrendingDown, Headphones, Fingerprint,
  Eye, FileCheck, HelpCircle, MessageCircle, Mail, PlaySquare, Apple, XCircle,
} from "lucide-react";
import { useState } from "react";

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
          Now processing 10,000+ payments daily
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-[1.1]">
          Pay Taxes
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] to-[#3BA7BC]">
            Digitally, Instantly
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto mb-10">
          Somaliland's official digital tax platform. Connect your mobile money —{" "}
          <strong className="text-white"> Zaad, eDahab, Nomad</strong> — and pay
          income, business, and property taxes in seconds.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
          <Link
            to="/register"
            className="group bg-white text-[#0F7B8C] hover:bg-gray-100 font-bold py-4 px-8 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
          >
            Get Started Free
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <button className="border-2 border-white/80 text-white hover:bg-white hover:text-[#0F7B8C] font-bold py-4 px-8 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2">
            <Play size={20} /> Watch Demo
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
          {[
            { value: "50K+", label: "Registered Taxpayers", icon: Users },
            { value: "1.2M+", label: "Transactions Processed", icon: TrendingUp },
            { value: "40%", label: "Compliance Increase", icon: TrendingUp },
            { value: "99.9%", label: "System Uptime", icon: Star },
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
  const badges = [
    { icon: ShieldCheck, label: "Government Certified", sub: "Ministry of Finance" },
    { icon: Lock, label: "256-bit Encryption", sub: "PCI-DSS Level 1" },
    { icon: Server, label: "99.9% Uptime", sub: "Neon Serverless" },
    { icon: Users, label: "50,000+ Users", sub: "Across Somaliland" },
  ];

  return (
    <section className="py-12 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {badges.map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white dark:hover:bg-[#111627] transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#0F7B8C]/10 flex items-center justify-center shrink-0">
                <Icon size={22} className="text-[#0F7B8C]" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   3. Features (Key Benefits)
   ──────────────────────────────────────────── */
function Features() {
  const features = [
    { icon: ShieldCheck, title: "Bank‑Level Security", desc: "End‑to‑end encryption with PCI‑DSS compliance and National ID SSO." },
    { icon: Smartphone, title: "All Operators", desc: "Zaad, eDahab, Nomad, Hormuud — use what you already trust." },
    { icon: Clock, title: "Real‑Time Receipts", desc: "SMS & email confirmations instantly after payment." },
    { icon: BadgeCheck, title: "Legal Compliance", desc: "Every transaction recorded and auditable by authorities." },
    { icon: Zap, title: "3‑Minute Payment", desc: "Complete your tax payment faster than boiling tea." },
    { icon: Globe, title: "Nationwide Access", desc: "Pay from anywhere — Hargeisa to Borama, urban or rural." },
  ];

  return (
    <section className="py-24 bg-white dark:bg-[#0A0E1A]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 text-[#0F7B8C] dark:text-[#3BA7BC] text-sm font-semibold mb-6">
            Why DalPay
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            Built for <span className="text-[#0F7B8C]">Trust & Speed</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Every feature engineered to make government payments effortless.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="group bg-white dark:bg-[#111627] border border-gray-200 dark:border-gray-700 rounded-2xl p-7 hover:border-[#0F7B8C]/40 hover:shadow-xl hover:shadow-[#0F7B8C]/5 transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 flex items-center justify-center mb-5 group-hover:bg-[#0F7B8C] group-hover:border-[#0F7B8C] transition-all">
                <Icon size={26} className="text-[#0F7B8C] group-hover:text-white transition-colors" />
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
   4. How It Works (simple steps)
   ──────────────────────────────────────────── */
function HowItWorks() {
  const steps = [
    { step: "01", icon: UserPlus, title: "Register", desc: "Create account with National ID in under 2 minutes." },
    { step: "02", icon: FileText, title: "View Demand", desc: "See your assessment, amount, and due date automatically." },
    { step: "03", icon: CreditCard, title: "Pay via Mobile", desc: "Choose operator, confirm amount, enter PIN." },
    { step: "04", icon: CheckCircle, title: "Get Receipt", desc: "Instant SMS + email confirmation. Done." },
  ];

  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 text-[#0F7B8C] dark:text-[#3BA7BC] text-sm font-semibold mb-6">
            Simple Process
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            How <span className="text-[#0F7B8C]">DalPay</span> Works
          </h2>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ step, icon: Icon, title, desc }) => (
            <div key={title} className="relative text-center group">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-8xl font-black text-gray-200/20 dark:text-gray-700/20 select-none">
                {step}
              </div>
              <div className="relative w-20 h-20 mx-auto rounded-3xl bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#0F7B8C] group-hover:border-[#0F7B8C] transition-all">
                <Icon size={32} className="text-[#0F7B8C] group-hover:text-white transition-colors" />
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
   5. How to Pay (detailed guide)
   ──────────────────────────────────────────── */
function HowToPay() {
  const steps = [
    { step: "1", icon: UserCheck, title: "Register Account", desc: "Sign up with your National ID. Takes less than 2 minutes.", detail: "Your identity is verified against the national database." },
    { step: "2", icon: FileText, title: "View Tax Demand", desc: "See your assessment, amount due, and payment deadline.", detail: "Tax demands are calculated automatically." },
    { step: "3", icon: Smartphone, title: "Choose Operator", desc: "Select your mobile money provider — Zaad, eDahab, or others.", detail: "All major operators are integrated." },
    { step: "4", icon: CreditCard, title: "Confirm & Pay", desc: "Enter your mobile money PIN to authorize.", detail: "Payment encrypted via PCI‑DSS channels." },
    { step: "5", icon: Bell, title: "Receive Receipt", desc: "Get instant SMS and email confirmation.", detail: "Receipts stored permanently in your dashboard." },
  ];

  return (
    <section className="py-24 bg-white dark:bg-[#0A0E1A]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 text-[#0F7B8C] dark:text-[#3BA7BC] text-sm font-semibold mb-6">
            Step‑by‑Step Guide
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            How to <span className="text-[#0F7B8C]">Pay Your Tax</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Five simple steps from registration to receipt.
          </p>
        </div>

        <div className="relative">
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#0F7B8C]/50 via-gray-200 dark:via-gray-700 to-[#0F7B8C]/50" />

          <div className="space-y-12">
            {steps.map(({ step, icon: Icon, title, desc, detail }, idx) => (
              <div
                key={step}
                className={`relative flex flex-col lg:flex-row items-center gap-8 ${
                  idx % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                }`}
              >
                <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-[#0F7B8C] text-white font-bold items-center justify-center z-10 shadow-lg shadow-[#0F7B8C]/30">
                  {step}
                </div>

                <div
                  className={`w-full lg:w-[calc(50%-40px)] ${
                    idx % 2 === 0 ? "lg:pr-12 lg:text-right" : "lg:pl-12 lg:text-left"
                  }`}
                >
                  <div className="bg-white dark:bg-[#111627] border border-gray-200 dark:border-gray-700 rounded-2xl p-7 hover:shadow-xl hover:border-[#0F7B8C]/20 transition-all group">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-[#0F7B8C]/10 flex items-center justify-center mb-5 group-hover:bg-[#0F7B8C] group-hover:scale-110 transition-all ${
                        idx % 2 === 0 ? "lg:ml-auto" : ""
                      }`}
                    >
                      <Icon size={26} className="text-[#0F7B8C] group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-3">{desc}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 italic">{detail}</p>
                  </div>
                </div>

                <div className="hidden lg:block w-[calc(50%-40px)]" />
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-14">
          <Link
            to="/resources/how-to-pay"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#0F7B8C] hover:bg-[#3BA7BC] text-white font-semibold rounded-xl transition-all"
          >
            Read Full Guide
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   6. Stats
   ──────────────────────────────────────────── */
function Stats() {
  const stats = [
    { icon: Users, value: "50K+", label: "Registered Taxpayers", sub: "Growing daily" },
    { icon: ReceiptText, value: "1.2M+", label: "Transactions", sub: "Processed securely" },
    { icon: TrendingUp, value: "40%", label: "Compliance Increase", sub: "Since launch" },
    { icon: ShieldCheck, value: "99.9%", label: "System Uptime", sub: "24/7 availability" },
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-[#0F7B8C]/5 via-white dark:via-[#0A0E1A] to-[#10B981]/5">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(({ icon: Icon, value, label, sub }) => (
            <div key={label} className="text-center group">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Icon size={28} className="text-[#0F7B8C]" />
              </div>
              <p className="text-4xl font-black text-gray-900 dark:text-white">{value}</p>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-2">{label}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   7. Operator Partners
   ──────────────────────────────────────────── */
function OperatorPartners() {
  const operators = [
    { name: "Zaad", color: "from-blue-500 to-blue-600" },
    { name: "eDahab", color: "from-green-500 to-green-600" },
    { name: "Nomad", color: "from-purple-500 to-purple-600" },
    { name: "Hormuud", color: "from-orange-500 to-orange-600" },
  ];

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="w-16 h-16 bg-[#0F7B8C]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-[#0F7B8C]" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Integrated Mobile Money Partners
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Seamlessly connected with all major operators
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {operators.map((op) => (
            <div key={op.name} className="group text-center">
              <div
                className={`w-16 h-16 bg-gradient-to-r ${op.color} rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform shadow-lg`}
              >
                <span className="text-white font-bold text-xl">{op.name.charAt(0)}</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{op.name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Mobile Money</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   8. Tax Types
   ──────────────────────────────────────────── */
function TaxTypes() {
  const types = [
    { icon: Briefcase, title: "Income Tax", desc: "For salaried employees and professionals.", href: "/tax-types/income", color: "from-[#0F7B8C] to-[#3BA7BC]" },
    { icon: Building2, title: "Business Tax", desc: "For registered businesses and traders.", href: "/tax-types/business", color: "from-[#2563EB] to-[#3B82F6]" },
    { icon: Home, title: "Property Tax", desc: "For landowners and property owners.", href: "/tax-types/property", color: "from-[#10B981] to-[#34D399]" },
    { icon: ShoppingCart, title: "Consumption Tax", desc: "Indirect tax on goods and services.", href: "/tax-types/consumption", color: "from-red-400 to-red-500" },
  ];

  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 text-[#0F7B8C] dark:text-[#3BA7BC] text-sm font-semibold mb-6">
            Tax Categories
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            Explore <span className="text-[#0F7B8C]">Tax Types</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Understand which taxes apply to you and pay them easily.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {types.map(({ icon: Icon, title, desc, href, color }) => (
            <Link
              key={title}
              to={href}
              className="group bg-white dark:bg-[#111627] border border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all text-center"
            >
              <div className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-r ${color} flex items-center justify-center mb-4 shadow-lg`}>
                <Icon size={26} className="text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   9. Benefits (Why DalPay?)
   ──────────────────────────────────────────── */
function Benefits() {
  const benefits = [
    { icon: Zap, title: "Lightning Fast", desc: "Complete your tax payment in under 3 minutes. No travel, no waiting in line.", color: "from-amber-500 to-orange-600" },
    { icon: TrendingDown, title: "Lower Costs", desc: "Digital processing reduces government overhead — savings passed to public services.", color: "from-emerald-500 to-teal-600" },
    { icon: Headphones, title: "24/7 Support", desc: "Multilingual help desk available via phone, email, and live chat.", color: "from-blue-500 to-indigo-600" },
    { icon: Globe, title: "Nationwide Access", desc: "Pay from anywhere in Somaliland with mobile network coverage. Urban or rural.", color: "from-purple-500 to-pink-600" },
    { icon: CreditCard, title: "Multiple Payment Methods", desc: "All major mobile money operators supported — use the service you already trust.", color: "from-cyan-500 to-blue-600" },
    { icon: Clock, title: "Real-Time Processing", desc: "Payments reflected instantly. No waiting days for confirmation or clearance.", color: "from-rose-500 to-red-600" },
  ];

  return (
    <section className="py-24 bg-white dark:bg-[#0A0E1A]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981] dark:text-[#34D399] text-sm font-semibold mb-6">
            Why Choose Us
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            Why <span className="text-[#10B981]">DalPay</span>?
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            More than just tax payments — a complete digital experience for citizens.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {benefits.map(({ icon: Icon, title, desc, color }) => (
            <div
              key={title}
              className="group bg-white dark:bg-[#111627] border border-gray-200 dark:border-gray-700 rounded-2xl p-7 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                <Icon size={26} className="text-white" />
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
   10. Comparison (DalPay vs Traditional)
   ──────────────────────────────────────────── */
function Comparison() {
  const rows = [
    { feature: "Payment Time", traditional: "2–4 hours (travel + queue)", dalpay: "Under 3 minutes" },
    { feature: "Travel Required", traditional: "Yes — must visit tax office", dalpay: "No — pay from anywhere" },
    { feature: "Operating Hours", traditional: "8 AM – 4 PM, weekdays only", dalpay: "24/7, including holidays" },
    { feature: "Instant Receipt", traditional: "Paper receipt only", dalpay: "SMS + Email + Dashboard" },
    { feature: "Payment Tracking", traditional: "Manual record keeping", dalpay: "Real-time dashboard" },
    { feature: "Security", traditional: "Cash handling risk", dalpay: "Encrypted + PCI-DSS" },
    { feature: "Cost per Transaction", traditional: "USD 2–5 (transport, fees)", dalpay: "USD 0.20–0.50" },
  ];

  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 text-[#0F7B8C] dark:text-[#3BA7BC] text-sm font-semibold mb-6">
            The Difference
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            DalPay vs <span className="text-gray-400 dark:text-gray-500 line-through">Traditional</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            See why digital tax payment is the future.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="grid grid-cols-3 bg-gray-100 dark:bg-gray-800 px-6 py-4 font-bold text-sm text-gray-700 dark:text-gray-300">
            <div>Feature</div>
            <div className="text-center">Traditional</div>
            <div className="text-center text-[#0F7B8C] dark:text-[#3BA7BC]">DalPay</div>
          </div>

          {rows.map((row, idx) => (
            <div
              key={row.feature}
              className={`grid grid-cols-3 px-6 py-4 text-sm items-center ${
                idx % 2 === 0 ? "bg-white dark:bg-[#111627]" : "bg-gray-50 dark:bg-gray-800/30"
              }`}
            >
              <div className="font-medium text-gray-900 dark:text-white">{row.feature}</div>
              <div className="text-center text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1.5">
                <XCircle size={14} className="text-red-400 shrink-0" />
                {row.traditional}
              </div>
              <div className="text-center text-[#0F7B8C] dark:text-[#3BA7BC] font-semibold flex items-center justify-center gap-1.5">
                <CheckCircle size={14} className="text-[#10B981] shrink-0" />
                {row.dalpay}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   11. Testimonials
   ──────────────────────────────────────────── */
function Testimonials() {
  const quotes = [
    { name: "Ahmed Ismail", role: "Business Owner — Borama", text: "DalPay saved me a full day of travel to Hargeisa. I paid my business tax from my shop in 2 minutes." },
    { name: "Fatima Yusuf", role: "Teacher — Berbera", text: "The SMS receipt gave me confidence. I can prove my payment anytime. This is what modern government looks like." },
    { name: "Mohamed Abdi", role: "Accountant — Hargeisa", text: "Real-time tracking means I always know which taxes are paid and which are pending. No more guesswork." },
  ];

  return (
    <section className="py-24 bg-white dark:bg-[#0A0E1A]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="w-16 h-16 bg-[#0F7B8C]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-[#0F7B8C]" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">What Our Citizens Say</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">Trusted by taxpayers across Somaliland</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {quotes.map((t, i) => (
            <div
              key={i}
              className="group bg-gray-50 dark:bg-[#111627] border border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:shadow-xl hover:border-[#0F7B8C]/30 transition-all"
            >
              <div className="flex mb-3">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 text-amber-500 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 dark:text-gray-400 italic mb-4">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#0F7B8C] to-[#10B981] rounded-full flex items-center justify-center text-white font-bold">
                  {t.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">{t.name}</h4>
                  <p className="text-[#0F7B8C] dark:text-[#3BA7BC] text-sm">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   12. Security
   ──────────────────────────────────────────── */
function Security() {
  const items = [
    { icon: Lock, title: "AES-256 Encryption", desc: "All data encrypted at rest and in transit using military-grade standards." },
    { icon: Fingerprint, title: "National ID Verification", desc: "SSO integration with government identity systems." },
    { icon: Eye, title: "Full Audit Trail", desc: "Every action logged and traceable by authorized officials." },
    { icon: FileCheck, title: "PCI-DSS Compliance", desc: "Meets payment card industry data security standards." },
    { icon: Server, title: "Secure Infrastructure", desc: "Neon serverless PostgreSQL with VPC isolation." },
    { icon: ShieldCheck, title: "DDoS Protection", desc: "Rate limiting and traffic monitoring to prevent attacks." },
  ];

  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 text-[#0F7B8C] dark:text-[#3BA7BC] text-sm font-semibold mb-6">
            <ShieldCheck size={14} /> Enterprise Security
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            Your Data is <span className="text-[#0F7B8C]">Safe</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Government-grade security protecting every transaction and taxpayer record.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group flex gap-5 p-6 rounded-2xl bg-white dark:bg-[#111627] border border-gray-200 dark:border-gray-700 hover:border-[#0F7B8C]/30 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-[#0F7B8C]/10 flex items-center justify-center shrink-0 group-hover:bg-[#0F7B8C] group-hover:scale-110 transition-all">
                <Icon size={22} className="text-[#0F7B8C] group-hover:text-white transition-colors" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1.5">{title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-[#0F7B8C]/5 border border-[#0F7B8C]/10">
            <ShieldCheck size={20} className="text-[#0F7B8C]" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              DalPay follows <strong className="text-gray-900 dark:text-white">OWASP Top 10</strong> and{" "}
              <strong className="text-gray-900 dark:text-white">NIST SP 800-52</strong> security frameworks
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   13. FAQ
   ──────────────────────────────────────────── */
function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const faqs = [
    { q: "What is DalPay?", a: "DalPay is the official digital tax payment system of the Ministry of Finance, Republic of Somaliland." },
    { q: "Which mobile money operators are supported?", a: "Currently Zaad, eDahab, Nomad, and Hormuud. More coming soon." },
    { q: "Is my payment information secure?", a: "Absolutely. All transactions are encrypted using AES-256, PCI‑DSS compliant, with National ID verification." },
    { q: "Do I need a smartphone?", a: "No. You can pay via SMS, USSD (feature phones), or the web portal from any device." },
    { q: "How do I get a receipt?", a: "Instant SMS and email after payment. All receipts stored permanently in your dashboard." },
    { q: "What if I overpay?", a: "The system detects overpayments and creates a credit note. You can request a refund or apply credit to future taxes." },
  ];

  return (
    <section className="py-24 bg-white dark:bg-[#0A0E1A]">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="w-16 h-16 bg-[#0F7B8C]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <HelpCircle size={32} className="text-[#0F7B8C]" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            Frequently <span className="text-[#0F7B8C]">Asked Questions</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Everything you need to know about paying taxes with DalPay.
          </p>
        </div>

        <div className="space-y-4 mb-12">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-white dark:bg-[#111627] border border-gray-200 dark:border-gray-700 hover:border-[#0F7B8C]/20 transition-all overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full flex items-center justify-between px-6 py-5 text-left"
              >
                <span className="font-semibold text-gray-900 dark:text-white pr-4">{faq.q}</span>
                <ChevronDown
                  size={20}
                  className={`text-gray-400 shrink-0 transition-transform duration-300 ${
                    openIndex === idx ? "rotate-180 text-[#0F7B8C]" : ""
                  }`}
                />
              </button>
              <div
                className={`grid transition-all duration-300 ${
                  openIndex === idx ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="px-6 pb-5 text-gray-600 dark:text-gray-400 leading-relaxed">{faq.a}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center p-8 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
          <MessageCircle size={28} className="mx-auto text-[#0F7B8C] mb-3" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Still have questions?</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">Our support team is ready to help.</p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0F7B8C] hover:bg-[#3BA7BC] text-white font-semibold rounded-xl transition-all text-sm"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   14. Download App
   ──────────────────────────────────────────── */
function DownloadApp() {
  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Phone Mockup */}
          <div className="relative flex justify-center">
            <div className="relative bg-gray-900 rounded-[40px] p-4 shadow-2xl max-w-[280px]">
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-6 bg-gray-900 rounded-b-xl z-10" />
              <div className="bg-gradient-to-br from-[#0F7B8C] to-[#10B981] rounded-[32px] overflow-hidden aspect-[9/19] relative">
                <div className="pt-12 p-6 text-white text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold">DalPay</h3>
                  <p className="text-white/80 text-sm">Pay Tax Digitally</p>
                  <div className="mt-6 bg-white/10 rounded-xl p-3">
                    <div className="font-semibold">Income Tax 2026</div>
                    <div className="text-2xl font-bold mt-2">$500.00</div>
                    <div className="mt-3 bg-white text-[#0F7B8C] font-bold py-2 rounded-lg text-sm">Pay Now</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div>
            <div className="w-16 h-16 bg-[#0F7B8C]/10 rounded-2xl flex items-center justify-center mb-6">
              <Smartphone className="w-8 h-8 text-[#0F7B8C]" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Take DalPay With You</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
              Download the official app for faster payments, push notifications, and offline access to your tax records.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              {[
                { icon: Zap, title: "Lightning Fast", desc: "Pay taxes in under 3 minutes" },
                { icon: ShieldCheck, title: "Secure & Safe", desc: "Bank-level encryption for all transactions" },
                { icon: TrendingUp, title: "Real-time Updates", desc: "Instant payment confirmations" },
                { icon: Globe, title: "Works Everywhere", desc: "2G, 3G, 4G, or WiFi — it just works" },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#0F7B8C]/10 rounded-lg flex items-center justify-center">
                    <f.icon size={18} className="text-[#0F7B8C]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{f.title}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button className="flex items-center justify-center gap-3 bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 py-4 px-6 rounded-2xl transition-all">
                <Apple size={24} />
                <div className="text-left">
                  <div className="text-xs">Download on</div>
                  <div className="font-semibold">App Store</div>
                </div>
              </button>
              <button className="flex items-center justify-center gap-3 bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 py-4 px-6 rounded-2xl transition-all">
                <PlaySquare size={24} />
                <div className="text-left">
                  <div className="text-xs">Get it on</div>
                  <div className="font-semibold">Google Play</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   15. Newsletter
   ──────────────────────────────────────────── */
function Newsletter() {
  return (
    <section className="py-24 bg-gradient-to-br from-[#0F7B8C] to-[#0A5D6B] text-white">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Mail size={36} />
        </div>
        <h2 className="text-4xl md:text-5xl font-bold mb-4">Stay in the Loop</h2>
        <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
          Get tax deadline reminders, new features, and tips directly to your inbox.
        </p>
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 px-5 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button className="bg-white text-[#0F7B8C] hover:bg-gray-100 font-bold py-3.5 px-8 rounded-xl transition-all whitespace-nowrap">
              Subscribe
            </button>
          </div>
          <p className="text-white/50 text-sm">Join 10,000+ taxpayers. No spam, unsubscribe anytime.</p>
        </div>
        <div className="mt-8 flex justify-center gap-8 text-white/60 text-sm">
          <div className="flex items-center gap-2"><CheckCircle size={14} /> Tax reminders</div>
          <div className="flex items-center gap-2"><CheckCircle size={14} /> Platform updates</div>
          <div className="flex items-center gap-2"><CheckCircle size={14} /> Tips & guides</div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   16. CTA
   ──────────────────────────────────────────── */
function Cta() {
  return (
    <section className="py-24 bg-white dark:bg-[#0A0E1A] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0F7B8C]/5 via-transparent to-[#10B981]/5" />
      <div className="relative max-w-4xl mx-auto text-center px-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 text-[#0F7B8C] dark:text-[#3BA7BC] text-sm font-semibold mb-8">
          <Zap size={14} /> Get Started in 2 Minutes
        </div>
        <h2 className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-6">
          Ready to Pay Your Taxes <span className="text-[#0F7B8C]">Digitally</span>?
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
          Join thousands of Somaliland citizens already using DalPay. No travel, no cash, no hassle.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link
            to="/register"
            className="group bg-[#0F7B8C] hover:bg-[#3BA7BC] text-white font-bold py-4 px-8 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-[#0F7B8C]/30 hover:shadow-[#0F7B8C]/50 hover:scale-105"
          >
            Create Your Account
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/login"
            className="border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-bold py-4 px-8 rounded-2xl transition-all"
          >
            Sign In
          </Link>
        </div>
        <div className="flex items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-[#0F7B8C]" /> PCI-DSS Compliant</div>
          <div className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-[#0F7B8C]" /> Government Certified</div>
          <div className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-[#0F7B8C]" /> Free Forever</div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   HomePage (aggregator)
   ──────────────────────────────────────────── */
export default function HomePage() {
  return (
    <main className="min-h-screen bg-white dark:bg-[#0A0E1A]">
      <Hero />
      <TrustBadges />
      <Features />
      <HowItWorks />
      <HowToPay />
      <Stats />
      <OperatorPartners />
      <TaxTypes />
      <Benefits />
      <Comparison />
      <Testimonials />
      <Security />
      <Faq />
      <DownloadApp />
      <Newsletter />
      <Cta />
    </main>
  );
}