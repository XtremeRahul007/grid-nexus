import express from "express";
import {
  sendLoginOtp,
  sendRegistrationOtp,
  verifyLoginOtp,
  verifyRegistrationOtp,
} from "../controllers/otp.controller.js";
import { extractChallengeId } from "../middlewares/challengeId.middleware.js";

const router = express.Router();

router.post("/api/register/request-otp", sendRegistrationOtp);
router.post(
  "/api/register/verify-otp",
  extractChallengeId,
  verifyRegistrationOtp,
);
router.post("/api/login/request-otp", sendLoginOtp);
router.post("/api/login/verify-otp", extractChallengeId, verifyLoginOtp);

export default router;
