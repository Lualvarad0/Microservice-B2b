import { env } from "../config/env.js";
import { AppError } from "../utils/appError.js";
import { signJwt } from "../utils/jwt.js";

export function login(username, password) {
  if (username !== env.auth.username || password !== env.auth.password) {
    throw new AppError("Invalid credentials", 401);
  }

  return {
    accessToken: signJwt({
      sub: username,
      role: "admin"
    }),
    tokenType: "Bearer",
    expiresIn: env.jwt.expiresIn
  };
}
