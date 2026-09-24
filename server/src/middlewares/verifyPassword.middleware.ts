import type { Request, Response, NextFunction } from "express";
import userPasswordSchema from "../validators/user.password.validator.js";
import { parseWithSchema } from "../utils/zodErrorHandler.js";

function verifyPassword(req: Request, _res: Response, next: NextFunction) {
  try {
    const { password } = parseWithSchema(userPasswordSchema, req.body);
    req.userPassword = password;
    next();
  } catch (err) {
    next(err);
  }
}

export default verifyPassword;
