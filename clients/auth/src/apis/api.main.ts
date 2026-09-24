import { AUTH_CONFIG } from "../config/auth.config";
import type { AuthMode, OtpResponse } from "../types/auth.types";

interface ApiError {
  code: string;
  details?: unknown;
}

interface ApiResponse<T> {
  success: boolean;
  status: number;
  message: string;
  data: T | null;
  error: ApiError | null;
}

export interface AuthCredentials {
  email: string;
  password: string;
  username?: string;
}

const API_BASE_URL = AUTH_CONFIG.apiBaseUrl.replace(/\/$/, "");

function validationMessage(details: unknown): string | undefined {
  if (!details || typeof details !== "object") return undefined;
  const detailRecord = details as {
    formError?: unknown;
    fields?: Record<string, unknown>;
  };
  if (typeof detailRecord.formError === "string") return detailRecord.formError;
  const firstFieldError = Object.values(detailRecord.fields ?? {}).flatMap((errors) =>
    Array.isArray(errors) ? errors : [],
  )[0];
  return typeof firstFieldError === "string" ? firstFieldError : undefined;
}

async function post<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Unable to reach the authentication server.");
  }

  let result: ApiResponse<T>;
  try {
    result = (await response.json()) as ApiResponse<T>;
  } catch {
    throw new Error("The authentication server returned an invalid response.");
  }

  if (!response.ok || !result.success) {
    const message = validationMessage(result.error?.details) ?? result.message;
    throw new Error(message || `Authentication request failed (${response.status}).`);
  }
  return result;
}

export async function sendOtpRequest(
  mode: AuthMode,
  credentials: AuthCredentials,
): Promise<OtpResponse> {
  const endpoint = mode === "signin"
    ? "/api/login/request-otp"
    : "/api/register/request-otp";
  const body = mode === "signin"
    ? { email: credentials.email, password: credentials.password }
    : { email: credentials.email, username: credentials.username };
  const response = await post<null>(endpoint, body);
  return { success: response.success, message: response.message };
}

export async function verifyOtpRequest(
  mode: AuthMode,
  email: string,
  otp: string,
): Promise<OtpResponse> {
  const endpoint = mode === "signin"
    ? "/api/login/verify-otp"
    : "/api/register/verify-otp";
  const response = await post<null>(endpoint, { email, otp });
  return {
    success: response.success,
    verified: response.success,
    message: response.message,
  };
}

export async function completeAuth(
  mode: AuthMode,
  credentials: AuthCredentials,
): Promise<OtpResponse> {
  const endpoint = mode === "signin" ? "/api/login" : "/api/register";
  const body = mode === "signin"
    ? { email: credentials.email, password: credentials.password }
    : {
        email: credentials.email,
        password: credentials.password,
        username: credentials.username,
      };
  const response = await post<null>(endpoint, body);
  return { success: response.success, message: response.message };
}
