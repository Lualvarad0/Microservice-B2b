import { Op, Transaction } from "sequelize";
import { sequelize } from "../models/index.js";
import { env } from "../config/env.js";
import { getCustomerById } from "../clients/customersApiClient.js";
import { Product, Order, OrderItem, IdempotencyKey } from "../models/index.js";
import { ORDER_STATUS } from "../models/Order.js";
import { AppError } from "../utils/appError.js";
import { decodeCursor } from "../utils/cursor.js";
import { buildCursorPage, normalizeLimit } from "../utils/pagination.js";
import { ensurePositiveInteger, validateOrderItems } from "../utils/validators.js";

async function getOrderWithItems(orderId, transaction = undefined) {
  const order = await Order.findByPk(orderId, {
    include: [
      {
        model: OrderItem,
        as: "items",
        include: [
          {
            model: Product,
            as: "product",
            attributes: ["id", "sku", "name"]
          }
        ]
      }
    ],
    transaction
  });

  if (!order) return null;

  const json = order.toJSON();

  return {
    ...json,
    items: json.items.map((item) => ({
      id: item.id,
      orderId: item.orderId,
      productId: item.productId,
      sku: item.product?.sku ?? null,
      name: item.product?.name ?? null,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal: item.subtotal
    }))
  };
}

export async function createOrderService(payload) {
  const customerId = ensurePositiveInteger(payload.customerId, "customerId");
  validateOrderItems(payload.items);

  await getCustomerById(customerId);

  return sequelize.transaction(
    {
      isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED
    },
    async (transaction) => {
      const productIds = [...new Set(payload.items.map((item) => Number(item.productId)))];

      const products = await Product.findAll({
        where: { id: productIds },
        transaction,
        lock: transaction.LOCK.UPDATE
      });

      if (products.length !== productIds.length) {
        throw new AppError("One or more products do not exist", 404);
      }

      const productMap = new Map(products.map((product) => [Number(product.id), product]));
      let total = 0;

      const normalizedItems = payload.items.map((item) => {
        const product = productMap.get(Number(item.productId));

        if (!product.active) {
          throw new AppError(`Product ${item.productId} is inactive`, 400);
        }

        if (Number(product.stock) < Number(item.quantity)) {
          throw new AppError(`Insufficient stock for product ${item.productId}`, 409);
        }

        const unitPrice = Number(product.price);
        const quantity = Number(item.quantity);
        const subtotal = Number((unitPrice * quantity).toFixed(2));
        total += subtotal;

        return {
          product,
          productId: Number(item.productId),
          quantity,
          unitPrice,
          subtotal
        };
      });

      total = Number(total.toFixed(2));

      const order = await Order.create(
        {
          customerId,
          status: ORDER_STATUS.CREATED,
          total
        },
        { transaction }
      );

      for (const item of normalizedItems) {
        await OrderItem.create(
          {
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal
          },
          { transaction }
        );

        await item.product.update(
          {
            stock: Number(item.product.stock) - item.quantity
          },
          { transaction }
        );
      }

      return getOrderWithItems(order.id, transaction);
    }
  );
}

export async function getOrderByIdService(id) {
  const orderId = ensurePositiveInteger(id, "id");
  const order = await getOrderWithItems(orderId);

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  return order;
}

export async function listOrdersService(query) {
  const limit = normalizeLimit(query.limit);
  const status = query.status?.trim() || null;
  const from = query.from || null;
  const to = query.to || null;
  const cursorId = query.cursor ? Number(decodeCursor(query.cursor)) : null;

  const where = {};

  if (status) where.status = status;

  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt[Op.gte] = new Date(from);
    if (to) where.createdAt[Op.lte] = new Date(to);
  }

  if (cursorId) {
    where.id = { [Op.lt]: cursorId };
  }

  const orders = await Order.findAll({
    where,
    order: [["id", "DESC"]],
    limit: limit + 1
  });

  return buildCursorPage(
    orders.map((item) => item.toJSON()),
    limit,
    (item) => item.id
  );
}

