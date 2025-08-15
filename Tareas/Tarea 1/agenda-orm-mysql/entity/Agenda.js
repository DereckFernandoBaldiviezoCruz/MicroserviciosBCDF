const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Agenda",
  tableName: "agenda",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    nombres: {
      type: "varchar",
    },
    apellidos: {
      type: "varchar",
    },
    fecha_nacimiento: {
      type: "date",
    },
    direccion: {
      type: "text",
    },
    celular: {
      type: "varchar",
    },
    correo: {
      type: "varchar",
    },
  },
});
