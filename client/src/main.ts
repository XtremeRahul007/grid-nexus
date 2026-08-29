import "./style.css";
import { z } from "zod/mini";

let responseContainer: HTMLTextAreaElement | null;
const IP = "http://192.168.0.7";
const PORT = "5500";

async function updateSession() {
  try {
    const response = await fetch(`${IP}:${PORT}/api/session`, {
      method: "GET",
      credentials: "include",
    });

    const data = await apiResponseJsonParse(response);

    if (responseContainer) {
      responseContainer.textContent = JSON.stringify(data, null, 2);
    }
  } catch (err) {
    console.error("Network or parsing error:", err);
  }
}

async function getUsersName() {
  const userName = document.querySelector<HTMLParagraphElement>("#userName");
  const showButton = document.querySelector<HTMLButtonElement>("#showUserName");

  if (!userName) return;

  try {
    showButton.addEventListener("click", async (e: Event) => {
      e.preventDefault();
      const response = await fetch(`${IP}:${PORT}/api/me`, {
        method: "GET",
        credentials: "include",
      });

      const data = await apiResponseJsonParse(response);
      if (userName && data.type === "authenticated_user_name") {
        return (userName!.textContent = `User Name: ${String(data.username)}`);
      }

      if (responseContainer) {
        responseContainer.value = JSON.stringify(data, null, 2);
      }
    });
  } catch (err) {
    console.error("Network or parsing error:", err);
  }
}

async function registerUser() {
  const form = document.querySelector<HTMLFormElement>("#register-form");
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
        const err = zodError(result.error);
        if (responseContainer)
          responseContainer.value = JSON.stringify(err, null, 2);
        return;
      }

      const response = await fetch(`${IP}:${PORT}/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(result.data),
      });

      const data = await apiResponseJsonParse(response);
      if (responseContainer)
        responseContainer.value = JSON.stringify(data, null, 2);
    });
  } catch (err) {
    console.error("Network or parsing error:", err);
  }
}

async function loginUser() {
  const form = document.querySelector<HTMLFormElement>("#login-form");
  const { default: loginUserSchema } =
    await import("../../server/src/validators/user.login.validator");
  try {
    form?.addEventListener("submit", async (e: Event) => {
      e.preventDefault();
      const formData = new FormData(form);

      const userData = {
        email: formData.get("email"),
        password: formData.get("password"),
      };

      const result = loginUserSchema.safeParse(userData);
      if (!result.success) {
        const err = zodError(result.error);
        if (responseContainer)
          responseContainer.value = JSON.stringify(err, null, 2);
        return;
      }

      const response = await fetch(`${IP}:${PORT}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
        credentials: "include",
      });

      const data = await apiResponseJsonParse(response);
      if (responseContainer) {
        responseContainer.value = JSON.stringify(data, null, 2);
      }

      if (response.ok) {
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    });
  } catch (err) {
    console.error("Network or parsing error:", err);
  }
}

async function logoutUser() {
  try {
    const logoutButton = document.getElementById(
      "logoutButton",
    ) as HTMLButtonElement;

    if (!logoutButton) return;
    logoutButton.addEventListener("click", async (e: Event) => {
      e.preventDefault();
      const response = await fetch(`${IP}:${PORT}/api/logout`, {
        method: "GET",
        credentials: "include",
      });

      const data = await apiResponseJsonParse(response);
      if (responseContainer) {
        responseContainer.value = JSON.stringify(data, null, 2);
      }

      if (response.ok) {
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    });
  } catch (err) {
    console.error("Network or parsing error:", err);
  }
}

async function logoutEverywhere() {
  try {
    const logoutEveryWhereButton = document.getElementById(
      "logoutEveryWhereButton",
    ) as HTMLButtonElement;

    if (!logoutEveryWhereButton) return;
    logoutEveryWhereButton.addEventListener("click", async (e: Event) => {
      e.preventDefault();
      const response = await fetch(`${IP}:${PORT}/api/logout-everywhere`, {
        method: "GET",
        credentials: "include",
      });

      const data = await apiResponseJsonParse(response);
      if (responseContainer) {
        responseContainer.value = JSON.stringify(data, null, 2);
      }

      if (response.ok) {
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    });
  } catch (err) {
    console.error("Network or parsing error:", err);
  }
}

async function deleteAccount() {
  const form = document.getElementById(
    "delete-account-form",
  ) as HTMLFormElement;
  const { default: userPasswordSchema } =
    await import("../../server/src/validators/user.password.validator");
  try {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData(form);

      const userData = { password: formData.get("password") };

      const result = userPasswordSchema.safeParse(userData);

      if (!result.success) {
        const err = zodError(result.error);
        if (responseContainer)
          responseContainer.value = JSON.stringify(err, null, 2);
        return;
      }

      const response = await fetch(`${IP}:${PORT}/api/account`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(result.data),
      });

      const data = await apiResponseJsonParse(response);
      if (responseContainer) {
        responseContainer.value = JSON.stringify(data, null, 2);
      }
    });
  } catch (err) {
    console.error("Network or parsing error:", err);
  }
}

async function apiResponseJsonParse(response: Response) {
  if (!response.ok) {
    console.error(`Request failed with status ${response.status}`);
  }

  const contentType = response.headers.get("content-type");

  if (!contentType || !contentType.includes("application/json"))
    return { error: "Failed to fetch" };
  return await response.json();
}

function zodError(err: any) {
  const flattenedErrors = z.flattenError(err);
  const { formErrors, fieldErrors } = flattenedErrors;
  return {
    type: "validation_error",
    errors: fieldErrors,
    formErrors: formErrors.length ? formErrors : undefined,
  };
}

async function runApp() {
  responseContainer = document.querySelector<HTMLTextAreaElement>(
    "#serverResponseContainer",
  );
  await updateSession();
  await getUsersName();
  await registerUser();
  await loginUser();
  await logoutUser();
  await logoutEverywhere();
  await deleteAccount();
}

document.addEventListener("DOMContentLoaded", async () => {
  runApp();
});
