import { request } from './client';

export const paymentApi = {
  getProviders: () => request('/payment/providers'),
  initiatePayment: (data: any) => request('/payment/initiate', { method: 'POST', body: JSON.stringify(data) }),
  confirmPayment: (data: any) => request('/payment/confirm', { method: 'POST', body: JSON.stringify(data) }),
  getHistory: (page = 1, limit = 10) => request(`/payment/history?page=${page}&limit=${limit}`),
  getStatus: (id: string) => request(`/payment/status/${id}`),
};