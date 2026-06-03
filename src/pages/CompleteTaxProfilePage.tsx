import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2, User, CheckCircle, Clock } from "lucide-react";
import { request } from "@/services/api";
import toast from "react-hot-toast";

const REGIONS = [
  "Maroodi Jeex", "Togdheer", "Saxil", "Sanaag", "Awdal", "Sool"
];

const BUSINESS_TYPES = ["retail", "wholesale", "manufacturing", "services", "livestock", "agriculture", "other"];

interface TaxProfile {
  occupation: string;
  monthly_income: number;
  region: string;
  district: string;
  business_name?: string;
  business_type?: string;
  property_value?: number;
  verified?: boolean;
}

export default function CompleteTaxProfilePage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<TaxProfile>({
    occupation: "",
    monthly_income: 0,
    region: "",
    district: "",
    business_name: "",
    business_type: "",
    property_value: 0,
  });

  // Check if profile already exists
  const { data: profileRes, isLoading: profileLoading, refetch } = useQuery({
    queryKey: ["tax-profile"],
    queryFn: () => request<{ profile: TaxProfile | null }>("/tax/profile"),
    retry: false,
    placeholderData: { success: true, message: "", data: { profile: null } },
  });

  const profile = profileRes?.data?.profile;

  // Mutation to create/update profile (submits for verification)
  const createProfile = useMutation({
    mutationFn: (data: TaxProfile) => request("/tax/profile", {
      method: "POST",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      toast.success("Profile submitted for verification.");
      refetch(); // Refresh to get the updated profile (now exists but unverified)
    },
    onError: (err: any) => toast.error(err.message || "Failed to save profile"),
  });

  // If profile exists and is verified, redirect to dashboard
  useEffect(() => {
    if (profile && profile.verified === true) {
      navigate("/dashboard", { replace: true });
    }
  }, [profile, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.occupation || !formData.monthly_income || !formData.region || !formData.district) {
      toast.error("Please fill all required fields.");
      return;
    }
    createProfile.mutate(formData);
  };

  if (profileLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-[#0F7B8C]" size={32} />
      </div>
    );
  }

  // Case 1: Profile exists but is not verified yet
  if (profile && profile.verified === false) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white dark:bg-[#111627] border border-gray-200 dark:border-gray-700 rounded-2xl p-8 text-center shadow-xl">
          <Clock size={48} className="mx-auto text-yellow-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Profile Under Review</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your tax profile has been submitted and is pending admin verification.
            You will be notified once it is approved.
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-2 bg-[#0F7B8C] text-white rounded-lg"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Case 2: No profile exists – show the form
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white dark:bg-[#111627] border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#0F7B8C]/10 flex items-center justify-center mb-4">
            <User size={32} className="text-[#0F7B8C]" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Complete Your Tax Profile</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            We need some information before we can calculate your tax obligations.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Occupation *</label>
            <input
              type="text"
              value={formData.occupation}
              onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#0F7B8C]"
              placeholder="e.g., Business Owner, Farmer, Employee"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Monthly Income (USD) *</label>
            <input
              type="number"
              value={formData.monthly_income}
              onChange={(e) => setFormData({ ...formData, monthly_income: parseFloat(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg"
              placeholder="e.g., 1500"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Region *</label>
              <select
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value, district: "" })}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg"
                required
              >
                <option value="">Select region</option>
                {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">District *</label>
              <input
                type="text"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg"
                placeholder="e.g., Hargeisa"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Business Name (optional)</label>
            <input
              type="text"
              value={formData.business_name}
              onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg"
              placeholder="If applicable"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Business Type</label>
            <select
              value={formData.business_type}
              onChange={(e) => setFormData({ ...formData, business_type: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <option value="">Select business type</option>
              {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Property Value (USD)</label>
            <input
              type="number"
              value={formData.property_value}
              onChange={(e) => setFormData({ ...formData, property_value: parseFloat(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg"
              placeholder="e.g., 50000"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={createProfile.isPending}
              className="w-full py-3 bg-[#0F7B8C] hover:bg-primary-light text-white font-bold rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {createProfile.isPending ? (
                <><Loader2 size={18} className="animate-spin" /> Submitting...</>
              ) : (
                <>Submit for Verification</>
              )}
            </button>
          </div>
        </form>

        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-6">
          Your information will be reviewed by an admin. After approval, your tax assessments will be generated automatically.
        </p>
      </div>
    </div>
  );
}