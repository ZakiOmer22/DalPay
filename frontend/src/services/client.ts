// web/src/services/client.ts
const API_BASE = '/api/v1';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  errors?: unknown;
}

export async function request<T = unknown>(
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

// ==================== TOKEN MANAGEMENT ====================

export function setTokens(
  accessToken: string,
  refreshToken?: string | null,
  user?: { fullName: string; role: string }
) {
  localStorage.setItem('dalpay_access_token', accessToken);

  if (refreshToken) {
    localStorage.setItem('dalpay_refresh_token', refreshToken);
  }

  if (user) {
    localStorage.setItem('dalpay_user', JSON.stringify(user));
  }

  window.dispatchEvent(new Event('dalpay-user-updated'));
}

export function clearTokens() {
  localStorage.removeItem('dalpay_access_token');
  localStorage.removeItem('dalpay_refresh_token');
  localStorage.removeItem('dalpay_user');
  localStorage.removeItem('dalpay_user_role');

  window.dispatchEvent(new Event('dalpay-user-updated'));
}

export function getAccessToken() {
  return localStorage.getItem('dalpay_access_token');
}

export function getUserRole(): string | null {
  const user = getUser();
  if (user) return user.role;
  return localStorage.getItem('dalpay_user_role');
}

export function getUser(): { fullName: string; role: string } | null {
  try {
    const raw = localStorage.getItem('dalpay_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
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