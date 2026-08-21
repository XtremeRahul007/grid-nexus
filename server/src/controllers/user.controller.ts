import type { NextFunction, Request, Response } from "express";
import * as userService from "../services/user.service.js";
import registrationUserSchema, {
  type RegistrationUser,
} from "../validators/user.registration.validator.js";
import loginUserSchema, {
  type LoginUser,
} from "../validators/user.login.validator.js";

export async function getUsers(_: Request, res: Response, next: NextFunction) {
  try {
    const result = await userService.getUsersTable();
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function registerUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = registrationUserSchema.safeParse(req.body);

    if (!result.success) {
      throw result.error;
    }

    const user: RegistrationUser = result.data;

    await userService.registerUser(req, user);

    res.status(201).json({
      type: "user_registered_success",
      message: "User registered successfully",
    });
  } catch (err) {
    next(err);
  }
}

export async function loginUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = loginUserSchema.safeParse(req.body);

    if (!result.success) {
      throw result.error;
    }

    const user: LoginUser = result.data;

    await userService.loginUser(user);

    res.status(201).json({
      type: "user_logged_in_success",
      message: "User logged in successfully",
    });
  } catch (err) {
    next(err);
  }
}
