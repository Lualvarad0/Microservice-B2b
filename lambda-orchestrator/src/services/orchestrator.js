import { getCustomerById } from "./customers.js";
import { createOrder, confirmOrder } from "./orders.js";
import { AppError } from "../utils/errors.js";
import { buildCorrelationId, buildServiceHeaders } from "../utils/headers.js";
import { validateCreateAndConfirmOrderPayload } from "../utils/response.js";

export async function createAndConfirmOrderFlow(payload) {
  validateCreateAndConfirmOrderPayload(payload);

  const { customer_id, items, idempotency_key, correlation_id } = payload;

  const correlationId = buildCorrelationId(correlation_id);

  const headers = buildServiceHeaders({
    correlationId,
    idempotencyKey: idempotency_key
  });

  const customerResponse = await getCustomerById(customer_id, headers);
  const customer = customerResponse?.data || customerResponse;

  if (!customer) {
    throw new AppError("Customer not found", 404);
  }

  if (customer.deleted_at) {
    throw new AppError("Customer is inactive or deleted", 409);
  }

  const orderResponse = await createOrder(
    {
      customer_id,
      items,
      idempotency_key
    },
    headers
  );

  const createdOrder = orderResponse?.data || orderResponse;
  const orderId = createdOrder?.id || createdOrder?.order_id;

  if (!orderId) {
    throw new AppError("Order creation response does not include order id", 502);
  }

  const confirmResponse = await confirmOrder(orderId, headers);
  const confirmedOrder = confirmResponse?.data || confirmResponse;

  return {
    success: true,
    message: "Order created and confirmed successfully",
    correlation_id: correlationId,
    data: {
      customer,
      created_order: createdOrder,
      confirmed_order: confirmedOrder
    }
  };
}