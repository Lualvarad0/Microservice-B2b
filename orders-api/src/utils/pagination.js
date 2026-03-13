import { env } from "../config/env.js";
import { encodeCursor } from "./cursor.js";

export function normalizeLimit(rawLimit) {
  const limit = Number(rawLimit ?? env.pagination.defaultLimit);

  if (Number.isNaN(limit) || limit <= 0) {
    return env.pagination.defaultLimit;
  }

  return Math.min(limit, env.pagination.maxLimit);
}

export function buildCursorPage(items, limit, getCursorValue) {
  const hasMore = items.length > limit;
  const sliced = hasMore ? items.slice(0, limit) : items;

  return {
    items: sliced,
    pageInfo: {
      limit,
      hasMore,
      nextCursor:
        hasMore && sliced.length > 0
          ? encodeCursor(getCursorValue(sliced[sliced.length - 1]))
          : null
    }
  };
}