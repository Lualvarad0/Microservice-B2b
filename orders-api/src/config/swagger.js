import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { env } from "./env.js";

const definition = {
  openapi: "3.0.3",
  info: {
    title: "orders-api",
    version: "1.0.0",
    description: "Orders microservice"
  },
  servers: [
    {
      url: env.swagger.serverUrl
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    },
    schemas: {
      LoginRequest: {
        type: "object",
        required: ["username", "password"],
        properties: {
          username: {
            type: "string",
            example: "admin"
          },
          password: {
            type: "string",
            example: "admin123"
          }
        }
      },
      ProductRequest: {
        type: "object",
        required: ["sku", "name", "price", "stock"],
        properties: {
          sku: {
            type: "string",
            example: "SKU-001"
          },
          name: {
            type: "string",
            example: "Laptop Lenovo"
          },
          description: {
            type: "string",
            example: "Laptop empresarial"
          },
          price: {
            type: "number",
            example: 1200.5
          },
          stock: {
            type: "integer",
            example: 10
          },
          active: {
            type: "boolean",
            example: true
          }
        }
      },
      CreateOrderRequest: {
        type: "object",
        required: ["customerId", "items"],
        properties: {
          customerId: {
            type: "integer",
            example: 1
          },
          items: {
            type: "array",
            items: {
              type: "object",
              required: ["productId", "quantity"],
              properties: {
                productId: {
                  type: "integer",
                  example: 1
                },
                quantity: {
                  type: "integer",
                  example: 2
                }
              }
            }
          }
        }
      }
    }
  }
};

const options = {
  definition,
  apis: ["./src/routes/*.js", "./src/controllers/*.js"]
};

export const swaggerSpec = swaggerJSDoc(options);
export { swaggerUi };
