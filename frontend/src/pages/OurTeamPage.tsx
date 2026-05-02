/* ─── src/pages/OurTeamPage.jsx ─── */
import { Link } from "react-router-dom";
import {
  ShieldCheck, ArrowRight, Smartphone, Clock,
  Zap, Globe, Star, ChevronRight,
  Lock, Server, Cpu, Users, Heart, Target,
} from "lucide-react";
import {
  Code, Database, Palette, FileText, BookOpen, ClipboardCheck,
} from "lucide-react"; // icons for team members

/* ─────────────────────────────────────────────
   Team Data (as provided)
   ──────────────────────────────────────────── */
const team = [
  {
    name: "Zacki A. Omer",
    role: "Lead Developer & System Architect",
    description:
      "Owns the entire system direction and critical backend logic. Defines system architecture, API contracts, and development standards.",
    icon: Code,
  },
  {
    name: "Abdulkadir I. Abdi",
    role: "Backend & Database Engineer",
    description:
      "Designs and manages the database, writes optimized queries, leads system testing, and ensures project quality assurance.",
    icon: Database,
  },
  {
    name: "Abdulmajid A. Ahmed",
    role: "Frontend Lead Developer",
    description:
      "Builds the complete user interface – Citizen Dashboard, Admin Dashboard, and all UI components.",
    icon: Palette,
  },
  {
    name: "Arafat Osman Aden",
    role: "Documentation Lead",
    description:
      "Writes the entire proposal letter, ensures it meets university standards, and coordinates the writing team.",
    icon: FileText,
  },
  {
    name: "Abdiqadir Ismacil",
    role: "Methodology & System Design Writer",
    description:
      "Owns the methodology chapter and system design documentation, ensuring academic rigour and clarity.",
    icon: BookOpen,
  },
  {
    name: "Abdiraxem Khadar",
    role: "Testing, Evaluation & Results Writer",
    description:
      "Writes testing methodology, evaluation criteria, and the results analysis chapter.",
    icon: ClipboardCheck,
  },
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
          Passionate team building the future of tax payments
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-[1.1]">
          Our Team
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] to-[#3BA7BC]">
            The Builders Behind DalPay
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto mb-10">
          A cross‑functional group of developers, designers, and writers dedicated to making tax payment simple, secure, and accessible.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
          <a href="#team-grid" className="group bg-white text-[#0F7B8C] hover:bg-gray-100 font-bold py-4 px-8 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105">
            Meet the Team
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </a>
          <Link to="/register" className="border-2 border-white/80 text-white hover:bg-white hover:text-[#0F7B8C] font-bold py-4 px-8 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2">
            Join DalPay
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
          {[
            { value: "6", label: "Core Members", icon: Users },
            { value: "4+", label: "Months of Work", icon: Clock },
            { value: "100%", label: "Passion", icon: Heart },
            { value: "1 Goal", label: "Better Taxation", icon: Target },
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
   3. Team Grid
   ──────────────────────────────────────────── */
function TeamGrid() {
  return (
    <section id="team-grid" className="py-24 bg-white dark:bg-[#0A0E1A]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="w-16 h-16 bg-[#0F7B8C]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-[#0F7B8C]" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            Meet the <span className="text-[#0F7B8C]">DalPay Team</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Every great platform starts with a great team. Here's ours.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {team.map((member, idx) => (
            <div
              key={idx}
              className="bg-gray-50 dark:bg-[#111627] border border-gray-200 dark:border-gray-700 rounded-2xl p-7 hover:border-[#0F7B8C]/40 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-2xl bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 flex items-center justify-center shrink-0 group-hover:bg-[#0F7B8C] group-hover:border-[#0F7B8C] transition-all">
                  <member.icon size={26} className="text-[#0F7B8C] group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{member.name}</h3>
                  <p className="text-sm font-semibold text-[#0F7B8C] dark:text-[#3BA7BC]">{member.role}</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{member.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   4. How We Work (Values / Process)
   ──────────────────────────────────────────── */
function HowWeWork() {
  const values = [
    { icon: Code, title: "Clean Architecture", desc: "System built on modern, scalable technologies." },
    { icon: ShieldCheck, title: "Security First", desc: "Every feature designed with end‑to‑end encryption." },
    { icon: Users, title: "User Focused", desc: "Continuous feedback from real taxpayers shapes our work." },
    { icon: Zap, title: "Agile & Fast", desc: "Rapid iterations and weekly improvements." },
  ];

  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 text-[#0F7B8C] dark:text-[#3BA7BC] text-sm font-semibold mb-6">Our Approach</div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            How We <span className="text-[#0F7B8C]">Build</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Principles that guide every line of code and document.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {values.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white dark:bg-[#111627] border border-gray-200 dark:border-gray-700 rounded-2xl p-6 text-center hover:-translate-y-1 transition-transform">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[#0F7B8C]/10 flex items-center justify-center mb-4">
                <Icon size={26} className="text-[#0F7B8C]" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   5. FAQ (optional)
   ──────────────────────────────────────────── */
function Faq() {
  const faqs = [
    { q: "Is the whole team from Somaliland?", a: "Yes, the entire development and writing team is based in Somaliland, working closely with the Ministry of Finance." },
    { q: "How long did the project take?", a: "The core system was built in 4 months of intensive development, with continuous updates since then." },
    { q: "Can others contribute to DalPay?", a: "DalPay is a government project, but we welcome collaboration – contact us for details." },
    { q: "What technology stack did you use?", a: "React, TypeScript, Node.js, PostgreSQL (Neon), and Stripe Connect, among others." },
  ];

  return (
    <section className="py-24 bg-white dark:bg-[#0A0E1A]">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 text-[#0F7B8C] dark:text-[#3BA7BC] text-sm font-semibold mb-6">FAQ</div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            Commonly Asked <span className="text-[#0F7B8C]">Questions</span>
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
   6. Security Section
   ──────────────────────────────────────────── */
function Security() {
  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 text-[#0F7B8C] dark:text-[#3BA7BC] text-sm font-semibold mb-6">Secure Foundations</div>
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8">
          Built on <span className="text-[#0F7B8C]">Trust</span>
        </h2>
        <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
          {[
            { icon: Lock, title: "End‑to‑End Encryption", desc: "All data encrypted with AES‑256 in transit and at rest." },
            { icon: Server, title: "ISO 27001 Certified", desc: "Infrastructure meets highest international standards." },
            { icon: Cpu, title: "Continuous Monitoring", desc: "AI‑powered threat detection 24/7." },
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
   7. Stats Section
   ──────────────────────────────────────────── */
function Stats() {
  return (
    <section className="py-24 bg-gradient-to-br from-[#0F7B8C] via-[#0A5D6B] to-[#0F7B8C] text-white">
      <div className="max-w-7xl mx-auto px-6 grid gap-8 md:grid-cols-3 text-center">
        {[
          { value: "6", label: "Team Members" },
          { value: "50K+", label: "Lives Impacted" },
          { value: "4 Months", label: "Development Time" },
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
   8. Testimonials
   ──────────────────────────────────────────── */
function Testimonials() {
  const quotes = [
    { name: "Ahmed H.", role: "Business Owner", text: "The team behind DalPay delivered a game‑changing platform. It's reliable and incredibly fast." },
    { name: "Sahra M.", role: "Teacher", text: "I appreciate the thoughtful design. Every detail shows the team really cares about taxpayers." },
    { name: "Ali G.", role: "Accountant", text: "Working with the DalPay team has been a pleasure. They are responsive and constantly improving the system." },
  ];

  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 text-[#0F7B8C] dark:text-[#3BA7BC] text-sm font-semibold mb-6">Praise</div>
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
   9. CTA
   ──────────────────────────────────────────── */
function Cta() {
  return (
    <section className="py-24 bg-gradient-to-br from-[#0F7B8C] via-[#0A5D6B] to-[#0F7B8C] text-white">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Be Part of the Story
        </h2>
        <p className="text-xl text-white/80 mb-10">
          Join DalPay and experience the product built by this dedicated team.
        </p>
        <Link
          to="/register"
          className="inline-flex items-center gap-3 bg-white text-[#0F7B8C] hover:bg-gray-100 font-bold py-4 px-10 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
        >
          Get Started Free
          <ArrowRight size={22} />
        </Link>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   OurTeamPage
   ──────────────────────────────────────────── */
export default function OurTeamPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-[#0A0E1A]">
      <Hero />
      <TrustBadges />
      <TeamGrid />
      <HowWeWork />
      <Faq />
      <Security />
      <Stats />
      <Testimonials />
      <Cta />
    </main>
  );
}