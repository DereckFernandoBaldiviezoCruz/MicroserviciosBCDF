require("reflect-metadata");
const { DataSource } = require("typeorm");
const Producto = require("./entity/Producto");
const Cliente = require("./entity/Cliente");
const Factura = require("./entity/Factura");
const DetalleFactura = require("./entity/DetalleFactura");

const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  username: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "ventas_rest",
  synchronize: true,
  logging: false,
  entities: [Producto, Cliente, Factura, DetalleFactura],
});

module.exports = { AppDataSource };
