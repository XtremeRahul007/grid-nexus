import fs from "fs";

export async function writeLog(logFilePath: string, data: string) {
  fs.appendFile(logFilePath, data, "utf8", (err) => {
    if (err) {
      console.error("Error writing to file:", err);
      return;
    }
  });
}
