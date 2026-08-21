import type { Request, Response, NextFunction } from "express";
import crypto from "crypto";

export function requestIdMiddleware(
  req: Request,
  _: Response,
  next: NextFunction,
) {
  req.requestId = `ID-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
  req.timestamp = Date.now();
  next();
}
