export function encodeCursor(value) {
  return Buffer.from(String(value), "utf8").toString("base64");
}

export function decodeCursor(cursor) {
  try {
    return Buffer.from(cursor, "base64").toString("utf8");
  } catch {
    return null;
  }
}
