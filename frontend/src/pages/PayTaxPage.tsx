/* ─── src/pages/PayTaxPage.jsx ─── */
import { Link } from "react-router-dom";
import {
  ShieldCheck, ArrowRight, Smartphone, Clock, BadgeCheck,
  Zap, Globe, Play, Star,
  CreditCard, Wallet, ReceiptText, ChevronRight,
  Check, Lock, Server, Cpu,
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
          Pay in 3 minutes – 50,000+ transactions processed daily
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-[1.1]">
          Pay Your Taxes
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] to-[#3BA7BC]">
            Without Leaving Home
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto mb-10">
          Connect your mobile money — <strong className="text-white">Zaad, eDahab, Nomad</strong> — and
          settle income, business, or property tax in seconds.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
          <Link
            to="/register"
            className="group bg-white text-[#0F7B8C] hover:bg-gray-100 font-bold py-4 px-8 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
          >
            Start Paying Now
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <button className="border-2 border-white/80 text-white hover:bg-white hover:text-[#0F7B8C] font-bold py-4 px-8 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2">
            <Play size={20} /> How It Works
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
          {[
            { value: "3 min", label: "Average Payment Time", icon: Clock },
            { value: "99.9%", label: "Uptime Guarantee", icon: Server },
            { value: "All Operators", label: "Zaad, eDahab, Nomad", icon: Smartphone },
            { value: "Instant Receipts", label: "SMS & Email", icon: ReceiptText },
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
   3. How to Pay (step‑by‑step)
   ──────────────────────────────────────────── */
function HowToPay() {
  const steps = [
    { step: 1, title: "Select Tax Type", desc: "Choose income, business, or property tax. Enter the amount you want to pay.", icon: CreditCard },
    { step: 2, title: "Enter Taxpayer Info", desc: "Your phone number & National ID are linked automatically for security.", icon: ShieldCheck },
    { step: 3, title: "Pay via Mobile Money", desc: "You'll receive a USSD push or use your mobile money app directly.", icon: Smartphone },
    { step: 4, title: "Instant Confirmation", desc: "SMS & email receipt with a unique transaction ID for your records.", icon: ReceiptText },
  ];

  return (
    <section className="py-24 bg-white dark:bg-[#0A0E1A]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 text-[#0F7B8C] dark:text-[#3BA7BC] text-sm font-semibold mb-6">
            Simple Process
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            How to Pay in <span className="text-[#0F7B8C]">4 Easy Steps</span>
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
   4. Features
   ──────────────────────────────────────────── */
function Features() {
  const items = [
    { icon: Smartphone, title: "All Mobile Operators", desc: "Works with Zaad, eDahab, Nomad, Hormuud — no extra app needed.", color: "text-[#0F7B8C]" },
    { icon: Clock, title: "3‑Minute Payment", desc: "Complete your tax payment faster than boiling tea.", color: "text-amber-500" },
    { icon: ReceiptText, title: "Digital Receipts", desc: "SMS & email proof instantly, stored in your account forever.", color: "text-green-500" },
    { icon: ShieldCheck, title: "End‑to‑End Secure", desc: "256‑bit encryption, National ID SSO, fraud detection.", color: "text-red-500" },
    { icon: Globe, title: "Nationwide Access", desc: "Pay from anywhere — Hargeisa to Borama, urban or rural.", color: "text-blue-500" },
    { icon: BadgeCheck, title: "Legal Compliance", desc: "Automatically filed with the Ministry of Finance.", color: "text-purple-500" },
  ];

  return (
    <section className="py-24 bg-white dark:bg-[#0A0E1A]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 text-[#0F7B8C] dark:text-[#3BA7BC] text-sm font-semibold mb-6">
            Key Benefits
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            Why Pay with <span className="text-[#0F7B8C]">DalPay</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            The only tax platform you'll ever need.
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
   5. Tax Types
   ──────────────────────────────────────────── */
function TaxTypes() {
  const types = [
    { icon: CreditCard, title: "Income Tax", desc: "Pay on your salary or earnings.", link: "/pay?tax=income" },
    { icon: Wallet, title: "Business Tax", desc: "Annual turnover tax for companies.", link: "/pay?tax=business" },
    { icon: ShieldCheck, title: "Property Tax", desc: "Land and building taxes.", link: "/pay?tax=property" },
  ];

  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 text-[#0F7B8C] dark:text-[#3BA7BC] text-sm font-semibold mb-6">
            What You Can Pay
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            Covered <span className="text-[#0F7B8C]">Tax Types</span>
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
                Pay Now <ArrowRight size={16} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   6. Comparison
   ──────────────────────────────────────────── */
function Comparison() {
  const rows = [
    { feature: "Payment Time", dalpay: "3 minutes", traditional: "1–3 hours" },
    { feature: "Queue", dalpay: "None", traditional: "Long queues" },
    { feature: "Receipt", dalpay: "Instant digital", traditional: "Paper receipt" },
    { feature: "Operating Hours", dalpay: "24/7", traditional: "9 AM – 4 PM" },
    { feature: "Security", dalpay: "Encrypted + biometric", traditional: "Manual" },
  ];

  return (
    <section className="py-24 bg-white dark:bg-[#0A0E1A]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 text-[#0F7B8C] dark:text-[#3BA7BC] text-sm font-semibold mb-6">
            Why Switch
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            DalPay vs <span className="text-[#0F7B8C]">Traditional</span>
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                <th className="py-4 px-6 text-gray-600 dark:text-gray-400">Feature</th>
                <th className="py-4 px-6 text-gray-900 dark:text-white font-bold">
                  <Check className="inline text-[#0F7B8C]" size={18} /> DalPay
                </th>
                <th className="py-4 px-6 text-gray-600 dark:text-gray-400 font-bold">
                  Traditional
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.feature} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                  <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">{row.feature}</td>
                  <td className="py-4 px-6 text-green-600 dark:text-green-400">{row.dalpay}</td>
                  <td className="py-4 px-6 text-red-500 dark:text-red-400">{row.traditional}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   7. Security
   ──────────────────────────────────────────── */
function Security() {
  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 text-[#0F7B8C] dark:text-[#3BA7BC] text-sm font-semibold mb-6">
          Enterprise Security
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8">
          Your Data is <span className="text-[#0F7B8C]">Safe</span>
        </h2>
        <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
          {[
            { icon: Lock, title: "End‑to‑End Encryption", desc: "All data encrypted in transit and at rest using AES‑256." },
            { icon: Server, title: "ISO 27001 Certified", desc: "Our infrastructure meets the highest international standards." },
            { icon: Cpu, title: "Real‑Time Fraud Detection", desc: "AI‑powered monitoring blocks suspicious transactions instantly." },
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
   8. FAQ
   ──────────────────────────────────────────── */
function Faq() {
  const faqs = [
    { q: "Which taxes can I pay?", a: "You can pay income tax, business tax, and property tax through DalPay." },
    { q: "Do I need a bank account?", a: "No. All you need is a mobile money account with Zaad, eDahab, or Nomad." },
    { q: "How do I get a receipt?", a: "A receipt is automatically sent via SMS and email immediately after payment." },
    { q: "Is my payment secure?", a: "Absolutely. All transactions are encrypted and comply with PCI‑DSS and government standards." },
    { q: "Can I pay for someone else?", a: "Yes. Just enter their National ID during the payment process." },
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
   9. Stats
   ──────────────────────────────────────────── */
function Stats() {
  return (
    <section className="py-24 bg-gradient-to-br from-[#0F7B8C] via-[#0A5D6B] to-[#0F7B8C] text-white">
      <div className="max-w-7xl mx-auto px-6 grid gap-8 md:grid-cols-3 text-center">
        {[
          { value: "1.2M+", label: "Transactions Processed" },
          { value: "50K+", label: "Active Taxpayers" },
          { value: "99.9%", label: "System Uptime" },
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
   10. Testimonials
   ──────────────────────────────────────────── */
function Testimonials() {
  const quotes = [
    { name: "Ahmed H.", role: "Business Owner, Hargeisa", text: "DalPay saved me hours. No more standing in long queues. I pay my business tax in minutes." },
    { name: "Hodan A.", role: "Teacher, Borama", text: "The instant receipt gives me peace of mind. I can track all my payments online." },
    { name: "Mahad I.", role: "Freelancer, Burco", text: "I never thought paying taxes could be this easy. DalPay is truly a game‑changer." },
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
              <p className="text-gray-600 dark:text-gray-400 mb-6 italic">"{text}"</p>
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
   11. Download App
   ──────────────────────────────────────────── */
function DownloadApp() {
  return (
    <section className="py-24 bg-white dark:bg-[#0A0E1A]">
      <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 text-[#0F7B8C] dark:text-[#3BA7BC] text-sm font-semibold mb-6">
            Coming Soon
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Use the <span className="text-[#0F7B8C]">DalPay App</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-lg">
            Download the official DalPay app for Android and iOS. Get push notifications, biometric login, and offline payment history.
          </p>
          <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
            <a href="#" className="inline-flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-black font-semibold py-3 px-6 rounded-xl hover:opacity-90 transition-opacity">
              <Smartphone size={20} /> Google Play
            </a>
            <a href="#" className="inline-flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-black font-semibold py-3 px-6 rounded-xl hover:opacity-90 transition-opacity">
              <Smartphone size={20} /> App Store
            </a>
          </div>
        </div>
        <div className="flex-1 flex justify-center">
          <div className="w-64 h-96 bg-[#0F7B8C]/10 rounded-3xl flex items-center justify-center rotate-3 hover:rotate-0 transition-transform">
            <Smartphone size={60} className="text-[#0F7B8C]" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   12. CTA
   ──────────────────────────────────────────── */
function Cta() {
  return (
    <section className="py-24 bg-gradient-to-br from-[#0F7B8C] via-[#0A5D6B] to-[#0F7B8C] text-white">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Ready to Pay Your Taxes?
        </h2>
        <p className="text-xl text-white/80 mb-10">
          Join thousands of taxpayers who have switched to DalPay. Start your payment now.
        </p>
        <Link
          to="/register"
          className="inline-flex items-center gap-3 bg-white text-[#0F7B8C] hover:bg-gray-100 font-bold py-4 px-10 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
        >
          Get Started Today
          <ArrowRight size={22} />
        </Link>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   PayTaxPage
   ──────────────────────────────────────────── */
export default function PayTaxPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-[#0A0E1A]">
      <Hero />
      <TrustBadges />
      <HowToPay />
      <Features />
      <TaxTypes />
      <Comparison />
      <Security />
      <Faq />
      <Stats />
      <Testimonials />
      <DownloadApp />
      <Cta />
    </main>
  );
}