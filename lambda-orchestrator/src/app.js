import express from "express";
import swaggerUi from "swagger-ui-express";
import orchestratorRoutes from "./routes/orchestrator.routes.js";
import { swaggerSpec } from "./config/swagger.js";
import { AppError } from "./utils/errors.js";

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    service: "lambda-orchestrator",
    status: "ok"
  });
});

app.use("/docs", swaggerUi.serve);
app.get("/docs", swaggerUi.setup(swaggerSpec));

app.get("/docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

app.use("/orchestrator", orchestratorRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

app.use((error, req, res, next) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      details: error.details || null
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error"
  });
});

const baseUrl = `http://localhost:${process.env.PORT || 3003}`;

console.log("");
console.log("📘 Lambda Orchestrator routes:");
console.log(`   Health: ${baseUrl}/health`);
console.log(`   Swagger UI: ${baseUrl}/docs`);
console.log(`   Swagger JSON: ${baseUrl}/docs.json`);
console.log(`   Create & Confirm Order: POST ${baseUrl}/orchestrator/create-and-confirm-order`);
console.log("");

export default app;