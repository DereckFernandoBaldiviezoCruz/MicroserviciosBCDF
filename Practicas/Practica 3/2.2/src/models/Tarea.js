const mongoose = require("mongoose");

const tareaSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  descripcion: { type: String, required: true },
  estado: { type: String, enum: ["pendiente", "en progreso", "completado"], default: "pendiente" },
  fechaCreacion: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Tarea", tareaSchema);
