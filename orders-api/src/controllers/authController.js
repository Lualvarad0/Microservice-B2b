import { login } from "../services/authService.js";
import { successResponse } from "../utils/responses.js";

export async function loginController(req, res) {
  const { username, password } = req.body;
  const data = login(username, password);

  res.status(200).json(successResponse(data, "Login successful"));
}
