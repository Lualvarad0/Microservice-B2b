import swaggerJSDoc from "swagger-jsdoc";
import { env } from "../utils/env.js";

const swaggerDefinition = {
  openapi: "3.0.3",
  info: {
    title: "Lambda Orchestrator API",
    version: "1.0.0",
    description: "Orchestrator API for create and confirm order flow"
  },
  servers: [
    {
      url:
        env.nodeEnv === "development"
          ? `http://localhost:${env.port}`
          : ""
    }
  ]
};

const options = {
  definition: swaggerDefinition,
  apis: ["./src/routes/*.js"]
};

export const swaggerSpec = swaggerJSDoc(options);