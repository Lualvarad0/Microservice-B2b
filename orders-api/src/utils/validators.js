import { AppError } from "./appError.js";

export function ensurePositiveInteger(value, fieldName) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new AppError(`${fieldName} must be a positive integer`, 400);
  }

  return parsed;
}

export function ensureNonNegativeInteger(value, fieldName) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new AppError(`${fieldName} must be a non-negative integer`, 400);
  }

  return parsed;
}

export function ensurePositiveNumber(value, fieldName) {
  const parsed = Number(value);

  if (Number.isNaN(parsed) || parsed <= 0) {
    throw new AppError(`${fieldName} must be a positive number`, 400);
  }

  return parsed;
}

export function ensureRequiredString(value, fieldName, maxLength = 255) {
  if (typeof value !== "string" || !value.trim()) {
    throw new AppError(`${fieldName} is required`, 400);
  }

  const trimmed = value.trim();

  if (trimmed.length > maxLength) {
    throw new AppError(`${fieldName} exceeds max length ${maxLength}`, 400);
  }

  return trimmed;
}

export function ensureOptionalString(value, fieldName, maxLength = 255) {
  if (value === undefined || value === null) return null;

  if (typeof value !== "string") {
    throw new AppError(`${fieldName} must be a string`, 400);
  }

  const trimmed = value.trim();

  if (trimmed.length > maxLength) {
    throw new AppError(`${fieldName} exceeds max length ${maxLength}`, 400);
  }

  return trimmed;
}

export function validateOrderItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new AppError("items must be a non-empty array", 400);
  }

  items.forEach((item, index) => {
    ensurePositiveInteger(item.productId, `items[${index}].productId`);
    ensurePositiveInteger(item.quantity, `items[${index}].quantity`);
  });
}