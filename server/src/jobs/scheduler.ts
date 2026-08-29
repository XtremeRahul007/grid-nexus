import { runLogCleanUp } from "./logCleanup.job.js";
import { runSessionCleanUp } from "./sessionCleanup.job.js";

const INTERVALS: [() => Promise<void>, number][] = [
  [runSessionCleanUp, 1 * 60 * 1000],
  [runLogCleanUp, 1 * 60 * 1000],
];

function scheduleJob(
  job: () => Promise<void>,
  interval: number,
): NodeJS.Timeout {
  let running = false;
  return setInterval(async () => {
    if (running) return;
    running = true;
    try {
      await job();
    } catch (err) {
      console.error(`Scheduled job ${job.name} failed:`, err);
    } finally {
      running = false;
    }
  }, interval);
}

export function startScheduler(): NodeJS.Timeout[] {
  return INTERVALS.map(([job, interval]) => scheduleJob(job, interval));
}

export function stopScheduler(timers: NodeJS.Timeout[]): void {
  timers.forEach(clearInterval);
}
