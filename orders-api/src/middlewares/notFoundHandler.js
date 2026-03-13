import { errorResponse } from "../utils/responses.js";

export function notFoundHandler(req, res) {
  res
    .status(404)
    .json(errorResponse(`Route not found: ${req.method} ${req.originalUrl}`));
}