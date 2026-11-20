import axios from "axios";
import { env } from "./env.js";
import { AppError } from "./errors.js";

export const httpCustomers = axios.create({
  baseURL: env.customersApiBaseUrl,
  timeout: env.customersApiTimeoutMs
});

export const httpOrders = axios.create({
  baseURL: env.ordersApiBaseUrl,
  timeout: env.ordersApiTimeoutMs
});

// customers-api's /internal/customers/:id is gated by a shared service token
// (x-service-token header), not a user JWT.
httpCustomers.interceptors.request.use((config) => {
  config.headers["x-service-token"] = env.serviceToken;
  return config;
});

// orders-api's /orders routes require a real user JWT, so the orchestrator
// logs in with its own service credentials and caches the token until it
// is close to expiring.
let ordersApiTokenCache = null;

function decodeJwtExpiryMs(token) {
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8"));
    return payload.exp ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

async function fetchOrdersApiToken() {
  const response = await axios.post(
    `${env.ordersApiBaseUrl}/auth/login`,
    {
      username: env.ordersApiAuthUsername,
      password: env.ordersApiAuthPassword
    },
    { timeout: env.ordersApiTimeoutMs }
  );

  const token = response.data?.data?.accessToken;

  if (!token) {
    throw new AppError("Could not authenticate against orders-api", 502);
  }

  ordersApiTokenCache = {
    token,
    expiresAt: decodeJwtExpiryMs(token) || Date.now() + 60_000
  };

  return token;
}

async function getOrdersApiToken() {
  const isExpiringSoon = !ordersApiTokenCache || ordersApiTokenCache.expiresAt - Date.now() < 5000;

  return isExpiringSoon ? fetchOrdersApiToken() : ordersApiTokenCache.token;
}

httpOrders.interceptors.request.use(async (config) => {
  config.headers.Authorization = `Bearer ${await getOrdersApiToken()}`;
  return config;
});

function handleHttpError(error) {
  if (error.response?.status === 401) {
    ordersApiTokenCache = null;
  }

  const statusCode = error.response?.status || 502;
  const message = error.response?.data?.message || error.message || "Upstream service error";

  throw new AppError(message, statusCode, error.response?.data || null);
}

httpCustomers.interceptors.response.use(
  (response) => response,
  (error) => handleHttpError(error)
);

httpOrders.interceptors.response.use(
  (response) => response,
  (error) => handleHttpError(error)
);
