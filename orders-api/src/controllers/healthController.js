import { sequelize } from "../models/index.js";
import { successResponse } from "../utils/responses.js";

export async function healthController(_req, res) {
  await sequelize.authenticate();

  res.status(200).json(
    successResponse(
      {
        service: "orders-api",
        status: "UP"
      },
      "Service healthy"
    )
  );
}