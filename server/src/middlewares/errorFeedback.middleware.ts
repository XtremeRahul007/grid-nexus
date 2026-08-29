import type { NextFunction } from "express";
import type { Request, Response } from "express";
import pg, { DatabaseError } from "pg";
import { ZodError } from "zod";
import * as z from "zod";
import AppError from "../core/AppError.js";

function errorFeedbackHandler(
  err: Error,
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  if (err instanceof pg.DatabaseError) {
    postgreSQLErrorFeedback(err, res);
  } else if (err instanceof ZodError) {
    zodErrorFeedback(err, res);
  } else if (err instanceof AppError) {
    appErrorFeedback(err, res);
  } else {
    nodeErrorFeedback(err, res);
  }
  return next(err);
}

function postgreSQLErrorFeedback(err: DatabaseError, res: Response) {
  switch (err.code) {
    case "23505":
      switch (err.constraint) {
        case "users_email_key":
          return res.status(409).json({
            type: "db_error",
            message: "Email already exists",
          });
        case "users_username_lower_unique":
          return res.status(409).json({
            type: "db_error",
            message: "Username already exists",
          });
        default:
          return res.status(409).json({
            type: "db_error",
            message: "Resource already exists",
          });
      }
    default:
      res.status(500).json({ error: "Internal server error" });
  }
}

function zodErrorFeedback(err: ZodError, res: Response) {
  const flattenedErrors = z.flattenError(err);
  const { formErrors, fieldErrors } = flattenedErrors;
  return res.status(400).json({
    type: "validation_error",
    errors: fieldErrors,
    formErrors: formErrors.length ? formErrors : undefined,
  });
}

function appErrorFeedback(err: AppError, res: Response) {
  return res.status(err.statusCode).json({
    type: err.type,
    error: err.message,
  });
}

function nodeErrorFeedback(_err: Error, res: Response) {
  return res.status(500).json({
    type: "server_error",
    error: "Internal server error",
  });
}

export default errorFeedbackHandler;
