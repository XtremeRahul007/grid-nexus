import { pool } from "../database/pool.js";
import type { UserWithHash } from "../services/user.service.js";

export async function getUserName(
  userID: number,
): Promise<{ username: string }> {
  const result = await pool.query(
    `
    SELECT username FROM users
    WHERE id = $1
    `,
    [userID],
  );
  return result.rows[0] ?? null;
}

export async function findUserCredentialsByEmail(
  email: string,
): Promise<{ id: string; passwordHash: string }> {
  const result = await pool.query(
    `SELECT id, password_hash FROM users WHERE email = $1
    `,
    [email],
  );
  return result.rows[0] ?? null;
}

export async function createSession(
  userID: string,
  tokenHash: string,
): Promise<void> {
  await pool.query(
    `INSERT INTO sessions (user_id, token_hash)
    VALUES ($1, $2)
    `,
    [userID, tokenHash],
  );
}

export async function createUser(userWithHash: UserWithHash): Promise<void> {
  const { email, passwordHash, username } = userWithHash;
  await pool.query(
    `INSERT INTO users (email, password_hash, username)
    VALUES ($1, $2, $3)
    `,
    [email, passwordHash, username],
  );
}

export async function findUserIdBySession(
  tokenHash: string,
): Promise<{ user_id: number; expires_at: string }> {
  const result = await pool.query(
    `SELECT user_id, expires_at
    FROM sessions
    WHERE token_hash = $1;
    `,
    [tokenHash],
  );

  return result.rows[0] ?? null;
}
