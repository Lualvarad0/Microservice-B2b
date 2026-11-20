import dotenv from "dotenv";

dotenv.config();

const requiredEnv = [
  "PORT",
  "DB_HOST",
  "DB_PORT",
  "DB_NAME",
  "DB_USER",
  "DB_PASSWORD",
  "JWT_SECRET",
  "JWT_EXPIRES_IN",
  "AUTH_USERNAME",
  "AUTH_PASSWORD",
  "SERVICE_TOKEN"
];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 3001,

  db: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    maxRetries: Number(process.env.DB_MAX_RETRIES) || 10,
    retryDelayMs: Number(process.env.DB_RETRY_DELAY_MS) || 3000
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || "1h"
  },

  auth: {
    username: process.env.AUTH_USERNAME,
    password: process.env.AUTH_PASSWORD
  },

  serviceToken: process.env.SERVICE_TOKEN,

  pagination: {
    defaultLimit: Number(process.env.DEFAULT_PAGE_LIMIT) || 10,
    maxLimit: Number(process.env.MAX_PAGE_LIMIT) || 50
  }
};
