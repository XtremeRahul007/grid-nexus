import crypto from "crypto";

export function cookieTokenHash(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}
