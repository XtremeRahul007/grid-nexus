import type { Request, Response, NextFunction } from "express";
import { authenticateUserId } from "../services/user.service.js";

async function verifySession(req: Request, _res: Response, next: NextFunction) {
  try {
    if (req.cookieToken == null) return next();
    const id = await authenticateUserId(req.cookieToken);

    if (id == null) return next();

    req.userID = id;
    next();
  } catch (err) {
    next(err);
  }
}

export default verifySession;
