import { getOtpError, getOtpWrap, status } from "./dom.utils";
import type { AuthMode } from "../types/auth.types";

export function showStatus(message: string, isError = false): void {
  status.textContent = message;
  status.classList.toggle("error", isError);
  status.classList.add("show");
}

export function hideStatus(): void {
  status.textContent = "";
  status.classList.remove("show", "error");
}

export function shake(element: HTMLElement | null): void {
  if (!element) return;
  element.classList.remove("shake");
  void element.offsetWidth;
  element.classList.add("shake");
  setTimeout(() => element.classList.remove("shake"), 400);
}

export function setFieldError(input: HTMLInputElement, message: string): void {
  const wrap = input.closest<HTMLElement>(".input-wrap");
  const error = document.getElementById(`${input.id}-error`);

  wrap?.classList.remove("valid");
  wrap?.classList.add("invalid");
  if (error) {
    error.textContent = message;
    error.classList.add("show");
  }
  shake(wrap || input);
}

export function setFieldValid(input: HTMLInputElement): void {
  const wrap = input.closest<HTMLElement>(".input-wrap");
  const error = document.getElementById(`${input.id}-error`);

  wrap?.classList.remove("invalid");
  if (input.value.trim()) wrap?.classList.add("valid");
  if (error) {
    error.textContent = "";
    error.classList.remove("show");
  }
}

export function clearAllErrors(): void {
  document.querySelectorAll(".input-wrap, .otp-input-wrap").forEach((el) => {
    el.classList.remove("invalid", "valid");
  });
  document.querySelectorAll(".field-error").forEach((el) => {
    el.textContent = "";
    el.classList.remove("show");
  });
}

export function markOtpError(mode: AuthMode, message: string): void {
  const wrap = getOtpWrap(mode);
  const error = getOtpError(mode);
  wrap.classList.remove("valid");
  wrap.classList.add("invalid");
  error.textContent = message;
  error.classList.add("show");
  shake(wrap);
}

export function clearOtpError(mode: AuthMode): void {
  const wrap = getOtpWrap(mode);
  const error = getOtpError(mode);
  wrap.classList.remove("invalid");
  error.textContent = "";
  error.classList.remove("show");
}
