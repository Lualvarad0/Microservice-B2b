export function encodeCursor(id) {
  return Buffer.from(String(id), "utf-8").toString("base64");
}

export function decodeCursor(cursor) {
  try {
    const decoded = Buffer.from(cursor, "base64").toString("utf-8");
    const id = Number(decoded);

    if (!Number.isInteger(id) || id <= 0) {
      return null;
    }

    return id;
  } catch {
    return null;
  }
}
