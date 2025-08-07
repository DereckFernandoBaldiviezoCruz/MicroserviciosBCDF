require("reflect-metadata");
const express = require("express");
const cors = require("cors");
const AppDataSource = require("./data-source");

const app = express();
app.use(cors());
app.use(express.json());

AppDataSource.initialize().then(() => {
  const agendaRepo = AppDataSource.getRepository("Agenda");

  app.get("/agenda", async (req, res) => {
    const datos = await agendaRepo.find();
    res.json(datos);
  });

  app.post("/agenda", async (req, res) => {
    const nuevo = agendaRepo.create(req.body);
    const guardado = await agendaRepo.save(nuevo);
    res.json(guardado);
  });

  app.put("/agenda/:id", async (req, res) => {
    await agendaRepo.update(req.params.id, req.body);
    res.send("Actualizado");
  });

  app.delete("/agenda/:id", async (req, res) => {
    await agendaRepo.delete(req.params.id);
    res.send("Eliminado");
  });

  app.listen(3000, () => {
    console.log("Servidor corriendo en http://localhost:3000");
  });
}).catch(err => console.error("Error al conectar:", err));
