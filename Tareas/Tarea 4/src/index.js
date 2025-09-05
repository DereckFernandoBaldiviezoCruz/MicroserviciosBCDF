require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const swaggerUi = require("swagger-ui-express");
const { swaggerSpec } = require("./swagger");
const { AppDataSource } = require("./data-source");
const { errorHandler } = require("./middlewares");

// Rutas
const productosRoutes = require("./routes/productos.routes");
const clientesRoutes = require("./routes/clientes.routes");
const facturasRoutes = require("./routes/facturas.routes");
const detallesRoutes = require("./routes/detalles.routes");

async function start() {
  await AppDataSource.initialize();
  console.log("✅ DB conectada");

  const app = express();
  app.use(bodyParser.json());

  app.use("/api/productos", productosRoutes);
  app.use("/api/clientes", clientesRoutes);
  app.use("/api/facturas", facturasRoutes);
  app.use("/api", detallesRoutes); // monta /api/facturas/:id/detalles y /api/detalles/:id

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.use(errorHandler);

  const PORT = process.env.PORT || 4001;
  app.listen(PORT, () => console.log(`🚀 http://localhost:${PORT}/api  | Docs: /api-docs`));
}

start();
