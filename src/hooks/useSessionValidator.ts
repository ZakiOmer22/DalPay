// src/hooks/useSessionValidator.ts
import { useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { authApi, setTokens, getAccessToken, clearTokens } from "@/services/api";
import toast from "react-hot-toast";

const VALIDATION_INTERVAL = 10 * 60 * 1000;
const TOKEN_EXPIRY_BUFFER = 2 * 60 * 1000; // reduced to 2 min — 5 min was too aggressive

export function useSessionValidator() {
  const queryClient = useQueryClient();
  const warningShownRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isLoggedOutRef = useRef(false);
  const isCheckingRef = useRef(false);
  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Track consecutive failures before giving up
  const failureCountRef = useRef(0);
  const MAX_FAILURES = 3;

  const isTokenExpiring = useCallback((): boolean => {
    const token = getAccessToken();
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const timeUntilExpiry = payload.exp * 1000 - Date.now();
      return timeUntilExpiry <= TOKEN_EXPIRY_BUFFER;
    } catch {
      return true;
    }
  }, []);

  const isTokenFullyExpired = useCallback((): boolean => {
    const token = getAccessToken();
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }, []);

  const refreshAndRetry = useCallback(async (): Promise<boolean> => {
    const refreshToken = localStorage.getItem("dalpay_refresh_token");
    if (!refreshToken) return false;

    try {
      const response = (await authApi.refreshToken(refreshToken)) as any;
      const newAccessToken = response.data?.accessToken;
      const newRefreshToken = response.data?.refreshToken;

      if (newAccessToken) {
        const user = localStorage.getItem("dalpay_user");
        const parsedUser = user ? JSON.parse(user) : undefined;
        setTokens(newAccessToken, newRefreshToken, parsedUser);
        failureCountRef.current = 0; // reset on success
        return true;
      }
    } catch (error) {
      console.log('[Session] Token refresh failed:', error);
    }
    return false;
  }, []);

  const triggerLogout = useCallback((reason: string) => {
    if (isLoggedOutRef.current) return;

    console.log(`[Session] Logging out: ${reason}`);
    isLoggedOutRef.current = true;

    if (redirectTimeoutRef.current) clearTimeout(redirectTimeoutRef.current);

    queryClient.clear();
    clearTokens();

    const currentPath = window.location.pathname;
    const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password']
      .includes(currentPath);

    if (!isAuthPage) {
      sessionStorage.setItem("redirectAfterLogin", currentPath);
      toast.error("Your session has expired. Redirecting to login…", {
        id: "session-warning",
        duration: 4000,
      });
      redirectTimeoutRef.current = setTimeout(() => {
        window.location.href = "/login?expired=true";
      }, 2000);
    }
  }, [queryClient]);

  const checkSession = useCallback(async () => {
    if (isCheckingRef.current || isLoggedOutRef.current) return;

    const token = getAccessToken();

    // No token at all — but only log out if we're on a protected route
    if (!token) {
      const currentPath = window.location.pathname;
      const isProtected = currentPath.startsWith('/admin') ||
        currentPath.startsWith('/employee') ||
        currentPath.startsWith('/taxpayer');
      if (isProtected) {
        triggerLogout('no token on protected route');
      }
      return;
    }

    // Token is expiring soon — try to refresh proactively
    if (isTokenExpiring()) {
      console.log('[Session] Token expiring soon, refreshing proactively…');
      const refreshed = await refreshAndRetry();
      if (refreshed) return; // all good
      // If proactive refresh failed but token hasn't fully expired yet, don't log out yet
      if (!isTokenFullyExpired()) {
        console.log('[Session] Proactive refresh failed but token still valid, will retry');
        return;
      }
      // Token is fully expired and refresh failed
      triggerLogout('token expired and refresh failed');
      return;
    }

    // Token looks fine — do a lightweight server check
    isCheckingRef.current = true;
    try {
      await authApi.getProfile();
      failureCountRef.current = 0;
      if (warningShownRef.current) {
        warningShownRef.current = false;
        toast.dismiss("session-warning");
      }
    } catch (error: any) {
      if (error?.status === 401) {
        failureCountRef.current += 1;
        console.log(`[Session] 401 on profile check (attempt ${failureCountRef.current}/${MAX_FAILURES})`);

        // Try refresh before giving up
        const refreshed = await refreshAndRetry();
        if (refreshed) {
          failureCountRef.current = 0;
        } else if (failureCountRef.current >= MAX_FAILURES) {
          // Only log out after repeated failures — not on first 401
          triggerLogout(`${MAX_FAILURES} consecutive 401s`);
        } else {
          console.log('[Session] Will retry on next interval');
        }
      }
      // Non-401 errors (network, 500s) — don't log out, just skip
    } finally {
      isCheckingRef.current = false;
    }
  }, [queryClient, refreshAndRetry, isTokenExpiring, isTokenFullyExpired, triggerLogout]);

  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === "visible" && !isLoggedOutRef.current) {
      setTimeout(() => checkSession(), 1000);
    }
  }, [checkSession]);

  const handleOnline = useCallback(() => {
    if (!isLoggedOutRef.current) {
      toast.success("You're back online", { id: "connection-status", duration: 3000 });
      checkSession();
    }
  }, [checkSession]);

  const handleOffline = useCallback(() => {
    toast.error("You are offline. Some features may be unavailable.", {
      id: "connection-status",
      duration: Infinity,
    });
  }, []);

  const handleStorageChange = useCallback((e: StorageEvent) => {
    if (e.key === "dalpay_access_token" && !e.newValue && !isLoggedOutRef.current) {
      isLoggedOutRef.current = true;
      toast.error("You've been logged out from another tab.", {
        id: "session-warning",
        duration: 3000,
      });
      queryClient.clear();
      setTimeout(() => { window.location.href = "/login?expired=true"; }, 1500);
    }
  }, [queryClient]);

  useEffect(() => {
    const initialCheck = setTimeout(() => checkSession(), 2000);

    intervalRef.current = setInterval(() => {
      if (!isLoggedOutRef.current && document.visibilityState === "visible") {
        checkSession();
      }
    }, VALIDATION_INTERVAL);

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      clearTimeout(initialCheck);
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (redirectTimeoutRef.current) clearTimeout(redirectTimeoutRef.current);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [checkSession, handleVisibilityChange, handleOnline, handleOffline, handleStorageChange]);

  return { checkSession, isValid: !isLoggedOutRef.current };
}