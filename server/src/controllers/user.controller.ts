import type { NextFunction, Request, Response } from "express";
import * as userService from "../services/user.service.js";
import registrationUserSchema, {
  type RegistrationUser,
} from "../validators/user.registration.validator.js";
import loginUserSchema, {
  type LoginUser,
} from "../validators/user.login.validator.js";
import userPasswordSchema, {
  type UserPassword,
} from "../validators/user.password.validator.js";

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
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      type: "user_login_success",
      message: "User logged in successfully",
    });
  } catch (err) {
    next(err);
  }
}

export async function logoutUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const token = req.cookieToken;
    if (token != null) await userService.logoutUser(token);

    res.clearCookie("session", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    return res.status(201).json({
      type: "user_logout_success",
      message: "User logged out successfully",
    });
  } catch (err) {
    next(err);
  }
}

export async function updateSession(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const token = req.cookieToken;
    await userService.updateSession(token);

    res.cookie("session", token, {
      httpOnly: true,
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "lax",
    });

    return res.status(201).json({
      type: "user_session_update_success",
      message: "User session updated successfully",
    });
  } catch (err) {
    next(err);
  }
}

export async function logoutAllSession(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userID = req.userID;
    await userService.logoutAllSession(userID);

    res.clearCookie("session", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    res.status(201).json({
      type: "user_all_sessions_logout_success",
      message: "All user sessions logged out successfully",
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userID = req.userID;
    await userService.deleteAccount(userID, req.userPassword);

    res.clearCookie("session", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    res.status(201).json({
      type: "user_delete_success",
      message: "User deleted successfully",
    });
  } catch (err) {
    next(err);
  }
}
