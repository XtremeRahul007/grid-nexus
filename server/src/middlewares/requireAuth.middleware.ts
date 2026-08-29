import type { Request, Response, NextFunction } from "express";
import AppError from "../core/AppError.js";

export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  try {
    if (req.userID == null) {
      throw new AppError("Authentication required", 401, "auth_error");
    }
    next();
  } catch (err) {
    next(err);
  }
}
