import type { Request, Response, NextFunction } from "express";
import * as otpService from "../services/otp.service.js";
import otpVerificationSchema, {
  type OtpVerification,
} from "../validators/user.otpVerification.validator.js";
import loginUserSchema, {
  type LoginUser,
} from "../validators/user.login.validator.js";
import {
  otpRegistrationSchema,
  type OtpReq,
} from "../validators/user.registration.validator.js";
import { ApiResponse } from "../core/responses/ApiResponse.js";
import { parseWithSchema } from "../utils/zodErrorHandler.js";

export async function sendRegistrationOtp(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = parseWithSchema(otpRegistrationSchema, req.body);

    const { email, username } = result as OtpReq;

    const challenge_id = await otpService.sendRegistrationOtp(email, username);

    res.cookie("challenge_id", challenge_id, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 5 * 60 * 1000,
    });

    res
      .status(200)
      .json(ApiResponse.success(null, "OTP sent successfully", 200));
  } catch (err) {
    next(err);
  }
}

export async function verifyRegistrationOtp(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = parseWithSchema(otpVerificationSchema, req.body);

    const { email, otp } = result as OtpVerification;

    const challenge_id = req.challenge_id;

    await otpService.verifyOtp(email, otp, challenge_id, "registration");

    res.status(200).json(ApiResponse.success(null, "OTP verified successfully", 200));
  } catch (err) {
    next(err);
  }
}

export async function sendLoginOtp(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = parseWithSchema(loginUserSchema, req.body);

    const { email, password } = result as LoginUser;

    const challenge_id = await otpService.sendLoginOtp(email, password);

    res.cookie("challenge_id", challenge_id, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 5 * 60 * 1000,
    });

    res
      .status(200)
      .json(ApiResponse.success(null, "OTP sent successfully", 200));
  } catch (err) {
    next(err);
  }
}

export async function verifyLoginOtp(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = parseWithSchema(otpVerificationSchema, req.body);

    const { email, otp } = result as OtpVerification;

    const challenge_id = req.challenge_id;

    await otpService.verifyOtp(email, otp, challenge_id, "login");

    res.status(200).json(ApiResponse.success(null, "OTP verified successfully", 200));
  } catch (err) {
    next(err);
  }
}
