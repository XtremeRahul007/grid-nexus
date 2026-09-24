import nodemailer from "nodemailer";

import {
  generateOtp,
  loadTemplate,
  renderTemplate,
} from "../utils/emailTemplateHandler.js";
import * as otpRepository from "../repositories/otp.repository.js";
import * as userRepository from "../repositories/user.repository.js";
import { sha256Hasher } from "../utils/sha256Hasher.js";
import AppError from "../core/errors/AppError.js";
import type { purpose } from "../@types/auth.types.js";
import argon2id from "argon2";
import crypto from "crypto";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST_NAME,
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_LOGIN,
    pass: process.env.SMTP_API_KEY,
  },
});

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
  const codeHash = sha256Hasher(code);

  await sendOtpEmail({
    to: email,
    username,
    otp: code,
    expiresIn: 5,
  });

  const { challenge_id_hash, challenge_id } = challengeIdGenerator();

  await otpRepository.createOtpRecord(
    email,
    codeHash,
    "registration",
    challenge_id_hash,
  );

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
  const codeHash = sha256Hasher(code);

  await sendOtpEmail({
    to: email,
    username: result.username,
    otp: code,
    expiresIn: 5,
  });
  const { challenge_id_hash, challenge_id } = challengeIdGenerator();

  await otpRepository.createOtpRecord(
    email,
    codeHash,
    "login",
    challenge_id_hash,
  );

  return challenge_id;
}

export async function verifyOtp(
  email: string,
  otp: string,
  challenge_id: string,
  purpose: purpose,
) {
  const codeHash = sha256Hasher(otp);

  const result = await otpRepository.getOtpRecord(
    email,
    purpose,
    sha256Hasher(challenge_id),
  );

  if (!result) {
    throw new AppError("No OTP found for this email. Request a new code.", {
      statusCode: 404,
      code: "OTP_NOT_FOUND",
    });
  }

  if (result.verified) {
    throw new AppError("This code has already been used. Request a new code.", {
      statusCode: 409,
      code: "OTP_ALREADY_VERIFIED",
    });
  }

  if (Date.parse(result.expires_at) < Date.now()) {
    throw new AppError("Code has expired. Request a new code.", {
      statusCode: 410,
      code: "CODE_EXPIRED",
    });
  }

  if (result.code !== codeHash) {
    throw new AppError("Incorrect code. Please try again.", {
      statusCode: 400,
      code: "INCORRECT_CODE",
    });
  }

  await otpRepository.markOtpVerified(email, purpose);
}

export function challengeIdGenerator(): {
  challenge_id_hash: string;
  challenge_id: string;
} {
  const challenge_id = crypto.randomBytes(32).toString("hex");
  const challenge_id_hash = sha256Hasher(challenge_id);

  return {
    challenge_id_hash,
    challenge_id,
  };
}
