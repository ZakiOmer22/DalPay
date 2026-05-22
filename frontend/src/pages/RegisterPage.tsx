// web/src/pages/RegisterPage.tsx
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
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
    Upload,
    Image,
    File,
    X,
} from "lucide-react";
import { setTokens, verificationApi } from "@/services/api";

const TOTAL_STEPS = 5;
const stepLabels = ["Personal Info", "Contact & Address", "Identity & Documents", "Agreements", "Review"];

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

interface UploadedFile {
    file: File;
    preview: string;
    name: string;
    size: number;
    type: string;
}

interface VerificationSessionData {
    verificationId: string;
    verificationUrl: string;
}

interface VerificationStatusData {
    status: string;
    lastError?: string;
}

interface RegistrationResponseData {
    accessToken: string;
    refreshToken: string;
}

// Validation helpers
const validateNationalId = (value: string): boolean => /^SL-\d{4}-\d{3}$/.test(value);
const validatePhoneNumber = (value: string): boolean => /^\+2526\d{8,9}$/.test(value);
const validatePassword = (value: string): boolean =>
    value.length >= 12 && /[A-Z]/.test(value) && /[a-z]/.test(value) && /[!@#$%^&*(),.?":{}|<>]/.test(value);
const calculateAge = (dob: string): number => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
};

