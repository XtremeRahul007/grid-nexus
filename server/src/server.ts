import express from "express";
import cors from "cors";
import { configDotenv } from "dotenv";
import router from "./routes/routes.js";
import { errorLogger, requestLogger } from "./middlewares/logger.middleware.js";
import { requestIdMiddleware } from "./middlewares/requestId.middleware.js";
import errorFeedbackHandler from "./middlewares/errorFeedback.middleware.js";
import { startScheduler, stopScheduler } from "./jobs/scheduler.js";

configDotenv();
const app = express();

const SERVER_PORT = Number(process.env.SERVER_PORT || 5000);
const CLIENT_PORT = Number(process.env.CLIENT_PORT || 5173);
const CLIENT_IP = process.env.CLIENT_IP;

const timers = startScheduler();

app.use(express.json());

app.use(
  cors({
    origin: `http://${CLIENT_IP}:${CLIENT_PORT}`,
    credentials: true,
  }),
);

app.use(requestIdMiddleware);
app.use(requestLogger);

app.use("/", router);

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
