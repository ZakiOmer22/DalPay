// web/src/pages/CareerDetailPage.tsx
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Briefcase,
  Send,
  CheckCircle,
  AlertCircle,
  Heart,
  Coffee,
  Globe,
  Users,
  Zap,
  GraduationCap,
  ClipboardList,
  User,
} from 'lucide-react';
import { jobs } from '@/types/jobs'; // correct path to the shared data file

export default function CareerDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const job = jobs.find((j) => j.slug === slug);

  // Application form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    // In a real app, this would send the data to an API
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  if (!job) {
    return (
      <section className="min-h-screen bg-white dark:bg-[#0A0E1A] pt-28 pb-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Job not found</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            The position you’re looking for doesn’t exist or has been filled.
          </p>
          <Link
            to="/careers"
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-[#0F7B8C] text-white font-semibold rounded-xl hover:bg-[#3BA7BC] transition-all"
          >
            <ArrowLeft size={18} /> All Openings
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-white dark:bg-[#0A0E1A] pt-28 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <Link
          to="/careers"
          className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-8"
        >
          <ArrowLeft size={16} />
          Back to all openings
        </Link>

        {/* Job Header */}
        <div className="bg-white dark:bg-[#111627] border border-gray-200 dark:border-gray-700 rounded-3xl p-6 md:p-8 shadow-xl mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {job.title}
          </h1>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-1.5">
              <Briefcase size={16} /> {job.department}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin size={16} /> {job.location}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={16} /> {job.type}
            </span>
          </div>
          <p className="mt-6 text-gray-600 dark:text-gray-400 leading-relaxed">
            {job.description}
          </p>
        </div>

        {/* Responsibilities & Qualifications */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white dark:bg-[#111627] border border-gray-200 dark:border-gray-700 rounded-3xl p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Responsibilities
            </h2>
            <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              {job.responsibilities.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[#0F7B8C] mt-1">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white dark:bg-[#111627] border border-gray-200 dark:border-gray-700 rounded-3xl p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Qualifications
            </h2>
            <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              {job.qualifications.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[#0F7B8C] mt-1">•</span>
                  {item}
                </li>
              ))}
            </ul>
            {job.niceToHave.length > 0 && (
              <>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                  Nice to Have
                </h3>
                <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                  {job.niceToHave.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-gray-400 mt-1">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>

        {/* Perks & Benefits – NEW SECTION */}
        <div className="bg-white dark:bg-[#111627] border border-gray-200 dark:border-gray-700 rounded-3xl p-6 md:p-8 shadow-xl mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Heart size={20} className="text-[#0F7B8C]" />
            Perks & Benefits
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Coffee, label: 'Flexible working hours' },
              { icon: Globe, label: 'Remote‑friendly culture' },
              { icon: Users, label: 'Collaborative team events' },
              { icon: Zap, label: 'Latest MacBook or Dell XPS' },
              { icon: GraduationCap, label: 'Annual learning budget' },
              { icon: Heart, label: 'Health & wellness coverage' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50">
                <Icon size={20} className="text-[#0F7B8C] shrink-0" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Our Hiring Process – NEW SECTION */}
        <div className="bg-white dark:bg-[#111627] border border-gray-200 dark:border-gray-700 rounded-3xl p-6 md:p-8 shadow-xl mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <ClipboardList size={20} className="text-[#0F7B8C]" />
            Our Hiring Process
          </h2>
          <div className="space-y-6">
            {[
              { step: '01', title: 'Application Review', description: 'Our team reviews your CV and cover letter within 3‑5 business days.' },
              { step: '02', title: 'Technical / Design Challenge', description: 'A short take‑home exercise relevant to the role.' },
              { step: '03', title: 'Panel Interview', description: 'Meet with future team members and discuss your experience.' },
              { step: '04', title: 'Offer & Onboarding', description: 'Receive your offer, sign the contract, and start your DalPay journey!' },
            ].map(({ step, title, description }) => (
              <div key={step} className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 flex items-center justify-center text-lg font-bold text-[#0F7B8C] shrink-0">
                  {step}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* About the Team – NEW SECTION */}
        <div className="bg-white dark:bg-[#111627] border border-gray-200 dark:border-gray-700 rounded-3xl p-6 md:p-8 shadow-xl mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <User size={20} className="text-[#0F7B8C]" />
            The Team You'll Join
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            You’ll work alongside a passionate group of engineers, designers, and tax experts who are
            building Somalia’s first digital tax platform. We value transparency, kindness, and
            craftsmanship. Whether you’re in Hargeisa or remote, you’ll have immediate impact on
            millions of citizens.
          </p>
        </div>

        {/* Apply Form */}
        <div className="bg-white dark:bg-[#111627] border border-gray-200 dark:border-gray-700 rounded-3xl p-6 md:p-8 shadow-xl">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Send size={20} className="text-[#0F7B8C]" />
            Apply for this position
          </h2>

          {submitted && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3 text-sm text-green-600 dark:text-green-400">
              <CheckCircle size={18} />
              Application submitted successfully! We’ll be in touch.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-[#0F7B8C] focus:ring-2 focus:ring-[#0F7B8C]/20"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Email *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-[#0F7B8C] focus:ring-2 focus:ring-[#0F7B8C]/20"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Cover Letter (optional)
              </label>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={4}
                placeholder="Tell us why you’re a great fit..."
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[#0F7B8C] focus:ring-2 focus:ring-[#0F7B8C]/20 resize-none"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
            >
              <Send size={18} /> Submit Application
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}