/* ─── src/pages/AboutPage.tsx (extended) ─── */
import { Link } from "react-router-dom";
import {
  ShieldCheck, ArrowRight, Clock, BadgeCheck,
  Zap, Globe, Play, Star,
  CreditCard,
  Lock, Server, Users, Target, Eye, Heart,
  Building2, Code, Smartphone as SmartphoneIcon, Cloud, Wallet, BarChart3, FileText, Award as AwardIcon,
  MapPin, Phone, ExternalLink,
} from "lucide-react";

/* ─────────────────────────────────────────────
   1. Hero (unchanged)
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
          Official digital tax platform – built for Somaliland
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-[1.1]">
          About DalPay
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] to-[#3BA7BC]">
            Digital Tax, Simplified
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto mb-10">
          DalPay is the official tax platform of the Republic of Somaliland, built to make tax payments fast, transparent, and accessible to every citizen.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
          <Link
            to="/register"
            className="group bg-white text-[#0F7B8C] hover:bg-gray-100 font-bold py-4 px-8 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
          >
            Join DalPay
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <a href="#mission" className="border-2 border-white/80 text-white hover:bg-white hover:text-[#0F7B8C] font-bold py-4 px-8 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2">
            <Play size={20} /> Our Mission
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
          {[
            { value: "50K+", label: "Active Users", icon: Users },
            { value: "1.2M+", label: "Transactions", icon: CreditCard },
            { value: "6 Regions", label: "Nationwide", icon: Globe },
            { value: "99.9%", label: "Uptime", icon: Server },
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
   2. Trust Badges (unchanged)
   ──────────────────────────────────────────── */
