const { DataSource } = require("typeorm");
const Agenda = require("./entity/Agenda");

const AppDataSource = new DataSource({
  type: "mysql",
  host: "localhost",
  port: 3306,
  username: "root",
  password: "",
  database: "agenda_db",
  synchronize: true,
  logging: false,
  entities: [Agenda],
});

module.exports = AppDataSource;
