import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.js";

export class IdempotencyKey extends Model {}

IdempotencyKey.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },
    idempotencyKey: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "idempotency_key"
    },
    method: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    endpoint: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    requestFingerprint: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "request_fingerprint"
    },
    isCompleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "is_completed"
    },
    responseStatus: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "response_status"
    },
    responseBody: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: "response_body"
    }
  },
  {
    sequelize,
    modelName: "IdempotencyKey",
    tableName: "idempotency_keys",
    indexes: [
      {
        unique: true,
        fields: ["idempotency_key", "method", "endpoint"]
      }
    ]
  }
);