function TrustBadges() {
  return (
    <section className="py-12 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center gap-10 items-center">
        <div className="flex items-center gap-3 text-sm font-semibold text-gray-600 dark:text-gray-400">
          <ShieldCheck className="text-[#0F7B8C]" size={22} /> Government Certified
        </div>
        <div className="flex items-center gap-3 text-sm font-semibold text-gray-600 dark:text-gray-400">
          <BadgeCheck className="text-[#0F7B8C]" size={22} /> Ministry of Finance
        </div>
        <div className="flex items-center gap-3 text-sm font-semibold text-gray-600 dark:text-gray-400">
          <Lock className="text-[#0F7B8C]" size={22} /> PCI-DSS Level 1
        </div>
        <div className="flex items-center gap-3 text-sm font-semibold text-gray-600 dark:text-gray-400">
          <AwardIcon className="text-[#0F7B8C]" size={22} /> ISO 27001 Certified
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   3. Mission & Vision (unchanged)
   ──────────────────────────────────────────── */
function MissionVision() {
  return (
    <section id="mission" className="py-24 bg-white dark:bg-[#0A0E1A]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12">
          <div className="bg-gray-50 dark:bg-[#111627] border border-gray-200 dark:border-gray-700 rounded-2xl p-8">
            <div className="w-14 h-14 rounded-2xl bg-[#0F7B8C]/10 flex items-center justify-center mb-6">
              <Target size={28} className="text-[#0F7B8C]" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Our Mission</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              To provide every citizen and business in Somaliland with a fast, secure, and transparent digital tax payment system, eliminating cash, queues, and complexity.
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-[#111627] border border-gray-200 dark:border-gray-700 rounded-2xl p-8">
            <div className="w-14 h-14 rounded-2xl bg-[#10B981]/10 flex items-center justify-center mb-6">
              <Eye size={28} className="text-[#10B981]" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Our Vision</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              To become the backbone of Somaliland's digital economy, where paying taxes is as simple as sending a mobile money top-up.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   4. Our Story / Timeline (unchanged)
   ──────────────────────────────────────────── */
function StoryTimeline() {
  const milestones = [
    { year: "2023", event: "DalPay concept born – Ministry of Finance partners with local developers." },
    { year: "2024", event: "Pilot launched in Hargeisa with Zaad and eDahab integration." },
    { year: "2025", event: "Nationwide rollout; Nomad and Hormuud added; 50K+ users onboard." },
    { year: "2026", event: "Consumption tax, multi-language, and mobile apps released." },
  ];

  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 text-[#0F7B8C] dark:text-[#3BA7BC] text-sm font-semibold mb-6">Our Journey</div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            From <span className="text-[#0F7B8C]">Idea to Reality</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">How DalPay grew into the official tax hub of Somaliland.</p>
        </div>

        <div className="relative">
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#0F7B8C]/50 via-gray-200 dark:via-gray-700 to-[#0F7B8C]/50" />
          <div className="space-y-12">
            {milestones.map((m, idx) => (
              <div key={idx} className="relative flex flex-col md:flex-row items-center gap-8">
                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-[#0F7B8C] text-white font-bold items-center justify-center z-10 shadow-lg text-sm">{m.year}</div>
                <div className={`w-full md:w-[calc(50%-40px)] ${idx % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12 md:text-left"}`}>
                  <div className="bg-white dark:bg-[#111627] border border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:shadow-lg transition-all">
                    <p className="text-gray-600 dark:text-gray-400">{m.event}</p>
                  </div>
                </div>
                <div className="hidden md:block w-[calc(50%-40px)]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   5. Services Overview (NEW)
   ──────────────────────────────────────────── */
function Services() {
  const services = [
    { icon: CreditCard, title: "Tax Payment", desc: "Pay income, business, property, and consumption tax in 3 minutes via mobile money." },
    { icon: BarChart3, title: "Balance Check", desc: "View outstanding liabilities, payment history, and download statements." },
    { icon: FileText, title: "Tax Calculator", desc: "Estimate your tax before you pay with official rates." },
    { icon: Wallet, title: "Payment History", desc: "Full, searchable record of all your payments with instant receipts." },
  ];

  return (
    <section className="py-24 bg-white dark:bg-[#0A0E1A]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 text-[#0F7B8C] dark:text-[#3BA7BC] text-sm font-semibold mb-6">What We Offer</div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            Services <span className="text-[#0F7B8C]">We Provide</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Everything you need for digital tax management.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {services.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-gray-50 dark:bg-[#111627] border border-gray-200 dark:border-gray-700 rounded-2xl p-6 text-center hover:-translate-y-1 transition-transform">
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
   6. Team (unchanged)
   ──────────────────────────────────────────── */
function Team() {
  const members = [
    { name: "Ahmed H.", role: "CEO & Founder", desc: "Former IT Director at Ministry of Finance. 15+ years in public sector digital transformation." },
    { name: "Hodan S.", role: "CTO", desc: "Software architect with expertise in payment systems and cloud infrastructure." },
    { name: "Mahad A.", role: "Head of Product", desc: "Product leader focused on user experience and financial inclusion." },
    { name: "Sahra G.", role: "Head of Compliance", desc: "Tax law expert ensuring DalPay meets all regulatory standards." },
  ];

  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="w-16 h-16 bg-[#0F7B8C]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-[#0F7B8C]" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            Meet Our <span className="text-[#0F7B8C]">Leadership</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">A dedicated team committed to transforming tax payments.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {members.map((m, i) => (
            <div key={i} className="bg-white dark:bg-[#111627] border border-gray-200 dark:border-gray-700 rounded-2xl p-6 text-center hover:-translate-y-1 transition-transform">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[#0F7B8C] to-[#10B981] flex items-center justify-center text-white font-bold text-2xl mb-4">
                {m.name.split(" ").map(n => n[0]).join("")}
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{m.name}</h3>
              <p className="text-[#0F7B8C] dark:text-[#3BA7BC] font-semibold mb-3">{m.role}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   7. Values (unchanged)
   ──────────────────────────────────────────── */
function Values() {
  const values = [
    { icon: ShieldCheck, title: "Integrity", desc: "We handle every transaction with the highest ethical standards." },
    { icon: Heart, title: "Citizen First", desc: "Every feature is designed with the taxpayer's convenience in mind." },
    { icon: Zap, title: "Innovation", desc: "Continuous improvement using modern tech to simplify government services." },
    { icon: Globe, title: "Inclusion", desc: "Accessible from any device, any network, anywhere in Somaliland." },
    { icon: Clock, title: "Efficiency", desc: "Average payment time of 3 minutes — down from hours." },
    { icon: Lock, title: "Security", desc: "Bank‑level encryption protects every piece of your data." },
  ];

  return (
    <section className="py-24 bg-white dark:bg-[#0A0E1A]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 text-[#0F7B8C] dark:text-[#3BA7BC] text-sm font-semibold mb-6">Core Values</div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            What <span className="text-[#0F7B8C]">Drives Us</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">The principles that guide every decision at DalPay.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {values.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-gray-50 dark:bg-[#111627] border border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:border-[#0F7B8C]/30 hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#0F7B8C]/10 flex items-center justify-center mb-4">
                <Icon size={22} className="text-[#0F7B8C]" />
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
   8. Technology Stack (NEW)
   ──────────────────────────────────────────── */
function Technology() {
  const techs = [
    { name: "React & TypeScript", icon: Code, desc: "Frontend" },
    { name: "Node.js & Hono", icon: Server, desc: "Backend API" },
    { name: "PostgreSQL + Neon", icon: Cloud, desc: "Database" },
    { name: "Mobile Money APIs", icon: SmartphoneIcon, desc: "Payment Integration" },
    { name: "Stripe Connect", icon: CreditCard, desc: "Card payments" },
    { name: "Docker & Vercel", icon: Cloud, desc: "Deployment" },
  ];

  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 text-[#0F7B8C] dark:text-[#3BA7BC] text-sm font-semibold mb-6">Tech Stack</div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            Powered by <span className="text-[#0F7B8C]">Modern Technology</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Built with world-class tools for reliability and security.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {techs.map(({ name, icon: Icon, desc }) => (
            <div key={name} className="group text-center">
              <div className="w-16 h-16 mx-auto bg-white dark:bg-[#111627] border border-gray-200 dark:border-gray-700 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm">
                <Icon size={24} className="text-[#0F7B8C]" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   9. Partners (NEW)
   ──────────────────────────────────────────── */
function Partners() {
  const partners = [
    { name: "Zaad", color: "from-blue-500 to-blue-600" },
    { name: "eDahab", color: "from-green-500 to-green-600" },
    { name: "Nomad", color: "from-purple-500 to-purple-600" },
    { name: "Hormuud", color: "from-orange-500 to-orange-600" },
    { name: "Ministry of Finance", icon: Building2, color: "from-gray-600 to-gray-700" },
    { name: "CERT Somalia", icon: ShieldCheck, color: "from-red-500 to-red-600" },
  ];

  return (
    <section className="py-24 bg-white dark:bg-[#0A0E1A]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="w-16 h-16 bg-[#0F7B8C]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-[#0F7B8C]" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            <span className="text-[#0F7B8C]">Partners</span> & Integrations
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Working together to deliver seamless tax services.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {partners.map((p, idx) => (
            <div key={idx} className="group text-center">
              <div className={`w-16 h-16 mx-auto bg-gradient-to-r ${p.color} rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg`}>
                {p.icon ? <p.icon size={22} className="text-white" /> : <span className="text-white font-bold text-xl">{p.name.charAt(0)}</span>}
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{p.name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Partner</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   10. Awards & Recognition (NEW)
   ──────────────────────────────────────────── */
function Awards() {
  const awards = [
    { title: "Best Digital Government Service 2025", org: "Somaliland Tech Summit" },
    { title: "Innovation in Public Finance 2026", org: "African Fintech Forum" },
    { title: "Top 10 Startups to Watch", org: "Digital Somalia Magazine" },
    { title: "Excellence in Mobile Payments", org: "GSMA Mobile Money Awards" },
  ];

  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="w-16 h-16 bg-[#0F7B8C]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AwardIcon className="w-8 h-8 text-[#0F7B8C]" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            Awards & <span className="text-[#0F7B8C]">Recognition</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Celebrated for innovation and impact.</p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {awards.map((a, i) => (
            <div key={i} className="bg-white dark:bg-[#111627] border border-gray-200 dark:border-gray-700 rounded-2xl p-6 text-center hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#0F7B8C]/10 flex items-center justify-center mb-4">
                <AwardIcon size={22} className="text-[#0F7B8C]" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">{a.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{a.org}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   11. Office Locations (NEW)
   ──────────────────────────────────────────── */
function Locations() {
  const offices = [
    { city: "Hargeisa", address: "Ministry of Finance, Hargeisa, Somaliland", phone: "+252 63 444 5555" },
    { city: "Burao", address: "Regional Tax Office, Burao, Togdheer", phone: "+252 63 555 6666" },
    { city: "Borama", address: "Awdal Tax Center, Borama", phone: "+252 63 666 7777" },
    { city: "Berbera", address: "Port Customs Office, Berbera", phone: "+252 63 777 8888" },
  ];

  return (
    <section className="py-24 bg-white dark:bg-[#0A0E1A]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="w-16 h-16 bg-[#0F7B8C]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-[#0F7B8C]" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            Our <span className="text-[#0F7B8C]">Offices</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Visit us at any of our regional offices.</p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {offices.map((o, i) => (
            <div key={i} className="bg-gray-50 dark:bg-[#111627] border border-gray-200 dark:border-gray-700 rounded-2xl p-6 text-center">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{o.city}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{o.address}</p>
              <p className="text-sm text-[#0F7B8C] dark:text-[#3BA7BC] flex items-center justify-center gap-1">
                <Phone size={14} /> {o.phone}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   12. Media & Press (NEW)
   ──────────────────────────────────────────── */
function Press() {
  const articles = [
    { outlet: "Somaliland National TV", quote: "DalPay is revolutionizing tax collection – a true digital success story." },
    { outlet: "Horn Business Journal", quote: "50,000 users in 2 years. How DalPay became Somaliland's favorite tax tool." },
    { outlet: "Digital Africa News", quote: "A model for other African nations: mobile money meets government services." },
    { outlet: "Finance Today Magazine", quote: "DalPay's uptime and security are unmatched – 99.9% availability." },
  ];

  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 text-[#0F7B8C] dark:text-[#3BA7BC] text-sm font-semibold mb-6">In the News</div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            Media & <span className="text-[#0F7B8C]">Press</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">What others are saying about DalPay.</p>
        </div>
        <div className="grid gap-8 md:grid-cols-2">
          {articles.map((a, i) => (
            <div key={i} className="bg-white dark:bg-[#111627] border border-gray-200 dark:border-gray-700 rounded-2xl p-6 flex gap-4 items-start">
              <ExternalLink size={20} className="text-[#0F7B8C] shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{a.outlet}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 italic">“{a.quote}”</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   13. Future Roadmap (NEW)
   ──────────────────────────────────────────── */
function Roadmap() {
  const items = [
    { quarter: "Q2 2026", item: "Mobile app for Android & iOS with offline mode." },
    { quarter: "Q3 2026", item: "AI-powered tax assistant chatbot." },
    { quarter: "Q4 2026", item: "Corporate bulk payment for large businesses." },
    { quarter: "Q1 2027", item: "Integration with more mobile operators and banks." },
  ];

  return (
    <section className="py-24 bg-white dark:bg-[#0A0E1A]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 text-[#0F7B8C] dark:text-[#3BA7BC] text-sm font-semibold mb-6">Coming Next</div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            Future <span className="text-[#0F7B8C]">Roadmap</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">What we're building next for you.</p>
        </div>
        <div className="max-w-3xl mx-auto space-y-4">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-4 p-5 bg-gray-50 dark:bg-[#111627] border border-gray-200 dark:border-gray-700 rounded-2xl">
              <div className="w-12 h-12 rounded-full bg-[#0F7B8C]/10 flex items-center justify-center shrink-0">
                <span className="font-bold text-[#0F7B8C]">{item.quarter.split(" ")[0]}</span>
              </div>
              <div>
                <span className="text-xs text-[#0F7B8C] dark:text-[#3BA7BC] font-semibold">{item.quarter}</span>
                <p className="text-gray-600 dark:text-gray-400">{item.item}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   14. Stats (impact) – reusing from before but placed after new sections
   ──────────────────────────────────────────── */
function Stats() {
  return (
    <section className="py-24 bg-gradient-to-br from-[#0F7B8C] via-[#0A5D6B] to-[#0F7B8C] text-white">
      <div className="max-w-7xl mx-auto px-6 grid gap-8 md:grid-cols-3 text-center">
        {[
          { value: "50K+", label: "Registered Taxpayers" },
          { value: "1.2M+", label: "Successful Payments" },
          { value: "40%", label: "Compliance Increase" },
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
   15. Testimonials (unchanged)
   ──────────────────────────────────────────── */
function Testimonials() {
  const quotes = [
    { name: "Ahmed H.", role: "Business Owner, Hargeisa", text: "DalPay transformed how I handle taxes. It's fast, reliable, and I get my receipts instantly." },
    { name: "Hodan A.", role: "Teacher, Borama", text: "As a teacher, I appreciate the simplicity. No more hours lost at the tax office." },
    { name: "Mahad I.", role: "Freelancer, Burco", text: "Finally a government service that actually works. Proud to be a DalPay user." },
  ];

  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 text-[#0F7B8C] dark:text-[#3BA7BC] text-sm font-semibold mb-6">Testimonials</div>
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
   16. CTA (unchanged)
   ──────────────────────────────────────────── */
function Cta() {
  return (
    <section className="py-24 bg-gradient-to-br from-[#0F7B8C] via-[#0A5D6B] to-[#0F7B8C] text-white">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Join the Digital Tax Revolution
        </h2>
        <p className="text-xl text-white/80 mb-10">
          Become one of 50,000+ taxpayers enjoying fast, secure, and transparent tax payments.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/register"
            className="inline-flex items-center gap-3 bg-white text-[#0F7B8C] hover:bg-gray-100 font-bold py-4 px-10 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
          >
            Get Started Free
            <ArrowRight size={22} />
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center gap-3 border-2 border-white text-white hover:bg-white hover:text-[#0F7B8C] font-bold py-4 px-10 rounded-2xl transition-all duration-300"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   AboutPage (extended aggregator)
   ──────────────────────────────────────────── */
export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-[#0A0E1A]">
      <Hero />
      <TrustBadges />
      <MissionVision />
      <StoryTimeline />
      <Services />
      <Team />
      <Values />
      <Technology />
      <Partners />
      <Awards />
      <Locations />
      <Press />
      <Roadmap />
      <Stats />
      <Testimonials />
      <Cta />
    </main>
  );
}