import type { Request, Response, NextFunction } from "express";

function cookieAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = req.headers.cookie
      ?.split(";")
      .map((cookie) => cookie.trim())
      .find((cookie) => cookie.startsWith("session="))
      ?.slice("session=".length);

    if (token == null) return next();

    req.cookieToken = token;
    next();
  } catch (err) {
    next(err);
  }
}

export default cookieAuth;
