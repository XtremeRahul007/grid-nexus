import type { Request } from "express";
import path from "path";
import { writeLog } from "./writeLogFile.js";

const logFolderPath = path.join(process.cwd(), "../logs");
const regnlogFilePath = path.join(logFolderPath, "registeredusers.log");

export async function trackUserRegistration(
  req: Request,
  email: string,
  username: string,
) {
  const record = `${req.requestId}\nTime=${new Date(req.timestamp).toISOString()}\nUser_IP=${req.ip}\nUsername=${username}\nEmail=${email}\n\n`;

  await writeLog(regnlogFilePath, record);
}
