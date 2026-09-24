import type { Request } from "express";
import argon2id from "argon2";
import crypto from "crypto";
import * as userRepository from "../repositories/user.repository.js";
import { trackUserRegistration } from "../utils/trackUserRegistration.js";
import type { RegistrationUser } from "../validators/user.registration.validator.js";
import type { LoginUser } from "../validators/user.login.validator.js";
import AppError from "../core/errors/AppError.js";
import { sha256Hasher } from "../utils/sha256Hasher.js";
import * as otpRepository from "../repositories/otp.repository.js";

export type UserWithHash = Omit<RegistrationUser, "password"> & {
  passwordHash: string;
};

export async function getUserName(userID: number) {
  const result = await userRepository.getUserName(userID);

  return result.username;
}

export async function loginUser(
  user: LoginUser,
  challenge_id: string | null,
): Promise<string> {
  const purpose = "login";

  if (challenge_id == null) {
    throw new AppError("Secure session expired. Please request a new code.", {
      statusCode: 404,
      code: "SESSION_EXPIRED",
    });
  }

  const otpResult = await otpRepository.checkEmailVerified(
    user.email,
    purpose,
    sha256Hasher(challenge_id),
  );

  if (!otpResult) {
    throw new AppError("No OTP found for this email. Request a new code.", {
      statusCode: 404,
      code: "NO_OTP_FOUND",
    });
  }

  if (!otpResult.verified) {
    throw new AppError("Email is not verified.", {
      statusCode: 409,
      code: "EMAIL_NOT_VERIFIED",
    });
  }

  const userResult = await userRepository.findUserCredentialsByEmail(
    user.email,
  );
  if (
    !userResult ||
    !(await argon2id.verify(userResult.password_hash, user.password))
  ) {
    throw new AppError("Invalid email or password", {
      statusCode: 401,
      code: "INVALID_CREDENTIALS",
    });
  }

  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = sha256Hasher(token);

  await userRepository.createSession(userResult.id, tokenHash);

  await otpRepository.deleteOtpRecord(user.email, purpose, challenge_id);
  return token;
}

export async function logoutUser(token: string) {
  const tokenHash = sha256Hasher(token);

  await userRepository.deleteSession(tokenHash);
}

export async function registerUser(
  req: Request,
  user: RegistrationUser,
  challenge_id: string | null,
) {
  const purpose = "registration";

  if (challenge_id == null) {
    throw new AppError("Secure session expired. Please request a new code.", {
      statusCode: 404,
      code: "SESSION_EXPIRED",
    });
  }

  const otpResult = await otpRepository.checkEmailVerified(
    user.email,
    purpose,
    sha256Hasher(challenge_id),
  );

  if (!otpResult) {
    throw new AppError("No OTP found for this email. Request a new code.", {
      statusCode: 404,
      code: "NO_OTP_FOUND",
    });
  }

  if (!otpResult.verified) {
    throw new AppError("Email is not verified.", {
      statusCode: 409,
      code: "EMAIL_NOT_VERIFIED",
    });
  }

  const passwordHash = await argon2id.hash(user.password);

  const userWithHash: UserWithHash = {
    email: user.email,
    passwordHash,
    username: user.username,
  };

  await userRepository.createUser(userWithHash);

  await otpRepository.deleteOtpRecord(user.email, purpose, challenge_id);
  await trackUserRegistration(req, user.email, user.username);
}

export async function authenticateUserId(
  token: string,
): Promise<number | null> {
  const tokenHash = sha256Hasher(token);

  const session = await userRepository.findUserIdBySession(tokenHash);

  return session != null ? session.user_id : null;
}

export async function updateSession(token: string) {
  const tokenHash = sha256Hasher(token);

  await userRepository.updateSession(tokenHash);
}

export async function logoutAllSession(userID: number) {
  await userRepository.deleteAllSession(userID);
}

export async function deleteAccount(userID: number, password: string) {
  const result = await userRepository.getUserPasswordHash(userID);

  const isPasswordValid = await argon2id.verify(result.password_hash, password);

  if (!isPasswordValid) {
    throw new AppError("Invalid password", {
      statusCode: 401,
      code: "INVALID_PASSWORD",
    });
  }

  await userRepository.deleteUser(userID);
}
