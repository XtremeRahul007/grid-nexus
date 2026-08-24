import express from "express";
import type { Response, Request, NextFunction } from "express";
import {
  registerUser,
  loginUser,
  getUserName,
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/api/", getUserName);
router.post("/api/register", registerUser);
router.post("/api/login", loginUser);

export default router;
