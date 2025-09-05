const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Factura",
  tableName: "factura",
  columns: {
    id: { type: "int", primary: true, generated: true },
    fecha: { type: "date" },
  },
  relations: {
    cliente: {
      type: "many-to-one",
      target: "Cliente",
      joinColumn: true,
      eager: true,
    },
    detalles: {
      type: "one-to-many",
      target: "DetalleFactura",
      inverseSide: "factura",
      cascade: true,
    },
  },
});
