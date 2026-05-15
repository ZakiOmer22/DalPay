export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  nationalId: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface DashboardSummary {
  // define fields you get from summary endpoint
  totalTaxDue?: number;
  paidThisYear?: number;
  // ...
}