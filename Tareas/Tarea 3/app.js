const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const app = express();
const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/agendaDB";
// Conexión a MongoDB
mongoose.connect(mongoURI)
  .then(() => console.log("MongoDB conectado"))
  .catch(err => console.error("❌ Error conectando a MongoDB:", err));

// Configuraciones
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// Importar modelo
const Agenda = require("./models/Agenda");

// Rutas

// 📌 LISTAR todos
app.get("/", async (req, res) => {
  const contactos = await Agenda.find();
  res.render("index", { contactos });
});

// 📌 FORMULARIO CREAR
app.get("/new", (req, res) => {
  res.render("create");
});

// 📌 CREAR nuevo
app.post("/", async (req, res) => {
  await Agenda.create(req.body);
  res.redirect("/");
});

// 📌 FORMULARIO EDITAR
app.get("/edit/:id", async (req, res) => {
  const contacto = await Agenda.findById(req.params.id);
  res.render("edit", { contacto });
});

// 📌 ACTUALIZAR
app.put("/:id", async (req, res) => {
  await Agenda.findByIdAndUpdate(req.params.id, req.body);
  res.redirect("/");
});

// 📌 ELIMINAR
app.delete("/:id", async (req, res) => {
  await Agenda.findByIdAndDelete(req.params.id);
  res.redirect("/");
});

// Servidor
app.listen(3000, () => console.log("Servidor en http://localhost:3000"));
