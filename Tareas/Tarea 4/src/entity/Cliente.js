const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Cliente",
  tableName: "cliente",
  columns: {
    id: { type: "int", primary: true, generated: true },
    ci: { type: "varchar", unique: true },
    nombres: { type: "varchar" },
    apellidos: { type: "varchar" },
    sexo: { type: "varchar" }, // "M", "F", etc.
  },
  relations: {
    facturas: {
      type: "one-to-many",
      target: "Factura",
      inverseSide: "cliente",
    },
  },
});
