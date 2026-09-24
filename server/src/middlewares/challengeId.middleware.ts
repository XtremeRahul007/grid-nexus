import type { Request, Response, NextFunction } from "express";
import AppError from "../core/errors/AppError.js";

export function extractChallengeId(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = req.headers.cookie
      ?.split(";")
      .map((cookie) => cookie.trim())
      .find((cookie) => cookie.startsWith("challenge_id="))
      ?.slice("challenge_id=".length);

    if (!token) {
      return next(
        new AppError("Secure session expired. Please request a new code.", {
          statusCode: 401,
          code: "SESSION_EXPIRED",
        }),
      );
    }
    req.challenge_id = token;
    next();
  } catch (err) {
    next(err);
  }
}
