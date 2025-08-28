const express = require("express");
const mongoose = require("mongoose");
const Tarea = require("./models/Tarea");

const app = express();
app.use(express.json());

// Conexión a MongoDB (nombre del servicio de docker-compose = "mongo")
mongoose.connect("mongodb://mongo:27017/tareasdb", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("✅ Conectado a MongoDB"))
  .catch(err => console.error("❌ Error MongoDB:", err));

// RUTAS CRUD
// Crear tarea
app.post("/tareas", async (req, res) => {
  const tarea = new Tarea(req.body);
  await tarea.save();
  res.json(tarea);
});

// Obtener todas
app.get("/tareas", async (req, res) => {
  const tareas = await Tarea.find();
  res.json(tareas);
});

// Obtener una
app.get("/tareas/:id", async (req, res) => {
  const tarea = await Tarea.findById(req.params.id);
  res.json(tarea);
});

// Actualizar
app.put("/tareas/:id", async (req, res) => {
  const tarea = await Tarea.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(tarea);
});

// Eliminar
app.delete("/tareas/:id", async (req, res) => {
  await Tarea.findByIdAndDelete(req.params.id);
  res.json({ mensaje: "Tarea eliminada" });
});

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

app.get("/", async (req, res) => {
  const tareas = await Tarea.find();
  res.render("index", { tareas });
});

// Iniciar servidor
app.listen(4000, () => console.log("🚀 Servidor en http://localhost:4000"));
