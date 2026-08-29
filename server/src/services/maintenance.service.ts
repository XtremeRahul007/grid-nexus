import * as userRepository from "../repositories/user.repository.js";

export async function cleanupExpiredSessions(): Promise<number | null> {
  return await userRepository.deleteExpiredSessions();
}
