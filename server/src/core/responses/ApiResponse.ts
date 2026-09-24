import type { ResponseError } from "../../@types/auth.types.js";

export class ApiResponse<T = unknown> {
  public readonly success: boolean;
  public readonly status: number;
  public readonly message: string;
  public readonly data: T | null;
  public readonly error: ResponseError | null;

  private constructor(
    success: boolean,
    status: number,
    message: string,
    data: T | null,
    error: ResponseError | null,
  ) {
    this.success = success;
    this.status = status;
    this.message = message;
    this.data = data;
    this.error = error;
  }

  // Successful response

  static success<T>(
    data: T | null,
    message = "Request successful",
    status = 200,
  ): ApiResponse<T> {
    return new ApiResponse(true, status, message, data, null);
  }

  static error(
    message: string,
    code: string,
    status = 400,
    details?: unknown,
  ): ApiResponse<null> {
    return new ApiResponse(false, status, message, null, {
      code,
      ...(details !== undefined ? { details } : {}),
    });
  }
}
