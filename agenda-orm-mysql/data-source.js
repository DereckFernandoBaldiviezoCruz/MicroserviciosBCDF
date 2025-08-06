const { DataSource } = require("typeorm");
const Agenda = require("./entity/Agenda");

const AppDataSource = new DataSource({
  type: "mysql",
  host: "localhost",
  port: 3306,
  username: "root",
  password: "", // tu contraseña
  database: "agenda_db",
  synchronize: true, // genera las tablas automáticamente
  logging: false,
  entities: [Agenda],
});

module.exports = AppDataSource;
