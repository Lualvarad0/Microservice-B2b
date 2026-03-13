import { env } from "../config/env.js";
import { ApiError } from "../utils/apiError.js";
import { verifyJwt } from "../utils/jwt.js";

export function authenticateJwt(req, _res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new ApiError(401, "Missing or invalid Authorization header"));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyJwt(token);
    req.user = decoded;
    return next();
  } catch {
    return next(new ApiError(401, "Invalid or expired token"));
  }
}

export function authenticateServiceToken(req, _res, next) {
  const token = req.headers["x-service-token"];

  if (!token) {
    return next(new ApiError(401, "Missing x-service-token header"));
  }

  if (token !== env.serviceToken) {
    return next(new ApiError(401, "Invalid service token"));
  }

  return next();
}