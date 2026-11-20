import { httpOrders } from "../utils/http.js";

export async function createOrder(payload, headers = {}) {
  const response = await httpOrders.post("/orders", payload, { headers });
  return response.data;
}

export async function confirmOrder(orderId, headers = {}) {
  const response = await httpOrders.post(`/orders/${orderId}/confirm`, {}, { headers });
  return response.data;
}
