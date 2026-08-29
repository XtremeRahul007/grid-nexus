import express from "express";
import {
  registerUser,
  loginUser,
  getUserName,
  logoutUser,
  updateSession,
  logoutAllSession,
} from "../controllers/user.controller.js";
import { requireAuth } from "../middlewares/requireAuth.middleware.js";
import verifySession from "../middlewares/verifySession.middleware.js";
import cookieAuth from "../middlewares/cookieAuth.middleware.js";

const router = express.Router();

router.get("/api/me", cookieAuth, verifySession, requireAuth, getUserName);
router.get(
  "/api/session",
  cookieAuth,
  verifySession,
  requireAuth,
  updateSession,
);
router.get(
  "/api/logout-everywhere",
  cookieAuth,
  verifySession,
  requireAuth,
  logoutAllSession,
);
router.get("/api/logout", cookieAuth, verifySession, logoutUser);
router.post("/api/register", registerUser);
router.post("/api/login", loginUser);

export default router;
