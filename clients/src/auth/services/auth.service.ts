import { AUTH_CONFIG } from "../config/auth.config";
import {
  completeAuth,
  sendOtpRequest,
  verifyOtpRequest,
} from "../apis/api.main";
import type { AuthMode, AuthState } from "../types/auth.types";
import {
  getEmail,
  getOtpHint,
  getOtpInputs,
  getPassword,
  getSendOtp,
  getSubmit,
  getUsername,
} from "../utils/dom.utils";
import {
  clearOtpError,
  markOtpError,
  showStatus,
} from "../utils/ui.utils";
import { validateInput } from "../utils/validation.utils";

export const authState: Record<AuthMode, AuthState> = {
  signin: { otpSent: false, otpVerified: false, resendTimer: null, remaining: 0 },
  signup: { otpSent: false, otpVerified: false, resendTimer: null, remaining: 0 },
};

export function updateSubmitState(mode: AuthMode): void {
  getSubmit(mode).disabled = !authState[mode].otpVerified;
}

function formatTime(totalSeconds: number): string {
  return `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, "0")}`;
}

function startResendCountdown(mode: AuthMode): void {
  const state = authState[mode];
  const button = getSendOtp(mode);
  if (state.resendTimer !== null) clearInterval(state.resendTimer);

  state.remaining = AUTH_CONFIG.resendAfterSeconds;
  button.disabled = true;
  button.textContent = `Resend ${formatTime(state.remaining)}`;
  state.resendTimer = setInterval(() => {
    state.remaining -= 1;
    if (state.remaining <= 0) {
      if (state.resendTimer !== null) clearInterval(state.resendTimer);
      state.resendTimer = null;
      state.remaining = 0;
      button.disabled = false;
      button.textContent = "Resend OTP";
      getOtpHint(mode).textContent = "You can request another code now.";
      return;
    }
    button.textContent = `Resend ${formatTime(state.remaining)}`;
  }, 1000);
}

export async function requestOtp(mode: AuthMode): Promise<void> {
  const state = authState[mode];
  const email = getEmail(mode);
  const password = getPassword(mode);
  const username = mode === "signup" ? getUsername() : undefined;

  if (!validateInput(email)) {
    showStatus("Enter a valid email before requesting an OTP.", true);
    email.focus();
    return;
  }
  if (!validateInput(password)) {
    showStatus("Enter a valid password before requesting an OTP.", true);
    password.focus();
    return;
  }
  if (username && !validateInput(username)) {
    showStatus("Enter a valid username before requesting an OTP.", true);
    username.focus();
    return;
  }
  if (state.otpSent && state.remaining > 0) return;

  const button = getSendOtp(mode);
  button.disabled = true;
  button.textContent = "Sending…";
  try {
    const result = await sendOtpRequest(mode, {
      email: email.value.trim(),
      password: password.value,
      ...(username ? { username: username.value.trim() } : {}),
    });

    state.otpSent = true;
    state.otpVerified = false;
    updateSubmitState(mode);
    getOtpHint(mode).textContent = result.message ||
      "Code sent. You can request another code after 5 minutes.";
    showStatus(result.message || "OTP sent successfully.");
    startResendCountdown(mode);
    getOtpInputs(mode)[0]?.focus();
  } catch (error) {
    button.disabled = false;
    button.textContent = state.otpSent ? "Resend OTP" : "Send OTP";
    showStatus(
      error instanceof Error ? error.message : "Unable to send OTP.",
      true,
    );
  }
}

export async function verifyOtp(mode: AuthMode): Promise<void> {
  const state = authState[mode];
  const inputs = getOtpInputs(mode);
  const otp = inputs.map((input) => input.value).join("");
  const email = getEmail(mode);
  clearOtpError(mode);

  if (!state.otpSent) return markOtpError(mode, "Send an OTP first.");
  if (otp.length !== AUTH_CONFIG.otpLength) {
    return markOtpError(mode, "Please enter the complete 6-digit OTP.");
  }

  inputs.forEach((input) => (input.disabled = true));
  try {
    const result = await verifyOtpRequest(mode, email.value.trim(), otp);
    state.otpVerified = result.verified === true;
    if (!state.otpVerified) {
      throw new Error(result.message || "OTP verification failed.");
    }
    const wrap = document.getElementById(`${mode}OtpWrap`);
    wrap?.classList.remove("invalid");
    wrap?.classList.add("valid");
    getOtpHint(mode).textContent = result.message || "OTP verified successfully.";
    updateSubmitState(mode);
    showStatus("OTP verified. You can now submit.");
  } catch (error) {
    state.otpVerified = false;
    updateSubmitState(mode);
    markOtpError(
      mode,
      error instanceof Error ? error.message : "OTP verification failed.",
    );
    inputs.forEach((input) => (input.value = ""));
    inputs[0]?.focus();
  } finally {
    inputs.forEach((input) => (input.disabled = false));
  }
}

export async function submitAuth(mode: AuthMode): Promise<void> {
  const email = getEmail(mode);
  const password = getPassword(mode);
  const username = mode === "signup" ? getUsername() : undefined;
  const submit = getSubmit(mode);

  submit.disabled = true;
  try {
    const result = await completeAuth(mode, {
      email: email.value.trim(),
      password: password.value,
      ...(username ? { username: username.value.trim() } : {}),
    });
    showStatus(result.message || (mode === "signin" ? "Signed in successfully." : "Account created successfully."));
  } catch (error) {
    showStatus(
      error instanceof Error ? error.message : "Authentication failed.",
      true,
    );
    submit.disabled = false;
  }
}
