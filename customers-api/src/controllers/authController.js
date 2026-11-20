import { login } from "../services/authService.js";
import { sendSuccess } from "../utils/response.js";
import { validateLoginInput } from "../utils/validators.js";

export function loginController(req, res) {
  validateLoginInput(req.body);

  const result = login(req.body);

  return sendSuccess(res, result, "Login successful");
}
