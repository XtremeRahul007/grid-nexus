class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public type: "app_error" | "db_error",
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export default AppError;
