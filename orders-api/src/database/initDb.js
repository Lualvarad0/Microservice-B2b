import { sequelize } from "../models/index.js";

export async function initDb() {
  await sequelize.sync({ alter: true });
  console.log("✅ Database synchronized");
}
