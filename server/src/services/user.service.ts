import type { Request } from "express";
import argon2id from "argon2";
import crypto from "crypto";
import * as userRepository from "../repositories/user.repository.js";
import { trackUserRegistration } from "../utils/trackUserRegistration.js";
import type { RegistrationUser } from "../validators/user.registration.validator.js";
import type { LoginUser } from "../validators/user.login.validator.js";
import AppError from "../core/AppError.js";
import { cookieTokenHash } from "../utils/cookieTokenHash.js";

export type UserWithHash = Omit<RegistrationUser, "password"> & {
  passwordHash: string;
};

export async function getUserName(userID: number) {
  const result = await userRepository.getUserName(userID);

  return result.username;
}

export async function loginUser(user: LoginUser): Promise<string> {
  const result = await userRepository.findUserCredentialsByEmail(user.email);
  if (!result) {
    throw new AppError("Invalid email or password", 401, "db_error");
  }

  const isPasswordValid = await argon2id.verify(
    result.password_hash,
    user.password,
  );

  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401, "db_error");
  }

  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = cookieTokenHash(token);

  await userRepository.createSession(result.id, tokenHash);

  return token;
}

export async function logoutUser(token: string) {
  const tokenHash = cookieTokenHash(token);

  await userRepository.deleteSession(tokenHash);
}

export async function registerUser(req: Request, user: RegistrationUser) {
  const passwordHash = await argon2id.hash(user.password);

  const userWithHash: UserWithHash = {
    email: user.email,
    passwordHash,
    username: user.username,
  };

  await userRepository.createUser(userWithHash);

  await trackUserRegistration(req, user.email, user.username);
}

export async function authenticateUserId(
  token: string,
): Promise<number | null> {
  const tokenHash = cookieTokenHash(token);

  const session = await userRepository.findUserIdBySession(tokenHash);

  return session != null ? session.user_id : null;
}

export async function updateSession(token: string) {
  const tokenHash = cookieTokenHash(token);

  await userRepository.updateSession(tokenHash);
}

export async function logoutAllSession(userID: number) {
  await userRepository.deleteAllSession(userID);
}
