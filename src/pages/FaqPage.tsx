/* ─── src/pages/FaqPage.jsx ─── */
import { Link } from "react-router-dom";
import {
  ShieldCheck, ArrowRight, Smartphone, Clock,
  Zap, Globe, Star, ChevronRight,
  Lock, Server, Cpu, HelpCircle, MessageCircle, Search,
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
          Answers at your fingertips – updated regularly
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-[1.1]">
          Frequently Asked
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] to-[#3BA7BC]">
            Questions
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto mb-10">
          Everything you need to know about DalPay – the official digital tax platform of Somaliland.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
          <Link
            to="/register"
            className="group bg-white text-[#0F7B8C] hover:bg-gray-100 font-bold py-4 px-8 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
          >
            Get Started
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <a href="#faq-list" className="border-2 border-white/80 text-white hover:bg-white hover:text-[#0F7B8C] font-bold py-4 px-8 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2">
            <HelpCircle size={20} /> Browse FAQs
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
          {[
            { value: "50+", label: "Answered Questions", icon: HelpCircle },
            { value: "4 Categories", label: "Tax, Payment, Security, Account", icon: Zap },
            { value: "Updated", label: "Monthly", icon: Clock },
            { value: "Instant", label: "Search & Find", icon: Search },
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
   3. FAQ Accordion List
   ──────────────────────────────────────────── */
function FaqList() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    { q: "What is DalPay?", a: "DalPay is the official digital tax payment system of the Ministry of Finance, Republic of Somaliland. It allows citizens and businesses to pay income, business, property, and consumption taxes using mobile money." },
    { q: "Is DalPay free to use?", a: "Yes, DalPay itself is completely free. Your mobile money provider may charge a small transaction fee (usually under $0.20)." },
    { q: "Which mobile money operators are supported?", a: "Currently Zaad, eDahab, Nomad, and Hormuud. Additional operators are being added soon." },
    { q: "Do I need a bank account?", a: "No. All you need is a mobile money account with one of the supported operators." },
    { q: "How do I register?", a: "Simply click 'Register', provide your National ID, and follow the prompts. Verification takes less than 2 minutes." },
    { q: "What taxes can I pay?", a: "Income Tax, Business Tax, Property Tax, and Consumption Tax. More tax types may be added in the future." },
    { q: "How long does a payment take?", a: "Average payment time is 3 minutes from login to receipt." },
    { q: "Will I get a receipt?", a: "Yes. You receive an instant SMS and email receipt after every successful payment. All receipts are permanently stored in your dashboard." },
    { q: "Is my personal and payment information secure?", a: "Absolutely. DalPay uses AES-256 encryption, is PCI-DSS compliant, and employs National ID verification. All data is protected at rest and in transit." },
    { q: "Can I pay for someone else?", a: "Yes. During the payment process you can enter the taxpayer's National ID to make a payment on their behalf." },
    { q: "What if I overpay?", a: "The system automatically detects overpayments and creates a credit note. You can request a refund or apply it to future taxes." },
    { q: "What happens if my payment fails?", a: "DalPay retries automatically. If the failure persists, you will be notified to contact support or try a different operator." },
    { q: "Can I use DalPay on a feature phone?", a: "Yes. You can pay via USSD (for feature phones) or SMS. A smartphone app is also available for iOS and Android." },
    { q: "How do I contact support?", a: "You can reach our support team via live chat, phone, or email. Visit the Contact page for details." },
    { q: "Is DalPay available 24/7?", a: "Yes. The platform is available 24 hours a day, 7 days a week, including holidays." },
  ];

  return (
    <section id="faq-list" className="py-24 bg-white dark:bg-[#0A0E1A]">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 text-[#0F7B8C] dark:text-[#3BA7BC] text-sm font-semibold mb-6">
            Common Questions
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            All Frequently Asked <span className="text-[#0F7B8C]">Questions</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Click on any question to see the answer.
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
                <ChevronRight
                  size={20}
                  className={`text-gray-400 shrink-0 transition-transform duration-300 ${
                    openIndex === idx ? "rotate-90 text-[#0F7B8C]" : ""
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

        {/* Still have questions */}
        <div className="text-center p-8 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
          <MessageCircle size={28} className="mx-auto text-[#0F7B8C] mb-3" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Didn't find your answer?</h3>
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
   4. Security Section
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
   5. Stats Section
   ──────────────────────────────────────────── */
function Stats() {
  return (
    <section className="py-24 bg-gradient-to-br from-[#0F7B8C] via-[#0A5D6B] to-[#0F7B8C] text-white">
      <div className="max-w-7xl mx-auto px-6 grid gap-8 md:grid-cols-3 text-center">
        {[
          { value: "50K+", label: "Active Taxpayers" },
          { value: "1.2M+", label: "Transactions Processed" },
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
   6. Testimonials
   ──────────────────────────────────────────── */
function Testimonials() {
  const quotes = [
    { name: "Ahmed H.", role: "Business Owner, Hargeisa", text: "The FAQ answered all my questions before I even signed up. Great resource!" },
    { name: "Hodan A.", role: "Teacher, Borama", text: "I was confused about property tax, but the FAQ cleared it up in seconds." },
    { name: "Mahad I.", role: "Freelancer, Burco", text: "Clear, simple, and always up to date. The best support doc I've seen from a government service." },
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
   7. CTA
   ──────────────────────────────────────────── */
function Cta() {
  return (
    <section className="py-24 bg-gradient-to-br from-[#0F7B8C] via-[#0A5D6B] to-[#0F7B8C] text-white">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Ready to Start Paying?
        </h2>
        <p className="text-xl text-white/80 mb-10">
          Now that your questions are answered, join thousands of taxpayers using DalPay.
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
   FaqPage (aggregator)
   ──────────────────────────────────────────── */
export default function FaqPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-[#0A0E1A]">
      <Hero />
      <TrustBadges />
      <FaqList />
      <Security />
      <Stats />
      <Testimonials />
      <Cta />
    </main>
  );
}