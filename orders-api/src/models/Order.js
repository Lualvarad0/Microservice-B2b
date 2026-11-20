import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.js";

export const ORDER_STATUS = {
  CREATED: "CREATED",
  CONFIRMED: "CONFIRMED",
  CANCELLED: "CANCELLED"
};

export class Order extends Model {}

Order.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },
    customerId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: "customer_id"
    },
    status: {
      type: DataTypes.ENUM("CREATED", "CONFIRMED", "CANCELLED"),
      allowNull: false,
      defaultValue: ORDER_STATUS.CREATED
    },
    total: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    },
    confirmedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "confirmed_at"
    },
    cancelledAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "cancelled_at"
    }
  },
  {
    sequelize,
    modelName: "Order",
    tableName: "orders"
  }
);
