export type AuthMode = "signin" | "signup";

export type AuthState = {
  otpSent: boolean;
  otpVerified: boolean;
  resendTimer: ReturnType<typeof setInterval> | null;
  remaining: number;
};

export type OtpResponse = {
  success: boolean;
  verified?: boolean;
  message?: string;
};

export interface ApiResponse<T> {
  success: boolean;
  status: number;
  message: string;
  data: T | null;
  error: ResponseError | null;
}

export interface ResponseError {
  code: string;
  details?: unknown;
  fields?: Record<string, string>;
}
