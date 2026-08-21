import express from "express";
import {
  getUsers,
  registerUser,
  loginUser,
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/api/", getUsers);
router.post("/api/register", registerUser);
router.post("/api/login", loginUser);

export default router;
