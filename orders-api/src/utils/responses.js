export function successResponse(data, message = "OK") {
  return {
    success: true,
    message,
    data
  };
}

export function errorResponse(message, details = null) {
  return {
    success: false,
    message,
    details
  };
}