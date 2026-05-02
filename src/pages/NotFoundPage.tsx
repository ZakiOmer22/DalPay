import { Link } from "react-router-dom";
import { ArrowLeft, Home, Search } from "lucide-react";

export default function NotFoundPage() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0A0E1A] px-6">
      <div className="max-w-lg mx-auto text-center">
        {/* 404 Display */}
        <div className="relative mb-8">
          <div className="text-[120px] md:text-[160px] font-black text-[#0F7B8C]/10 dark:text-[#3BA7BC]/10 select-none leading-none">
            404
          </div>
          <h1 className="absolute inset-0 flex items-center justify-center text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Page Not Found
          </h1>
        </div>

        <p className="text-lg text-gray-600 dark:text-gray-400 mb-10 leading-relaxed">
          The page you're looking for doesn't exist or has been moved. 
          It might have been archived, or the URL may be incorrect.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#0F7B8C] hover:bg-[#3BA7BC] text-white font-semibold rounded-xl transition-all hover:shadow-[0_0_20px_rgba(15,123,140,0.4)] hover:scale-105"
          >
            <Home size={18} />
            Back to Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-semibold rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft size={18} />
            Go Back
          </button>
        </div>

        {/* Helpful links */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 flex items-center justify-center gap-2">
            <Search size={14} />
            You might be looking for:
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link to="/pay" className="text-[#0F7B8C] dark:text-[#3BA7BC] hover:text-[#0A5D6B] dark:hover:text-[#3BA7BC]/80 transition-colors">
              Pay Tax
            </Link>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <Link to="/faq" className="text-[#0F7B8C] dark:text-[#3BA7BC] hover:text-[#0A5D6B] dark:hover:text-[#3BA7BC]/80 transition-colors">
              FAQ
            </Link>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <Link to="/contact" className="text-[#0F7B8C] dark:text-[#3BA7BC] hover:text-[#0A5D6B] dark:hover:text-[#3BA7BC]/80 transition-colors">
              Contact Us
            </Link>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <Link to="/login" className="text-[#0F7B8C] dark:text-[#3BA7BC] hover:text-[#0A5D6B] dark:hover:text-[#3BA7BC]/80 transition-colors">
              Sign In
            </Link>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <Link to="/register" className="text-[#0F7B8C] dark:text-[#3BA7BC] hover:text-[#0A5D6B] dark:hover:text-[#3BA7BC]/80 transition-colors">
              Register
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}