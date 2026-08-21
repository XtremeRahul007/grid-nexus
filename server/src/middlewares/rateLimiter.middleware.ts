import rateLimit from "express-rate-limit";

const rateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  message: {
    error: "Too many requests from this IP. Please try again after an hour.",
  },
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

export default rateLimiter;
