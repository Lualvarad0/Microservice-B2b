import { createAndConfirmOrderFlow } from "../services/orchestrator.js";
import { validateCreateAndConfirmOrderPayload } from "../utils/response.js";
import { errorResponse, successResponse } from "../utils/response.js";
import { AppError } from "../utils/errors.js";

export async function createAndConfirmOrder(event) {
  try {
    const body =
      typeof event.body === "string" ? JSON.parse(event.body) : event.body || {};

    validateCreateAndConfirmOrderPayload(body);

    const result = await createAndConfirmOrderFlow(body);

    return successResponse(200, result);
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error.statusCode, error.message, error.details);
    }

    return errorResponse(500, "Internal server error");
  }
}