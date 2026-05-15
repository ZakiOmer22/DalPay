import { request, type RegisterPayload } from "./client";

export const authApi = {
  register: (data: RegisterPayload) =>
    request("/auth/register", { method: "POST", body: JSON.stringify(data) }),

  login: (data: {
    email?: string;
    phoneNumber?: string;
    nationalId?: string;
    password: string;
  }) => request("/auth/login", { method: "POST", body: JSON.stringify(data) }),

  refreshToken: (refreshToken: string) =>
    request("/auth/refresh-token", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    }),

  logout: () => request("/auth/logout", { method: "POST" }),

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

  // Password reset OTP
  forgotPassword: (data: { email?: string; phoneNumber?: string }) =>
    request("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  resetPassword: (data: {
    email?: string;
    phoneNumber?: string;
    code: string;
    newPassword: string;
  }) =>
    request("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
