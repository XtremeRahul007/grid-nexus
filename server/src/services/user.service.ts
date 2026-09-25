import type { Request } from "express";
import * as userRepository from "../repositories/user.repository.js";
import { trackUserRegistration } from "../utils/trackUserRegistration.js";
import type { RegistrationUser } from "../validators/user.registration.validator.js";
import type { LoginUser } from "../validators/user.login.validator.js";
import AppError from "../core/errors/AppError.js";
import { CryptoHandler, Argon2idHandler } from "../utils/cryptoHandler.js";
import crypto from "crypto";
import redisClient from "../database/redis.js";
import type { purpose } from "../@types/auth.types.js";

export type UserWithHash = Omit<RegistrationUser, "password"> & {
  passwordHash: string;
};

const cryptoHandler = new CryptoHandler();
const argon2idHandler = new Argon2idHandler();

export async function getUserName(userID: number) {
  const result = await userRepository.getUserName(userID);

  return result.username;
}

export async function loginUser(
  user: LoginUser,
  challenge_id: string | null,
): Promise<string> {
  const purpose = "login";

  await verifyEmail(challenge_id, purpose, user.email);

  const userResult = await userRepository.findUserCredentialsByEmail(
    user.email,
  );

  if (
    !userResult ||
    !(await argon2idHandler.verify(userResult.password_hash, user.password))
  ) {
    throw new AppError("Invalid email or password", {
      statusCode: 401,
      code: "INVALID_CREDENTIALS",
    });
  }

  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = cryptoHandler.hash(token);

  await userRepository.createSession(userResult.id, tokenHash);

  await redisClient.del(`otp:${purpose}:${user.email}`);
  return token;
}

export async function logoutUser(token: string) {
  const tokenHash = cryptoHandler.hash(token);

  await userRepository.deleteSession(tokenHash);
}

export async function registerUser(
  req: Request,
  user: RegistrationUser,
  challenge_id: string | null,
) {
  const purpose = "registration";

  await verifyEmail(challenge_id, purpose, user.email);

  const passwordHash = await argon2idHandler.hash(user.password);

  const userWithHash: UserWithHash = {
    email: user.email,
    passwordHash,
    username: user.username,
  };

  await userRepository.createUser(userWithHash);

  await redisClient.del(`otp:${purpose}:${user.email}`);
  await trackUserRegistration(req, user.email, user.username);
}

export async function authenticateUserId(
  token: string,
): Promise<number | null> {
  const tokenHash = cryptoHandler.hash(token);

  const session = await userRepository.findUserIdBySession(tokenHash);

  return session != null ? session.user_id : null;
}

export async function updateSession(token: string) {
  const tokenHash = cryptoHandler.hash(token);

  await userRepository.updateSession(tokenHash);
}

export async function logoutAllSession(userID: number) {
  await userRepository.deleteAllSession(userID);
}

export async function deleteAccount(userID: number, password: string) {
  const result = await userRepository.getUserPasswordHash(userID);

  const isPasswordValid = await argon2idHandler.verify(
    result.password_hash,
    password,
  );

  if (!isPasswordValid) {
    throw new AppError("Invalid password", {
      statusCode: 401,
      code: "INVALID_PASSWORD",
    });
  }

  await userRepository.deleteUser(userID);
}

async function verifyEmail(
  challenge_id: string | null,
  purpose: purpose,
  email: string,
) {
  if (challenge_id == null) {
    throw new AppError("Secure session expired. Please request a new code.", {
      statusCode: 404,
      code: "SESSION_EXPIRED",
    });
  }

  const challenge_id_hash = cryptoHandler.hash(challenge_id);

  const data = await redisClient.hGetAll(`otp:${purpose}:${email}`);
  const isVerified = data.verified === "true";

  if (!data.otp) {
    throw new AppError("No OTP found for this email. Request a new code.", {
      statusCode: 404,
      code: "NO_OTP_FOUND",
    });
  }

  if (data.token !== challenge_id_hash) {
    throw new AppError("Invalid challenge ID.", {
      statusCode: 400,
      code: "INVALID_CHALLENGE_ID",
    });
  }

  if (!isVerified) {
    throw new AppError("Email is not verified.", {
      statusCode: 409,
      code: "EMAIL_NOT_VERIFIED",
    });
  }
}
