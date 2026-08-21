import type { Request } from "express";
import argon2id from "argon2";
import * as userRepository from "../repositories/user.repository.js";
import { trackUserRegistration } from "../utils/trackUserRegistration.js";
import type { RegistrationUser } from "../validators/user.registration.validator.js";
import type { LoginUser } from "../validators/user.login.validator.js";
import AppError from "../core/AppError.js";

export type UserWithHash = Omit<RegistrationUser, "password"> & {
  passwordHash: string;
};

export async function getUsersTable() {
  return await userRepository.getUsersTable();
}

export async function loginUser(user: LoginUser) {
  const result = await userRepository.findUserByEmail(user.email);
  if (result.rowCount === 0) {
    throw new AppError("Invalid email or password", 401, "app_error");
  }

  const isPasswordValid = await argon2id.verify(
    result.passwordHash,
    user.password,
  );

  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401, "app_error");
  }
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
