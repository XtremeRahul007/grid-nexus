import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logDirPath =
  process.env.LOG_DIR ?? path.join(__dirname, "../../../logs/");

export async function runLogCleanUp(): Promise<void> {
  const logFileNames = ["errors", "logs"];

  await Promise.all(
    logFileNames.map(async (name) => {
      const logFilePath = path.join(logDirPath, `${name}.log`);
      try {
        await fs.truncate(logFilePath, 0);
        console.log(`Cleared ${logFilePath}`);
      } catch (err) {
        console.error(`${name} failed to write\nERROR: ${err}`);
      }
    }),
  );
}
