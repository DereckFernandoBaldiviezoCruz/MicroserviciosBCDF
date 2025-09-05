const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Producto",
  tableName: "producto",
  columns: {
    id: { type: "int", primary: true, generated: true },
    nombre: { type: "varchar" },
    descripcion: { type: "varchar", nullable: true },
    marca: { type: "varchar", nullable: true },
    stock: { type: "int", default: 0 },
  },
  relations: {
    detalles: {
      type: "one-to-many",
      target: "DetalleFactura",
      inverseSide: "producto",
    },
  },
});
