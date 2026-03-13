import express from "express";
import swaggerUi from "swagger-ui-express";
import authRoutes from "./routes/authRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";
import internalRoutes from "./routes/internalRoutes.js";
import { swaggerSpec } from "./config/swagger.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { notFoundHandler } from "./middlewares/notFoundHandler.js";

const app = express();

app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/auth", authRoutes);
app.use("/health", healthRoutes);
app.use("/customers", customerRoutes);
app.use("/internal", internalRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;