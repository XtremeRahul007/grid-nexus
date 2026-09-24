import type { Request, Response, NextFunction } from "express";
import path from "path";
import { writeLog } from "../utils/writeLogFile.js";
import AppError from "../core/errors/AppError.js";

const logFolderPath = path.join(process.cwd(), "../logs");
const reqlogFilePath = path.join(logFolderPath, "logs.log");
const errLogFilePath = path.join(logFolderPath, "errors.log");

export async function requestLogger(
  req: Request,
  _: Response,
  next: NextFunction,
) {
  const log = `[${req.requestId}][${new Date(req.timestamp).toISOString()}] [REQ] ${req.ip} (${req.hostname}) "${req.method} ${req.originalUrl}" - UserAgent: "${req.get("user-agent") || "N/A"}" \n`;
  await writeLog(reqlogFilePath, log);
  next();
}

export async function errorLogger(
  err: Error,
  req: Request,
  res: Response,
  _: NextFunction,
) {
  const log = `[${req.requestId}][${new Date().toISOString()}] [ERROR] ${req.ip} - "${req.method} ${req.originalUrl}" - Status: ${err instanceof AppError ? err.statusCode : res.statusCode || 500} - ${err.name || "Error"}: "${err.message}" - Stack: "${err.stack ?? "N/A"}"`;
  await writeLog(errLogFilePath, log);
  console.error(err);
}
