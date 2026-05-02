/* ─── src/pages/ContactPage.jsx ─── */
import { Link } from "react-router-dom";
import { useState } from "react";
import {
  ShieldCheck, ArrowRight, Smartphone, Clock,
  Zap, Globe, ChevronRight,
  Lock, Server, Cpu, MapPin, Phone, Mail, MessageCircle,
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
          We're here to help – reach out any time
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-[1.1]">
          Contact DalPay
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] to-[#3BA7BC]">
            We’d Love to Hear from You
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto mb-10">
          Whether you have questions, feedback, or need support — our team is ready to assist.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
          <a href="#contact-form" className="group bg-white text-[#0F7B8C] hover:bg-gray-100 font-bold py-4 px-8 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105">
            Send a Message
            <Mail size={20} />
          </a>
          <a href="#contact-info" className="border-2 border-white/80 text-white hover:bg-white hover:text-[#0F7B8C] font-bold py-4 px-8 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2">
            <Phone size={20} /> Call Us
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
          {[
            { value: "24/7", label: "Support Availability", icon: Clock },
            { value: "5 min", label: "Average Response Time", icon: Zap },
            { value: "Somali & English", label: "Languages", icon: Globe },
            { value: "Live Chat", label: "Preferred Channel", icon: MessageCircle },
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
   3. Contact Form + Info Side by Side
   ──────────────────────────────────────────── */
function ContactFormSection() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder – replace with real API
    alert("Message sent! (demo)");
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <section id="contact-form" className="py-24 bg-white dark:bg-[#0A0E1A]">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12">
        {/* Form */}
        <div>
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 text-[#0F7B8C] dark:text-[#3BA7BC] text-sm font-semibold mb-4">
              Get in Touch
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
              Send Us a <span className="text-[#0F7B8C]">Message</span>
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              Fill out the form and we’ll respond within an hour during business days.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111627] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0F7B8C]"
                placeholder="Ahmed Ali"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111627] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0F7B8C]"
                placeholder="ahmed@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Subject</label>
              <select
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111627] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0F7B8C]"
              >
                <option value="">Select a topic</option>
                <option>Payment Issue</option>
                <option>Account Help</option>
                <option>Tax Rates Question</option>
                <option>General Inquiry</option>
                <option>Feedback</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Message</label>
              <textarea
                required
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111627] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0F7B8C]"
                placeholder="How can we help you?"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-[#0F7B8C] hover:bg-[#3BA7BC] text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl"
            >
              Send Message
              <ArrowRight size={18} />
            </button>
          </form>
        </div>

        {/* Contact Info Panel */}
        <div id="contact-info" className="lg:pl-8">
          <div className="bg-gray-50 dark:bg-[#111627] border border-gray-200 dark:border-gray-700 rounded-2xl p-8 sticky top-24">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Contact Information</h3>

            <div className="space-y-5">
              <div className="flex gap-3">
                <MapPin size={20} className="text-[#0F7B8C] shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Head Office</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Ministry of Finance, <br />Hargeisa, Somaliland</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Phone size={20} className="text-[#0F7B8C] shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Phone</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">+252 63 444 5555</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Mail size={20} className="text-[#0F7B8C] shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Email</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">support@dalpay.gov.so</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Clock size={20} className="text-[#0F7B8C] shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Working Hours</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Sunday – Thursday<br />8:00 AM – 4:00 PM (EAT)</p>
                </div>
              </div>
            </div>

            {/* Quick links */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Quick Links</h4>
              <div className="flex flex-col gap-2">
                <Link to="/faq" className="text-sm text-[#0F7B8C] dark:text-[#3BA7BC] hover:underline">Frequently Asked Questions</Link>
                <Link to="/resources/how-to-pay" className="text-sm text-[#0F7B8C] dark:text-[#3BA7BC] hover:underline">How to Pay Guide</Link>
                <Link to="/resources/tax-rates" className="text-sm text-[#0F7B8C] dark:text-[#3BA7BC] hover:underline">Tax Rates</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   4. FAQ (brief)
   ──────────────────────────────────────────── */
function Faq() {
  const faqs = [
    { q: "How quickly will I receive a reply?", a: "We aim to respond within 1 hour during business days, and within 24 hours on weekends." },
    { q: "Can I visit the office in person?", a: "Yes, our head office is at the Ministry of Finance in Hargeisa. We recommend calling ahead for an appointment." },
    { q: "What if I have a payment emergency?", a: "Call our support hotline for immediate assistance. We can trace payments and resolve issues in real time." },
    { q: "Is my personal information safe when I contact you?", a: "Absolutely. All communications are encrypted and handled according to our privacy policy." },
  ];

  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 text-[#0F7B8C] dark:text-[#3BA7BC] text-sm font-semibold mb-6">Quick Help</div>
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
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 text-[#0F7B8C] dark:text-[#3BA7BC] text-sm font-semibold mb-6">Enterprise Security</div>
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8">
          Your Privacy is <span className="text-[#0F7B8C]">Protected</span>
        </h2>
        <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
          {[
            { icon: Lock, title: "End‑to‑End Encryption", desc: "All messages and data encrypted with AES‑256." },
            { icon: Server, title: "ISO 27001 Certified", desc: "Infrastructure meets highest security standards." },
            { icon: Cpu, title: "Fraud Detection", desc: "AI monitors for suspicious contact attempts." },
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
          { value: "98%", label: "Satisfaction Rate" },
          { value: "15K+", label: "Monthly Tickets Resolved" },
          { value: "5 min", label: "Average First Reply" },
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
   7. CTA
   ──────────────────────────────────────────── */
function Cta() {
  return (
    <section className="py-24 bg-gradient-to-br from-[#0F7B8C] via-[#0A5D6B] to-[#0F7B8C] text-white">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Still Need Help?
        </h2>
        <p className="text-xl text-white/80 mb-10">
          Our support team is standing by. Start a live chat or give us a call.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="inline-flex items-center gap-3 bg-white text-[#0F7B8C] hover:bg-gray-100 font-bold py-4 px-10 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105">
            <MessageCircle size={20} /> Start Live Chat
          </button>
          <a href="tel:+252634445555" className="inline-flex items-center gap-3 border-2 border-white text-white hover:bg-white hover:text-[#0F7B8C] font-bold py-4 px-10 rounded-2xl transition-all duration-300">
            <Phone size={20} /> Call Now
          </a>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   ContactPage (aggregator)
   ──────────────────────────────────────────── */
export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-[#0A0E1A]">
      <Hero />
      <TrustBadges />
      <ContactFormSection />
      <Faq />
      <Security />
      <Stats />
      <Cta />
    </main>
  );
}