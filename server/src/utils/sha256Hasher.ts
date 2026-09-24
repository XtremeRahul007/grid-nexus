import crypto from "crypto";

export function sha256Hasher(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}
