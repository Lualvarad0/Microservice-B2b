import { ApiError } from "./apiError.js";

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

export function validateLoginInput(body) {
  const { username, password } = body;

  if (!username || !password) {
    throw new ApiError(400, "username and password are required");
  }
}

export function validateCreateCustomerInput(body) {
  const { name, email, phone } = body;

  if (!name || !String(name).trim()) {
    throw new ApiError(400, "name is required");
  }

  if (!email || !String(email).trim()) {
    throw new ApiError(400, "email is required");
  }

  if (!isValidEmail(String(email).trim())) {
    throw new ApiError(400, "email format is invalid");
  }

  if (phone !== undefined && phone !== null && typeof phone !== "string") {
    throw new ApiError(400, "phone must be a string");
  }
}

export function validateUpdateCustomerInput(body) {
  const allowedFields = ["name", "email", "phone"];
  const keys = Object.keys(body);

  if (keys.length === 0) {
    throw new ApiError(400, "At least one field is required for update");
  }

  const hasInvalidField = keys.some((key) => !allowedFields.includes(key));
  if (hasInvalidField) {
    throw new ApiError(400, "Only name, email and phone can be updated");
  }

  if (body.name !== undefined && !String(body.name).trim()) {
    throw new ApiError(400, "name cannot be empty");
  }

  if (body.email !== undefined) {
    if (!String(body.email).trim()) {
      throw new ApiError(400, "email cannot be empty");
    }

    if (!isValidEmail(String(body.email).trim())) {
      throw new ApiError(400, "email format is invalid");
    }
  }

  if (body.phone !== undefined && body.phone !== null && typeof body.phone !== "string") {
    throw new ApiError(400, "phone must be a string");
  }
}

export function parsePositiveInt(value, fieldName) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new ApiError(400, `${fieldName} must be a positive integer`);
  }

  return parsed;
}
