import { AppError } from "./errors.js";

export function validateCreateAndConfirmOrderPayload(body) {
  if (!body || typeof body !== "object") {
    throw new AppError("Invalid request body", 400);
  }

  const { customer_id, items, idempotency_key } = body;

  if (!customer_id) {
    throw new AppError("customer_id is required", 400);
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw new AppError("items must be a non-empty array", 400);
  }

  for (const item of items) {
    if (
      !item ||
      typeof item !== "object" ||
      !item.product_id ||
      typeof item.quantity !== "number" ||
      item.quantity <= 0
    ) {
      throw new AppError(
        "Each item must contain product_id and quantity > 0",
        400
      );
    }
  }

  if (!idempotency_key || typeof idempotency_key !== "string") {
    throw new AppError("idempotency_key is required", 400);
  }
}

export function successResponse(statusCode, data) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  };
}

export function errorResponse(statusCode, message, details = null) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      success: false,
      message,
      details
    })
  };
}