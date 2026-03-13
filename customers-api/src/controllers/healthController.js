import { sendSuccess } from "../utils/response.js";

export function healthController(_req, res) {
  return sendSuccess(res, {
    service: "customers-api",
    status: "UP"
  });
}