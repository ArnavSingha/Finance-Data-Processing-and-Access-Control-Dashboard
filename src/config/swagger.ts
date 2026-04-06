import swaggerJSDoc from "swagger-jsdoc";

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Finance Data Processing and Access Control Dashboard API",
      version: "1.0.0",
      description: "REST API for finance records, analytics, and role-based access control."
    },
    servers: [
      {
        url: "/api/v1",
        description: "Primary API server"
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
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Validation failed" },
            errors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  field: { type: "string", example: "body.email" },
                  message: { type: "string", example: "Invalid email address" }
                }
              }
            },
            timestamp: { type: "string", format: "date-time" }
          }
        },
        User: {
          type: "object",
          properties: {
            id: { type: "string", example: "69d35aaafffbffa9b85d212e" },
            name: { type: "string", example: "Arnav Singha" },
            email: { type: "string", example: "arnav.singha2002@gmail.com" },
            role: { type: "string", enum: ["Viewer", "Analyst", "Admin"] },
            status: { type: "string", enum: ["active", "inactive"] },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" }
          }
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email", example: "admin@example.com" },
            password: { type: "string", example: "ChangeMe123!" }
          }
        },
        RegisterRequest: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: { type: "string", example: "Ava Viewer" },
            email: { type: "string", format: "email", example: "ava@example.com" },
            password: { type: "string", example: "Password123!" },
            role: { type: "string", enum: ["Viewer", "Analyst", "Admin"], example: "Viewer" }
          }
        },
        AuthResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Login successful" },
            data: {
              type: "object",
              properties: {
                token: { type: "string" },
                user: { $ref: "#/components/schemas/User" }
              }
            }
          }
        },
        Record: {
          type: "object",
          properties: {
            id: { type: "string", example: "69d3e67987a8f2bd8450a8c6" },
            amount: { type: "number", example: 1250.5 },
            type: { type: "string", enum: ["income", "expense"] },
            category: { type: "string", example: "Consulting" },
            date: { type: "string", format: "date-time" },
            notes: { type: "string", example: "April consulting invoice" },
            createdBy: {
              oneOf: [
                { type: "string", example: "69d35aaafffbffa9b85d212e" },
                { $ref: "#/components/schemas/User" }
              ]
            },
            deletedAt: { type: "string", format: "date-time", nullable: true },
            deletedBy: { type: "string", nullable: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" }
          }
        },
        CreateRecordRequest: {
          type: "object",
          required: ["amount", "type", "category", "date"],
          properties: {
            amount: { type: "number", example: 1250.5 },
            type: { type: "string", enum: ["income", "expense"], example: "income" },
            category: { type: "string", example: "Consulting" },
            date: { type: "string", format: "date-time", example: "2026-04-01T00:00:00.000Z" },
            notes: { type: "string", example: "April consulting invoice" }
          }
        },
        UpdateRecordRequest: {
          type: "object",
          properties: {
            amount: { type: "number", example: 900.25 },
            type: { type: "string", enum: ["income", "expense"] },
            category: { type: "string", example: "Operations" },
            date: { type: "string", format: "date-time" },
            notes: { type: "string", example: "Updated note" }
          }
        },
        UpdateUserStatusRequest: {
          type: "object",
          required: ["status"],
          properties: {
            status: { type: "string", enum: ["active", "inactive"], example: "inactive" }
          }
        },
        UpdateUserRoleRequest: {
          type: "object",
          required: ["role"],
          properties: {
            role: { type: "string", enum: ["Viewer", "Analyst", "Admin"], example: "Analyst" }
          }
        }
      }
    }
  },
  apis: ["./src/routes/*.ts"]
});
