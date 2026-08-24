import express from "express";
import router from "./routes/routes.js";
import { configDotenv } from "dotenv";
import path from "path";
import { errorLogger, requestLogger } from "./middlewares/logger.middleware.js";
import { requestIdMiddleware } from "./middlewares/requestId.middleware.js";
import errorFeedbackHandler from "./middlewares/errorFeedback.middleware.js";
import cookieAuth from "./middlewares/cookieAuth.middleware.js";
import verifySession from "./middlewares/verifySession.middleware.js";

configDotenv();
const app = express();

app.use(requestIdMiddleware);
app.use(requestLogger);
app.use("/api/", cookieAuth);
app.use(verifySession);

app.use(express.json());

app.use(express.static(path.join(process.cwd(), "../client/dist")));

app.use("/", router);

app.use(errorFeedbackHandler);
app.use(errorLogger);

app.listen(process.env.NODE_PORT, () => {
  console.log(`Server is running on port ${process.env.NODE_PORT}`);
});
