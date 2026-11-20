import { sequelize } from "../config/db.js";
import { Product } from "./Product.js";
import { Order } from "./Order.js";
import { OrderItem } from "./OrderItem.js";
import { IdempotencyKey } from "./IdempotencyKey.js";

Order.hasMany(OrderItem, {
  foreignKey: "orderId",
  as: "items"
});

OrderItem.belongsTo(Order, {
  foreignKey: "orderId",
  as: "order"
});

Product.hasMany(OrderItem, {
  foreignKey: "productId",
  as: "orderItems"
});

OrderItem.belongsTo(Product, {
  foreignKey: "productId",
  as: "product"
});

export { sequelize, Product, Order, OrderItem, IdempotencyKey };
