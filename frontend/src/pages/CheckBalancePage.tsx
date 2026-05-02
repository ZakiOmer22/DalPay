/* ─── src/pages/CheckBalancePage.jsx ─── */
import { Link } from "react-router-dom";
import {
  ShieldCheck, ArrowRight, Smartphone, BadgeCheck,
  Zap, Globe, Play, Star,
  CreditCard, Wallet, ChevronRight,
  Lock, Server, Cpu, Eye, BarChart3, Search, FileText,
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
          Real‑time balance updates – always up to date
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-[1.1]">
          Check Your Tax
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] to-[#3BA7BC]">
            Balance Instantly
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto mb-10">
          View your outstanding tax liabilities, payment history, and upcoming obligations — all in one dashboard.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
          <Link
            to="/register"
            className="group bg-white text-[#0F7B8C] hover:bg-gray-100 font-bold py-4 px-8 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
          >
            Check Your Balance Now
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <button className="border-2 border-white/80 text-white hover:bg-white hover:text-[#0F7B8C] font-bold py-4 px-8 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2">
            <Play size={20} /> How It Works
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
          {[
            { value: "Real‑time", label: "Balance Updates", icon: BarChart3 },
            { value: "All Tax Types", label: "Income, Business, Property", icon: CreditCard },
            { value: "Instant", label: "Liability Overview", icon: Eye },
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
   3. How to Check Balance (step‑by‑step)
   ──────────────────────────────────────────── */
function HowToCheck() {
  const steps = [
    { step: 1, title: "Enter National ID", desc: "Securely link your taxpayer profile with your National ID number.", icon: Search },
    { step: 2, title: "Verify via Mobile", desc: "A confirmation OTP is sent to your registered mobile money account.", icon: Smartphone },
    { step: 3, title: "View Dashboard", desc: "Real‑time balance, outstanding amounts, and payment history in one place.", icon: BarChart3 },
    { step: 4, title: "Download Statement", desc: "Get a PDF of your tax account summary for your records.", icon: FileText },
  ];

  return (
    <section className="py-24 bg-white dark:bg-[#0A0E1A]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 text-[#0F7B8C] dark:text-[#3BA7BC] text-sm font-semibold mb-6">
            Simple Process
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            Check Your Balance in <span className="text-[#0F7B8C]">4 Easy Steps</span>
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
   4. Features (balance‑focused)
   ──────────────────────────────────────────── */
function Features() {
  const items = [
    { icon: BarChart3, title: "Real‑time Balances", desc: "See exactly what you owe as soon as you log in — no delays.", color: "text-[#0F7B8C]" },
    { icon: Eye, title: "Transparent Breakdown", desc: "View principal, penalties, interest, and payment history clearly.", color: "text-amber-500" },
    { icon: FileText, title: "Downloadable Statements", desc: "Export your tax account in PDF or CSV for your own records.", color: "text-green-500" },
    { icon: Lock, title: "Privacy Protected", desc: "Your balance is visible only to you, secured by biometric login.", color: "text-red-500" },
    { icon: Globe, title: "Nationwide Access", desc: "Check your balance from anywhere — Hargeisa to Borama, urban or rural.", color: "text-blue-500" },
    { icon: BadgeCheck, title: "Government Synced", desc: "Reflects official tax records shared with the Ministry of Finance.", color: "text-purple-500" },
  ];

  return (
    <section className="py-24 bg-white dark:bg-[#0A0E1A]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 text-[#0F7B8C] dark:text-[#3BA7BC] text-sm font-semibold mb-6">
            Key Benefits
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            Why Check Balance with <span className="text-[#0F7B8C]">DalPay</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            All the information you need, whenever you need it.
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
   5. Tax Types Overview (balance coverage)
   ──────────────────────────────────────────── */
function TaxTypes() {
  const types = [
    { icon: CreditCard, title: "Income Tax", desc: "Check outstanding income tax liabilities.", link: "/balance?tax=income" },
    { icon: Wallet, title: "Business Tax", desc: "Business tax obligations for your company.", link: "/balance?tax=business" },
    { icon: ShieldCheck, title: "Property Tax", desc: "Property tax assessments and balances.", link: "/balance?tax=property" },
  ];

  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 text-[#0F7B8C] dark:text-[#3BA7BC] text-sm font-semibold mb-6">
            What You Can Check
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
                Check Balance <ArrowRight size={16} />
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
    { q: "How up‑to‑date is my balance?", a: "Your balance is synchronized in real‑time with the Ministry of Finance systems." },
    { q: "Can I see past payments?", a: "Yes. Your payment history is available, including receipts for every transaction." },
    { q: "Is my financial data secure?", a: "Absolutely. Your data is encrypted and only accessible by you using biometric login." },
    { q: "Do I need to enter my National ID every time?", a: "No. Once linked, your balance is accessible with a simple mobile OTP or biometric." },
    { q: "Can I get a printed statement?", a: "Yes, you can download a PDF statement or request an official email copy." },
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
          Your Balance Data is <span className="text-[#0F7B8C]">Safe</span>
        </h2>
        <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
          {[
            { icon: Lock, title: "End‑to‑End Encryption", desc: "All balance queries are encrypted in transit and at rest using AES‑256." },
            { icon: Server, title: "ISO 27001 Certified", desc: "Our infrastructure meets the highest international standards for data protection." },
            { icon: Cpu, title: "Real‑Time Anomaly Detection", desc: "AI‑powered monitoring prevents unauthorized balance lookup attempts." },
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
          { value: "2.5M+", label: "Balance Checks Performed" },
          { value: "100%", label: "Accuracy Rate" },
          { value: "0.3 sec", label: "Average Response Time" },
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
    { name: "Khadra M.", role: "Business Owner, Hargeisa", text: "I can now plan my cash flow effortlessly. The balance dashboard shows me exactly what I owe." },
    { name: "Abdi R.", role: "Teacher, Borama", text: "The downloadable statement feature is a lifesaver for my records. So simple and clear!" },
    { name: "Sahra O.", role: "Freelancer, Burco", text: "I used to guess my tax dues. Now I just log in and everything is there. Peace of mind!" },
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
          Ready to Know Your Tax Dues?
        </h2>
        <p className="text-xl text-white/80 mb-10">
          Join thousands of taxpayers who trust DalPay for transparent, real‑time balance checks.
        </p>
        <Link
          to="/register"
          className="inline-flex items-center gap-3 bg-white text-[#0F7B8C] hover:bg-gray-100 font-bold py-4 px-10 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
        >
          Check Balance Now
          <ArrowRight size={22} />
        </Link>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   CheckBalancePage (aggregator)
   ──────────────────────────────────────────── */
export default function CheckBalancePage() {
  return (
    <main className="min-h-screen bg-white dark:bg-[#0A0E1A]">
      <Hero />
      <TrustBadges />
      <HowToCheck />
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