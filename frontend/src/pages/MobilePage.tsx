/* ─── src/pages/MobilePage.jsx ─── */
import {
  ShieldCheck, Smartphone, Clock, BadgeCheck,
  Zap, Globe, Star, ChevronRight,
  Lock, Server, Cpu, Download, Apple, PlaySquare, QrCode,
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
          Available for iOS & Android – always with you
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-[1.1]">
          DalPay Mobile
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] to-[#3BA7BC]">
            Pay Taxes on the Go
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto mb-10">
          Download the official DalPay app and settle your taxes anywhere, anytime — with all the security of the web platform.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
          <a href="#" className="group bg-white text-[#0F7B8C] hover:bg-gray-100 font-bold py-4 px-8 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105">
            <Apple size={20} /> App Store
          </a>
          <a href="#" className="border-2 border-white/80 text-white hover:bg-white hover:text-[#0F7B8C] font-bold py-4 px-8 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2">
            <PlaySquare size={20} /> Google Play
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
          {[
            { value: "4.8 ★", label: "App Store Rating", icon: Star },
            { value: "100K+", label: "Downloads", icon: Download },
            { value: "Biometric", label: "Secure Login", icon: ShieldCheck },
            { value: "Offline", label: "Receipt Access", icon: Clock },
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
   3. Phone Mockup + Features
   ──────────────────────────────────────────── */
function AppShowcase() {
  const appFeatures = [
    { icon: Zap, title: "Lightning Fast", desc: "Pay taxes in under 3 minutes — now with fingerprint or face unlock." },
    { icon: ShieldCheck, title: "Secure & Safe", desc: "Bank‑level encryption with biometric authentication." },
    { icon: Globe, title: "Works Everywhere", desc: "2G, 3G, 4G, or WiFi — optimized for all networks." },
    { icon: Download, title: "Offline Receipts", desc: "View recent payment receipts even without an internet connection." },
    { icon: BadgeCheck, title: "Push Notifications", desc: "Never miss a due date — get reminders and payment confirmations." },
    { icon: Clock, title: "24/7 Access", desc: "No downtime, no queues — your tax account always in your pocket." },
  ];

  return (
    <section className="py-24 bg-white dark:bg-[#0A0E1A]">
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

          {/* Features List */}
          <div>
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 text-[#0F7B8C] dark:text-[#3BA7BC] text-sm font-semibold mb-4">
                Why the App
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
                The Full <span className="text-[#0F7B8C]">DalPay Experience</span>
              </h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                Everything you love about the website, optimized for your phone.
              </p>
            </div>
            <div className="grid gap-4">
              {appFeatures.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex gap-3 p-4 bg-gray-50 dark:bg-[#111627] border border-gray-200 dark:border-gray-700 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-[#0F7B8C]/10 flex items-center justify-center shrink-0">
                    <Icon size={20} className="text-[#0F7B8C]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   4. Download Buttons Section
   ──────────────────────────────────────────── */
function DownloadSection() {
  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <div className="w-16 h-16 bg-[#0F7B8C]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Smartphone className="w-8 h-8 text-[#0F7B8C]" />
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Get the <span className="text-[#0F7B8C]">App Today</span>
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-10 max-w-xl mx-auto">
          Available on the App Store and Google Play. Regular updates with new features.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button className="flex items-center justify-center gap-3 bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 py-4 px-8 rounded-2xl transition-all shadow-lg">
            <Apple size={24} />
            <div className="text-left">
              <div className="text-xs">Download on the</div>
              <div className="font-semibold">App Store</div>
            </div>
          </button>

          <button className="flex items-center justify-center gap-3 bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 py-4 px-8 rounded-2xl transition-all shadow-lg">
            <PlaySquare size={24} />
            <div className="text-left">
              <div className="text-xs">Get it on</div>
              <div className="font-semibold">Google Play</div>
            </div>
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <QrCode size={18} className="text-[#0F7B8C]" />
          Scan QR code to download
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   5. FAQ
   ──────────────────────────────────────────── */
function Faq() {
  const faqs = [
    { q: "Is the app free?", a: "Yes, the DalPay app is completely free on both iOS and Android." },
    { q: "Can I do everything from the app?", a: "Absolutely — pay, check balance, view history, download receipts, and more." },
    { q: "Does it work on older phones?", a: "The app is optimized for Android 8+ and iOS 14+. The web version works on any device." },
    { q: "Is biometric login safe?", a: "Yes. Your fingerprint or face data never leaves your device; it only unlocks the app locally." },
  ];

  return (
    <section className="py-24 bg-white dark:bg-[#0A0E1A]">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 text-[#0F7B8C] dark:text-[#3BA7BC] text-sm font-semibold mb-6">App FAQ</div>
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
   6. Security Section
   ──────────────────────────────────────────── */
function Security() {
  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 text-[#0F7B8C] dark:text-[#3BA7BC] text-sm font-semibold mb-6">Enterprise Security</div>
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8">
          Your Mobile Data is <span className="text-[#0F7B8C]">Safe</span>
        </h2>
        <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
          {[
            { icon: Lock, title: "End‑to‑End Encryption", desc: "All data encrypted in transit and at rest, same as the web platform." },
            { icon: Server, title: "ISO 27001 Certified", desc: "Infrastructure meets the highest security standards." },
            { icon: Cpu, title: "Tamper‑Proof", desc: "The app detects jailbroken/rooted devices and warns users." },
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
          { value: "100K+", label: "App Downloads" },
          { value: "4.8 ★", label: "Average Rating" },
          { value: "50%", label: "of Users on Mobile" },
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
    { name: "Ahmed K.", role: "Business Owner, Hargeisa", text: "The app is so smooth. I paid my business tax while waiting in line for coffee." },
    { name: "Hodan M.", role: "Teacher, Borama", text: "I love the offline receipts. I can show proof to my accountant even without internet." },
    { name: "Sahra N.", role: "Freelancer, Berbera", text: "Biometric login makes it so easy — no passwords, just my fingerprint." },
  ];

  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 text-[#0F7B8C] dark:text-[#3BA7BC] text-sm font-semibold mb-6">Testimonials</div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            What <span className="text-[#0F7B8C]">App Users</span> Say
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
          Download the App Now
        </h2>
        <p className="text-xl text-white/80 mb-10">
          Join 100K+ users who already pay taxes with DalPay on their phones.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="inline-flex items-center gap-3 bg-white text-[#0F7B8C] hover:bg-gray-100 font-bold py-4 px-10 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105">
            <Apple size={20} /> App Store
          </button>
          <button className="inline-flex items-center gap-3 border-2 border-white text-white hover:bg-white hover:text-[#0F7B8C] font-bold py-4 px-10 rounded-2xl transition-all duration-300">
            <PlaySquare size={20} /> Google Play
          </button>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   MobilePage (aggregator)
   ──────────────────────────────────────────── */
export default function MobilePage() {
  return (
    <main className="min-h-screen bg-white dark:bg-[#0A0E1A]">
      <Hero />
      <TrustBadges />
      <AppShowcase />
      <DownloadSection />
      <Faq />
      <Security />
      <Stats />
      <Testimonials />
      <Cta />
    </main>
  );
}