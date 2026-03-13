import { AppError } from "../utils/appError.js";
import { verifyJwt } from "../utils/jwt.js";

export function authMiddleware(req, _res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError("Unauthorized", 401));
  }

  const token = authHeader.split(" ")[1];

  try {
    req.user = verifyJwt(token);
    next();
  } catch {
    next(new AppError("Invalid or expired token", 401));
  }
}