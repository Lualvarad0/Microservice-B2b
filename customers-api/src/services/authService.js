import { env } from "../config/env.js";
import { ApiError } from "../utils/apiError.js";
import { generateJwt } from "../utils/jwt.js";

export function login({ username, password }) {
  if (username !== env.auth.username || password !== env.auth.password) {
    throw new ApiError(401, "Invalid credentials");
  }

  const token = generateJwt({
    sub: username,
    role: "api-user"
  });

  return {
    token,
    tokenType: "Bearer",
    expiresIn: env.jwt.expiresIn
  };
}