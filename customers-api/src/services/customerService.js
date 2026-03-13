import { env } from "../config/env.js";
import {
  createCustomer,
  findCustomerByEmail,
  findCustomerById,
  listCustomers,
  softDeleteCustomer,
  updateCustomer
} from "../repositories/customerRepository.js";
import { ApiError } from "../utils/apiError.js";
import { decodeCursor, encodeCursor } from "../utils/cursor.js";
import { normalizeEmail } from "../utils/validators.js";

export async function createCustomerService(payload) {
  const email = normalizeEmail(payload.email);

  const existing = await findCustomerByEmail(email, { includeDeleted: true });
  if (existing) {
    throw new ApiError(409, "email already exists");
  }

  return createCustomer({
    name: payload.name.trim(),
    email,
    phone: payload.phone?.trim() || null
  });
}

export async function getCustomerByIdService(id) {
  const customer = await findCustomerById(id);

  if (!customer) {
    throw new ApiError(404, "Customer not found");
  }

  return customer;
}

export async function getInternalCustomerByIdService(id) {
  const customer = await findCustomerById(id, { includeDeleted: true });

  if (!customer) {
    throw new ApiError(404, "Customer not found");
  }

  return customer;
}

export async function listCustomersService({ search, cursor, limit }) {
  const safeLimit = Math.min(
    limit || env.pagination.defaultLimit,
    env.pagination.maxLimit
  );

  const cursorId = cursor ? decodeCursor(cursor) : null;

  if (cursor && !cursorId) {
    throw new ApiError(400, "Invalid cursor");
  }

  const rows = await listCustomers({
    search: search?.trim() || "",
    cursorId,
    limit: safeLimit
  });

  const hasNextPage = rows.length > safeLimit;
  const items = hasNextPage ? rows.slice(0, safeLimit) : rows;
  const nextCursor = hasNextPage
    ? encodeCursor(items[items.length - 1].id)
    : null;

  return {
    items,
    pagination: {
      limit: safeLimit,
      nextCursor,
      hasNextPage
    }
  };
}

export async function updateCustomerService(id, payload) {
  const updatePayload = {};

  if (payload.name !== undefined) {
    updatePayload.name = payload.name.trim();
  }

  if (payload.email !== undefined) {
    const normalizedEmail = normalizeEmail(payload.email);

    const existing = await findCustomerByEmail(normalizedEmail, {
      includeDeleted: true
    });

    if (existing && Number(existing.id) !== Number(id)) {
      throw new ApiError(409, "email already exists");
    }

    updatePayload.email = normalizedEmail;
  }

  if (payload.phone !== undefined) {
    updatePayload.phone = payload.phone?.trim() || null;
  }

  const updated = await updateCustomer(id, updatePayload);

  if (!updated) {
    throw new ApiError(404, "Customer not found");
  }

  return updated;
}

export async function deleteCustomerService(id) {
  const deleted = await softDeleteCustomer(id);

  if (!deleted) {
    throw new ApiError(404, "Customer not found");
  }

  return {
    id,
    deleted: true
  };
}