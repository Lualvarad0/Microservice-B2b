import app from "./src/app.js";
import { env } from "./src/config/env.js";
import { connectWithRetry } from "./src/config/db.js";
import { initDb } from "./src/database/initDb.js";

async function bootstrap() {
  try {
    await connectWithRetry();
    await initDb();

    app.listen(env.port, () => {
      console.log(`🚀 orders-api running on port ${env.port}`);
      console.log(`📘 Swagger available at ${env.swagger.serverUrl}/docs`);
    });
  } catch (error) {
    console.error("❌ Failed to start orders-api:", error);
    process.exit(1);
  }
}

bootstrap();
