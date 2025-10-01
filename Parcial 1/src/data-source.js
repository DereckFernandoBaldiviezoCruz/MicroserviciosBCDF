const { DataSource } = require("typeorm");
const Medico = require("./entity/Medico");

const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  username: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "medicosdb",
  entities: [Medico],
  synchronize: true,
  logging: false
});

module.exports = { AppDataSource };