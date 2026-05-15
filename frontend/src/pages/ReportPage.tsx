// web/src/pages/ReportPage.tsx
import { useState } from 'react';
import {
  AlertTriangle,
  Send,
  CheckCircle,
  Clock,
  XCircle,
  MessageSquare,
  Upload,
  FileText,
  Flag,
  Bug,
  HelpCircle,
  Shield,
} from 'lucide-react';

const categories = [
  { value: 'bug', label: 'Bug Report', icon: Bug },
  { value: 'payment', label: 'Payment Issue', icon: Shield },
  { value: 'account', label: 'Account Problem', icon: HelpCircle },
  { value: 'other', label: 'Other', icon: Flag },
];

// Example previous reports (simulated)
const exampleReports = [
  {
    id: '1',
    subject: 'Payment not reflecting in dashboard',
    date: '2026-05-10',
    status: 'open',
    message: 'I paid my income tax yesterday but the status still shows unpaid.',
  },
  {
    id: '2',
    subject: 'Unable to upload document',
    date: '2026-05-08',
    status: 'resolved',
    message: 'Tried to upload my national ID but got an error. It’s fixed now.',
  },
];

export default function ReportPage() {
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('bug');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [reports, setReports] = useState(exampleReports);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;

    const newReport = {
      id: Date.now().toString(),
      subject,
      date: new Date().toISOString().slice(0, 10),
      status: 'open',
      message: description,
    };

    setReports([newReport, ...reports]);
    setSubject('');
    setDescription('');
    setCategory('bug');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <Clock size={14} className="text-amber-500" />;
      case 'resolved':
        return <CheckCircle size={14} className="text-green-500" />;
      default:
        return <XCircle size={14} className="text-red-500" />;
    }
  };

  return (
    <section className="min-h-screen bg-white dark:bg-[#0A0E1A] pt-28 pb-20 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
            <AlertTriangle size={32} className="text-amber-500" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Report an Issue
          </h1>
          <p className="mt-3 text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            Encountered a problem? Let us know and we’ll fix it as soon as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-[#111627] border border-gray-200 dark:border-gray-700 rounded-3xl p-6 md:p-8 shadow-xl">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <MessageSquare size={20} className="text-[#0F7B8C]" />
                Submit a Report
              </h2>

              {submitted && (
                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3 text-sm text-green-600 dark:text-green-400">
                  <CheckCircle size={18} />
                  Your report has been submitted successfully!
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g., Payment not reflecting"
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[#0F7B8C] focus:ring-2 focus:ring-[#0F7B8C]/20"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Category
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {categories.map(({ value, label, icon: Icon }) => (
                      <label
                        key={value}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          category === value
                            ? 'border-[#0F7B8C] bg-[#0F7B8C]/10'
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                        }`}
                      >
                        <input
                          type="radio"
                          name="category"
                          value={value}
                          checked={category === value}
                          onChange={(e) => setCategory(e.target.value)}
                          className="sr-only"
                        />
                        <Icon size={18} className={category === value ? 'text-[#0F7B8C]' : 'text-gray-400'} />
                        <span className={`text-sm font-medium ${
                          category === value ? 'text-[#0F7B8C]' : 'text-gray-600 dark:text-gray-300'
                        }`}>
                          {label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the issue in detail..."
                    rows={5}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[#0F7B8C] focus:ring-2 focus:ring-[#0F7B8C]/20 resize-none"
                    required
                  />
                </div>

                {/* File Upload (visual only) */}
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center">
                  <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Drag & drop screenshots or <button type="button" className="text-[#0F7B8C] font-medium">browse</button>
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    PNG, JPG up to 5MB (optional)
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#0F7B8C] hover:bg-[#3BA7BC] text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Send size={18} /> Submit Report
                </button>
              </form>
            </div>
          </div>

          {/* Previous Reports */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-[#111627] border border-gray-200 dark:border-gray-700 rounded-3xl p-6 shadow-xl">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FileText size={18} className="text-[#0F7B8C]" />
                Your Reports
              </h3>
              <div className="space-y-3">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {report.subject}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        {statusIcon(report.status)}
                        {report.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {report.date}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                      {report.message}
                    </p>
                  </div>
                ))}
                {reports.length === 0 && (
                  <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
                    No reports yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}