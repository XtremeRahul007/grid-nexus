import type { NextFunction } from "express";
import type { Request, Response } from "express";
import pg, { DatabaseError } from "pg";
import AppError from "../core/errors/AppError.js";
import type { NodemailerError } from "../@types/auth.types.js";
import { ApiResponse } from "../core/responses/ApiResponse.js";

function errorFeedbackHandler(
  err: Error,
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  if (res.headersSent) return next(err);

  if (err instanceof pg.DatabaseError) {
    return postgreSQLErrorFeedback(err, res);
  }
  if (err instanceof AppError) {
    return appErrorFeedback(err, res);
  }
  if (isNodemailerError(err)) {
    return smtpError(err, res);
  }
  return nodeErrorFeedback(err, res);
}

function postgreSQLErrorFeedback(err: DatabaseError, res: Response) {
  switch (err.code) {
    case "23505":
      switch (err.constraint) {
        case "users_email_key":
          return res
            .status(409)
            .json(ApiResponse.error("Email already exists", "DB_ERROR", 409));
        case "users_username_lower_unique":
          return res
            .status(409)
            .json(
              ApiResponse.error("Username already exists", "DB_ERROR", 409),
            );
        default:
          return res
            .status(409)
            .json(
              ApiResponse.error("Resource already exists", "DB_ERROR", 409),
            );
      }
    default:
      return res
        .status(500)
        .json(ApiResponse.error("Internal server error", "DEFAULT", 500));
  }
}

function appErrorFeedback(err: AppError, res: Response) {
  return res
    .status(err.statusCode)
    .json(
      ApiResponse.error(err.message, err.code, err.statusCode, err.details),
    );
}

function nodeErrorFeedback(_err: Error, res: Response) {
  return res
    .status(500)
    .json(ApiResponse.error("Internal server error", "DEFAULT", 500));
}

function isNodemailerError(err: Error): err is NodemailerError {
  return ["ECONNECTION", "ETIMEDOUT", "EAUTH", "EENVELOPE"].includes(
    (err as NodemailerError).code ?? "",
  );
}

function smtpError(err: NodemailerError, res: Response) {
  const status = err.responseCode ?? 500;
  switch (err.code) {
    case "ECONNECTION":
      return res
        .status(status)
        .json(
          ApiResponse.error(
            "Unable to reach the mail server. Please try again later.",
            "ECONNECTION",
            status,
          ),
        );
    case "ETIMEDOUT":
      return res
        .status(status)
        .json(
          ApiResponse.error(
            "Connection to the mail server timed out. Please try again later.",
            "ETIMEDOUT",
            status,
          ),
        );
    case "EAUTH":
      return res
        .status(status)
        .json(
          ApiResponse.error(
            "Failed to send email due to a mail service configuration issue.",
            "EAUTH",
            status,
          ),
        );
    case "EENVELOPE":
      return res
        .status(status)
        .json(
          ApiResponse.error(
            "Invalid email recipient or sender address format.",
            "EENVELOPE",
            status,
          ),
        );
    default:
      return res
        .status(500)
        .json(ApiResponse.error("Internal server error", "DEFAULT", 500));
  }
}

export default errorFeedbackHandler;
