// web/src/pages/ReportFraudPage.tsx
import { useState } from 'react';
import {
  Shield,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Upload,
  MessageSquare,
} from 'lucide-react';

const fraudTypes = [
  { value: 'unauthorized_payment', label: 'Unauthorised Payment' },
  { value: 'identity_theft', label: 'Identity Theft' },
  { value: 'phishing', label: 'Phishing Attempt' },
  { value: 'account_takeover', label: 'Account Takeover' },
  { value: 'refund_fraud', label: 'Refund Fraud' },
  { value: 'other', label: 'Other' },
];

// Example previous reports (simulated)
const exampleReports = [
  {
    id: '1',
    type: 'unauthorized_payment',
    date: '2026-05-09',
    status: 'investigating',
    message: 'I noticed a payment of 500 SOS that I did not authorise.',
  },
  {
    id: '2',
    type: 'phishing',
    date: '2026-05-05',
    status: 'resolved',
    message: 'Received a suspicious email asking for my DalPay credentials.',
  },
];

export default function ReportFraudPage() {
  const [fraudType, setFraudType] = useState('unauthorized_payment');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [reports, setReports] = useState(exampleReports);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    const newReport = {
      id: Date.now().toString(),
      type: fraudType,
      date: new Date().toISOString().slice(0, 10),
      status: 'investigating',
      message: description,
    };

    setReports([newReport, ...reports]);
    setDescription('');
    setFraudType('unauthorized_payment');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case 'investigating':
        return <Clock size={14} className="text-amber-500" />;
      case 'resolved':
        return <CheckCircle size={14} className="text-green-500" />;
      case 'dismissed':
        return <XCircle size={14} className="text-red-500" />;
      default:
        return <Clock size={14} className="text-gray-400" />;
    }
  };

  const fraudLabel = (type: string) => fraudTypes.find(t => t.value === type)?.label || type;

  return (
    <section className="min-h-screen bg-white dark:bg-[#0A0E1A] pt-28 pb-20 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
            <Shield size={32} className="text-red-500" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Report Fraudulent Activity
          </h1>
          <p className="mt-3 text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
            Help us keep DalPay safe. If you suspect any fraudulent behaviour, please report it immediately.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-[#111627] border border-gray-200 dark:border-gray-700 rounded-3xl p-6 md:p-8 shadow-xl">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <MessageSquare size={20} className="text-[#0F7B8C]" />
                Submit a Fraud Report
              </h2>

              {submitted && (
                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3 text-sm text-green-600 dark:text-green-400">
                  <CheckCircle size={18} />
                  Thank you – your report has been received. Our fraud team will review it.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Fraud Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Type of Fraud
                  </label>
                  <select
                    value={fraudType}
                    onChange={(e) => setFraudType(e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-[#0F7B8C] focus:ring-2 focus:ring-[#0F7B8C]/20"
                  >
                    {fraudTypes.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Describe the incident
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide as much detail as possible – dates, amounts, suspicious emails, etc."
                    rows={5}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[#0F7B8C] focus:ring-2 focus:ring-[#0F7B8C]/20 resize-none"
                    required
                  />
                </div>

                {/* File Upload (visual) */}
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center">
                  <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Attach screenshots or evidence (optional)
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    PNG, JPG, PDF up to 5MB
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
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
                Your Fraud Reports
              </h3>
              <div className="space-y-3">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2 py-0.5 rounded-full">
                        {fraudLabel(report.type)}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        {statusIcon(report.status)}
                        {report.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-900 dark:text-white mt-1 line-clamp-2">
                      {report.message}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                      {report.date}
                    </p>
                  </div>
                ))}
                {reports.length === 0 && (
                  <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
                    You haven’t reported any fraud yet.
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