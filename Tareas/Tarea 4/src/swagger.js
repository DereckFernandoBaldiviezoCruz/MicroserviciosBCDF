const swaggerJsdoc = require("swagger-jsdoc");

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.3",
    info: {
      title: "API Ventas - Productos, Clientes, Facturas y Detalles",
      version: "1.0.0",
    },
    servers: [{ url: "http://localhost:4001/api" }],
  },
  apis: ["./src/routes/*.js"],
});

module.exports = { swaggerSpec };
