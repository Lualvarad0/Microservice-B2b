import dotenv from "dotenv";

dotenv.config();

function getEnv(name, fallback = undefined) {
  const value = process.env[name] ?? fallback;

  if (value === undefined || value === null || value === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function getNumber(name, fallback) {
  const raw = process.env[name] ?? fallback;
  const parsed = Number(raw);

  if (Number.isNaN(parsed)) {
    throw new Error(`Environment variable ${name} must be a number`);
  }

  return parsed;
}

export const env = {
  nodeEnv: getEnv("NODE_ENV", "development"),
  port: getNumber("PORT", 3002),

  db: {
    host: getEnv("DB_HOST"),
    port: getNumber("DB_PORT", 5432),
    name: getEnv("DB_NAME"),
    user: getEnv("DB_USER"),
    password: getEnv("DB_PASSWORD"),
    maxRetries: getNumber("DB_MAX_RETRIES", 10),
    retryDelayMs: getNumber("DB_RETRY_DELAY_MS", 3000),
    logging: String(process.env.DB_LOGGING ?? "false").toLowerCase() === "true"
  },

  jwt: {
    secret: getEnv("JWT_SECRET"),
    expiresIn: getEnv("JWT_EXPIRES_IN", "1h")
  },

  auth: {
    username: getEnv("AUTH_USERNAME"),
    password: getEnv("AUTH_PASSWORD")
  },

  service: {
    token: getEnv("SERVICE_TOKEN")
  },

  customersApi: {
    baseUrl: getEnv("CUSTOMERS_API_BASE_URL")
  },

  pagination: {
    defaultLimit: getNumber("DEFAULT_PAGE_LIMIT", 10),
    maxLimit: getNumber("MAX_PAGE_LIMIT", 50)
  },

  rules: {
    confirmedCancelWindowMinutes: getNumber("CONFIRMED_CANCEL_WINDOW_MINUTES", 5)
  },

  swagger: {
    serverUrl: getEnv("SWAGGER_SERVER_URL", "http://localhost:3002")
  }
};
