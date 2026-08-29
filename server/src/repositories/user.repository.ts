import { pool } from "../database/pool.js";
import type { UserWithHash } from "../services/user.service.js";

export async function getUserName(
  userID: number,
): Promise<{ username: string }> {
  const result = await pool.query(
    `SELECT username FROM users
    WHERE id = $1
    `,
    [userID],
  );
  return result.rows[0] ?? null;
}

export async function findUserCredentialsByEmail(
  email: string,
): Promise<{ id: string; password_hash: string }> {
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

export async function deleteSession(tokenHash: string): Promise<void> {
  await pool.query(
    `DELETE FROM sessions
    WHERE token_hash = $1
    `,
    [tokenHash],
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
): Promise<{ user_id: number }> {
  console.log(tokenHash);
  const result = await pool.query(
    `SELECT user_id
    FROM sessions
    WHERE token_hash = $1
    AND expires_at > now()
    `,
    [tokenHash],
  );

  return result.rows[0] ?? null;
}

export async function deleteExpiredSessions(): Promise<number | null> {
  const result = await pool.query(
    `DELETE FROM sessions
    WHERE expires_at <= now()
    `,
  );

  return result.rowCount;
}

export async function updateSession(tokenHash: string): Promise<void> {
  await pool.query(
    `UPDATE sessions
    SET expires_at = now() + INTERVAL '7 days'
    WHERE token_hash = $1
    AND expires_at > now()
    `,
    [tokenHash],
  );
}

export async function deleteAllSession(userID: number): Promise<void> {
  await pool.query(
    `DELETE FROM sessions
    WHERE user_id = $1
    `,
    [userID],
  );
}

export async function getUserPasswordHash(userID: number): Promise<{
  password_hash: string;
}> {
  const result = await pool.query(
    `SELECT password_hash FROM users
    WHERE id = $1
    `,
    [userID],
  );
  return result.rows[0] ?? null;
}

export async function deleteUser(userID: number): Promise<void> {
  await pool.query(
    `DELETE FROM users
    WHERE id = $1
    `,
    [userID],
  );
}
