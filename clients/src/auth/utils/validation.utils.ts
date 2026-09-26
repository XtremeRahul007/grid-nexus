import { getElement, forms } from "./dom.utils";
import { setFieldError, setFieldValid } from "./ui.utils";
import type { AuthMode } from "../types/auth.types";

export function validateInput(input: HTMLInputElement): boolean {
  const value = input.value.trim();
  if (!value) {
    setFieldError(
      input,
      `${input.labels?.[0]?.textContent || "This field"} is required.`,
    );
    return false;
  }
  if (input.type === "email" && !input.checkValidity()) {
    setFieldError(input, "Please enter a valid email address.");
    return false;
  }
  if (input.type === "password" && value.length < input.minLength) {
    setFieldError(input, `Password must be at least ${input.minLength} characters.`);
    return false;
  }
  if (input.id === "signup-password") {
    const requirements = [
      [/[a-z]/, "a lowercase letter"],
      [/[A-Z]/, "an uppercase letter"],
      [/[0-9]/, "a number"],
      [/[^a-zA-Z0-9]/, "a special character"],
    ] as const;
    const unmet = requirements.find(([pattern]) => !pattern.test(input.value));
    if (unmet) {
      setFieldError(input, `Password must contain ${unmet[1]}.`);
      return false;
    }
  }
  if (input.id === "signup-username" && !/^[a-zA-Z0-9_]{3,30}$/.test(value)) {
    setFieldError(input, "Use 3–30 letters, numbers, or underscores.");
    return false;
  }
  setFieldValid(input);
  return true;
}

export function validateBasicFields(mode: AuthMode): boolean {
  const form = forms[mode];
  let valid = true;
  form.querySelectorAll<HTMLInputElement>(".field input[required]").forEach((input) => {
    if (!validateInput(input)) valid = false;
  });

  if (mode === "signup") {
    const terms = getElement<HTMLInputElement>("signup-terms");
    const error = getElement<HTMLParagraphElement>("signup-terms-error");
    if (!terms.checked) {
      error.textContent = "Please accept the terms and privacy policy.";
      error.classList.add("show");
      valid = false;
    } else {
      error.textContent = "";
      error.classList.remove("show");
    }
  }
  return valid;
}
