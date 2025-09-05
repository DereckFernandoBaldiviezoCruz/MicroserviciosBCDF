const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "DetalleFactura",
  tableName: "detalle_factura",
  columns: {
    id: { type: "int", primary: true, generated: true },
    cantidad: { type: "int" },
    precio: { type: "decimal", precision: 10, scale: 2 },
  },
  relations: {
    factura: {
      type: "many-to-one",
      target: "Factura",
      joinColumn: true,
      eager: true,
    },
    producto: {
      type: "many-to-one",
      target: "Producto",
      joinColumn: true,
      eager: true,
    },
  },
});
