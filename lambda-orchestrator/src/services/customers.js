import { httpCustomers } from "../utils/http.js";

export async function getCustomerById(customerId, headers = {}) {
  const response = await httpCustomers.get(`/internal/customers/${customerId}`, {
    headers
  });

  return response.data;
}