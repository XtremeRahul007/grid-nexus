import "./style.css";
import { z } from "zod/mini";

async function getUsersList() {
  const userName = document.querySelector<HTMLParagraphElement>("#userName");

  if (!userName) return;

  try {
    const response = await fetch(`http://localhost:5500/api/`);

    if (!response.ok) {
      console.error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();
    if (userName) {
      userName!.textContent = JSON.stringify(data, null, 2);
    }
  } catch (error) {
    console.error("Network or parsing error:", error);
  }
}

async function registerUser() {
  const form = document.querySelector<HTMLFormElement>("#register-form");
  const responseContainer = document.querySelector<HTMLTextAreaElement>(
    "#serverResponseContainer",
  );
  const { default: registrationUserSchema } =
    await import("../../server/src/validators/user.registration.validator");

  try {
    form?.addEventListener("submit", async (e: Event) => {
      e.preventDefault();
      const fromData = new FormData(form);

      const userData = {
        email: fromData.get("email"),
        password: fromData.get("password"),
        username: fromData.get("username"),
      };

      const result = registrationUserSchema.safeParse(userData);

      if (!result.success) {
        const flattenedErrors = z.flattenError(result.error);
        const { formErrors, fieldErrors } = flattenedErrors;
        if (responseContainer)
          responseContainer.value = JSON.stringify(
            {
              type: "validation_error",
              errors: fieldErrors,
              formErrors: formErrors.length ? formErrors : undefined,
            },
            null,
            2,
          );
        return;
      }

      const response = await fetch(`http://localhost:5500/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(result.data),
      });

      if (!response.ok) {
        console.error(`Request failed with status ${response.status}`);
      }

      const data = await response.json();
      if (responseContainer)
        responseContainer.value = JSON.stringify(data, null, 2);
    });
  } catch (err) {
    console.error("Network or parsing error:", err);
  }
}

async function loginUser() {
  const form = document.querySelector<HTMLFormElement>("#login-form");
  const responseContainer = document.querySelector<HTMLTextAreaElement>(
    "#serverResponseContainer",
  );
  try {
    form?.addEventListener("submit", async (e: Event) => {
      e.preventDefault();
      const formData = new FormData(form);

      const result = {
        email: formData.get("email"),
        password: formData.get("password"),
      };

      const response = await fetch("http://localhost:5500/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result),
      });

      if (!response.ok) {
        console.error(`Request failed with status ${response.status}`);
      }

      const data = await response.json();
      if (responseContainer)
        responseContainer.value = JSON.stringify(data, null, 2);
    });
  } catch (err) {
    console.error("Network or parsing error:", err);
  }
}

async function runApp() {
  await getUsersList();
  await registerUser();
  await loginUser();
}

document.addEventListener("DOMContentLoaded", async () => {
  runApp();
});