export async function confirmOrderService(orderIdRaw, idempotencyKeyRaw) {
  const orderId = ensurePositiveInteger(orderIdRaw, "id");

  if (!idempotencyKeyRaw || !String(idempotencyKeyRaw).trim()) {
    throw new AppError("X-Idempotency-Key header is required", 400);
  }

  const idempotencyKey = String(idempotencyKeyRaw).trim();
  const method = "POST";
  const endpoint = `/orders/${orderId}/confirm`;
  const requestFingerprint = `confirm-order:${orderId}`;

  return sequelize.transaction(async (transaction) => {
    let keyRecord;

    try {
      keyRecord = await IdempotencyKey.create(
        {
          idempotencyKey,
          method,
          endpoint,
          requestFingerprint,
          isCompleted: false
        },
        { transaction }
      );
    } catch {
      const existing = await IdempotencyKey.findOne({
        where: { idempotencyKey, method, endpoint },
        transaction,
        lock: transaction.LOCK.UPDATE
      });

      if (!existing) {
        throw new AppError("Idempotency key lookup failed", 409);
      }

      if (existing.requestFingerprint !== requestFingerprint) {
        throw new AppError("Idempotency key reused with another request", 409);
      }

      if (!existing.isCompleted) {
        throw new AppError("This idempotent request is already processing", 409);
      }

      return {
        statusCode: existing.responseStatus,
        body: existing.responseBody
      };
    }

    const order = await Order.findByPk(orderId, {
      transaction,
      lock: transaction.LOCK.UPDATE
    });

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    if (order.status === ORDER_STATUS.CANCELLED) {
      throw new AppError("Cancelled order cannot be confirmed", 409);
    }

    let responseBody;

    if (order.status === ORDER_STATUS.CONFIRMED) {
      const fullOrder = await getOrderWithItems(orderId, transaction);

      responseBody = {
        success: true,
        message: "Order already confirmed",
        data: fullOrder
      };

      await keyRecord.update(
        {
          isCompleted: true,
          responseStatus: 200,
          responseBody
        },
        { transaction }
      );

      return {
        statusCode: 200,
        body: responseBody
      };
    }

    await order.update(
      {
        status: ORDER_STATUS.CONFIRMED,
        confirmedAt: new Date()
      },
      { transaction }
    );

    const fullOrder = await getOrderWithItems(orderId, transaction);

    responseBody = {
      success: true,
      message: "Order confirmed successfully",
      data: fullOrder
    };

    await keyRecord.update(
      {
        isCompleted: true,
        responseStatus: 200,
        responseBody
      },
      { transaction }
    );

    return {
      statusCode: 200,
      body: responseBody
    };
  });
}

export async function cancelOrderService(orderIdRaw) {
  const orderId = ensurePositiveInteger(orderIdRaw, "id");

  return sequelize.transaction(async (transaction) => {
    const order = await Order.findByPk(orderId, {
      transaction,
      lock: transaction.LOCK.UPDATE
    });

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    if (order.status === ORDER_STATUS.CANCELLED) {
      throw new AppError("Order is already cancelled", 409);
    }

    const items = await OrderItem.findAll({
      where: { orderId },
      include: [
        {
          model: Product,
          as: "product"
        }
      ],
      transaction,
      lock: transaction.LOCK.UPDATE
    });

    if (order.status === ORDER_STATUS.CONFIRMED) {
      const confirmedAt = new Date(order.confirmedAt);
      const deadline = new Date(
        confirmedAt.getTime() + env.rules.confirmedCancelWindowMinutes * 60 * 1000
      );

      if (new Date() > deadline) {
        throw new AppError(
          `Confirmed order can only be cancelled within ${env.rules.confirmedCancelWindowMinutes} minutes`,
          409
        );
      }
    }

    for (const item of items) {
      await item.product.update(
        {
          stock: Number(item.product.stock) + Number(item.quantity)
        },
        { transaction }
      );
    }

    await order.update(
      {
        status: ORDER_STATUS.CANCELLED,
        cancelledAt: new Date()
      },
      { transaction }
    );

    return getOrderWithItems(orderId, transaction);
  });
}