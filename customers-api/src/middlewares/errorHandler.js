import { ApiError } from "../utils/apiError.js";

export function errorHandler(err, _req, res, _next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.details ? { details: err.details } : {})
    });
  }

  if (err?.code === "23505") {
    return res.status(409).json({
      success: false,
      message: "email already exists"
    });
  }

  console.error("Unhandled error:", err);

  return res.status(500).json({
    success: false,
    message: "Internal Server Error"
  });
}
