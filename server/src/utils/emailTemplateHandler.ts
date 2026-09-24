import crypto from "crypto";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

const __dirname = import.meta.dirname;
dotenv.config({ path: path.join(__dirname, "../../.env") });

export function generateOtp(length: number): string {
  const otp = crypto
    .randomInt(0, Math.pow(10, length) - 1)
    .toString()
    .padStart(length, "0");
  return otp;
}

export function loadTemplate(templateName: string): string {
  const filePath = path.join(__dirname, `../templates/${templateName}`);
  return fs.readFileSync(filePath, "utf-8");
}

export function renderTemplate(
  template: string,
  values: Record<string, string>,
): string {
  let html = template;
  for (const [key, value] of Object.entries(values)) {
    const pattern = new RegExp(`{{\\s*${key}\\s*}}`, "g");
    html = html.replace(pattern, value);
  }
  return html;
}
