export interface NodemailerError extends Error {
  code?: string;
  command?: string;
  response?: string;
  responseCode?: number;
  rejected?: string[];
  rejectedErrors?: Error[];
}

export type purpose = "login" | "registration";

export interface AppErrorOptions {
  statusCode?: number;
  code?: string;
  details?: unknown;
}

export interface ResponseError {
  code: string;
  details?: unknown;
  fields?: Record<string, string>;
}

export type FieldErrors = Record<string, string[]>;

export interface OtpRedisRecord {
  [key: string]: string;
  otp: string;
  token: string;
  verified: "true" | "false";
}
