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
      }
    }
  },
  apis: ["./src/routes/*.ts"]
});

