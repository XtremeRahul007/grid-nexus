import argon2id from "argon2";
import crypto from "crypto";

export class Argon2idHandler {
  async hash(password: string): Promise<string> {
    const hashed = await argon2id.hash(password);
    return hashed;
  }

  async verify(hashed: string, password: string): Promise<boolean> {
    const verified = await argon2id.verify(hashed, password);
    return verified;
  }
}

export class CryptoHandler {
  hash(password: string): string {
    const hashed = crypto.createHash("sha256").update(password).digest("hex");
    return hashed;
  }

  verify(hashed: string, password: string): boolean {
    const verified =
      hashed === crypto.createHash("sha256").update(password).digest("hex");
    return verified;
  }
}
