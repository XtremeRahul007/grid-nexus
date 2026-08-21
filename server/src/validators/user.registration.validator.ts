import { z } from "zod/mini";

const registrationUserSchema = z.strictObject({
  email: z.pipe(
    z
      .string()
      .check(
        z.trim(),
        z.minLength(6, "Email must be at least 6 characters"),
        z.maxLength(254, "Email must be at most 254 characters"),
        z.toLowerCase(),
      ),
    z.email("Invalid email address"),
  ),

  password: z
    .string()
    .check(
      z.minLength(8, "Password must be at least 8 characters"),
      z.maxLength(64, "Password must be at most 64 characters"),
      z.regex(/[a-z]/, "Password must contain a lowercase letter"),
      z.regex(/[A-Z]/, "Password must contain an uppercase letter"),
      z.regex(/[0-9]/, "Password must contain a number"),
      z.regex(/[^a-zA-Z0-9]/, "Password must contain a special character"),
    ),

  username: z
    .string()
    .check(
      z.trim(),
      z.minLength(3, "Username must be at least 3 characters"),
      z.maxLength(30, "Username must be at most 30 characters"),
      z.regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores",
      ),
    ),
});

export type RegistrationUser = z.infer<typeof registrationUserSchema>;

export default registrationUserSchema;
