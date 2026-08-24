import type { NextFunction, Request, Response } from "express";
import * as userService from "../services/user.service.js";
import registrationUserSchema, {
  type RegistrationUser,
} from "../validators/user.registration.validator.js";
import loginUserSchema, {
  type LoginUser,
} from "../validators/user.login.validator.js";

export async function getUserName(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const username = await userService.getUserName(req.userID);
    return res.status(200).json({ type: "authenticated_user_name", username });
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

    return res.status(201).json({
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

    const token = await userService.loginUser(user);

    res.cookie("session", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      type: "user_logged_in_success",
      message: "User logged in successfully",
    });
  } catch (err) {
    next(err);
  }
}
