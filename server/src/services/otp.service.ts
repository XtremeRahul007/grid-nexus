import nodemailer from "nodemailer";
import {
  generateOtp,
  loadTemplate,
  renderTemplate,
} from "../utils/emailTemplateHandler.js";
import * as userRepository from "../repositories/user.repository.js";
import { CryptoHandler } from "../utils/cryptoHandler.js";
import AppError from "../core/errors/AppError.js";
import type { OtpRedisRecord, purpose } from "../@types/auth.types.js";
import argon2id from "argon2";
import crypto from "crypto";
import redisClient from "../database/redis.js";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST_NAME,
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_LOGIN,
    pass: process.env.SMTP_API_KEY,
  },
});

const cryptoHandler = new CryptoHandler();

async function sendOtpEmail({
  to,
  username,
  otp,
  expiresIn = 5,
}: {
  to: string;
  username: string;
  otp: string;
  expiresIn: number;
}): Promise<void> {
  const template = loadTemplate("otp-template-neumorphism.html");
  const html = renderTemplate(template, {
    USERNAME: username,
    OTP_CODE: otp,
    EXPIRY_MINUTES: expiresIn.toString(),
    DATE_YEAR: new Date().getFullYear().toString(),
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: `Your Grid Nexus verification code: ${otp}`,
    html,
    text: `Hey ${username}, your Grid Nexus verification code is ${otp}. It expires in ${expiresIn} minutes.`,
  });
}

export async function sendRegistrationOtp(
  email: string,
  username: string,
): Promise<string> {
  const code = generateOtp(6);
  const codeHash = cryptoHandler.hash(code);

  await sendOtpEmail({
    to: email,
    username,
    otp: code,
    expiresIn: 5,
  });

  const { challenge_id_hash, challenge_id } = challengeIdGenerator();

  const otpData: OtpRedisRecord = {
    otp: codeHash,
    token: challenge_id_hash,
    verified: "false",
  };

  await redisClient.hSet(`otp:registration:${email}`, otpData);
  await redisClient.expire(`otp:registration:${email}`, 300);

  return challenge_id;
}

export async function sendLoginOtp(
  email: string,
  password: string,
): Promise<string> {
  const result = await userRepository.findUserCredentialsByEmail(email);
  if (!result) {
    throw new AppError("Invalid email or password", {
      statusCode: 401,
      code: "INVALID_CREDENTIALS",
    });
  }

  const isPasswordValid = await argon2id.verify(result.password_hash, password);

  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", {
      statusCode: 401,
      code: "INVALID_CREDENTIALS",
    });
  }
  const code = generateOtp(6);
  const codeHash = cryptoHandler.hash(code);

  await sendOtpEmail({
    to: email,
    username: result.username,
    otp: code,
    expiresIn: 5,
  });
  const { challenge_id_hash, challenge_id } = challengeIdGenerator();

  const otpData: OtpRedisRecord = {
    otp: codeHash,
    token: challenge_id_hash,
    verified: "false",
  };

  await redisClient.hSet(`otp:login:${email}`, otpData);
  await redisClient.expire(`otp:login:${email}`, 300);

  return challenge_id;
}

export async function verifyOtp(
  email: string,
  otp: string,
  challenge_id: string,
  purpose: purpose,
) {
  const codeHash = cryptoHandler.hash(otp);
  const challenge_id_hash = challenge_id
    ? cryptoHandler.hash(challenge_id)
    : null;

  if (challenge_id == null) {
    throw new AppError("Secure session expired. Please request a new code.", {
      statusCode: 404,
      code: "SESSION_EXPIRED",
    });
  }

  const data = await redisClient.hGetAll(`otp:${purpose}:${email}`);
  const isVerified = data.verified === "true";

  if (!data.otp) {
    throw new AppError("No OTP found for this email. Request a new code.", {
      statusCode: 404,
      code: "OTP_NOT_FOUND",
    });
  }

  if (data.token !== challenge_id_hash) {
    throw new AppError("Invalid challenge ID.", {
      statusCode: 400,
      code: "INVALID_CHALLENGE_ID",
    });
  }

  if (isVerified) {
    throw new AppError("This code has already been used. Request a new code.", {
      statusCode: 409,
      code: "OTP_ALREADY_VERIFIED",
    });
  }

  if (data.otp !== codeHash) {
    throw new AppError("Incorrect code. Please try again.", {
      statusCode: 400,
      code: "INCORRECT_CODE",
    });
  }

  await redisClient.hSet(`otp:${purpose}:${email}`, { verified: "true" });
}

export function challengeIdGenerator(): {
  challenge_id_hash: string;
  challenge_id: string;
} {
  const challenge_id = crypto.randomBytes(32).toString("hex");
  const challenge_id_hash = cryptoHandler.hash(challenge_id);

  return {
    challenge_id_hash,
    challenge_id,
  };
}
