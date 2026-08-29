import * as maintenanceService from "../services/maintenance.service.js";

export async function runSessionCleanUp() {
  try {
    const deleteCount = await maintenanceService.cleanupExpiredSessions();

    console.log(
      `[Session Cleanup] Removed ${deleteCount ?? 0} expired sessions`,
    );
  } catch (err) {
    console.error("[Session Cleanup] Failed:", err);
  }
}
