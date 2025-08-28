const express = require("express");
const mysql = require("mysql2");
const app = express();

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

// Conexión a la base de datos
const db = mysql.createConnection({
  host: process.env.DB_HOST || "mysql",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "123123",
  database: process.env.DB_NAME || "usuariosdb"
});

db.connect(err => {
  if (err) throw err;
  console.log("Conectado a MySQL");
});

// Página principal: lista de usuarios
app.get("/", (req, res) => {
  db.query("SELECT * FROM usuarios", (err, results) => {
    if (err) throw err;
    res.render("index", { usuarios: results });
  });
});

// Formulario para agregar usuario
app.get("/nuevo", (req, res) => {
  res.render("form");
});

app.post("/nuevo", (req, res) => {
  const { nombre, correo } = req.body;
  db.query("INSERT INTO usuarios (nombre, correo) VALUES (?, ?)", [nombre, correo], err => {
    if (err) throw err;
    res.redirect("/");
  });
});

// Eliminar usuario
app.get("/eliminar/:id", (req, res) => {
  db.query("DELETE FROM usuarios WHERE id = ?", [req.params.id], err => {
    if (err) throw err;
    res.redirect("/");
  });
});

app.listen(3000, () => console.log("Servidor en http://localhost:3000"));
