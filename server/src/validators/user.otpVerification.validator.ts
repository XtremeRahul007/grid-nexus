import { z } from "zod";

const otpVerificationSchema = z.strictObject({
  email: z.pipe(
    z
      .string()
      .trim()
      .min(6, "Email must be at least 6 characters")
      .max(254, "Email must be at most 254 characters")
      .toLowerCase(),
    z.email("Invalid email address"),
  ),
  otp: z
    .string()
    .trim()
    .length(6, "OTP must be exactly 6 digits.")
    .regex(/^\d+$/, "OTP must contain only numbers."),
});

export type OtpVerification = z.infer<typeof otpVerificationSchema>;

export default otpVerificationSchema;
