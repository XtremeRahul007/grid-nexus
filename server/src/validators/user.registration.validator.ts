import { z } from "zod";

const registrationUserSchema = z.strictObject({
  email: z.pipe(
    z
      .string()
      .trim()
      .min(6, "Email must be at least 6 characters")
      .max(254, "Email must be at most 254 characters")
      .toLowerCase(),
    z.email("Invalid email address"),
  ),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(64, "Password must be at most 64 characters")
    .regex(/[a-z]/, "Password must contain a lowercase letter")
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[0-9]/, "Password must contain a number")
    .regex(/[^a-zA-Z0-9]/, "Password must contain a special character"),

  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores",
    ),
});

const otpRegistrationSchema = registrationUserSchema.omit({
  password: true,
});

export type RegistrationUser = z.infer<typeof registrationUserSchema>;
export type OtpReq = z.infer<typeof otpRegistrationSchema>;

export { registrationUserSchema, otpRegistrationSchema };
