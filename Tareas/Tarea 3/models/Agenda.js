const mongoose = require("mongoose");

const agendaSchema = new mongoose.Schema({
  nombres: String,
  apellidos: String,
  fecha_nacimiento: Date,
  direccion: String,
  celular: String,
  correo: String
});

module.exports = mongoose.model("Agenda", agendaSchema);
