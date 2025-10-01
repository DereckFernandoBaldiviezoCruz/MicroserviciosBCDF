const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Medico",
  tableName: "medicos",
  columns: {
    id: { primary: true, type: "int", generated: true },
    nombre: { type: "varchar", length: 100, nullable: false },
    apellido: { type: "varchar", length: 100, nullable: false },
    cedula_profesional: { type: "varchar", length: 100, unique: true, nullable: false },
    especialidad: { type: "varchar", length: 100, nullable: false },
    anios_experiencia: { type: "int", nullable: false },
    correo_electronico: { type: "varchar", length: 150, unique: true, nullable: false },
    created_at: { type: "timestamp", default: () => "CURRENT_TIMESTAMP" },
    updated_at: { type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" }
  }
});