import dotenv from "dotenv";

dotenv.config();

export const env = {
  appName: process.env.APP_NAME || "lambda-orchestrator",
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 3003),
  stage: process.env.STAGE || "dev",
  customersApiBaseUrl: process.env.CUSTOMERS_API_BASE_URL,
  ordersApiBaseUrl: process.env.ORDERS_API_BASE_URL,
  customersApiTimeoutMs: Number(process.env.CUSTOMERS_API_TIMEOUT_MS || 5000),
  ordersApiTimeoutMs: Number(process.env.ORDERS_API_TIMEOUT_MS || 5000),
  logLevel: process.env.LOG_LEVEL || "info"
};