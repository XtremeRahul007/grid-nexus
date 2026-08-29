import type { Request, Response, NextFunction } from "express";
import userPasswordSchema, {
  type UserPassword,
} from "../validators/user.password.validator.js";

function verifyPassword(req: Request, _res: Response, next: NextFunction) {
  try {
    const result = userPasswordSchema.safeParse(req.body);

    if (!result.success) {
      throw result.error;
    }

    const password: string = (result.data as UserPassword).password;
    req.userPassword = password;
    next();
  } catch (err) {
    next(err);
  }
}

export default verifyPassword;
