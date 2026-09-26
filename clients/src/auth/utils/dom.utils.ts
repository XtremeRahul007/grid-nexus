import type { AuthMode } from "../types/auth.types";

export function getElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Required element #${id} was not found.`);
  return element as T;
}

export const forms: Record<AuthMode, HTMLFormElement> = {
  signin: getElement<HTMLFormElement>("signInForm"),
  signup: getElement<HTMLFormElement>("signUpForm"),
};

export const status = getElement<HTMLDivElement>("status");

export function getEmail(mode: AuthMode): HTMLInputElement {
  return getElement<HTMLInputElement>(`${mode}-email`);
}

export function getPassword(mode: AuthMode): HTMLInputElement {
  return getElement<HTMLInputElement>(`${mode}-password`);
}

export function getUsername(): HTMLInputElement {
  return getElement<HTMLInputElement>("signup-username");
}

export function getSubmit(mode: AuthMode): HTMLButtonElement {
  return getElement<HTMLButtonElement>(`${mode}Submit`);
}

export function getSendOtp(mode: AuthMode): HTMLButtonElement {
  return getElement<HTMLButtonElement>(`${mode}SendOtp`);
}

export function getOtpWrap(mode: AuthMode): HTMLElement {
  return getElement<HTMLElement>(`${mode}OtpWrap`);
}

export function getOtpInputs(mode: AuthMode): HTMLInputElement[] {
  return Array.from(
    document.querySelectorAll<HTMLInputElement>(
      `[data-otp-group="${mode}"] input`,
    ),
  );
}

export function getOtpError(mode: AuthMode): HTMLParagraphElement {
  return getElement<HTMLParagraphElement>(`${mode}-otp-error`);
}

export function getOtpHint(mode: AuthMode): HTMLParagraphElement {
  return getElement<HTMLParagraphElement>(`${mode}OtpHint`);
}
