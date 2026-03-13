import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Customers API",
      version: "1.0.0",
      description: "Microservicio customers-api para prueba técnica"
    },
    servers: [
      {
        url: "http://localhost:3001",
        description: "Local server"
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        },
        serviceTokenAuth: {
          type: "apiKey",
          in: "header",
          name: "x-service-token"
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
        LoginResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true
            },
            message: {
              type: "string",
              example: "Login successful"
            },
            data: {
              type: "object",
              properties: {
                token: {
                  type: "string",
                  example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                },
                tokenType: {
                  type: "string",
                  example: "Bearer"
                },
                expiresIn: {
                  type: "string",
                  example: "1h"
                }
              }
            }
          }
        },
        Customer: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              example: 1
            },
            name: {
              type: "string",
              example: "Juan Perez"
            },
            email: {
              type: "string",
              example: "juan.perez@example.com"
            },
            phone: {
              type: "string",
              nullable: true,
              example: "0999999999"
            },
            deletedAt: {
              type: "string",
              format: "date-time",
              nullable: true,
              example: null
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2026-03-11T22:00:00.000Z"
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2026-03-11T22:00:00.000Z"
            }
          }
        },
        CreateCustomerRequest: {
          type: "object",
          required: ["name", "email"],
          properties: {
            name: {
              type: "string",
              example: "Juan Perez"
            },
            email: {
              type: "string",
              example: "juan.perez@example.com"
            },
            phone: {
              type: "string",
              nullable: true,
              example: "0999999999"
            }
          }
        },
        UpdateCustomerRequest: {
          type: "object",
          properties: {
            name: {
              type: "string",
              example: "Juan Perez Actualizado"
            },
            email: {
              type: "string",
              example: "juan.actualizado@example.com"
            },
            phone: {
              type: "string",
              nullable: true,
              example: "0888888888"
            }
          }
        },
        SuccessResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true
            },
            message: {
              type: "string",
              example: "OK"
            },
            data: {
              type: "object"
            }
          }
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false
            },
            message: {
              type: "string",
              example: "Internal Server Error"
            },
            details: {
              oneOf: [
                { type: "array", items: { type: "string" } },
                { type: "object" },
                { type: "string" }
              ]
            }
          }
        },
        CustomersListResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true
            },
            message: {
              type: "string",
              example: "Customers retrieved successfully"
            },
            data: {
              type: "object",
              properties: {
                items: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/Customer"
                  }
                },
                pagination: {
                  type: "object",
                  properties: {
                    limit: {
                      type: "integer",
                      example: 10
                    },
                    nextCursor: {
                      type: "string",
                      nullable: true,
                      example: "MQ=="
                    },
                    hasNextPage: {
                      type: "boolean",
                      example: false
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  apis: ["./src/routes/*.js"]
};

export const swaggerSpec = swaggerJsdoc(options);