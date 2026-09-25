import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import userRouter from "./routes/user.routes.js";
import otpRouter from "./routes/otp.routes.js";
import { errorLogger, requestLogger } from "./middlewares/logger.middleware.js";
import { requestIdMiddleware } from "./middlewares/requestId.middleware.js";
import errorFeedbackHandler from "./middlewares/errorFeedback.middleware.js";
import { startScheduler, stopScheduler } from "./jobs/scheduler.js";
import { connectRedis } from "./database/redis.js";
import { connectPool } from "./database/pool.js";

const __dirname = import.meta.dirname;
dotenv.config({ path: path.join(__dirname, "../.env") });

const app = express();

const SERVER_PORT = Number(process.env.SERVER_PORT || 5000);
const CLIENT_PORT = Number(process.env.CLIENT_PORT || 5173);
const CLIENT_IP = process.env.CLIENT_IP || "localhost";
const CLIENT_ORIGIN =
  process.env.CLIENT_ORIGIN || `http://${CLIENT_IP}:${CLIENT_PORT}`;

const timers = startScheduler();

app.use(express.json());

await connectRedis();
await connectPool();

app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
  }),
);

app.use(requestIdMiddleware);
app.use(requestLogger);

app.use("/", userRouter);
app.use("/auth", express.static(path.join(__dirname, "../public/auth")));
app.use("/", otpRouter);

app.use(errorFeedbackHandler);
app.use(errorLogger);

const server = app.listen(SERVER_PORT, () => {
  console.log(`Server is running on port ${SERVER_PORT}`);
});

function shutdown() {
  stopScheduler(timers);
  server.close(() => process.exit(0));
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
