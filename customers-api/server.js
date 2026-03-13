import app from "./src/app.js";
import { env } from "./src/config/env.js";
import { connectWithRetry } from "./src/config/db.js";
import { initDb } from "./src/database/initDb.js";

async function bootstrap() {
  try {
    await connectWithRetry();
    await initDb();

    app.listen(env.port, () => {
      console.log(`🚀 customers-api running on port ${env.port}`);
      console.log(`📘 Swagger docs available at http://localhost:${env.port}/api-docs`);
    });
  } catch (error) {
    console.error("Failed to start customers-api:", error.message);
    process.exit(1);
  }
}

bootstrap();