import type { NextFunction, Request, Response } from "express";
import * as userService from "../services/user.service.js";
import loginUserSchema, {
  type LoginUser,
} from "../validators/user.login.validator.js";
import {
  registrationUserSchema,
  type RegistrationUser,
} from "../validators/user.registration.validator.js";
import { parseWithSchema } from "../utils/zodErrorHandler.js";
import { ApiResponse } from "../core/responses/ApiResponse.js";

export async function getUserName(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const username = await userService.getUserName(req.userID);
    return res
      .status(200)
      .json(
        ApiResponse.success(
          { type: "AUTHENTICATED_USER_NAME", username },
          "User name retrieved successfully",
          200,
        ),
      );
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
    const result = parseWithSchema(registrationUserSchema, req.body);

    const user = result as RegistrationUser;

    const challenge_id = req.challenge_id;

    await userService.registerUser(req, user, challenge_id);

    res.clearCookie("challenge_id", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });

    return res
      .status(201)
      .json(ApiResponse.success(null, "User registered successfully", 201));
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
    const result = parseWithSchema(loginUserSchema, req.body);

    const user = result as LoginUser;

    const challenge_id = req.challenge_id;

    const token = await userService.loginUser(user, challenge_id);

    res.cookie("session", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.clearCookie("challenge_id", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });

    return res
      .status(201)
      .json(ApiResponse.success(null, "User logged in successfully", 201));
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
      path: "/",
    });

    return res
      .status(201)
      .json(ApiResponse.success(null, "User logged out successfully", 201));
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
      path: "/",
    });

    return res
      .status(201)
      .json(
        ApiResponse.success(null, "User session updated successfully", 201),
      );
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
      path: "/",
    });

    return res
      .status(201)
      .json(
        ApiResponse.success(
          null,
          "All user sessions logged out successfully",
          201,
        ),
      );
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
      path: "/",
    });

    return res
      .status(201)
      .json(ApiResponse.success(null, "User deleted successfully", 201));
  } catch (err) {
    next(err);
  }
}
