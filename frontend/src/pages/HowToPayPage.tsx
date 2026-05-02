/* ─── src/pages/HowToPayPage.jsx ─── */
import { Link } from "react-router-dom";
import {
  ShieldCheck, ArrowRight, Smartphone, Clock, BadgeCheck,
  Zap, Globe, Play, Star,
  CreditCard, Wallet, ReceiptText, ChevronRight,
  Check, Lock, Server, Cpu, Search, UserCheck, Bell,
  ShoppingCart,
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
          Complete guide – step‑by‑step instructions
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-[1.1]">
          How to Pay
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] to-[#3BA7BC]">
            Your Taxes Online
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto mb-10">
          A simple, visual guide that walks you through every step – from registration to receiving your receipt.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
          <Link
            to="/register"
            className="group bg-white text-[#0F7B8C] hover:bg-gray-100 font-bold py-4 px-8 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
          >
            Start Now
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <a href="#steps" className="border-2 border-white/80 text-white hover:bg-white hover:text-[#0F7B8C] font-bold py-4 px-8 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2">
            <Play size={20} /> Jump to Steps
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
          {[
            { value: "5 Steps", label: "From Start to Receipt", icon: Check },
            { value: "3 min", label: "Average Completion Time", icon: Clock },
            { value: "All Operators", label: "Zaad, eDahab, Nomad", icon: Smartphone },
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
   3. Detailed Step‑by‑Step Guide
   ──────────────────────────────────────────── */
function DetailedSteps() {
  const steps = [
    {
      step: "1",
      icon: UserCheck,
      title: "Register / Log In",
      desc: "Create your DalPay account using your National ID. Already registered? Simply log in.",
      detail: "Your identity is verified against the government database for security.",
    },
    {
      step: "2",
      icon: Search,
      title: "Select Tax Type & Amount",
      desc: "Choose income, business, property, or consumption tax. Enter the amount if it's not pre‑filled.",
      detail: "The system may auto‑populate your latest assessment based on your tax profile.",
    },
    {
      step: "3",
      icon: CreditCard,
      title: "Review Summary",
      desc: "Check the tax type, amount, and any surcharges. Everything is transparent.",
      detail: "You'll see a detailed breakdown before you commit to pay.",
    },
    {
      step: "4",
      icon: Smartphone,
      title: "Pay via Mobile Money",
      desc: "Choose your mobile operator (Zaad, eDahab, Nomad) and enter your mobile money PIN.",
      detail: "A USSD push may be sent to your phone – simply approve to complete the transaction.",
    },
    {
      step: "5",
      icon: Bell,
      title: "Receive Instant Receipt",
      desc: "Get an SMS and email confirmation immediately. The receipt is stored in your dashboard.",
      detail: "You can also download a PDF or CSV copy for your records.",
    },
  ];

  return (
    <section id="steps" className="py-24 bg-white dark:bg-[#0A0E1A]">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 text-[#0F7B8C] dark:text-[#3BA7BC] text-sm font-semibold mb-6">
            Payment Guide
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            How to Pay <span className="text-[#0F7B8C]">in 5 Steps</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            From opening the app to getting your receipt – it's that simple.
          </p>
        </div>

        <div className="relative">
          {/* Vertical connector line on large screens */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#0F7B8C]/50 via-gray-200 dark:via-gray-700 to-[#0F7B8C]/50" />

          <div className="space-y-12">
            {steps.map(({ step, icon: Icon, title, desc, detail }, idx) => (
              <div
                key={step}
                className={`relative flex flex-col lg:flex-row items-center gap-8 ${
                  idx % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                }`}
              >
                {/* Step number circle */}
                <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-[#0F7B8C] text-white font-bold items-center justify-center z-10 shadow-lg shadow-[#0F7B8C]/30">
                  {step}
                </div>

                {/* Content card */}
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

                {/* Spacer for opposite side */}
                <div className="hidden lg:block w-[calc(50%-40px)]" />
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-14">
          <Link
            to="/pay"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#0F7B8C] hover:bg-[#3BA7BC] text-white font-semibold rounded-xl transition-all"
          >
            Go to Payment Page
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   4. Key Benefits (Why Pay with DalPay)
   ──────────────────────────────────────────── */
function Benefits() {
  const items = [
    { icon: Clock, title: "3‑Minute Process", desc: "Complete your entire payment in less time than boiling tea." },
    { icon: Smartphone, title: "All Mobile Operators", desc: "Zaad, eDahab, Nomad — no extra app or bank account required." },
    { icon: ReceiptText, title: "Instant Digital Receipts", desc: "SMS + email confirmation immediately, saved forever." },
    { icon: ShieldCheck, title: "End‑to‑End Secure", desc: "256‑bit encryption and National ID authentication." },
    { icon: Globe, title: "Nationwide Access", desc: "Pay from anywhere — Hargeisa to Borama, urban or rural." },
    { icon: BadgeCheck, title: "Government‑Approved", desc: "Official tax platform of the Ministry of Finance." },
  ];

  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 text-[#0F7B8C] dark:text-[#3BA7BC] text-sm font-semibold mb-6">
            Why DalPay
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            The <span className="text-[#0F7B8C]">Easiest Way</span> to Pay
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            No queues, no paperwork, no hassle.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white dark:bg-[#111627] border border-gray-200 dark:border-gray-700 rounded-2xl p-7 hover:border-[#0F7B8C]/40 hover:shadow-xl hover:shadow-[#0F7B8C]/5 transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 flex items-center justify-center mb-5">
                <Icon size={26} className="text-[#0F7B8C]" />
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
   5. Covered Tax Types
   ──────────────────────────────────────────── */
function TaxTypesCovered() {
  const types = [
    { icon: CreditCard, title: "Income Tax", desc: "For salaried employees and professionals." },
    { icon: Wallet, title: "Business Tax", desc: "Annual turnover tax for businesses." },
    { icon: ShieldCheck, title: "Property Tax", desc: "Land and building taxes for owners." },
    { icon: ShoppingCart, title: "Consumption Tax", desc: "Indirect tax on goods and services." },
  ];

  return (
    <section className="py-24 bg-white dark:bg-[#0A0E1A]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 text-[#0F7B8C] dark:text-[#3BA7BC] text-sm font-semibold mb-6">
            Coverage
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            Pay All <span className="text-[#0F7B8C]">Tax Types</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            The same process works for every tax you owe.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {types.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white dark:bg-[#111627] border border-gray-200 dark:border-gray-700 rounded-2xl p-6 text-center hover:-translate-y-1 transition-transform">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 flex items-center justify-center mb-4">
                <Icon size={26} className="text-[#0F7B8C]" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{desc}</p>
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
    { q: "Do I need a bank account?", a: "No. You only need a mobile money account (Zaad, eDahab, or Nomad)." },
    { q: "Can I pay for someone else?", a: "Yes. Just enter their National ID during the payment process." },
    { q: "What if my payment fails?", a: "The system retries automatically. If it still fails, you'll be prompted to try again or contact support." },
    { q: "How do I know the payment was successful?", a: "You'll receive an SMS and email instantly, and the receipt appears in your dashboard." },
    { q: "Is there a fee?", a: "DalPay itself is free. Your mobile operator may charge a small transaction fee, typically less than $0.20." },
  ];

  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
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
    <section className="py-24 bg-white dark:bg-[#0A0E1A]">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 text-[#0F7B8C] dark:text-[#3BA7BC] text-sm font-semibold mb-6">
          Enterprise Security
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8">
          Your Payment is <span className="text-[#0F7B8C]">Protected</span>
        </h2>
        <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
          {[
            { icon: Lock, title: "End‑to‑End Encryption", desc: "Every transaction is encrypted using AES‑256, in transit and at rest." },
            { icon: Server, title: "ISO 27001 Certified", desc: "Infrastructure meets the highest global security standards." },
            { icon: Cpu, title: "Fraud Detection", desc: "AI monitors transactions 24/7 to block suspicious activity." },
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
          { value: "1.2M+", label: "Successful Payments" },
          { value: "3 min", label: "Average Payment Time" },
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
   9. Testimonials
   ──────────────────────────────────────────── */
function Testimonials() {
  const quotes = [
    { name: "Ahmed H.", role: "Business Owner, Hargeisa", text: "The steps are so clear, I paid my business tax on the first try without any help." },
    { name: "Hodan A.", role: "Teacher, Borama", text: "I was nervous about online payments, but the guide made it foolproof." },
    { name: "Mahad I.", role: "Freelancer, Burco", text: "From login to receipt in under 3 minutes – exactly as promised." },
  ];

  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 text-[#0F7B8C] dark:text-[#3BA7BC] text-sm font-semibold mb-6">
            Testimonials
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            What <span className="text-[#0F7B8C]">Users</span> Say
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
          Ready to Pay Your Taxes?
        </h2>
        <p className="text-xl text-white/80 mb-10">
          Now that you know how, jump in and settle your taxes in minutes.
        </p>
        <Link
          to="/pay"
          className="inline-flex items-center gap-3 bg-white text-[#0F7B8C] hover:bg-gray-100 font-bold py-4 px-10 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
        >
          Pay Now
          <ArrowRight size={22} />
        </Link>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   HowToPayPage
   ──────────────────────────────────────────── */
export default function HowToPayPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-[#0A0E1A]">
      <Hero />
      <TrustBadges />
      <DetailedSteps />
      <Benefits />
      <TaxTypesCovered />
      <Security />
      <Faq />
      <Stats />
      <Testimonials />
      <Cta />
    </main>
  );
}