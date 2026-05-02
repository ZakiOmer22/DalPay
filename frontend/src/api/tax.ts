import { request } from './client';

export const taxApi = {
  getAssessments: () => request('/tax/assessments'),
  getAssessment: (id: string) => request(`/tax/assessments/${id}`),
  getAssessmentTypes: () => request('/tax/assessment-types'),
  getSummary: () => request('/tax/summary'),
};