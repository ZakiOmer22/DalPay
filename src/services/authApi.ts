import { request, type RegisterPayload } from './client';

export const authApi = {
  register: (data: RegisterPayload, turnstileToken: string) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify({ ...data, turnstileToken }) }),

  login: (data: { email?: string; phoneNumber?: string; nationalId?: string; password: string }) =>
    request<{
      user: { id: string; fullName: string; role: string };
      accessToken: string;
    }>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  refreshToken: (refreshToken: string) =>
    request('/auth/refresh-token', { method: 'POST', body: JSON.stringify({ refreshToken }) }),

  logout: () => request('/auth/logout', { method: 'POST' }),

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
    }>('/auth/profile'),
};