export default function RegisterPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [completedSteps, setCompletedSteps] = useState<number[]>([]);
    const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
    const recaptchaRef = useRef<ReCAPTCHA>(null);
    const [stripeVerificationId, setStripeVerificationId] = useState("");
    const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
    const [verificationError, setVerificationError] = useState<string>("");

    // Document uploads state
    const [identityDocument, setIdentityDocument] = useState<UploadedFile | null>(null);
    const [proofOfAddressDocument, setProofOfAddressDocument] = useState<UploadedFile | null>(null);
    const [portraitPhoto, setPortraitPhoto] = useState<UploadedFile | null>(null);
    const [uploadErrors, setUploadErrors] = useState({
        identity: "",
        proofOfAddress: "",
        portrait: "",
    });

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
        agreeToTerms: false,
        isUnder18: false,
        parentName: "",
        parentNationalId: "",
        parentPhone: "",
    });

    const updateField = (field: string, value: string | boolean) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setError("");
        setSuccessMessage("");
    };

    // File handlers
    const handleFileUpload = (
        file: File | null,
        type: "identity" | "proofOfAddress" | "portrait"
    ) => {
        setUploadErrors((prev) => ({ ...prev, [type]: "" }));
        if (!file) {
            if (type === "identity") setIdentityDocument(null);
            if (type === "proofOfAddress") setProofOfAddressDocument(null);
            if (type === "portrait") setPortraitPhoto(null);
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setUploadErrors((prev) => ({ ...prev, [type]: "File size must be < 5MB" }));
            return;
        }
        const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
        if (!allowedTypes.includes(file.type)) {
            setUploadErrors((prev) => ({ ...prev, [type]: "Only JPEG, PNG, or PDF" }));
            return;
        }
        const preview = URL.createObjectURL(file);
        const uploadedFile = { file, preview, name: file.name, size: file.size, type: file.type };
        if (type === "identity") setIdentityDocument(uploadedFile);
        if (type === "proofOfAddress") setProofOfAddressDocument(uploadedFile);
        if (type === "portrait") setPortraitPhoto(uploadedFile);
    };

    const removeFile = (type: "identity" | "proofOfAddress" | "portrait") => {
        if (type === "identity" && identityDocument) URL.revokeObjectURL(identityDocument.preview);
        if (type === "proofOfAddress" && proofOfAddressDocument) URL.revokeObjectURL(proofOfAddressDocument.preview);
        if (type === "portrait" && portraitPhoto) URL.revokeObjectURL(portraitPhoto.preview);
        if (type === "identity") setIdentityDocument(null);
        if (type === "proofOfAddress") setProofOfAddressDocument(null);
        if (type === "portrait") setPortraitPhoto(null);
        setUploadErrors((prev) => ({ ...prev, [type]: "" }));
    };

    // Poll Stripe verification status – handles all possible Stripe states
    const startPolling = (sessionId: string) => {
        let pollCount = 0;
        const maxPolls = 100; // 5 minutes
        const pollInterval = setInterval(async () => {
            pollCount++;
            try {
                const response = await verificationApi.checkStatus(sessionId);
                // Log the full response for debugging
                console.log("Polling response:", response.data);
                // The response might be nested differently; assume response.data has a 'status' field
                const statusData = response.data as any;
                const status = statusData.status || statusData.state || "unknown";
                setVerificationStatus(status);
                setVerificationError(statusData.lastError || statusData.error || "");

                switch (status) {
                    case "verified":
                        clearInterval(pollInterval);
                        setIsVerifying(false);
                        setError("");
                        setSuccessMessage("Identity verified successfully! You can continue.");
                        break;
                    case "processing":
                        setSuccessMessage("Stripe is analyzing your documents. This takes 1-2 minutes...");
                        break;
                    case "requires_input":
                        setSuccessMessage("Please complete the verification form in the new tab.");
                        break;
                    case "requires_action":
                        clearInterval(pollInterval);
                        setIsVerifying(false);
                        setError("Verification requires additional action. Please try again.");
                        setSuccessMessage("");
                        setVerificationStatus(null);
                        break;
                    case "canceled":
                        clearInterval(pollInterval);
                        setIsVerifying(false);
                        setError("Verification was canceled. Please start a new session.");
                        setSuccessMessage("");
                        setVerificationStatus(null);
                        break;
                    case "expired":
                        clearInterval(pollInterval);
                        setIsVerifying(false);
                        setError("Verification session expired. Please try again.");
                        setSuccessMessage("");
                        setVerificationStatus(null);
                        break;
                    case "failed":
                        clearInterval(pollInterval);
                        setIsVerifying(false);
                        setError(`Verification failed: ${statusData.lastError || "Please try again with clear documents."}`);
                        setSuccessMessage("");
                        setVerificationStatus(null);
                        break;
                    default:
                        setSuccessMessage(`Status: ${status}. Complete verification in the new tab.`);
                }
            } catch (err) {
                console.error("Polling error:", err);
            }
            if (pollCount >= maxPolls) {
                clearInterval(pollInterval);
                setIsVerifying(false);
                if (verificationStatus !== "verified") {
                    setError("Verification timed out after 5 minutes. Please try again or refresh status.");
                }
            }
        }, 3000);
    };
    const refreshVerificationStatus = async () => {
        if (!stripeVerificationId) return;
        try {
            const response = await verificationApi.checkStatus(stripeVerificationId);
            const statusData = response.data as any;
            const status = statusData.status || statusData.state || "unknown";
            setVerificationStatus(status);
            setVerificationError(statusData.lastError || statusData.error || "");
            if (status === "verified") {
                setSuccessMessage("Identity verified! You can continue.");
                setError("");
            } else if (status === "processing") {
                setSuccessMessage("Still processing...");
            } else {
                setError(`Current status: ${status}. Please complete Stripe verification.`);
            }
        } catch (err) {
            console.error("Status refresh failed", err);
        }
    };


    // Restore saved registration data (if any)
    useEffect(() => {
        const savedData = localStorage.getItem("dalpay_registration_data");
        const savedSessionId = localStorage.getItem("dalpay_stripe_session_id");
        const savedStep = localStorage.getItem("dalpay_current_step");
        const savedCompletedSteps = localStorage.getItem("dalpay_completed_steps");

        if (savedData && savedSessionId) {
            setTimeout(() => {
                try {
                    const parsed = JSON.parse(savedData);
                    setFormData(parsed.formData);
                    if (parsed.identityDocument) setIdentityDocument(parsed.identityDocument);
                    if (parsed.proofOfAddressDocument) setProofOfAddressDocument(parsed.proofOfAddressDocument);
                    if (parsed.portraitPhoto) setPortraitPhoto(parsed.portraitPhoto);
                    setStripeVerificationId(savedSessionId);
                    if (savedStep) setStep(parseInt(savedStep));
                    if (savedCompletedSteps) setCompletedSteps(JSON.parse(savedCompletedSteps));
                    setSuccessMessage("Checking your verification status...");
                    verificationApi
                        .checkStatus(savedSessionId)
                        .then((resp) => {
                            const status = (resp.data as VerificationStatusData).status;
                            setVerificationStatus(status);
                            if (status === "verified") {
                                setSuccessMessage("Identity verified! You can continue.");
                            } else if (status === "processing") {
                                startPolling(savedSessionId);
                            }
                        })
                        .catch(() => { });
                } catch { }
                localStorage.removeItem("dalpay_registration_data");
                localStorage.removeItem("dalpay_stripe_session_id");
                localStorage.removeItem("dalpay_current_step");
                localStorage.removeItem("dalpay_completed_steps");
            }, 0);
        }
    }, []);

    // Save progress when step changes or files change
    useEffect(() => {
        if (step > 1 && stripeVerificationId) {
            const dataToSave = {
                formData,
                identityDocument,
                proofOfAddressDocument,
                portraitPhoto,
            };
            localStorage.setItem("dalpay_registration_data", JSON.stringify(dataToSave));
            localStorage.setItem("dalpay_stripe_session_id", stripeVerificationId);
            localStorage.setItem("dalpay_current_step", step.toString());
            localStorage.setItem("dalpay_completed_steps", JSON.stringify(completedSteps));
        }
    }, [step, formData, identityDocument, proofOfAddressDocument, portraitPhoto, stripeVerificationId, completedSteps]);

    // Step validations (including document uploads)
    const validateStep = (stepNum: number): boolean => {
        switch (stepNum) {
            case 1:
                if (!formData.nationalId || !formData.firstName || !formData.lastName) {
                    setError("All personal info fields are required.");
                    return false;
                }
                if (!validateNationalId(formData.nationalId)) {
                    setError("National ID must be like SL-2026-999 (SL-YYYY-XXX)");
                    return false;
                }
                if (!formData.dateOfBirth) {
                    setError("Date of birth is required.");
                    return false;
                }
                if (calculateAge(formData.dateOfBirth) < 18) {
                    setError("You must be at least 18 years old.");
                    return false;
                }
                return true;
            case 2:
                if (!formData.phoneNumber || !validatePhoneNumber(formData.phoneNumber)) {
                    setError("Phone must be +2526XXXXXXXX (e.g., +252612345678)");
                    return false;
                }
                if (!formData.password || !validatePassword(formData.password)) {
                    setError("Password: min 12 chars, uppercase, lowercase, symbol");
                    return false;
                }
                if (formData.password !== formData.confirmPassword) {
                    setError("Passwords do not match.");
                    return false;
                }
                return true;
            case 3:
                // Stripe verification must be completed
                if (verificationStatus !== "verified") {
                    setError("Please complete Stripe identity verification first.");
                    return false;
                }
                // Document uploads required
                if (!identityDocument) {
                    setError("Please upload your Government ID (National ID/Passport).");
                    return false;
                }
                if (!proofOfAddressDocument) {
                    setError("Please upload a Proof of Address document.");
                    return false;
                }
                if (!portraitPhoto) {
                    setError("Please upload a portrait photo (selfie).");
                    return false;
                }
                if (!formData.idNumber) {
                    setError("ID document number is required.");
                    return false;
                }
                if (formData.idType === "driving_license" && !formData.drivingLicenseNumber) {
                    setError("Driving license number is required.");
                    return false;
                }
                return true;
            case 4:
                if (!formData.agreeToTerms) {
                    setError("You must agree to the Terms of Service and Privacy Policy.");
                    return false;
                }
                if (formData.isUnder18 && (!formData.parentName || !formData.parentNationalId)) {
                    setError("Parent/guardian information required for applicants under 18.");
                    return false;
                }
                return true;
            default:
                return true;
        }
    };

    const handleNext = () => {
        if (validateStep(step)) {
            setCompletedSteps((prev) => [...prev, step]);
            setStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
            setError("");
        }
    };

    const handleBack = () => {
        setStep((prev) => Math.max(prev - 1, 1));
        setError("");
        setSuccessMessage("");
    };

    // Stripe verification – opens new tab
    const handleStripeVerification = async () => {
        setIsVerifying(true);
        setError("");
        setSuccessMessage("Opening Stripe verification...");

        const newTab = window.open("about:blank", "_blank");
        if (!newTab) {
            setError("Pop-up blocked! Please allow pop-ups for this site.");
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
            setStripeVerificationId(sessionData.verificationId);
            newTab.location.href = sessionData.verificationUrl;
            startPolling(sessionData.verificationId);
            setSuccessMessage("Verification page opened. Complete all steps there — this page will update automatically.");
        } catch (err: any) {
            setError(err.message || "Failed to start verification.");
            setIsVerifying(false);
            newTab.close();
        }
    };

    // Submit registration – creates pending account
    const handleSubmit = async () => {
        if (!validateStep(5)) return;
        if (!recaptchaToken) {
            setError("Please complete the reCAPTCHA verification.");
            return;
        }
        if (verificationStatus !== "verified") {
            setError("Stripe verification must be completed.");
            return;
        }

        setIsSubmitting(true);
        setError("");
        setSuccessMessage("");

        try {
            const formDataToSend = new FormData();
            const fields: (keyof typeof formData)[] = [
                "nationalId", "firstName", "lastName", "email", "phoneNumber", "password",
                "dateOfBirth", "gender", "occupation", "region", "district", "address",
                "idType", "idNumber", "drivingLicenseNumber", "proofOfAddressType",
                "parentName", "parentNationalId", "parentPhone"
            ];
            fields.forEach(field => {
                const val = formData[field];
                if (val) formDataToSend.append(field, val.toString());
            });
            formDataToSend.append("agreeToTerms", String(formData.agreeToTerms));
            formDataToSend.append("isUnder18", String(formData.isUnder18));
            if (identityDocument) formDataToSend.append("identityDocument", identityDocument.file);
            if (proofOfAddressDocument) formDataToSend.append("proofOfAddressDocument", proofOfAddressDocument.file);
            if (portraitPhoto) formDataToSend.append("portraitPhoto", portraitPhoto.file);
            formDataToSend.append("stripeVerificationId", stripeVerificationId);
            formDataToSend.append("recaptchaToken", recaptchaToken);

            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5173'}/api/v1/auth/register`, {
                method: 'POST',
                body: formDataToSend,
                headers: { 'Accept': 'application/json' },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Registration failed");
            }

            const regData = await response.json() as RegistrationResponseData;
            setSuccessMessage("Registration successful! Your account is pending admin approval. You will be notified when your tax profile is created.");
            setTokens(regData.accessToken, regData.refreshToken);
            setTimeout(() => navigate("/dashboard?pending=true"), 2500);
        } catch (err: any) {
            setError(err.message || "Registration failed.");
            recaptchaRef.current?.reset();
            setRecaptchaToken(null);
        } finally {
            setIsSubmitting(false);
        }
    };

    const districts = formData.region ? DISTRICTS[formData.region] || [] : [];
    const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

    return (
        <section className="min-h-screen bg-white dark:bg-[#0A0E1A] pt-28 pb-20 px-4">
            <div className="max-w-3xl mx-auto">
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

                {successMessage && (
                    <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3 text-sm text-green-600 dark:text-green-400">
                        <CheckCircle size={18} className="shrink-0" />
                        <span>{successMessage}</span>
                    </div>
                )}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3 text-sm text-red-600 dark:text-red-400">
                        <AlertCircle size={18} className="shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="bg-white dark:bg-[#111627] border border-gray-200 dark:border-gray-700 rounded-2xl p-6 md:p-8 shadow-xl">
                    {/* STEP 1 – Personal Info */}
                    {step === 1 && (
                        <div className="space-y-5">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <User size={20} className="text-[#0F7B8C]" /> Personal Information
                            </h2>
                            <div>
                                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">National ID *</label>
                                <input
                                    type="text"
                                    value={formData.nationalId}
                                    onChange={(e) => updateField("nationalId", e.target.value)}
                                    placeholder="SL-2026-001"
                                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-[#0F7B8C] focus:ring-2 focus:ring-[#0F7B8C]/20"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Format: SL-YYYY-XXX (e.g., SL-2026-001)</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">First Name *</label>
                                    <input
                                        type="text"
                                        value={formData.firstName}
                                        onChange={(e) => updateField("firstName", e.target.value)}
                                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Last Name *</label>
                                    <input
                                        type="text"
                                        value={formData.lastName}
                                        onChange={(e) => updateField("lastName", e.target.value)}
                                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Date of Birth *</label>
                                    <input
                                        type="date"
                                        value={formData.dateOfBirth}
                                        onChange={(e) => updateField("dateOfBirth", e.target.value)}
                                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Gender</label>
                                    <select
                                        value={formData.gender}
                                        onChange={(e) => updateField("gender", e.target.value)}
                                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
                                    >
                                        <option value="">Select</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Occupation</label>
                                <select
                                    value={formData.occupation}
                                    onChange={(e) => updateField("occupation", e.target.value)}
                                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
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

                    {/* STEP 2 – Contact & Address */}
                    {step === 2 && (
                        <div className="space-y-5">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <MapPin size={20} className="text-[#0F7B8C]" /> Contact & Address
                            </h2>
                            <div>
                                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Email</label>
                                <div className="relative">
                                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => updateField("email", e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Phone Number *</label>
                                <div className="relative">
                                    <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="tel"
                                        value={formData.phoneNumber}
                                        onChange={(e) => updateField("phoneNumber", e.target.value)}
                                        placeholder="+252612345678"
                                        className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Format: +2526 followed by 8-9 digits</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Password *</label>
                                <div className="relative">
                                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={(e) => updateField("password", e.target.value)}
                                        className="w-full pl-11 pr-12 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Minimum 12 chars, uppercase, lowercase, symbol</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Confirm Password *</label>
                                <input
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={(e) => updateField("confirmPassword", e.target.value)}
                                    className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border rounded-xl ${formData.confirmPassword && formData.password !== formData.confirmPassword
                                        ? "border-red-500 focus:ring-red-500/20"
                                        : "border-gray-200 dark:border-gray-700 focus:border-[#0F7B8C]"
                                        }`}
                                />
                                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                                    <p className="text-xs text-red-500 mt-1">Passwords do not match.</p>
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Region</label>
                                    <select
                                        value={formData.region}
                                        onChange={(e) => {
                                            updateField("region", e.target.value);
                                            updateField("district", "");
                                        }}
                                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
                                    >
                                        <option value="">Select region</option>
                                        {REGIONS.map((r) => (
                                            <option key={r.value} value={r.value}>{r.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">District</label>
                                    <select
                                        value={formData.district}
                                        onChange={(e) => updateField("district", e.target.value)}
                                        disabled={!formData.region}
                                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl disabled:opacity-50"
                                    >
                                        <option value="">Select district</option>
                                        {districts.map((d) => (
                                            <option key={d} value={d.toLowerCase().replace(/\s+/g, "_")}>{d}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Address</label>
                                <textarea
                                    value={formData.address}
                                    onChange={(e) => updateField("address", e.target.value)}
                                    placeholder="Enter your full street address..."
                                    rows={2}
                                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl resize-none"
                                />
                            </div>
                        </div>
                    )}

                    {/* STEP 3 – Identity (Stripe + Document Uploads) */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <ShieldCheck size={20} className="text-[#0F7B8C]" /> Identity Verification & Documents
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                First, verify your identity with Stripe. Then upload the required documents.
                            </p>

                            {/* Stripe Identity Card */}
                            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-5">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Stripe Identity Verification</h3>
                                <div className="bg-gray-100/30 dark:bg-gray-800/30 rounded-lg p-4 text-center">
                                    {verificationStatus === "verified" ? (
                                        // Verified UI
                                        <div>
                                            <div className="w-12 h-12 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-2">
                                                <CheckCircle size={24} className="text-green-600" />
                                            </div>
                                            <p className="text-green-600 dark:text-green-400 font-medium">Identity Verified</p>
                                            <p className="text-xs text-gray-500">Your Stripe verification is complete.</p>
                                        </div>
                                    ) : verificationStatus === "processing" ? (
                                        // Processing UI
                                        <div>
                                            <div className="w-12 h-12 mx-auto rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-2">
                                                <Loader2 size={24} className="text-blue-500 animate-spin" />
                                            </div>
                                            <p className="text-blue-600 dark:text-blue-400 font-medium">Processing...</p>
                                            <p className="text-xs text-gray-500">Stripe is analyzing your documents.</p>
                                        </div>
                                    ) : verificationStatus === "requires_input" ? (
                                        // Requires input
                                        <div>
                                            <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-2">
                                                <AlertCircle size={24} className="text-amber-500" />
                                            </div>
                                            <p className="text-amber-600 dark:text-amber-400 font-medium">Action Required</p>
                                            <p className="text-xs text-gray-500 mb-2">Please complete the verification in the new tab.</p>
                                            <button onClick={handleStripeVerification} className="text-sm text-[#0F7B8C] hover:underline">Reopen</button>
                                        </div>
                                    ) : verificationStatus === "requires_action" || verificationStatus === "canceled" || verificationStatus === "failed" || verificationStatus === "expired" ? (
                                        // Failed/Error states
                                        <div>
                                            <div className="w-12 h-12 mx-auto rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-2">
                                                <AlertCircle size={24} className="text-red-500" />
                                            </div>
                                            <p className="text-red-600 dark:text-red-400 font-medium">
                                                {verificationStatus === "canceled" ? "Canceled" : verificationStatus === "expired" ? "Expired" : "Verification Failed"}
                                            </p>
                                            <p className="text-xs text-gray-500 mb-2">{verificationError || "Please try again with clear documents."}</p>
                                            <button onClick={handleStripeVerification} className="px-4 py-1 bg-[#0F7B8C] text-white rounded-lg text-sm">Retry</button>
                                        </div>
                                    ) : (
                                        // Initial state
                                        <div>
                                            <button
                                                onClick={handleStripeVerification}
                                                disabled={isVerifying}
                                                className="px-5 py-2 bg-[#0F7B8C] text-white rounded-lg disabled:opacity-50"
                                            >
                                                {isVerifying ? "Starting..." : "Start Stripe Verification"}
                                            </button>
                                            <p className="text-xs text-gray-500 mt-2">A new tab will open for you to upload your ID and take a selfie.</p>
                                        </div>
                                    )}
                                    {/* Manual refresh button and status display */}
                                    {stripeVerificationId && verificationStatus !== "verified" && (
                                        <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                                            <button onClick={refreshVerificationStatus} className="text-xs text-[#0F7B8C] hover:underline">
                                                Refresh Status
                                            </button>
                                            {verificationStatus && verificationStatus !== "verified" && (
                                                <p className="text-xs text-gray-500 mt-1">Current status: <span className="font-mono">{verificationStatus}</span></p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Document Uploads */}
                            <div className="space-y-4 mt-4">
                                <h3 className="font-semibold text-gray-900 dark:text-white">Required Documents</h3>

                                {/* Government ID */}
                                <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                        <ShieldCheck size={16} className="text-[#0F7B8C]" /> 1. Government ID (National ID/Passport) *
                                    </label>
                                    {!identityDocument ? (
                                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-[#0F7B8C] transition-colors">
                                            <div className="space-y-1 text-center">
                                                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                                <div className="flex text-sm text-gray-600 dark:text-gray-400">
                                                    <label className="relative cursor-pointer rounded-md font-medium text-[#0F7B8C] hover:text-[#3BA7BC]">
                                                        <span>Upload a file</span>
                                                        <input
                                                            type="file"
                                                            className="sr-only"
                                                            accept="image/jpeg,image/png,image/jpg,application/pdf"
                                                            onChange={(e) => handleFileUpload(e.target.files?.[0] || null, "identity")}
                                                        />
                                                    </label>
                                                    <p className="pl-1">or drag and drop</p>
                                                </div>
                                                <p className="text-xs text-gray-500">PNG, JPG, PDF up to 5MB</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                {identityDocument.type.startsWith("image/") ? (
                                                    <img src={identityDocument.preview} alt="preview" className="w-12 h-12 object-cover rounded" />
                                                ) : (
                                                    <File size={24} className="text-gray-500" />
                                                )}
                                                <div>
                                                    <p className="text-sm font-medium">{identityDocument.name}</p>
                                                    <p className="text-xs text-gray-500">{(identityDocument.size / 1024).toFixed(0)} KB</p>
                                                </div>
                                            </div>
                                            <button onClick={() => removeFile("identity")} className="text-red-500 hover:text-red-700">
                                                <X size={18} />
                                            </button>
                                        </div>
                                    )}
                                    {uploadErrors.identity && <p className="text-xs text-red-500 mt-1">{uploadErrors.identity}</p>}
                                </div>

                                {/* Proof of Address */}
                                <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                        <Home size={16} className="text-[#0F7B8C]" /> 2. Proof of Address *
                                    </label>
                                    <div className="mb-3">
                                        <select
                                            value={formData.proofOfAddressType}
                                            onChange={(e) => updateField("proofOfAddressType", e.target.value)}
                                            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                                        >
                                            {PROOF_OF_ADDRESS_TYPES.map((t) => (
                                                <option key={t.value} value={t.value}>{t.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    {!proofOfAddressDocument ? (
                                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-[#0F7B8C]">
                                            <div className="space-y-1 text-center">
                                                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                                <div className="flex text-sm text-gray-600">
                                                    <label className="relative cursor-pointer rounded-md font-medium text-[#0F7B8C]">
                                                        <span>Upload a file</span>
                                                        <input
                                                            type="file"
                                                            className="sr-only"
                                                            accept="image/jpeg,image/png,image/jpg,application/pdf"
                                                            onChange={(e) => handleFileUpload(e.target.files?.[0] || null, "proofOfAddress")}
                                                        />
                                                    </label>
                                                    <p className="pl-1">or drag and drop</p>
                                                </div>
                                                <p className="text-xs text-gray-500">PNG, JPG, PDF up to 5MB</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                {proofOfAddressDocument.type.startsWith("image/") ? (
                                                    <img src={proofOfAddressDocument.preview} alt="preview" className="w-12 h-12 object-cover rounded" />
                                                ) : (
                                                    <File size={24} className="text-gray-500" />
                                                )}
                                                <div>
                                                    <p className="text-sm font-medium">{proofOfAddressDocument.name}</p>
                                                    <p className="text-xs text-gray-500">{(proofOfAddressDocument.size / 1024).toFixed(0)} KB</p>
                                                </div>
                                            </div>
                                            <button onClick={() => removeFile("proofOfAddress")} className="text-red-500">
                                                <X size={18} />
                                            </button>
                                        </div>
                                    )}
                                    {uploadErrors.proofOfAddress && <p className="text-xs text-red-500 mt-1">{uploadErrors.proofOfAddress}</p>}
                                </div>

                                {/* Portrait Photo */}
                                <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                        <Image size={16} className="text-[#0F7B8C]" /> 3. Portrait Photo (Selfie) *
                                    </label>
                                    {!portraitPhoto ? (
                                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#0F7B8C]">
                                            <div className="space-y-1 text-center">
                                                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                                <div className="flex text-sm text-gray-600">
                                                    <label className="relative cursor-pointer rounded-md font-medium text-[#0F7B8C]">
                                                        <span>Upload a photo</span>
                                                        <input
                                                            type="file"
                                                            className="sr-only"
                                                            accept="image/jpeg,image/png,image/jpg"
                                                            onChange={(e) => handleFileUpload(e.target.files?.[0] || null, "portrait")}
                                                        />
                                                    </label>
                                                    <p className="pl-1">or drag and drop</p>
                                                </div>
                                                <p className="text-xs text-gray-500">JPG or PNG, up to 5MB</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <img src={portraitPhoto.preview} alt="portrait preview" className="w-12 h-12 object-cover rounded-full" />
                                                <div>
                                                    <p className="text-sm font-medium">{portraitPhoto.name}</p>
                                                    <p className="text-xs text-gray-500">{(portraitPhoto.size / 1024).toFixed(0)} KB</p>
                                                </div>
                                            </div>
                                            <button onClick={() => removeFile("portrait")} className="text-red-500">
                                                <X size={18} />
                                            </button>
                                        </div>
                                    )}
                                    {uploadErrors.portrait && <p className="text-xs text-red-500 mt-1">{uploadErrors.portrait}</p>}
                                </div>

                                {/* ID Document Details */}
                                <div className="border-t border-gray-200 pt-4 mt-2">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">ID Document Type</label>
                                        <select
                                            value={formData.idType}
                                            onChange={(e) => updateField("idType", e.target.value)}
                                            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 rounded-xl"
                                        >
                                            {ID_TYPES.map((t) => (
                                                <option key={t.value} value={t.value}>{t.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Document Number *</label>
                                        <input
                                            type="text"
                                            value={formData.idNumber}
                                            onChange={(e) => updateField("idNumber", e.target.value)}
                                            placeholder="Enter your ID/passport number"
                                            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 rounded-xl"
                                        />
                                    </div>
                                    {formData.idType === "driving_license" && (
                                        <div className="mt-4">
                                            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                                <Car size={16} className="text-[#0F7B8C]" /> Driving License Number *
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.drivingLicenseNumber}
                                                onChange={(e) => updateField("drivingLicenseNumber", e.target.value)}
                                                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 rounded-xl"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 4 – Agreements & Parental */}
                    {step === 4 && (
                        <div className="space-y-5">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <FileText size={20} className="text-[#0F7B8C]" /> Agreements & Parental Consent
                            </h2>
                            <div className="space-y-3">
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.agreeToTerms}
                                        onChange={(e) => updateField("agreeToTerms", e.target.checked)}
                                        className="mt-1 w-4 h-4 rounded border-gray-200 text-[#0F7B8C] focus:ring-[#0F7B8C]"
                                    />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        I agree to the <Link to="/terms" className="text-[#0F7B8C] hover:underline">Terms of Service</Link> and{" "}
                                        <Link to="/privacy" className="text-[#0F7B8C] hover:underline">Privacy Policy</Link>. *
                                    </span>
                                </label>
                            </div>
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-5">
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.isUnder18}
                                        onChange={(e) => updateField("isUnder18", e.target.checked)}
                                        className="mt-1 w-4 h-4 rounded border-gray-200 text-[#0F7B8C]"
                                    />
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">I am under 18 years old and need parental/guardian consent.</span>
                                </label>
                                {formData.isUnder18 && (
                                    <div className="mt-4 space-y-4 pl-7 border-l-2 border-amber-400 ml-2">
                                        <p className="text-sm text-amber-600 font-medium">Parent/Guardian Information Required</p>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-900 mb-2">Parent/Guardian Full Name *</label>
                                            <input
                                                type="text"
                                                value={formData.parentName}
                                                onChange={(e) => updateField("parentName", e.target.value)}
                                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-900 mb-2">Parent/Guardian National ID *</label>
                                            <input
                                                type="text"
                                                value={formData.parentNationalId}
                                                onChange={(e) => updateField("parentNationalId", e.target.value)}
                                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-900 mb-2">Parent/Guardian Phone</label>
                                            <input
                                                type="tel"
                                                value={formData.parentPhone}
                                                onChange={(e) => updateField("parentPhone", e.target.value)}
                                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* STEP 5 – Review & Submit (with reCAPTCHA at the end) */}
                    {step === 5 && (
                        <div className="space-y-5">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <CheckCircle size={20} className="text-[#10B981]" /> Review & Submit
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Review your information before submitting.</p>
                            <div className="space-y-3">
                                {[
                                    {
                                        label: "Personal Info",
                                        fields: [
                                            ["National ID", formData.nationalId],
                                            ["Name", `${formData.firstName} ${formData.lastName}`],
                                            ["DOB", formData.dateOfBirth || "—"],
                                            ["Age", formData.dateOfBirth ? `${calculateAge(formData.dateOfBirth)} years` : "—"],
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
                                        label: "Identity & Documents",
                                        fields: [
                                            ["Stripe Status", verificationStatus === "verified" ? "Verified" : "Not completed"],
                                            ["ID Type", formData.idType],
                                            ["Document Number", formData.idNumber],
                                            ["Proof of Address Type", formData.proofOfAddressType],
                                            ["Gov ID Uploaded", identityDocument ? "Yes" : "No"],
                                            ["Proof of Address Uploaded", proofOfAddressDocument ? "Yes" : "No"],
                                            ["Portrait Uploaded", portraitPhoto ? "Yes" : "No"],
                                        ],
                                    },
                                ].map((section, i) => (
                                    <div key={i} className="bg-gray-100/30 dark:bg-gray-800/30 rounded-xl p-4">
                                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">{section.label}</h3>
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

                            {/* reCAPTCHA placed here as requested */}
                            <div className="flex justify-center my-4">
                                <ReCAPTCHA
                                    ref={recaptchaRef}
                                    sitekey={recaptchaSiteKey}
                                    onChange={(token) => setRecaptchaToken(token)}
                                    onExpired={() => setRecaptchaToken(null)}
                                />
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting || !recaptchaToken || verificationStatus !== "verified"}
                                className="w-full py-4 bg-[#0F7B8C] hover:bg-[#3BA7BC] text-white font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <><Loader2 size={20} className="animate-spin" /> Submitting...</>
                                ) : (
                                    <><ShieldCheck size={20} /> Create My Account</>
                                )}
                            </button>
                            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                                After registration, your account will be pending admin approval. You will be notified when your tax profile is created.
                            </p>
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                        {step > 1 ? (
                            <button
                                onClick={handleBack}
                                className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-semibold rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                                <ArrowLeft size={16} /> Back
                            </button>
                        ) : (
                            <div />
                        )}
                        {step < TOTAL_STEPS ? (
                            <button
                                onClick={handleNext}
                                className="flex items-center gap-2 px-6 py-2.5 bg-[#0F7B8C] hover:bg-[#3BA7BC] text-white font-semibold rounded-xl"
                            >
                                Continue <ArrowRight size={16} />
                            </button>
                        ) : null}
                    </div>
                </div>

                <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
                    Already have an account?{" "}
                    <Link to="/login" className="text-[#0F7B8C] dark:text-[#3BA7BC] hover:underline font-semibold">
                        Sign In
                    </Link>
                </p>
            </div>
        </section>
    );
}