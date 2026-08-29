import "express";

declare global {
  namespace Express {
    interface Request {
      requestId: string;
      timestamp: number;
      cookieToken: string;
      userID: number;
      userPassword: string;
    }
  }
}
