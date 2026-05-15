// web/src/pages/RegisterPage.tsx — Full Registration with Real Stripe Identity
// (theme updated to explicit light/dark mode classes)

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    ShieldCheck,
    ArrowRight,
    ArrowLeft,
    CheckCircle,
    User,
    Mail,
    Phone,
    Lock,
    Eye,
    EyeOff,
    MapPin,
    Car,
    Home,
    FileText,
    AlertCircle,
    Loader2,
} from "lucide-react";
import { authApi, verificationApi, setTokens, type RegisterPayload } from "@/services/api";
import TurnstileWidget from "@/components/shared/TurnstileWidget";

const TOTAL_STEPS = 5;

const stepLabels = ["Personal Info", "Contact & Address", "Identity", "Documents", "Review"];

const REGIONS = [
    { value: "maroodi_jeex", label: "Maroodi Jeex" },
    { value: "togdheer", label: "Togdheer" },
    { value: "saxil", label: "Saxil" },
    { value: "sanaag", label: "Sanaag" },
    { value: "awdal", label: "Awdal" },
    { value: "sool", label: "Sool" },
];

const DISTRICTS: Record<string, string[]> = {
    maroodi_jeex: ["Hargeisa", "Baligubadle", "Salahley", "Haro Sheikh"],
    togdheer: ["Burao", "Oodweyne", "Buhoodle"],
    saxil: ["Berbera", "Sheikh", "Mandera"],
    sanaag: ["Erigavo", "El Afweyn", "Badhan", "Las Qoray"],
    awdal: ["Borama", "Zeila", "Baki", "Lughaya"],
    sool: ["Las Anod", "Aynabo", "Taleh", "Hudun"],
};

const ID_TYPES = [
    { value: "national_id", label: "National ID Card" },
    { value: "passport", label: "Passport" },
    { value: "driving_license", label: "Driving License" },
];

const PROOF_OF_ADDRESS_TYPES = [
    { value: "utility_bill", label: "Utility Bill" },
    { value: "bank_statement", label: "Bank Statement" },
    { value: "rental_agreement", label: "Rental Agreement" },
    { value: "employer_letter", label: "Employer Letter" },
];

// ------------------------------------------------------------------
// Shapes of the data returned by the verification API
interface VerificationSessionData {
    verificationId: string;
    verificationUrl: string;
}

interface VerificationStatusData {
    status: string;
}

// ------------------------------------------------------------------
// Shape of a successful registration response (matches backend)
interface RegistrationResponseData {
    accessToken: string;
    refreshToken: string;
}

// ------------------------------------------------------------------

