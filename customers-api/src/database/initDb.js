import { sequelize } from "../config/db.js";
import "../models/index.js";

export async function initDb() {
  await sequelize.sync();
  console.log("✅ Database synchronized");
}
