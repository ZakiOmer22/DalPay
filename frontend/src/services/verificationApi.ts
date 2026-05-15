import { request } from './client';

export const verificationApi = {
  createSession: (data: { email?: string; firstName: string; lastName: string }) =>
    request('/auth/verification/create', { method: 'POST', body: JSON.stringify(data) }),

  checkStatus: (sessionId: string) =>
    request(`/auth/verification/status/${sessionId}`),
};