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

function handleHttpError(error) {
  const statusCode = error.response?.status || 502;
  const message =
    error.response?.data?.message || error.message || "Upstream service error";

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