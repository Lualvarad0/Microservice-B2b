import axios from "axios";
import { env } from "../config/env.js";
import { AppError } from "../utils/appError.js";

const customersApi = axios.create({
  baseURL: env.customersApi.baseUrl,
  timeout: 5000
});

export async function getCustomerById(customerId) {
  try {
    const response = await customersApi.get(`/internal/customers/${customerId}`, {
      headers: {
        "x-service-token": env.service.token
      }
    });

    return response.data?.data ?? response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new AppError("Customer not found", 404);
    }

    if ([401, 403].includes(error.response?.status)) {
      throw new AppError("Customers API authorization failed", 502);
    }

    throw new AppError("Could not validate customer with customers-api", 502, {
      upstreamStatus: error.response?.status ?? null
    });
  }
}
