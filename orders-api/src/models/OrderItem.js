import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.js";

export class OrderItem extends Model {}

OrderItem.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },
    orderId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: "order_id"
    },
    productId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: "product_id"
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    unitPrice: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      field: "unit_price"
    },
    subtotal: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    }
  },
  {
    sequelize,
    modelName: "OrderItem",
    tableName: "order_items",
    updatedAt: false
  }
);