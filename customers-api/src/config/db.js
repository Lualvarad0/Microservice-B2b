import { Sequelize } from "sequelize";
import { env } from "./env.js";

export const sequelize = new Sequelize(
  env.db.database,
  env.db.user,
  env.db.password,
  {
    host: env.db.host,
    port: env.db.port,
    dialect: "postgres",
    logging: false
  }
);

export async function connectWithRetry() {
  let attempt = 0;

  while (attempt < env.db.maxRetries) {
    try {
      await sequelize.authenticate();
      console.log("✅ Connected to PostgreSQL with Sequelize");
      return;
    } catch (error) {
      attempt += 1;
      console.error(
        `❌ PostgreSQL connection failed (attempt ${attempt}/${env.db.maxRetries}): ${error.message}`
      );

      if (attempt >= env.db.maxRetries) {
        throw new Error("Unable to connect to PostgreSQL after multiple attempts");
      }

      await new Promise((resolve) =>
        setTimeout(resolve, env.db.retryDelayMs)
      );
    }
  }
}