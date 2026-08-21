import { pool } from "../database/pool.js";
import type { UserWithHash } from "../services/user.service.js";

export async function getUsersTable() {
  const result = await pool.query("SELECT * FROM users");
  return result.rows ?? null;
}

export async function findUserByEmail(email: string) {
  const result = await pool.query(
    `SELECT password_hash FROM users WHERE email = $1`,
    [email],
  );
  return { passwordHash: result.rows[0]?.password_hash, rowCount: result.rowCount };
}

export async function createUser(userWithHash: UserWithHash) {
  const { email, passwordHash, username } = userWithHash;
  await pool.query(
    `INSERT INTO users (email, password_hash, username)
    VALUES ($1, $2, $3)
    RETURNING id, email, username
    `,
    [email, passwordHash, username],
  );
}