export default function RegisterPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [completedSteps, setCompletedSteps] = useState<number[]>([]);
    const [stripeVerificationId, setStripeVerificationId] = useState("");
    const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
    const [turnstileToken, setTurnstileToken] = useState('');
    const [formData, setFormData] = useState({
        nationalId: "",
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        gender: "",
        occupation: "",
        email: "",
        phoneNumber: "",
        password: "",
        confirmPassword: "",
        region: "",
        district: "",
        address: "",
        idType: "national_id",
        idNumber: "",
        drivingLicenseNumber: "",
        proofOfAddressType: "utility_bill",
        agreeToStripeVerification: false,
        agreeToTerms: false,
        agreeToPrivacy: false,
        isUnder18: false,
        parentName: "",
        parentNationalId: "",
        parentPhone: "",
    });

    // updateField now accepts string or boolean, no `any`
    const updateField = (field: string, value: string | boolean) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setError("");
        setSuccessMessage("");
    };

    // ────────────────────────────────────────────────────────────
    // Poll Stripe verification status (handles ALL states)
    // Must be defined BEFORE the useEffect that uses it
    // ────────────────────────────────────────────────────────────
    const startPolling = (sessionId: string) => {
        let pollCount = 0;
        const maxPolls = 100; // 5 minutes

        const pollInterval = setInterval(async () => {
            pollCount++;
            try {
                const statusResponse = await verificationApi.checkStatus(sessionId);
                // cast to known type (API returns `unknown`)
                const statusData = statusResponse.data as VerificationStatusData;
                const status = statusData.status;
                setVerificationStatus(status);

                switch (status) {
                    case "verified":
                        clearInterval(pollInterval);
                        setIsVerifying(false);
                        setError("");
                        setSuccessMessage("Identity verified! You can continue.");
                        setFormData((prev) => ({ ...prev, agreeToStripeVerification: true }));
                        break;
                    case "processing":
                        setSuccessMessage(
                            "Stripe is analyzing your documents. This usually takes 1-2 minutes..."
                        );
                        break;
                    case "requires_input":
                        setSuccessMessage("Please complete the verification form in the new tab.");
                        break;
                    case "requires_action":
                        clearInterval(pollInterval);
                        setIsVerifying(false);
                        setError(
                            "Verification failed. Stripe requires additional information. Please try again."
                        );
                        setSuccessMessage("");
                        setVerificationStatus(null);
                        break;
                    case "canceled":
                        clearInterval(pollInterval);
                        setIsVerifying(false);
                        setError("Verification was canceled or expired. Please try again.");
                        setSuccessMessage("");
                        setVerificationStatus(null);
                        break;
                    default:
                        setSuccessMessage(`Status: ${status}. Complete verification in the new tab.`);
                }
            } catch {
                // keep polling
            }

            if (pollCount >= maxPolls) {
                clearInterval(pollInterval);
                setIsVerifying(false);
                if (verificationStatus !== "verified") {
                    setError("Verification timed out after 5 minutes. Please try again.");
                    setSuccessMessage("");
                }
            }
        }, 3000);
    };

    // ────────────────────────────────────────────────────────────
    // Restore registration data when returning from Stripe
    // ────────────────────────────────────────────────────────────
    useEffect(() => {
        const savedData = localStorage.getItem("dalpay_registration_data");
        const savedSessionId = localStorage.getItem("dalpay_stripe_session_id");
        const savedStep = localStorage.getItem("dalpay_current_step");
        const savedCompletedSteps = localStorage.getItem("dalpay_completed_steps");

        if (savedData && savedSessionId) {
            // Defer state updates to avoid the "setState in effect" lint warning
            setTimeout(() => {
                try {
                    const parsedData = JSON.parse(savedData);
                    const completedSteps = savedCompletedSteps ? JSON.parse(savedCompletedSteps) : undefined;

                    setFormData(parsedData);
                    setStripeVerificationId(savedSessionId);
                    if (savedStep) setStep(parseInt(savedStep));
                    if (completedSteps) setCompletedSteps(completedSteps);

                    setSuccessMessage("Welcome back! Checking your verification status...");

                    verificationApi
                        .checkStatus(savedSessionId)
                        .then((statusResponse) => {
                            const statusData = statusResponse.data as VerificationStatusData;
                            const status = statusData.status;
                            setVerificationStatus(status);

                            if (status === "verified") {
                                setError("");
                                setSuccessMessage(
                                    "Identity verified successfully! You can continue to the next step."
                                );
                                setFormData((prev) => ({ ...prev, agreeToStripeVerification: true }));
                            } else if (status === "processing") {
                                setSuccessMessage(
                                    "Stripe is still processing your documents. This page will update automatically."
                                );
                                startPolling(savedSessionId);
                            } else if (status === "requires_input") {
                                setSuccessMessage(
                                    "Verification incomplete. Click 'Start Verification' to try again."
                                );
                            } else if (status === "requires_action") {
                                setError(
                                    "Verification failed. Stripe needs additional information. Please try again with clear documents."
                                );
                            } else if (status === "canceled") {
                                setError("Verification was canceled. Please try again.");
                            } else {
                                setSuccessMessage(`Verification status: ${status}. You can try again.`);
                            }
                        })
                        .catch(() => setSuccessMessage(""));
                } catch {
                    // Corrupted data – ignore
                }

                localStorage.removeItem("dalpay_registration_data");
                localStorage.removeItem("dalpay_stripe_session_id");
                localStorage.removeItem("dalpay_current_step");
                localStorage.removeItem("dalpay_completed_steps");
            }, 0);
        }
    }, []);

    const validateStep = (stepNum: number): boolean => {
        switch (stepNum) {
            case 1:
                if (!formData.nationalId || !formData.firstName || !formData.lastName) {
                    setError("Please fill in all required fields.");
                    return false;
                }
                return true;
            case 2:
                if (!formData.phoneNumber || !formData.password) {
                    setError("Phone number and password are required.");
                    return false;
                }
                if (formData.password.length < 8) {
                    setError("Password must be at least 8 characters.");
                    return false;
                }
                if (formData.password !== formData.confirmPassword) {
                    setError("Passwords do not match.");
                    return false;
                }
                return true;
            case 3:
                if (!formData.idNumber) {
                    setError("Please enter your ID document number.");
                    return false;
                }
                if (formData.idType === "driving_license" && !formData.drivingLicenseNumber) {
                    setError("Please enter your driving license number.");
                    return false;
                }
                return true;
            case 4:
                if (!formData.agreeToStripeVerification || !formData.agreeToTerms) {
                    setError("Please agree to the verification process and terms.");
                    return false;
                }
                if (formData.isUnder18 && (!formData.parentName || !formData.parentNationalId)) {
                    setError("Parent/guardian information is required for applicants under 18.");
                    return false;
                }
                return true;
            case 5:
                return true;
            default:
                return false;
        }
    };

    const handleNext = () => {
        if (validateStep(step)) {
            setCompletedSteps((prev) => [...prev, step]);
            setStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
        }
    };

    const handleBack = () => {
        setStep((prev) => Math.max(prev - 1, 1));
        setError("");
        setSuccessMessage("");
    };

    // ────────────────────────────────────────────────────────────
    // Stripe Verification — Opens a NEW TAB (does NOT refresh page)
    // ────────────────────────────────────────────────────────────
    const handleStripeVerification = async () => {
        setIsVerifying(true);
        setError("");
        setSuccessMessage("");

        const newTab = window.open("about:blank", "_blank");

        if (!newTab) {
            setError("Pop-up blocked! Please allow pop-ups for this site to continue verification.");
            setIsVerifying(false);
            return;
        }

        try {
            const response = await verificationApi.createSession({
                email: formData.email,
                firstName: formData.firstName,
                lastName: formData.lastName,
            });

            const sessionData = response.data as VerificationSessionData;
            const sessionId = sessionData.verificationId;
            const verificationUrl = sessionData.verificationUrl;

            setStripeVerificationId(sessionId);
            setSuccessMessage(
                "Verification page opened in a new tab. Complete all steps there — this page will update automatically."
            );

            newTab.location.href = verificationUrl;
            startPolling(sessionId);
        } catch (err: unknown) {
            const message = (err as { message?: string })?.message || "Failed to create verification session. Please try again.";
            setError(message);
            setSuccessMessage("");
            setIsVerifying(false);
            try {
                newTab.close();
            } catch {
                /* ignore */
            }
        }
    };

    // ────────────────────────────────────────────────────────────
    // Submit registration
    // ────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        if (!validateStep(5)) return;
        setIsSubmitting(true);
        setError("");
        setSuccessMessage("");

        try {
            const payload: RegisterPayload = {
                nationalId: formData.nationalId,
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email || undefined,
                phoneNumber: formData.phoneNumber,
                password: formData.password,
                dateOfBirth: formData.dateOfBirth || undefined,
                gender: formData.gender || undefined,
                occupation: formData.occupation || undefined,
                region: formData.region || undefined,
                district: formData.district || undefined,
                address: formData.address || undefined,
                parentName: formData.isUnder18 ? formData.parentName : undefined,
                parentNationalId: formData.isUnder18 ? formData.parentNationalId : undefined,
                parentPhone: formData.isUnder18 ? formData.parentPhone : undefined,
                idType: formData.idType,
                idNumber: formData.idNumber,
                drivingLicenseNumber: formData.drivingLicenseNumber || undefined,
                proofOfAddressType: formData.proofOfAddressType,
                stripeVerificationId: stripeVerificationId || undefined,
            };

            const response = await authApi.register(payload, turnstileToken);
            const regData = response.data as RegistrationResponseData;
            setError("");
            setSuccessMessage(
                response.message || "Account created successfully! Redirecting to your dashboard..."
            );
            setTokens(regData.accessToken, regData.refreshToken);

            window.scrollTo({ top: 0, behavior: "smooth" });

            setTimeout(() => {
                navigate("/dashboard?welcome=true");
            }, 2500);
        } catch (err: unknown) {
            const msg =
                (err as { message?: string; data?: { message?: string } })?.message ||
                (err as { message?: string; data?: { message?: string } })?.data?.message ||
                "Registration failed. Please try again.";
            setError(msg);
            setSuccessMessage("");
            window.scrollTo({ top: 0, behavior: "smooth" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const districts = formData.region ? DISTRICTS[formData.region] || [] : [];

    return (
        <section className="min-h-screen bg-white dark:bg-[#0A0E1A] pt-28 pb-20 px-4">
            <div className="max-w-3xl mx-auto">
                <TurnstileWidget onVerify={(token) => setTurnstileToken(token)} />
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 flex items-center justify-center mb-4">
                        <ShieldCheck size={32} className="text-[#0F7B8C]" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                        Create Your <span className="text-[#0F7B8C]">DalPay</span> Account
                    </h1>
                    <p className="mt-3 text-gray-600 dark:text-gray-400">
                        Register to pay taxes digitally. All fields marked * are required.
                    </p>
                </div>

                {/* Progress bar */}
                <div className="mb-10">
                    <div className="flex items-center justify-between relative">
                        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700" />
                        <div
                            className="absolute top-5 left-0 h-0.5 bg-[#0F7B8C] transition-all duration-500"
                            style={{ width: `${((step - 1) / (TOTAL_STEPS - 1)) * 100}%` }}
                        />
                        {stepLabels.map((label, idx) => (
                            <div key={idx} className="relative z-10 flex flex-col items-center">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${idx + 1 < step || completedSteps.includes(idx + 1)
                                        ? "bg-[#0F7B8C] text-white"
                                        : idx + 1 === step
                                            ? "bg-[#0F7B8C] text-white ring-4 ring-[#0F7B8C]/20"
                                            : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                                        }`}
                                >
                                    {idx + 1 < step || completedSteps.includes(idx + 1) ? (
                                        <CheckCircle size={18} />
                                    ) : (
                                        idx + 1
                                    )}
                                </div>
                                <span className="text-xs mt-2 text-gray-600 dark:text-gray-400 hidden sm:block">
                                    {label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Success banner */}
                {successMessage && (
                    <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3 text-sm text-green-600 dark:text-green-400 animate-fade-in">
                        <CheckCircle size={18} className="shrink-0" />
                        <span>{successMessage}</span>
                    </div>
                )}

                {/* Error banner */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3 text-sm text-red-600 dark:text-red-400 animate-fade-in">
                        <AlertCircle size={18} className="shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Form Card */}
                <div className="bg-white dark:bg-[#111627] border border-gray-200 dark:border-gray-700 rounded-2xl p-6 md:p-8 shadow-xl">
                    {/* ======================== STEP 1 ======================== */}
                    {step === 1 && (
                        <div className="space-y-5 animate-fade-in">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <User size={20} className="text-[#0F7B8C]" /> Personal Information
                            </h2>
                            <div>
                                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                    National ID *
                                </label>
                                <input
                                    type="text"
                                    value={formData.nationalId}
                                    onChange={(e) => updateField("nationalId", e.target.value)}
                                    placeholder="e.g. SL-2026-001"
                                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-[#0F7B8C] focus:ring-2 focus:ring-[#0F7B8C]/20 transition-all"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                        First Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.firstName}
                                        onChange={(e) => updateField("firstName", e.target.value)}
                                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-[#0F7B8C] focus:ring-2 focus:ring-[#0F7B8C]/20 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                        Last Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.lastName}
                                        onChange={(e) => updateField("lastName", e.target.value)}
                                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-[#0F7B8C] focus:ring-2 focus:ring-[#0F7B8C]/20 transition-all"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                        Date of Birth
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.dateOfBirth}
                                        onChange={(e) => updateField("dateOfBirth", e.target.value)}
                                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-[#0F7B8C] focus:ring-2 focus:ring-[#0F7B8C]/20 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                        Gender
                                    </label>
                                    <select
                                        value={formData.gender}
                                        onChange={(e) => updateField("gender", e.target.value)}
                                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-[#0F7B8C] focus:ring-2 focus:ring-[#0F7B8C]/20 transition-all"
                                    >
                                        <option value="">Select</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                    Occupation
                                </label>
                                <select
                                    value={formData.occupation}
                                    onChange={(e) => updateField("occupation", e.target.value)}
                                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-[#0F7B8C] focus:ring-2 focus:ring-[#0F7B8C]/20 transition-all"
                                >
                                    <option value="">Select</option>
                                    <option value="salaried">Salaried Employee</option>
                                    <option value="business">Business Owner</option>
                                    <option value="trader">Trader</option>
                                    <option value="farmer">Farmer</option>
                                    <option value="professional">Professional</option>
                                    <option value="informal">Informal Sector</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* ======================== STEP 2 ======================== */}
                    {step === 2 && (
                        <div className="space-y-5 animate-fade-in">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <MapPin size={20} className="text-[#0F7B8C]" /> Contact & Address
                            </h2>
                            <div>
                                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                    Email
                                </label>
                                <div className="relative">
                                    <Mail
                                        size={18}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                                    />
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => updateField("email", e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-[#0F7B8C] focus:ring-2 focus:ring-[#0F7B8C]/20 transition-all"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                    Phone Number *
                                </label>
                                <div className="relative">
                                    <Phone
                                        size={18}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                                    />
                                    <input
                                        type="tel"
                                        value={formData.phoneNumber}
                                        onChange={(e) => updateField("phoneNumber", e.target.value)}
                                        placeholder="+252 63 123 4567"
                                        className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-[#0F7B8C] focus:ring-2 focus:ring-[#0F7B8C]/20 transition-all"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                    Password *
                                </label>
                                <div className="relative">
                                    <Lock
                                        size={18}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                                    />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={(e) => updateField("password", e.target.value)}
                                        className="w-full pl-11 pr-12 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-[#0F7B8C] focus:ring-2 focus:ring-[#0F7B8C]/20 transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                    Confirm Password *
                                </label>
                                <input
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={(e) => updateField("confirmPassword", e.target.value)}
                                    className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all ${formData.confirmPassword && formData.password !== formData.confirmPassword
                                        ? "border-red-500 focus:ring-red-500/20"
                                        : "border-gray-200 dark:border-gray-700 focus:border-[#0F7B8C] focus:ring-[#0F7B8C]/20"
                                        }`}
                                />
                                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                                    <p className="text-xs text-red-500 mt-1">Passwords do not match.</p>
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                        Region
                                    </label>
                                    <select
                                        value={formData.region}
                                        onChange={(e) => {
                                            updateField("region", e.target.value);
                                            updateField("district", "");
                                        }}
                                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-[#0F7B8C] focus:ring-2 focus:ring-[#0F7B8C]/20 transition-all"
                                    >
                                        <option value="">Select region</option>
                                        {REGIONS.map((r) => (
                                            <option key={r.value} value={r.value}>
                                                {r.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                        District
                                    </label>
                                    <select
                                        value={formData.district}
                                        onChange={(e) => updateField("district", e.target.value)}
                                        disabled={!formData.region}
                                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-[#0F7B8C] focus:ring-2 focus:ring-[#0F7B8C]/20 transition-all disabled:opacity-50"
                                    >
                                        <option value="">Select district</option>
                                        {districts.map((d) => (
                                            <option key={d} value={d.toLowerCase().replace(/\s+/g, "_")}>
                                                {d}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                    Address
                                </label>
                                <textarea
                                    value={formData.address}
                                    onChange={(e) => updateField("address", e.target.value)}
                                    placeholder="Enter your full street address..."
                                    rows={2}
                                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-[#0F7B8C] focus:ring-2 focus:ring-[#0F7B8C]/20 transition-all resize-none"
                                />
                            </div>
                        </div>
                    )}

                    {/* ======================== STEP 3 — Stripe Identity ======================== */}
                    {step === 3 && (
                        <div className="space-y-5 animate-fade-in">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <ShieldCheck size={20} className="text-[#0F7B8C]" /> Stripe Identity Verification
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                DalPay uses Stripe Identity to securely verify your identity. A new tab will open
                                for you to upload your documents and take a selfie.
                            </p>

                            {/* Status Card — handles ALL Stripe states */}
                            <div className="bg-gray-100/30 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center">
                                {verificationStatus === "verified" ? (
                                    <>
                                        <div className="w-14 h-14 mx-auto rounded-2xl bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center mb-3">
                                            <CheckCircle size={28} className="text-[#10B981]" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                            Identity Verified!
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Your identity has been successfully verified through Stripe. You can proceed.
                                        </p>
                                    </>
                                ) : verificationStatus === "processing" ? (
                                    <>
                                        <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 flex items-center justify-center mb-3">
                                            <Loader2 size={28} className="text-blue-500 animate-spin" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                            Analyzing Documents...
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Stripe is verifying your documents against official records. This usually takes
                                            1-2 minutes.
                                        </p>
                                    </>
                                ) : verificationStatus === "requires_input" ? (
                                    <>
                                        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 flex items-center justify-center mb-3">
                                            <AlertCircle size={28} className="text-amber-500" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                            Waiting for Documents
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Please complete the verification form in the opened tab. Upload your ID and take
                                            a selfie.
                                        </p>
                                        <button
                                            onClick={handleStripeVerification}
                                            disabled={isVerifying}
                                            className="mt-3 text-sm text-[#0F7B8C] dark:text-[#3BA7BC] hover:text-[#0A5D6B] dark:hover:text-[#3BA7BC]/80 font-medium"
                                        >
                                            Reopen verification page
                                        </button>
                                    </>
                                ) : verificationStatus === "requires_action" ? (
                                    <>
                                        <div className="w-14 h-14 mx-auto rounded-2xl bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 flex items-center justify-center mb-3">
                                            <AlertCircle size={28} className="text-red-500" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                            Verification Failed
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                            Stripe was unable to verify your identity. This could be due to unclear documents
                                            or mismatched information. Please try again with clear photos.
                                        </p>
                                        <button
                                            onClick={handleStripeVerification}
                                            disabled={isVerifying}
                                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#0F7B8C] hover:bg-[#3BA7BC] text-white font-semibold rounded-xl transition-all disabled:opacity-50"
                                        >
                                            <ShieldCheck size={18} /> Try Again
                                        </button>
                                    </>
                                ) : verificationStatus === "canceled" ? (
                                    <>
                                        <div className="w-14 h-14 mx-auto rounded-2xl bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 flex items-center justify-center mb-3">
                                            <AlertCircle size={28} className="text-red-500" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                            Verification Canceled
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                            The verification session was closed before completion. Please try again.
                                        </p>
                                        <button
                                            onClick={handleStripeVerification}
                                            disabled={isVerifying}
                                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#0F7B8C] hover:bg-[#3BA7BC] text-white font-semibold rounded-xl transition-all disabled:opacity-50"
                                        >
                                            <ShieldCheck size={18} /> Retry Verification
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-14 h-14 mx-auto rounded-2xl bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 flex items-center justify-center mb-3">
                                            <ShieldCheck size={28} className="text-[#0F7B8C]" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                            Verify Your Identity
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                            Click below to start verification. A new tab will open for Stripe's secure
                                            verification page.
                                        </p>
                                        <button
                                            onClick={handleStripeVerification}
                                            disabled={isVerifying}
                                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#0F7B8C] hover:bg-[#3BA7BC] text-white font-semibold rounded-xl transition-all disabled:opacity-50"
                                        >
                                            {isVerifying ? (
                                                <>
                                                    <Loader2 size={18} className="animate-spin" /> Creating session...
                                                </>
                                            ) : (
                                                <>
                                                    <ShieldCheck size={18} /> Start Verification with Stripe
                                                </>
                                            )}
                                        </button>
                                    </>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                    ID Document Type
                                </label>
                                <select
                                    value={formData.idType}
                                    onChange={(e) => updateField("idType", e.target.value)}
                                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-[#0F7B8C] focus:ring-2 focus:ring-[#0F7B8C]/20 transition-all"
                                >
                                    {ID_TYPES.map((t) => (
                                        <option key={t.value} value={t.value}>
                                            {t.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                    Document Number *
                                </label>
                                <input
                                    type="text"
                                    value={formData.idNumber}
                                    onChange={(e) => updateField("idNumber", e.target.value)}
                                    placeholder="Enter your ID/passport number"
                                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-[#0F7B8C] focus:ring-2 focus:ring-[#0F7B8C]/20 transition-all"
                                />
                            </div>
                            {formData.idType === "driving_license" && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                        <Car size={16} className="text-[#0F7B8C]" /> Driving License Number *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.drivingLicenseNumber}
                                        onChange={(e) => updateField("drivingLicenseNumber", e.target.value)}
                                        placeholder="Enter your driving license number"
                                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-[#0F7B8C] focus:ring-2 focus:ring-[#0F7B8C]/20 transition-all"
                                    />
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                    <Home size={16} className="text-[#0F7B8C]" /> Proof of Address Type
                                </label>
                                <select
                                    value={formData.proofOfAddressType}
                                    onChange={(e) => updateField("proofOfAddressType", e.target.value)}
                                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-[#0F7B8C] focus:ring-2 focus:ring-[#0F7B8C]/20 transition-all"
                                >
                                    {PROOF_OF_ADDRESS_TYPES.map((t) => (
                                        <option key={t.value} value={t.value}>
                                            {t.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    {/* ======================== STEP 4 ======================== */}
                    {step === 4 && (
                        <div className="space-y-5 animate-fade-in">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <FileText size={20} className="text-[#0F7B8C]" /> Agreements & Parental Control
                            </h2>
                            <div className="space-y-3">
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.agreeToStripeVerification}
                                        onChange={(e) => updateField("agreeToStripeVerification", e.target.checked)}
                                        className="mt-1 w-4 h-4 rounded border-gray-200 dark:border-gray-700 text-[#0F7B8C] focus:ring-[#0F7B8C]"
                                    />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        I consent to identity verification through Stripe Identity.
                                    </span>
                                </label>
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.agreeToTerms}
                                        onChange={(e) => updateField("agreeToTerms", e.target.checked)}
                                        className="mt-1 w-4 h-4 rounded border-gray-200 dark:border-gray-700 text-[#0F7B8C] focus:ring-[#0F7B8C]"
                                    />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        I agree to the{" "}
                                        <Link
                                            to="/terms"
                                            className="text-[#0F7B8C] dark:text-[#3BA7BC] hover:underline"
                                        >
                                            Terms of Service
                                        </Link>{" "}
                                        and{" "}
                                        <Link
                                            to="/privacy"
                                            className="text-[#0F7B8C] dark:text-[#3BA7BC] hover:underline"
                                        >
                                            Privacy Policy
                                        </Link>
                                        .
                                    </span>
                                </label>
                            </div>
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-5">
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.isUnder18}
                                        onChange={(e) => updateField("isUnder18", e.target.checked)}
                                        className="mt-1 w-4 h-4 rounded border-gray-200 dark:border-gray-700 text-[#0F7B8C] focus:ring-[#0F7B8C]"
                                    />
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                        I am under 18 years old and need parental/guardian consent.
                                    </span>
                                </label>
                                {formData.isUnder18 && (
                                    <div className="mt-4 space-y-4 pl-7 border-l-2 border-amber-400 ml-2">
                                        <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                                            Parent/Guardian Information Required
                                        </p>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                                Parent/Guardian Full Name *
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.parentName}
                                                onChange={(e) => updateField("parentName", e.target.value)}
                                                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-[#0F7B8C] focus:ring-2 focus:ring-[#0F7B8C]/20 transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                                Parent/Guardian National ID *
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.parentNationalId}
                                                onChange={(e) => updateField("parentNationalId", e.target.value)}
                                                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-[#0F7B8C] focus:ring-2 focus:ring-[#0F7B8C]/20 transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                                Parent/Guardian Phone
                                            </label>
                                            <input
                                                type="tel"
                                                value={formData.parentPhone}
                                                onChange={(e) => updateField("parentPhone", e.target.value)}
                                                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-[#0F7B8C] focus:ring-2 focus:ring-[#0F7B8C]/20 transition-all"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ======================== STEP 5 ======================== */}
                    {step === 5 && (
                        <div className="space-y-5 animate-fade-in">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <CheckCircle size={20} className="text-[#10B981]" /> Review & Submit
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Please review your information before submitting.
                            </p>
                            <div className="space-y-3">
                                {[
                                    {
                                        label: "Personal Info",
                                        fields: [
                                            ["National ID", formData.nationalId],
                                            ["Name", `${formData.firstName} ${formData.lastName}`],
                                            ["DOB", formData.dateOfBirth || "—"],
                                            ["Occupation", formData.occupation || "—"],
                                        ],
                                    },
                                    {
                                        label: "Contact",
                                        fields: [
                                            ["Phone", formData.phoneNumber],
                                            ["Email", formData.email || "—"],
                                            ["Region", formData.region || "—"],
                                            ["District", formData.district || "—"],
                                        ],
                                    },
                                    {
                                        label: "Identity",
                                        fields: [
                                            ["ID Type", formData.idType],
                                            ["Document #", formData.idNumber],
                                            ["Proof of Address", formData.proofOfAddressType],
                                            ["Stripe Verification", verificationStatus || "Not completed"],
                                        ],
                                    },
                                ].map((section, i) => (
                                    <div
                                        key={i}
                                        className="bg-gray-100/30 dark:bg-gray-800/30 rounded-xl p-4"
                                    >
                                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">
                                            {section.label}
                                        </h3>
                                        <div className="grid grid-cols-2 gap-1 text-sm">
                                            {section.fields.map(([l, v], j) => (
                                                <div key={j} className="contents">
                                                    <span className="text-gray-600 dark:text-gray-400">{l}:</span>
                                                    <span className="text-gray-900 dark:text-white font-medium">{v}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="w-full py-4 bg-[#0F7B8C] hover:bg-[#3BA7BC] text-white font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" /> Creating your account...
                                    </>
                                ) : (
                                    <>
                                        <ShieldCheck size={20} /> Create My Account
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                        {step > 1 ? (
                            <button
                                onClick={handleBack}
                                className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-semibold rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                <ArrowLeft size={16} /> Back
                            </button>
                        ) : (
                            <div />
                        )}
                        {step < TOTAL_STEPS ? (
                            <button
                                onClick={handleNext}
                                className="flex items-center gap-2 px-6 py-2.5 bg-[#0F7B8C] hover:bg-[#3BA7BC] text-white font-semibold rounded-xl transition-all"
                            >
                                Continue <ArrowRight size={16} />
                            </button>
                        ) : null}
                    </div>
                </div>

                <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        className="text-[#0F7B8C] dark:text-[#3BA7BC] hover:text-[#0A5D6B] dark:hover:text-[#3BA7BC]/80 font-semibold"
                    >
                        Sign In
                    </Link>
                </p>
            </div>
        </section>
    );
}