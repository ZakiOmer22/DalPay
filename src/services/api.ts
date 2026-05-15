// web/src/services/api.ts
const API_BASE = "/api/v1";

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  errors?: unknown;
}

export async function request<T = unknown>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const token = localStorage.getItem("dalpay_access_token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw {
      message: data.message || data.errors || "Something went wrong",
      status: response.status,
      data: data,
    };
  }

  return data;
}

// Auth API
export const authApi = {
  register: (data: RegisterPayload, turnstileToken: string) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ ...data, turnstileToken }),
    }),

  login: (data: {
    email?: string;
    phoneNumber?: string;
    nationalId?: string;
    password: string;
  }) =>
    request<{
      user: { id: string; fullName: string; role: string };
      accessToken: string;
    }>("/auth/login", { method: "POST", body: JSON.stringify(data) }),

  refreshToken: (refreshToken: string) =>
    request("/auth/refresh-token", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    }),

  logout: () => request("/auth/logout", { method: "POST" }),

  // ✅ NEW: Get logged‑in user’s profile (non‑sensitive data)
  getProfile: () =>
    request<{
      user: {
        id: string;
        fullName: string;
        role: string;
        emailVerified: boolean;
        phoneVerified: boolean;
        memberSince: string;
        region: string | null;
        district: string | null;
        occupation: string | null;
      };
    }>("/auth/profile"),
};

// Verification API (Stripe Identity)
export const verificationApi = {
  createSession: (data: {
    email?: string;
    firstName: string;
    lastName: string;
  }) =>
    request("/auth/verification/create", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  checkStatus: (sessionId: string) =>
    request(`/auth/verification/status/${sessionId}`),
};

// Tax API
export const taxApi = {
  getAssessments: () => request("/tax/assessments"),
  getAssessment: (id: string) => request(`/tax/assessments/${id}`),
  getAssessmentTypes: () => request("/tax/assessment-types"),
  getSummary: () => request("/tax/summary"),
};


// ==================== TOKEN MANAGEMENT ====================

export function setTokens(
  accessToken: string,
  refreshToken?: string | null,
  user?: { fullName: string; role: string },
) {
  localStorage.setItem("dalpay_access_token", accessToken);

  if (refreshToken) {
    localStorage.setItem("dalpay_refresh_token", refreshToken);
  }

  if (user) {
    localStorage.setItem("dalpay_user", JSON.stringify(user));
  }

  window.dispatchEvent(new Event("dalpay-user-updated"));
}

export function clearTokens() {
  localStorage.removeItem("dalpay_access_token");
  localStorage.removeItem("dalpay_refresh_token");
  localStorage.removeItem("dalpay_user");
  localStorage.removeItem("dalpay_user_role");

  window.dispatchEvent(new Event("dalpay-user-updated"));
}

export function getAccessToken() {
  return localStorage.getItem("dalpay_access_token");
}

export function getUserRole(): string | null {
  const user = getUser();
  if (user) return user.role;
  return localStorage.getItem("dalpay_user_role");
}

export function getUser(): { fullName: string; role: string } | null {
  try {
    const raw = localStorage.getItem("dalpay_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export const paymentApi = {
  getProviders: () => request("/payment/providers"),
  initiatePayment: (data: Record<string, unknown>) =>
    request("/payment/initiate", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  confirmPayment: (data: Record<string, unknown>) =>
    request("/payment/confirm", { method: "POST", body: JSON.stringify(data) }),
  getHistory: (page = 1, limit = 10) =>
    request(`/payment/history?page=${page}&limit=${limit}`),
  getStatus: (id: string) => request(`/payment/status/${id}`),
  getAllPaymentsAdmin: (page = 1, limit = 20) =>
    request(`/payment/admin/all?page=${page}&limit=${limit}`),
};

// Admin API
export const adminApi = {
  getTaxpayers: (params?: Record<string, string | number>) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) =>
        searchParams.set(k, String(v)),
      );
    }
    return request<{
      taxpayers: Taxpayer[];
      total: number;
      page: number;
      limit: number;
    }>(`/admin/taxpayers?${searchParams.toString()}`);
  },
  generateAssessments: (taxYear: number) =>
    request("/tax/assessments/generate", {
      method: "POST",
      body: JSON.stringify({ taxYear }),
    }),

  getTaxpayerDetail: (userId: string) =>
    request<TaxpayerDetail>(`/admin/taxpayers/${userId}`),
};


// Types used by admin API
export interface Taxpayer {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  national_id: string;
  region: string;
  district: string;
  occupation: string;
  monthly_income: number;
  property_value: number;
  verified: boolean;
  created_at: string;
}

export interface TaxpayerDetail {
  user: {
    id: string;
    full_name: string;
    phone: string;
    email: string;
    national_id: string;
    role: string;
    email_verified: boolean;
    phone_verified: boolean;
    created_at: string;
  };
  profile: {
    occupation: string;
    monthly_income: number;
    region: string;
    district: string;
    business_name?: string;
    business_type?: string;
    property_value: number;
    verified: boolean;
  } | null;
  taxSummary: {
    total_due: number;
    total_paid: number;
    pending: number;
    overdue: number;
    paid: number;
  };
  assessments: Assessment[];
  payments: Payment[];
  documents: Document[];
  disputes: Dispute[];
}

// (You may already have these types; if not, add them)
export interface Assessment {
  id: string;
  tax_type: string;
  amount: number;
  year: number;
  due_date: string;
  status: string;
}
export interface Payment {
  id: string;
  provider: string;
  amount: number;
  status: string;
  created_at: string;
}
export interface Document {
  id: string;
  document_type: string;
  verified: boolean;
}
export interface Dispute {
  id: string;
  reason: string;
  status: string;
}

// Types
export interface RegisterPayload {
  nationalId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber: string;
  password: string;
  dateOfBirth?: string;
  gender?: string;
  occupation?: string;
  region?: string;
  district?: string;
  address?: string;
  parentName?: string;
  parentNationalId?: string;
  parentPhone?: string;
  idType?: string;
  idNumber?: string;
  drivingLicenseNumber?: string;
  proofOfAddressType?: string;
  stripeVerificationId?: string;
  turnstileToken?: string;
}
