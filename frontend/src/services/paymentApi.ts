import { request } from './client';

export const paymentApi = {
  getProviders: () => request('/payment/providers'),
  initiatePayment: (data: Record<string, unknown>) =>
    request('/payment/initiate', { method: 'POST', body: JSON.stringify(data) }),
  confirmPayment: (data: Record<string, unknown>) =>
    request('/payment/confirm', { method: 'POST', body: JSON.stringify(data) }),
  getHistory: (page = 1, limit = 10) =>
    request(`/payment/history?page=${page}&limit=${limit}`),
  getStatus: (id: string) => request(`/payment/status/${id}`),
};