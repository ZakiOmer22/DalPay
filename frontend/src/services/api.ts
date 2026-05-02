// web/src/services/api.ts
const API_BASE = '/api/v1';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  errors?: any;
}

// ★ Export the function so other files can use it directly
export async function request<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = localStorage.getItem('dalpay_access_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw {
      message: data.message || data.errors || 'Something went wrong',
      status: response.status,
      data: data,
    };
  }

  return data;
}

// Auth API
export const authApi = {
  register: (data: RegisterPayload) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  login: (data: { email?: string; phoneNumber?: string; nationalId?: string; password: string }) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  refreshToken: (refreshToken: string) =>
    request('/auth/refresh-token', { method: 'POST', body: JSON.stringify({ refreshToken }) }),

  logout: () => request('/auth/logout', { method: 'POST' }),
};

// Verification API (Stripe Identity)
export const verificationApi = {
  createSession: (data: { email?: string; firstName: string; lastName: string }) =>
    request('/auth/verification/create', { method: 'POST', body: JSON.stringify(data) }),

  checkStatus: (sessionId: string) =>
    request(`/auth/verification/status/${sessionId}`),
};

// Tax API
export const taxApi = {
  getAssessments: () => request('/tax/assessments'),
  getAssessment: (id: string) => request(`/tax/assessments/${id}`),
  getAssessmentTypes: () => request('/tax/assessment-types'),
  getSummary: () => request('/tax/summary'),
};

// Payment API
export const paymentApi = {
  getProviders: () => request('/payment/providers'),
  initiatePayment: (data: any) => request('/payment/initiate', { method: 'POST', body: JSON.stringify(data) }),
  confirmPayment: (data: any) => request('/payment/confirm', { method: 'POST', body: JSON.stringify(data) }),
  getHistory: (page = 1, limit = 10) => request(`/payment/history?page=${page}&limit=${limit}`),
  getStatus: (id: string) => request(`/payment/status/${id}`),
};

// Token management
export function setTokens(accessToken: string, refreshToken: string, role?: string) {
  localStorage.setItem('dalpay_access_token', accessToken);
  localStorage.setItem('dalpay_refresh_token', refreshToken);
  if (role) localStorage.setItem('dalpay_user_role', role);
}

export function clearTokens() {
  localStorage.removeItem('dalpay_access_token');
  localStorage.removeItem('dalpay_refresh_token');
  localStorage.removeItem('dalpay_user_role');
}

export function getAccessToken() {
  return localStorage.getItem('dalpay_access_token');
}

export function getUserRole(): string | null {
  return localStorage.getItem('dalpay_user_role');
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
}