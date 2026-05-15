// web/src/pages/CareersPage.tsx
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Heart,
  Users,
  Zap,
  MapPin,
  ArrowLeft,
  ChevronRight,
  Star,
  Send,
} from 'lucide-react';

const jobs = [
  {
    title: 'Senior Backend Engineer',
    department: 'Engineering',
    location: 'Hargeisa, Somaliland',
    type: 'Full‑time',
  },
  {
    title: 'UI/UX Designer',
    department: 'Design',
    location: 'Remote',
    type: 'Contract',
  },
  {
    title: 'Tax Operations Specialist',
    department: 'Operations',
    location: 'Hargeisa, Somaliland',
    type: 'Full‑time',
  },
  {
    title: 'Security Analyst',
    department: 'Security',
    location: 'Hargeisa, Somaliland',
    type: 'Full‑time',
  },
  {
    title: 'Mobile Money Integration Developer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full‑time',
  },
];

const benefits = [
  { icon: Heart, text: 'Competitive salary & health insurance' },
  { icon: Users, text: 'Collaborative, mission‑driven team' },
  { icon: Zap, text: 'Work with cutting‑edge fintech & AI' },
  { icon: MapPin, text: 'Flexible remote / on‑site in Hargeisa' },
  { icon: Star, text: 'Professional development budget' },
  { icon: Briefcase, text: 'Meaningful public‑sector impact' },
];

export default function CareersPage() {
  return (
    <section className="min-h-screen bg-white dark:bg-[#0A0E1A] pt-28 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-8"
        >
          <ArrowLeft size={16} />
          Back to home
        </Link>

        {/* Header */}
        <div className="text-center mb-16">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 flex items-center justify-center mb-4">
            <Briefcase size={32} className="text-[#0F7B8C]" />
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white">
            Join DalPay
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Help us digitalise tax collection for millions of citizens across Somaliland – from
            smartphone users to those on basic feature phones.
          </p>
        </div>

        {/* Mission & Culture */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white dark:bg-[#111627] border border-gray-200 dark:border-gray-700 rounded-2xl p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Our Mission
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              DalPay is the official digital tax platform of the Somaliland Ministry of Finance.
              We replace manual, cash‑based collection with a secure, automated system that
              supports mobile money, USSD, AI fraud detection, and double‑entry accounting.
              Every line of code you write directly improves government transparency and citizen
              convenience.
            </p>
          </div>
          <div className="bg-white dark:bg-[#111627] border border-gray-200 dark:border-gray-700 rounded-2xl p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Who We’re Looking For
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              We hire curious, detail‑oriented engineers, designers, and operations specialists who
              care about public service. You don’t need government experience – you just need
              solid skills, a collaborative mindset, and a passion for building technology that
              works for everyone.
            </p>
          </div>
        </div>

        {/* Open Positions */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Open Positions
          </h2>
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.title}
                className="bg-white dark:bg-[#111627] border border-gray-200 dark:border-gray-700 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-lg hover:border-[#0F7B8C]/30 transition-all"
              >
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{job.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {job.department} · {job.location} · {job.type}
                  </p>
                </div>
                <Link
                  to={`/careers/${encodeURIComponent(job.title.toLowerCase().replace(/\s+/g, '-'))}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0F7B8C] hover:bg-[#3BA7BC] text-white font-medium rounded-xl transition-all shrink-0"
                >
                  Apply <ChevronRight size={16} />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-[#0F7B8C]/5 dark:bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 rounded-3xl p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Why join DalPay?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-xl p-4"
              >
                <Icon size={20} className="text-[#0F7B8C] shrink-0" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Contact / Spontaneous application */}
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Don’t see a perfect fit? We’d still love to hear from you.
          </p>
          <a
            href="mailto:careers@dalpay.gov.so"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all"
          >
            <Send size={18} /> Send us an open application
          </a>
        </div>
      </div>
    </section>
  );
}