import { request, type RegisterPayload } from './client';

export const authApi = {
  register: (data: RegisterPayload) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  login: (data: { email?: string; phoneNumber?: string; nationalId?: string; password: string }) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  refreshToken: (refreshToken: string) =>
    request('/auth/refresh-token', { method: 'POST', body: JSON.stringify({ refreshToken }) }),

  logout: () => request('/auth/logout', { method: 'POST' }),
};