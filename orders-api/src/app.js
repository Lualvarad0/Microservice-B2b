import express from "express";
import routes from "./routes/index.js";
import { swaggerSpec, swaggerUi } from "./config/swagger.js";
import { notFoundHandler } from "./middlewares/notFoundHandler.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

app.use(express.json());

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/docs.json", (_req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

app.use(routes);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
