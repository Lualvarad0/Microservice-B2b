import {
  createOrderService,
  getOrderByIdService,
  listOrdersService,
  confirmOrderService,
  cancelOrderService
} from "../services/orderService.js";
import { successResponse } from "../utils/responses.js";

export async function createOrderController(req, res) {
  const order = await createOrderService(req.body);
  res.status(201).json(successResponse(order, "Order created successfully"));
}

export async function getOrderByIdController(req, res) {
  const order = await getOrderByIdService(req.params.id);
  res.status(200).json(successResponse(order, "Order retrieved successfully"));
}

export async function listOrdersController(req, res) {
  const data = await listOrdersService(req.query);
  res.status(200).json(successResponse(data, "Orders retrieved successfully"));
}

export async function confirmOrderController(req, res) {
  const result = await confirmOrderService(
    req.params.id,
    req.headers["x-idempotency-key"]
  );

  res.status(result.statusCode).json(result.body);
}

export async function cancelOrderController(req, res) {
  const order = await cancelOrderService(req.params.id);
  res.status(200).json(successResponse(order, "Order cancelled successfully"));
}