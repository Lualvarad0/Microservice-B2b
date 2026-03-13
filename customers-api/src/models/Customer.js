import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.js";

export class Customer extends Model {}

Customer.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "name is required"
        }
      }
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: {
          msg: "email is required"
        },
        isEmail: {
          msg: "email format is invalid"
        }
      }
    },
    phone: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "deleted_at"
    }
  },
  {
    sequelize,
    modelName: "Customer",
    tableName: "customers",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ["email"]
      },
      {
        fields: ["deleted_at"]
      }
    ]
  }
);