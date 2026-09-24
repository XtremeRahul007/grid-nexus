import type { purpose } from "../@types/auth.types.js";
import { pool } from "../database/pool.js";

export async function createOtpRecord(
  email: string,
  codeHash: string,
  purpose: purpose,
  challenge_id: string,
): Promise<void> {
  await pool.query(
    `
    INSERT INTO otps (email, code, purpose, expires_at, challenge_id, verified)
    VALUES ($1, $2, $3, now() + INTERVAL '5 minute', $4, FALSE)
    ON CONFLICT (email, purpose)
    DO UPDATE SET
      code = EXCLUDED.code,
      expires_at = EXCLUDED.expires_at,
      challenge_id = EXCLUDED.challenge_id,
      verified = EXCLUDED.verified
    `,
    [email, codeHash, purpose, challenge_id],
  );
}

export async function getOtpRecord(
  email: string,
  purpose: purpose,
  challenge_id: string,
): Promise<{ code: string; expires_at: string; verified: boolean } | null> {
  const { rows } = await pool.query(
    `SELECT code, expires_at, verified FROM otps
    WHERE email = $1 AND purpose = $2 AND challenge_id = $3`,
    [email, purpose, challenge_id],
  );
  return rows[0] ?? null;
}

export async function deleteOtpRecord(
  email: string,
  purpose: purpose,
  challenge_id: string,
) {
  await pool.query(
    `DELETE FROM otps
    WHERE email = $1 AND purpose = $2 AND challenge_id = $3`,
    [email, purpose, challenge_id],
  );
}

export async function checkEmailVerified(
  email: string,
  purpose: purpose,
  challenge_id: string,
): Promise<{ verified: boolean }> {
  const { rows } = await pool.query(
    `SELECT verified FROM otps
    WHERE email = $1 AND purpose = $2 AND challenge_id = $3`,
    [email, purpose, challenge_id],
  );
  return rows[0] ?? null;
}

export async function markOtpVerified(email: string, purpose: string) {
  await pool.query(
    `UPDATE otps SET verified = TRUE WHERE email = $1 AND purpose = $2`,
    [email, purpose],
  );
}
