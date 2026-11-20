import { ValidationError, UniqueConstraintError } from "sequelize";
import { AppError } from "../utils/appError.js";
import { errorResponse } from "../utils/responses.js";

export function errorHandler(err, _req, res, _next) {
  console.error(err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json(errorResponse(err.message, err.details));
  }

  if (err instanceof UniqueConstraintError) {
    return res.status(409).json(
      errorResponse("Duplicate resource", {
        fields: err.errors?.map((e) => e.path) ?? []
      })
    );
  }

  if (err instanceof ValidationError) {
    return res.status(400).json(
      errorResponse("Validation error", {
        errors:
          err.errors?.map((e) => ({
            field: e.path,
            message: e.message
          })) ?? []
      })
    );
  }

  return res.status(500).json(errorResponse("Internal server error"));
}
