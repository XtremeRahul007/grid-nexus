export const AUTH_CONFIG = {
  apiBaseUrl:
    import.meta.env.VITE_API_BASE_URL ||
    (import.meta.env.DEV ? "http://localhost:5500" : window.location.origin),
  otpLength: 6,
  resendAfterSeconds: 5 * 60,
} as const;
