import type { AuthMode } from "../types/auth.types";
import { AUTH_CONFIG } from "../config/auth.config";
import {
  forms,
  getElement,
  getOtpInputs,
  getSendOtp,
} from "../utils/dom.utils";
import { clearAllErrors, hideStatus, showStatus } from "../utils/ui.utils";
import { validateBasicFields, validateInput } from "../utils/validation.utils";
import {
  authState,
  requestOtp,
  submitAuth,
  updateSubmitState,
  verifyOtp,
} from "../services/auth.service";

const authModes: AuthMode[] = ["signin", "signup"];

function switchForm(target: string | undefined): void {
  if (target !== "signin" && target !== "signup") return;
  Object.values(forms).forEach((form) => form.classList.remove("active"));
  forms[target].classList.add("active");
  hideStatus();
  clearAllErrors();
}

function attachFormSwitchers(): void {
  document.querySelectorAll<HTMLButtonElement>(".switch-btn").forEach((button) => {
    button.addEventListener("click", () => switchForm(button.dataset.target));
  });
}

function attachPasswordToggles(): void {
  document.querySelectorAll<HTMLButtonElement>(".toggle-password").forEach((button) => {
    button.addEventListener("click", () => {
      const input = button.parentElement?.querySelector<HTMLInputElement>("input");
      if (!input) return;
      const visible = input.type === "text";
      input.type = visible ? "password" : "text";
      button.textContent = visible ? "Show" : "Hide";
      button.setAttribute("aria-label", visible ? "Show password" : "Hide password");
    });
  });
}

function attachFieldValidation(): void {
  document.querySelectorAll<HTMLInputElement>(".auth-form input").forEach((input) => {
    input.addEventListener("blur", () => {
      if (input.type !== "checkbox") validateInput(input);
    });
    input.addEventListener("input", () => {
      if (input.type !== "checkbox" && input.value.trim()) validateInput(input);
    });
  });
}

function attachTermsValidation(): void {
  const terms = getElement<HTMLInputElement>("signup-terms");
  const error = getElement<HTMLParagraphElement>("signup-terms-error");
  terms.addEventListener("change", () => {
    if (terms.checked) {
      error.textContent = "";
      error.classList.remove("show");
    } else {
      error.textContent = "Please accept the terms and privacy policy.";
      error.classList.add("show");
    }
  });
}

function attachLegalDialog(): void {
  const dialog = getElement<HTMLDialogElement>("legalDialog");
  const trigger = getElement<HTMLButtonElement>("termsPolicyTrigger");
  const closeButtons = [
    getElement<HTMLButtonElement>("legalDialogClose"),
    getElement<HTMLButtonElement>("legalDialogDone"),
  ];

  trigger.addEventListener("click", () => {
    dialog.showModal();
    closeButtons[0].focus();
  });
  closeButtons.forEach((button) => {
    button.addEventListener("click", () => dialog.close());
  });
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener("close", () => trigger.focus());
}

function attachOtpInputs(): void {
  authModes.forEach((mode) => {
    getSendOtp(mode).addEventListener("click", () => requestOtp(mode));
    const inputs = getOtpInputs(mode);
    inputs.forEach((input, index) => {
      input.addEventListener("input", async () => {
        input.value = input.value.replace(/\D/g, "").slice(-1);
        if (inputs.every((field) => field.value.length === 1)) {
          await verifyOtp(mode);
          return;
        }
        if (input.value && index < inputs.length - 1) inputs[index + 1].focus();
      });
      input.addEventListener("keydown", (event) => {
        if (event.key === "Backspace" && !input.value && index > 0) inputs[index - 1].focus();
        if (event.key === "ArrowLeft" && index > 0) inputs[index - 1].focus();
        if (event.key === "ArrowRight" && index < inputs.length - 1) inputs[index + 1].focus();
      });
      input.addEventListener("paste", (event) => {
        event.preventDefault();
        const pasted = (event.clipboardData?.getData("text") ?? "")
          .replace(/\D/g, "")
          .slice(0, AUTH_CONFIG.otpLength);
        pasted.split("").forEach((digit, digitIndex) => {
          if (inputs[digitIndex]) inputs[digitIndex].value = digit;
        });
        if (pasted.length === AUTH_CONFIG.otpLength) {
          void verifyOtp(mode);
        } else {
          inputs[Math.min(pasted.length, inputs.length - 1)]?.focus();
        }
      });
    });
  });
}

function attachSubmitHandlers(): void {
  forms.signin.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!authState.signin.otpVerified) {
      showStatus("Verify the OTP before signing in.", true);
      return;
    }
    if (!validateBasicFields("signin")) {
      showStatus("Please correct the highlighted fields.", true);
      return;
    }
    await submitAuth("signin");
  });

  forms.signup.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!authState.signup.otpVerified) {
      showStatus("Verify the OTP before creating your account.", true);
      return;
    }
    if (!validateBasicFields("signup")) {
      showStatus("Please correct the highlighted fields.", true);
      return;
    }
    await submitAuth("signup");
  });
}

export function initializeAuthPanel(): void {
  attachFormSwitchers();
  attachPasswordToggles();
  attachFieldValidation();
  attachTermsValidation();
  attachLegalDialog();
  attachOtpInputs();
  attachSubmitHandlers();
  authModes.forEach(updateSubmitState);
}
