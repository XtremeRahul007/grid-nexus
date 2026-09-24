import type { Request, Response, NextFunction } from "express";
import AppError from "../core/errors/AppError.js";

export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  try {
    if (req.userID == null) {
      throw new AppError("Authentication required", {
        statusCode: 401,
        code: "AUTH_REQUIRED",
      });
    }
    next();
  } catch (err) {
    next(err);
  }
}
