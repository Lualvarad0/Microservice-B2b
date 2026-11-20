import { Sequelize } from "sequelize";
import { env } from "./env.js";

export const sequelize = new Sequelize(env.db.name, env.db.user, env.db.password, {
  host: env.db.host,
  port: env.db.port,
  dialect: "postgres",
  logging: env.db.logging ? console.log : false,
  define: {
    freezeTableName: true,
    underscored: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
});

export async function connectWithRetry() {
  let attempt = 0;

  while (attempt < env.db.maxRetries) {
    try {
      attempt += 1;
      await sequelize.authenticate();
      console.log(`✅ PostgreSQL connected on attempt ${attempt}`);
      return;
    } catch (error) {
      console.error(
        `❌ DB connection attempt ${attempt}/${env.db.maxRetries} failed: ${error.message}`
      );

      if (attempt >= env.db.maxRetries) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, env.db.retryDelayMs));
    }
  }
}
