/* ─── src/pages/DownloadFormsPage.jsx ─── */
import { Link } from "react-router-dom";
import { useState, useMemo } from "react";
import {
  ShieldCheck, ArrowRight, Smartphone,
  Zap, Globe, Play, Star,
  CreditCard, ChevronRight, Lock, Server, Cpu, FileText, Download, Search,
} from "lucide-react";

/* ─────────────────────────────────────────────
   Form data
   ──────────────────────────────────────────── */
interface FormItem {
  title: string;
  category: "Income Tax" | "Business Tax" | "Property Tax" | "Consumption Tax" | "General";
  description: string;
  format: "PDF" | "Excel" | "Word";
  size: string;
  updated: string;
}

const forms: FormItem[] = [
  { title: "Individual Income Tax Return", category: "Income Tax", description: "Annual return for salaried employees and freelancers.", format: "PDF", size: "245 KB", updated: "2026-01-15" },
  { title: "Business Tax Declaration", category: "Business Tax", description: "Quarterly turnover declaration for registered businesses.", format: "Excel", size: "180 KB", updated: "2026-02-01" },
  { title: "Property Tax Assessment Form", category: "Property Tax", description: "Self-assessment for landowners and property owners.", format: "PDF", size: "320 KB", updated: "2026-01-20" },
  { title: "Consumption Tax (VAT) Return", category: "Consumption Tax", description: "Monthly VAT return for importers and traders.", format: "Excel", size: "210 KB", updated: "2026-01-10" },
  { title: "Tax Clearance Certificate Request", category: "General", description: "Application for a tax compliance certificate.", format: "PDF", size: "150 KB", updated: "2026-02-05" },
  { title: "Business Registration for Tax", category: "Business Tax", description: "First-time business registration form.", format: "PDF", size: "275 KB", updated: "2026-01-25" },
  { title: "VAT Exemption Application", category: "Consumption Tax", description: "For goods/services eligible for zero-rating or exemption.", format: "Word", size: "190 KB", updated: "2026-01-12" },
  { title: "Property Tax Payment Plan Request", category: "Property Tax", description: "Installment plan proposal for property tax.", format: "PDF", size: "160 KB", updated: "2026-01-30" },
  { title: "Income Tax Withholding Form", category: "Income Tax", description: "For employers to report employee tax deductions.", format: "Excel", size: "230 KB", updated: "2026-02-10" },
  { title: "Tax Appeal Form", category: "General", description: "File a formal appeal against a tax assessment.", format: "PDF", size: "200 KB", updated: "2026-01-08" },
];

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
          All official forms – free and instant download
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-[1.1]">
          Download Tax
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] to-[#3BA7BC]">
            Forms & Documents
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto mb-10">
          Download official tax forms, returns, and applications directly from the Ministry of Finance – all in one place.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
          <a href="#forms-list" className="group bg-white text-[#0F7B8C] hover:bg-gray-100 font-bold py-4 px-8 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105">
            Browse Forms
            <FileText size={20} />
          </a>
          <Link to="/resources/how-to-pay" className="border-2 border-white/80 text-white hover:bg-white hover:text-[#0F7B8C] font-bold py-4 px-8 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2">
            <Play size={20} /> How to File
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
          {[
            { value: "10+", label: "Downloadable Forms", icon: FileText },
            { value: "5", label: "Categories", icon: CreditCard },
            { value: "PDF/Excel", label: "Multiple Formats", icon: Download },
            { value: "Instant", label: "Free Download", icon: Zap },
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
   3. Forms List with search & filter
   ──────────────────────────────────────────── */
function FormsList() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");

  const filtered = useMemo(() => {
    let result = forms;
    if (categoryFilter !== "All") {
      result = result.filter((f) => f.category === categoryFilter);
    }
    if (search.trim()) {
      result = result.filter((f) =>
        f.title.toLowerCase().includes(search.toLowerCase()) ||
        f.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    return result;
  }, [search, categoryFilter]);

  const categories = ["All", "Income Tax", "Business Tax", "Property Tax", "Consumption Tax", "General"];

  return (
    <section id="forms-list" className="py-24 bg-white dark:bg-[#0A0E1A]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 text-[#0F7B8C] dark:text-[#3BA7BC] text-sm font-semibold mb-4">
            Forms Library
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            All <span className="text-[#0F7B8C]">Tax Forms</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Search or filter by category to find the right form.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-10 max-w-3xl mx-auto">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search forms..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111627] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0F7B8C]"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111627] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0F7B8C]"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Forms grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No forms found. Try a different search.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((form, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-[#111627] border border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:border-[#0F7B8C]/40 hover:shadow-xl transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#0F7B8C]/10 flex items-center justify-center">
                    <FileText size={22} className="text-[#0F7B8C]" />
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#0F7B8C]/10 text-[#0F7B8C] dark:text-[#3BA7BC]">
                    {form.format}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{form.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{form.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
                  <span>{form.size}</span>
                  <span>Updated {form.updated}</span>
                </div>
                <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#0F7B8C] hover:bg-[#3BA7BC] text-white font-semibold rounded-xl transition-all text-sm">
                  <Download size={16} />
                  Download
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   4. FAQ
   ──────────────────────────────────────────── */
function Faq() {
  const faqs = [
    { q: "Are all forms free to download?", a: "Yes, every form is completely free. You can download and print as many copies as you need." },
    { q: "Can I fill forms digitally?", a: "Most Excel and Word forms can be filled on your computer. PDFs may require a PDF editor or can be printed and filled by hand." },
    { q: "How often are forms updated?", a: "Forms are updated as soon as the Ministry of Finance releases new versions. Check the update date on each form." },
    { q: "Do I need to register to download forms?", a: "No, downloads are open to everyone. Registration is only required for making payments." },
    { q: "What if I can't find the form I need?", a: "Contact our support team. We can guide you to the correct document or note the missing form for future addition." },
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
   5. Security Section
   ──────────────────────────────────────────── */
function Security() {
  return (
    <section className="py-24 bg-white dark:bg-[#0A0E1A]">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 text-[#0F7B8C] dark:text-[#3BA7BC] text-sm font-semibold mb-6">
          Enterprise Security
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8">
          Your Downloads are <span className="text-[#0F7B8C]">Secure</span>
        </h2>
        <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
          {[
            { icon: Lock, title: "End‑to‑End Encryption", desc: "All downloads delivered over HTTPS with AES‑256 encryption." },
            { icon: Server, title: "ISO 27001 Certified", desc: "Our infrastructure meets the highest international standards." },
            { icon: Cpu, title: "Virus‑Scanned", desc: "Every file is scanned for malware before being made available." },
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
   6. Stats Section
   ──────────────────────────────────────────── */
function Stats() {
  return (
    <section className="py-24 bg-gradient-to-br from-[#0F7B8C] via-[#0A5D6B] to-[#0F7B8C] text-white">
      <div className="max-w-7xl mx-auto px-6 grid gap-8 md:grid-cols-3 text-center">
        {[
          { value: "200K+", label: "Monthly Downloads" },
          { value: "10+", label: "Form Types" },
          { value: "Free", label: "Forever" },
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
   7. Testimonials
   ──────────────────────────────────────────── */
function Testimonials() {
  const quotes = [
    { name: "Ahmed K.", role: "Accountant, Hargeisa", text: "I download all my client forms here. The library is complete and always up to date." },
    { name: "Sahra N.", role: "Business Owner, Berbera", text: "So easy to find what I need. The search and filter save me hours every quarter." },
    { name: "Ali H.", role: "Property Manager, Borama", text: "The instant download is great. I don't even need to register — just click and print." },
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
   8. CTA
   ──────────────────────────────────────────── */
function Cta() {
  return (
    <section className="py-24 bg-gradient-to-br from-[#0F7B8C] via-[#0A5D6B] to-[#0F7B8C] text-white">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Ready to File Your Taxes?
        </h2>
        <p className="text-xl text-white/80 mb-10">
          Download the right form, fill it out, and pay directly with DalPay — all from your mobile device.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/pay"
            className="inline-flex items-center gap-3 bg-white text-[#0F7B8C] hover:bg-gray-100 font-bold py-4 px-10 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
          >
            Pay Now
            <ArrowRight size={22} />
          </Link>
          <Link
            to="/register"
            className="inline-flex items-center gap-3 border-2 border-white text-white hover:bg-white hover:text-[#0F7B8C] font-bold py-4 px-10 rounded-2xl transition-all duration-300"
          >
            Create Account
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   DownloadFormsPage
   ──────────────────────────────────────────── */
export default function DownloadFormsPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-[#0A0E1A]">
      <Hero />
      <TrustBadges />
      <FormsList />
      <Security />
      <Faq />
      <Stats />
      <Testimonials />
      <Cta />
    </main>
  );
}