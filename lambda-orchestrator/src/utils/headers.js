import crypto from "node:crypto";

export function buildCorrelationId(correlationId) {
  return correlationId || crypto.randomUUID();
}

export function buildServiceHeaders({ correlationId, idempotencyKey }) {
  const headers = {
    "Content-Type": "application/json",
    "x-correlation-id": correlationId
  };

  if (idempotencyKey) {
    headers["x-idempotency-key"] = idempotencyKey;
  }

  return headers;
}
